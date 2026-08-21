<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\Classes;
use App\Models\CourseProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BatchController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Batch/Batch', [
            'batches' => Batch::query()
                ->with('courseProfile:id,title')
                ->withCount('registrations')
                ->latest()
                ->get(),
            'courseProfileOptions' => CourseProfile::query()
                ->orderBy('title')
                ->get(['id', 'title']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_profile_id' => ['required', 'integer', 'exists:course_profiles,id'],
            'name' => ['required', 'string', 'max:255'],
            'google_form_link' => ['nullable', 'url', 'max:255'],
        ]);

        Batch::create($validated);

        return redirect()->route('batch');
    }

    public function update(Request $request, Batch $batch): RedirectResponse
    {
        $validated = $request->validate([
            'course_profile_id' => ['required', 'integer', 'exists:course_profiles,id'],
            'name' => ['required', 'string', 'max:255'],
            'google_form_link' => ['nullable', 'url', 'max:255'],
        ]);

        $batch->update($validated);

        return redirect()->route('batch');
    }

    public function show(Batch $batch): JsonResponse
    {
        return response()->json([
            'batch' => $batch->load('courseProfile:id,title,suggested_class_capacity'),
            'registrations' => $batch->registrations()
                ->with('student:id,name,email')
                ->latest()
                ->get(),
            'eligibleClasses' => Classes::query()
                ->where('course_profile_id', $batch->course_profile_id)
                ->where('status', 'open')
                ->withCount('enrollments')
                ->orderBy('name')
                ->get(['id', 'name', 'course_profile_id']),
        ]);
    }
    public function destroy(Batch $batch): RedirectResponse
    {
        $batch->delete();

        return redirect()->route('batch');
    }
}