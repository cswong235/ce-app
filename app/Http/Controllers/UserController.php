<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\ClassAdmin;
use App\Models\ClassEnrollment;
use App\Models\CommitteeInvite;
use App\Models\FacilitatorStatus;
use App\Models\User;
use App\Support\PhoneNumberSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('User/User', [
            'users' => User::query()
                ->with(['studentDetails', 'committeeDetails'])
                ->latest()
                ->get(),
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $user->load(['studentDetails', 'committeeDetails']);

        $data = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'profile_picture' => $user->profile_picture,
        ];

        if ($user->studentDetails) {
            $enrollments = ClassEnrollment::query()
                ->where('student_id', $user->id)
                ->with('classes.courseProfile:id,title')
                ->get();

            $existingMarks = FacilitatorStatus::where('student_id', $user->id)->pluck('course_profile_id')->toArray();

            $eligibleCourseProfiles = $enrollments
                ->where('status', 'completed')
                ->pluck('classes.courseProfile')
                ->filter()
                ->unique('id')
                ->reject(fn ($courseProfile) => in_array($courseProfile->id, $existingMarks))
                ->values();

            $data['student'] = [
                'status' => $user->studentDetails->status,
                'enrollments' => $enrollments,
                'facilitator_statuses' => FacilitatorStatus::query()
                    ->where('student_id', $user->id)
                    ->with('courseProfile:id,title')
                    ->get(),
                'eligible_facilitator_course_profiles' => $eligibleCourseProfiles,
            ];
        }

        if ($user->committeeDetails) {
            $invite = CommitteeInvite::where('email', $user->email)->first(['id', 'status']);

            $data['committee'] = [
                'role' => $user->committeeDetails->role,
                'term_start_date' => $user->committeeDetails->term_start_date,
                'term_end_date' => $user->committeeDetails->term_end_date,
                'admin_classes' => ClassAdmin::query()
                    ->where('committee_id', $user->id)
                    ->with('classes:id,name')
                    ->get(),
                'invite_id' => $invite?->id,
                'invite_status' => $invite?->status,
            ];
        }

        return response()->json($data);
    }

    public function storeStudent(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'name' => ['required_without:user_id', 'nullable', 'string', 'max:255'],
            'email' => ['required_without:user_id', 'nullable', 'email', 'max:255', 'unique:users,email'],
            'phone_number' => ['nullable', 'string', 'max:20'],
        ]);

        DB::transaction(function () use ($validated) {
            if (! empty($validated['user_id'])) {
                $user = User::findOrFail($validated['user_id']);
                $user->studentDetails()->firstOrCreate([], ['status' => 'potential']);
                return;
            }

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone_number' => PhoneNumberSanitizer::sanitize($validated['phone_number'] ?? null),
                'password' => Hash::make(Str::random(32)),
            ]);

            $user->studentDetails()->create(['status' => 'potential']);
        });

        return redirect()->route('user');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'role' => ['nullable', 'in:chair,co_chair,committee,system_admin'],
            'term_start_date' => ['nullable', 'date'],
        ]);

        $committeeDetails = $user->committeeDetails;
        $newRole = $committeeDetails ? ($validated['role'] ?? $committeeDetails->role) : null;

        if ($committeeDetails && $user->is($request->user()) && $newRole !== $committeeDetails->role) {
            throw ValidationException::withMessages([
                'role' => "You can't change your own role.",
            ]);
        }

        DB::transaction(function () use ($validated, $user, $committeeDetails, $newRole) {
            $user->update([
                'name' => $validated['name'],
                'phone_number' => PhoneNumberSanitizer::sanitize($validated['phone_number'] ?? null),
            ]);

            if (! $committeeDetails) {
                return;
            }

            $termStart = $validated['term_start_date'] ?? $committeeDetails->term_start_date;

            // System Admins have no expiring term; every other role serves two years.
            $committeeDetails->update([
                'role' => $newRole,
                'term_start_date' => $termStart,
                'term_end_date' => $newRole === 'system_admin' || ! $termStart
                    ? null
                    : \Carbon\Carbon::parse($termStart)->addYears(2),
            ]);

            CommitteeInvite::where('email', $user->email)->update(['role' => $newRole]);
        });

        return redirect()->route('user');
    }

    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()->route('user');
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->query('q', '');
        $excludeRole = $request->query('exclude_role');

        $users = User::query()
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%");
            })
            ->when($excludeRole === 'committee', fn ($q) => $q->whereDoesntHave('committeeDetails'))
            ->when($excludeRole === 'student', fn ($q) => $q->whereDoesntHave('studentDetails'))
            ->limit(10)
            ->get(['id', 'name', 'email']);

        return response()->json(['users' => $users]);
    }
}