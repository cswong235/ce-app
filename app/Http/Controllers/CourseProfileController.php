<?php

namespace App\Http\Controllers;

use App\Models\CourseProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\ClassEnrollment;
use App\Models\FacilitatorStatus;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class CourseProfileController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('CourseProfile/CourseProfile', [
            'courseProfiles' => CourseProfile::query()
                ->with('prerequisites:id,title')
                ->latest()
                ->get(),
            'prerequisiteOptions' => CourseProfile::query()
                ->orderBy('title')
                ->get(['id', 'title']),
            'classes' => \App\Models\Classes::query()
                ->with(['courseProfile:id,title', 'facilitator:id,name'])
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'target_audience' => ['nullable', 'string', 'max:255'],
            'early_bird_fees' => ['nullable', 'numeric', 'min:0'],
            'standard_fees' => ['nullable', 'numeric', 'min:0'],
            'course_type' => ['required', 'in:standard,facilitator'],
            'suggested_class_capacity' => ['nullable', 'integer', 'min:1'],
            'prerequisite_course_profile_ids' => [
                'nullable',
                'array',
            ],
            'prerequisite_course_profile_ids.*' => [
                'integer',
                'exists:course_profiles,id',
            ],
        ]);

        $this->validateNoSelfPrerequisite($validated['prerequisite_course_profile_ids'] ?? [], null);

        DB::transaction(function () use ($validated): void {
            $prerequisiteIds = $validated['prerequisite_course_profile_ids'] ?? [];
            unset($validated['prerequisite_course_profile_ids']);

            $courseProfile = CourseProfile::create($validated);

            if (! empty($prerequisiteIds)) {
                $courseProfile->prerequisites()->attach($prerequisiteIds);
            }
        });

        return redirect()->route('course_profile');
    }

    public function update(Request $request, CourseProfile $courseProfile): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'target_audience' => ['nullable', 'string', 'max:255'],
            'early_bird_fees' => ['nullable', 'numeric', 'min:0'],
            'standard_fees' => ['nullable', 'numeric', 'min:0'],
            'course_type' => ['required', 'in:standard,facilitator'],
            'suggested_class_capacity' => ['nullable', 'integer', 'min:1'],
            'prerequisite_course_profile_ids' => [
                'nullable',
                'array',
            ],
            'prerequisite_course_profile_ids.*' => [
                'integer',
                'exists:course_profiles,id',
            ],
        ]);

        $this->validateNoSelfPrerequisite($validated['prerequisite_course_profile_ids'] ?? [], $courseProfile->id);

        DB::transaction(function () use ($validated, $courseProfile): void {
            $prerequisiteIds = $validated['prerequisite_course_profile_ids'] ?? [];
            unset($validated['prerequisite_course_profile_ids']);

            $courseProfile->update($validated);
            $courseProfile->prerequisites()->sync($prerequisiteIds);
        });

        return redirect()->route('course_profile');
    }

    protected function validateNoSelfPrerequisite(?array $prerequisiteIds, ?int $currentProfileId): void
    {
        $ids = $prerequisiteIds ?? [];

        if (empty($ids)) {
            return;
        }

        if (in_array($currentProfileId, array_map('intval', $ids), true)) {
            abort(422, 'A course profile cannot be its own prerequisite.');
        }
    }

    public function destroy(CourseProfile $courseProfile): RedirectResponse
    {
        $courseProfile->delete();

        return redirect()->route('course_profile');
    }

    public function facilitators(CourseProfile $courseProfile): JsonResponse
    {
        $completedEnrollments = ClassEnrollment::query()
            ->where('status', 'completed')
            ->whereHas('classes', fn ($query) => $query->where('course_profile_id', $courseProfile->id))
            ->with('student:id,name,email')
            ->get()
            ->unique('student_id');

        $existingStatuses = FacilitatorStatus::query()
            ->where('course_profile_id', $courseProfile->id)
            ->whereIn('student_id', $completedEnrollments->pluck('student_id'))
            ->get()
            ->keyBy('student_id');

        $candidates = $completedEnrollments->map(function ($enrollment) use ($existingStatuses) {
            return [
                'student_id' => $enrollment->student->id,
                'name' => $enrollment->student->name,
                'email' => $enrollment->student->email,
                'facilitator_status' => $existingStatuses->get($enrollment->student->id),
            ];
        })->values();

        return response()->json(['candidates' => $candidates]);
    }
}
