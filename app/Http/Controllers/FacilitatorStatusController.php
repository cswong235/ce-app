<?php

namespace App\Http\Controllers;

use App\Models\CourseProfile;
use App\Models\FacilitatorStatus;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
}