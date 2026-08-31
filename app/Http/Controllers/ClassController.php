<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use App\Models\CourseProfile;
use App\Models\FacilitatorStatus;
use App\Models\User;
use App\Models\ClassAdmin;
use App\Models\ClassEnrollment;
use App\Models\GraduationItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ClassController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Class/Class', [
            'classes' => Classes::query()
                ->with(['courseProfile:id,title', 'facilitators:id,name'])
                ->withCount('enrollments')
                ->latest()
                ->get(),
            'courseProfileOptions' => CourseProfile::query()
                ->orderBy('title')
                ->get(['id', 'title']),
            'facilitatorOptions' => $this->appointedFacilitatorsByCourseProfile(),
        ]);
    }

    public function show(Classes $class): JsonResponse
    {
        return response()->json([
            'class' => $class->load(['courseProfile:id,title', 'facilitators:id,name', 'classAdmin.committee:id,name']),
            'graduationItems' => GraduationItem::where('class_id', $class->id)->get(),
            'committeeOptions' => User::query()
                ->whereHas('committeeDetails')
                ->orderBy('name')
                ->get(['id', 'name']),
            'facilitatorOptions' => $this->appointedFacilitatorsForCourseProfile($class->course_profile_id),
            'enrollments' => ClassEnrollment::query()
                ->where('class_id', $class->id)
                ->with('student:id,name,email')
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_profile_id' => ['required', 'integer', 'exists:course_profiles,id'],
            'facilitator_ids' => ['nullable', 'array'],
            'facilitator_ids.*' => ['integer', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:planning,open,in_progress,completed,cancelled'],
            'language' => ['required', 'string', 'max:255'],
            'mode' => ['required', 'in:online,hybrid,physical'],
            'venue' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
        ]);

        $facilitatorIds = $validated['facilitator_ids'] ?? [];
        unset($validated['facilitator_ids']);

        foreach ($facilitatorIds as $facilitatorId) {
            $this->assertFacilitatorIsAppointed($facilitatorId, $validated['course_profile_id'], 'facilitator_ids');
        }

        $class = Classes::create($validated);
        $class->facilitators()->sync($facilitatorIds);

        return redirect()->route('class');
    }

    public function update(Request $request, Classes $class): RedirectResponse
    {
        $validated = $request->validate([
            'course_profile_id' => ['required', 'integer', 'exists:course_profiles,id'],
            'facilitator_ids' => ['nullable', 'array'],
            'facilitator_ids.*' => ['integer', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:planning,open,in_progress,completed,cancelled'],
            'language' => ['required', 'string', 'max:255'],
            'mode' => ['required', 'in:online,hybrid,physical'],
            'venue' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
        ]);

        $facilitatorIds = $validated['facilitator_ids'] ?? [];
        unset($validated['facilitator_ids']);

        foreach ($facilitatorIds as $facilitatorId) {
            $this->assertFacilitatorIsAppointed($facilitatorId, $validated['course_profile_id'], 'facilitator_ids');
        }

        $class->update($validated);
        $class->facilitators()->sync($facilitatorIds);

        return redirect()->route('class');
    }

    public function addFacilitator(Request $request, Classes $class): JsonResponse
    {
        $validated = $request->validate([
            'facilitator_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $this->assertFacilitatorIsAppointed($validated['facilitator_id'], $class->course_profile_id);

        $class->facilitators()->syncWithoutDetaching([
            $validated['facilitator_id'] => ['assigned_at' => now()],
        ]);

        return response()->json(['success' => true]);
    }

    public function removeFacilitator(Classes $class, User $facilitator): JsonResponse
    {
        $class->facilitators()->detach($facilitator->id);

        return response()->json(['success' => true]);
    }

    public function destroy(Classes $class): RedirectResponse
    {
        $class->delete();

        return redirect()->route('class');
    }

    public function uploadAttendanceRecord(Request $request, Classes $class): JsonResponse
    {
        $request->validate([
            'attendance_record' => ['required', 'file', 'max:10240'],
        ]);

        $path = $request->file('attendance_record')->store('attendance-records', 'public');

        $class->update(['attendance_record_path' => $path]);

        return response()->json(['success' => true, 'path' => $path]);
    }

    // A facilitator can only be assigned to a class if they've been appointed
    // (facilitator_statuses.status = 'appointed') for that class's course profile.
    private function assertFacilitatorIsAppointed(?int $facilitatorId, int $courseProfileId, string $field = 'facilitator_id'): void
    {
        if (!$facilitatorId) {
            return;
        }

        $isAppointed = FacilitatorStatus::query()
            ->where('course_profile_id', $courseProfileId)
            ->where('student_id', $facilitatorId)
            ->where('status', 'appointed')
            ->exists();

        if (!$isAppointed) {
            throw ValidationException::withMessages([
                $field => 'Selected facilitator is not appointed for this course profile.',
            ]);
        }
    }

    private function appointedFacilitatorsForCourseProfile(int $courseProfileId)
    {
        return FacilitatorStatus::query()
            ->where('course_profile_id', $courseProfileId)
            ->where('status', 'appointed')
            ->with('student:id,name')
            ->get()
            ->pluck('student')
            ->filter()
            ->unique('id')
            ->sortBy('name')
            ->values();
    }

    private function appointedFacilitatorsByCourseProfile()
    {
        return FacilitatorStatus::query()
            ->where('status', 'appointed')
            ->with('student:id,name')
            ->get()
            ->groupBy('course_profile_id')
            ->map(fn ($statuses) => $statuses->pluck('student')->filter()->unique('id')->sortBy('name')->values());
    }
}
