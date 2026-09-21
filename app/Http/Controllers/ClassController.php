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
        Classes::syncAutoStatuses();

        return Inertia::render('Class/Class', [
            'classes' => Classes::query()
                ->with(['courseProfile:id,title', 'facilitators:id,name', 'classAdmin'])
                ->withCount('enrollments')
                ->latest()
                ->get(),
            'courseProfileOptions' => CourseProfile::query()
                ->orderBy('title')
                ->get(['id', 'title']),
            'facilitatorOptions' => $this->appointedFacilitatorsByCourseProfile(),
            'committeeOptions' => User::query()
                ->whereHas('committeeDetails')
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function show(Classes $class): JsonResponse
    {
        Classes::syncAutoStatuses();
        $class->refresh();

        return response()->json([
            'class' => $class->load(['courseProfile:id,title', 'facilitators:id,name', 'classAdmin.committee:id,name']),
            'graduationItems' => GraduationItem::where('class_id', $class->id)->get(),
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
            'class_admin_id' => ['nullable', 'integer', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'language' => ['required', 'string', 'max:255'],
            'mode' => ['required', 'in:online,hybrid,physical'],
            'venue' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
        ]);

        $facilitatorIds = $validated['facilitator_ids'] ?? [];
        $classAdminId = $validated['class_admin_id'] ?? null;
        unset($validated['facilitator_ids'], $validated['class_admin_id']);

        foreach ($facilitatorIds as $facilitatorId) {
            $this->assertFacilitatorIsAppointed($facilitatorId, $validated['course_profile_id'], 'facilitator_ids');
        }

        $class = Classes::create([...$validated, 'status' => 'planning']);
        $class->facilitators()->sync($facilitatorIds);
        $this->syncClassAdmin($class, $classAdminId);

        return redirect()->route('class');
    }

    public function update(Request $request, Classes $class): RedirectResponse
    {
        $validated = $request->validate([
            'course_profile_id' => ['required', 'integer', 'exists:course_profiles,id'],
            'facilitator_ids' => ['nullable', 'array'],
            'facilitator_ids.*' => ['integer', 'exists:users,id'],
            'class_admin_id' => ['nullable', 'integer', 'exists:users,id'],
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
        $classAdminId = $validated['class_admin_id'] ?? null;
        unset($validated['facilitator_ids'], $validated['class_admin_id']);

        foreach ($facilitatorIds as $facilitatorId) {
            $this->assertFacilitatorIsAppointed($facilitatorId, $validated['course_profile_id'], 'facilitator_ids');
        }

        $class->update($validated);
        $class->facilitators()->sync($facilitatorIds);
        $this->syncClassAdmin($class, $classAdminId);

        return redirect()->route('class');
    }

    public function destroy(Classes $class): RedirectResponse
    {
        $class->delete();

        return redirect()->route('class');
    }

    public function uploadAttendanceRecord(Request $request, Classes $class): JsonResponse
    {
        abort_unless($request->user()->canManageClass($class->id), 403);

        $request->validate([
            'attendance_record' => ['required', 'file', 'max:10240'],
        ]);

        $path = $request->file('attendance_record')->store('attendance-records', 'public');

        $class->update(['attendance_record_path' => $path]);

        return response()->json(['success' => true, 'path' => $path]);
    }

    private function syncClassAdmin(Classes $class, ?int $committeeId): void
    {
        if (!$committeeId) {
            ClassAdmin::where('class_id', $class->id)->delete();
            return;
        }

        $current = ClassAdmin::where('class_id', $class->id)->first();

        if ($current?->committee_id !== $committeeId) {
            ClassAdmin::updateOrCreate(
                ['class_id' => $class->id],
                ['committee_id' => $committeeId, 'assigned_at' => now()]
            );
        }
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
