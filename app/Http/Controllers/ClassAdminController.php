<?php

namespace App\Http\Controllers;

use App\Models\ClassAdmin;
use App\Models\Classes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassAdminController extends Controller
{
    public function store(Request $request, Classes $class): JsonResponse
    {
        $validated = $request->validate([
            'committee_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        ClassAdmin::updateOrCreate(
            ['class_id' => $class->id],
            ['committee_id' => $validated['committee_id'], 'assigned_at' => now()]
        );

        return response()->json(['success' => true]);
    }

    public function destroy(Classes $class): JsonResponse
    {
        ClassAdmin::where('class_id', $class->id)->delete();

        return response()->json(['success' => true]);
    }
}