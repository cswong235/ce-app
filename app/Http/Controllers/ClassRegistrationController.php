<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use App\Models\ClassEnrollment;
use App\Models\ClassRegistration;
use App\Models\Batch;
use App\Models\User;
use App\Support\PhoneNumberSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ClassRegistrationController extends Controller
{
    public function import(Request $request): JsonResponse
    {
        $expectedSecret = env('GOOGLE_FORM_WEBHOOK_SECRET');

        if ($expectedSecret && $request->header('X-Apps-Script-Secret') !== $expectedSecret) {
            return response()->json(['success' => false, 'message' => 'Unauthorized webhook request.'], 403);
        }

        $validated = $request->validate([
            'batch_id' => ['required', 'integer', 'exists:batches,id'],
            'form_name' => ['required', 'string', 'max:255'],
            'form_email' => ['required', 'email', 'max:255'],
            'form_phone' => ['nullable', 'string', 'max:255'],
            'form_answers' => ['nullable', 'array'],
        ]);

        $record = ClassRegistration::create([
            'batch_id' => $validated['batch_id'],
            'imported_at' => now(),
            'form_name' => $validated['form_name'],
            'form_email' => $validated['form_email'],
            'form_phone' => PhoneNumberSanitizer::sanitize($validated['form_phone'] ?? null),
            'form_answers' => $validated['form_answers'] ?? [],
            'status' => 'pending',
        ]);

        return response()->json(['success' => true, 'registration_id' => $record->id], 201);
    }

    public function storeManual(Request $request, Batch $batch): JsonResponse
    {
        $validated = $request->validate([
            'form_name' => ['required', 'string', 'max:255'],
            'form_email' => ['required', 'email', 'max:255'],
            'form_phone' => ['nullable', 'string', 'max:255'],
            'form_answers' => ['nullable', 'array'],
        ]);

        $registration = $batch->registrations()->create([
            'imported_at' => now(),
            'form_name' => $validated['form_name'],
            'form_email' => $validated['form_email'],
            'form_phone' => PhoneNumberSanitizer::sanitize($validated['form_phone'] ?? null),
            'form_answers' => $validated['form_answers'] ?? [],
            'status' => 'pending',
        ]);

        return response()->json(['success' => true, 'registration' => $registration], 201);
    }

    public function bulkApprove(Request $request, Batch $batch): JsonResponse
    {
        $validated = $request->validate([
            'registration_ids' => ['required', 'array', 'min:1'],
            'registration_ids.*' => ['integer', Rule::exists('class_registrations', 'id')->where('batch_id', $batch->id)],
            'class_id' => [
                'required',
                'integer',
                Rule::exists('classes', 'id')
                    ->where('course_profile_id', $batch->course_profile_id)
                    ->where('status', 'open'),
            ],
        ]);

        $result = DB::transaction(function () use ($validated, $batch) {
            $registrations = ClassRegistration::query()
                ->whereIn('id', $validated['registration_ids'])
                ->where('batch_id', $batch->id)
                ->where('status', 'pending')
                ->get();

            $enrolledCount = 0;

            foreach ($registrations as $registration) {
                $student = $this->findOrCreateStudentForApproval($registration);

                $registration->update([
                    'status' => 'approved',
                    'student_id' => $student->id,
                    'reviewed_at' => now(),
                ]);

                ClassEnrollment::firstOrCreate(
                    ['class_id' => $validated['class_id'], 'student_id' => $student->id],
                    ['status' => 'active', 'payment_status' => 'not_paid', 'enrolled_at' => now()]
                );

                $enrolledCount++;
            }

            return $enrolledCount;
        });

        return response()->json([
            'success' => true,
            'enrolled_count' => $result,
        ]);
    }

    // Reject — student profile creation deferred for now, per your note (member profile module not built yet)
    public function reject(Request $request, ClassRegistration $registration): JsonResponse
    {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string'],
        ]);

        $student = $this->findOrCreateStudentForRejection($registration);

        $registration->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'student_id' => $student->id,
            'reviewed_at' => now(),
        ]);

        return response()->json(['success' => true, 'registration' => $registration]);
    }

    public function bulkReject(Request $request, Batch $batch): JsonResponse
    {
        $validated = $request->validate([
            'registration_ids' => ['required', 'array', 'min:1'],
            'registration_ids.*' => ['integer', Rule::exists('class_registrations', 'id')->where('batch_id', $batch->id)],
            'rejection_reason' => ['required', 'string'],
        ]);

        $count = DB::transaction(function () use ($validated, $batch) {
            $registrations = ClassRegistration::query()
                ->whereIn('id', $validated['registration_ids'])
                ->where('batch_id', $batch->id)
                ->where('status', 'pending')
                ->get();

            foreach ($registrations as $registration) {
                $student = $this->findOrCreateStudentForRejection($registration);

                $registration->update([
                    'status' => 'rejected',
                    'rejection_reason' => $validated['rejection_reason'],
                    'student_id' => $student->id,
                    'reviewed_at' => now(),
                ]);
            }

            return $registrations->count();
        });

        return response()->json(['success' => true, 'rejected_count' => $count]);
    }

    private function findOrCreateStudentForApproval(ClassRegistration $registration): User
    {
        $student = User::where('email', $registration->form_email)
            ->orWhere('name', $registration->form_name)
            ->orWhere(function ($query) use ($registration) {
                if ($registration->form_phone) {
                    $query->where('phone_number', $registration->form_phone);
                }
            })
            ->first();

        if (! $student) {
            $student = User::create([
                'name' => $registration->form_name,
                'email' => $registration->form_email,
                'phone_number' => PhoneNumberSanitizer::sanitize($registration->form_phone),
                'password' => Hash::make(Str::random(32)),
            ]);
        }

        $student->studentDetails()->updateOrCreate([], ['status' => 'current']);

        return $student;
    }

    private function findOrCreateStudentForRejection(ClassRegistration $registration): User
    {
        $student = User::where('email', $registration->form_email)
            ->orWhere('name', $registration->form_name)
            ->orWhere(function ($query) use ($registration) {
                if ($registration->form_phone) {
                    $query->where('phone_number', $registration->form_phone);
                }
            })
            ->first();

        if (! $student) {
            $student = User::create([
                'name' => $registration->form_name,
                'email' => $registration->form_email,
                'phone_number' => PhoneNumberSanitizer::sanitize($registration->form_phone),
                'password' => Hash::make(Str::random(32)),
            ]);
        }

        $student->studentDetails()->firstOrCreate([], ['status' => 'potential']);

        return $student;
    }

    public function importExcel(Request $request, Batch $batch): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls'],
        ]);

        $spreadsheet = IOFactory::load($request->file('file')->getRealPath());
        $rows = $spreadsheet->getActiveSheet()->toArray(null, true, true, true); // keyed by column letter (A, B, C...)

        $created = 0;
        $skipped = [];

        DB::transaction(function () use ($rows, $batch, &$created, &$skipped) {
            foreach ($rows as $rowNumber => $row) {
                if ($rowNumber <= 4) {
                    continue; // rows 1-4 are header/title rows, per the known template
                }

                $name = trim((string) ($row['C'] ?? ''));
                $phone = trim((string) ($row['D'] ?? ''));
                $email = trim((string) ($row['E'] ?? ''));

                if ($name === '' && $email === '') {
                    continue; // fully blank row, likely trailing whitespace in the sheet
                }

                if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $skipped[] = ['row' => $rowNumber, 'reason' => 'Invalid or missing email'];
                    continue;
                }

                $batch->registrations()->create([
                    'imported_at' => now(),
                    'form_name' => $name,
                    'form_email' => $email,
                    'form_phone' => PhoneNumberSanitizer::sanitize($validated['form_phone'] ?? null),
                    'form_answers' => [
                        'church' => trim((string) ($row['F'] ?? '')) ?: null,
                        'course_interest' => trim((string) ($row['G'] ?? '')) ?: null,
                        'previous_course' => trim((string) ($row['H'] ?? '')) ?: null,
                        'remarks' => trim((string) ($row['I'] ?? '')) ?: null,
                    ],
                    'status' => 'pending',
                ]);

                $created++;
            }
        });

        return response()->json([
            'success' => true,
            'created_count' => $created,
            'skipped' => $skipped,
        ]);
    }
}