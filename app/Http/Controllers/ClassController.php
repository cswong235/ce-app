<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use App\Models\CourseProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ClassController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Class/Class', [
            'classes' => Classes::query()
                ->with(['courseProfile:id,title', 'facilitator:id,name'])
                ->latest()
                ->get(),
            'courseProfileOptions' => CourseProfile::query()
                ->orderBy('title')
                ->get(['id', 'title']),
            'facilitatorOptions' => User::query()
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_profile_id' => ['required', 'integer', 'exists:course_profiles,id'],
            'facilitator_id' => ['nullable', 'integer', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:planning,open,in_progress,completed,cancelled'],
            'language' => ['required', 'string', 'max:255'],
            'mode' => ['required', 'in:online,hybrid,physical'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
        ]);

        Classes::create($validated);

        return redirect()->route('class');
    }

    public function update(Request $request, Classes $class): RedirectResponse
    {
        $validated = $request->validate([
            'course_profile_id' => ['required', 'integer', 'exists:course_profiles,id'],
            'facilitator_id' => ['nullable', 'integer', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:planning,open,in_progress,completed,cancelled'],
            'language' => ['required', 'string', 'max:255'],
            'mode' => ['required', 'in:online,hybrid,physical'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
        ]);

        $class->update($validated);

        return redirect()->route('class');
    }

    public function destroy(Classes $class): RedirectResponse
    {
        $class->delete();

        return redirect()->route('class');
    }
}
