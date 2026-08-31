<?php

namespace App\Http\Controllers;

use App\Models\CourseProfile;
use App\Models\FacilitatorStatus;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FacilitatorStatusController extends Controller
{
    // Mark one student as "potential" for one or more course profiles
    // Used by the Member profile modal
    public function markForStudent(Request $request, User $student): JsonResponse
    {
        $validated = $request->validate([
            'course_profile_ids' => ['required', 'array', 'min:1'],
            'course_profile_ids.*' => ['integer', 'exists:course_profiles,id'],
        ]);

        DB::transaction(function () use ($validated, $student) {
            foreach ($validated['course_profile_ids'] as $courseProfileId) {
                FacilitatorStatus::firstOrCreate(
                    ['student_id' => $student->id, 'course_profile_id' => $courseProfileId],
                    ['status' => 'potential']
                );
            }
        });

        return response()->json(['success' => true]);
    }

    // Mark one or more students as "potential" for a single course profile
    // Used by the Course Profile page
    public function markForCourse(Request $request, CourseProfile $courseProfile): JsonResponse
    {
        $validated = $request->validate([
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['integer', 'exists:users,id'],
        ]);

        DB::transaction(function () use ($validated, $courseProfile) {
            foreach ($validated['student_ids'] as $studentId) {
                FacilitatorStatus::firstOrCreate(
                    ['student_id' => $studentId, 'course_profile_id' => $courseProfile->id],
                    ['status' => 'potential']
                );
            }
        });

        return response()->json(['success' => true]);
    }

    // Promote potential -> appointed, or revert appointed -> potential
    public function update(Request $request, FacilitatorStatus $facilitatorStatus): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:potential,appointed'],
        ]);

        $facilitatorStatus->update([
            'status' => $validated['status'],
            'appointed_at' => $validated['status'] === 'appointed' ? now() : null,
        ]);

        return response()->json(['success' => true, 'facilitator_status' => $facilitatorStatus]);
    }

    // Remove a mark entirely — back to "Not Applicable"
    public function destroy(FacilitatorStatus $facilitatorStatus): JsonResponse
    {
        $facilitatorStatus->delete();

        return response()->json(['success' => true]);
    }

    // List every student currently marked "potential" for at least one course,
    // with the full set of courses they're a potential facilitator for.
    public function potential(): JsonResponse
    {
        return response()->json(['facilitators' => $this->potentialFacilitators()]);
    }

    public function exportPotential(): StreamedResponse
    {
        $facilitators = $this->potentialFacilitators();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Potential Facilitators');
        $sheet->fromArray(['Name', 'Email', 'Phone Number', 'Courses'], null, 'A1');

        $row = 2;
        foreach ($facilitators as $facilitator) {
            $sheet->fromArray([
                $facilitator['name'],
                $facilitator['email'],
                $facilitator['phone_number'] ?? '',
                implode(', ', $facilitator['courses']),
            ], null, "A{$row}");
            $row++;
        }

        foreach (range('A', 'D') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $filename = 'potential-facilitators-' . now()->format('Y-m-d') . '.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function potentialFacilitators(): array
    {
        return FacilitatorStatus::query()
            ->where('status', 'potential')
            ->with(['student:id,name,email,phone_number', 'courseProfile:id,title'])
            ->get()
            ->filter(fn (FacilitatorStatus $status) => $status->student !== null)
            ->groupBy('student_id')
            ->map(function ($statuses) {
                $student = $statuses->first()->student;

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'phone_number' => $student->phone_number,
                    'courses' => $statuses->pluck('courseProfile.title')->filter()->values()->all(),
                ];
            })
            ->sortBy('name')
            ->values()
            ->all();
    }
}