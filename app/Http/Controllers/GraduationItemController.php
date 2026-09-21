<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use App\Models\GraduationItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GraduationItemController extends Controller
{
    public function updateClassDate(Request $request, Classes $class): JsonResponse
    {
        abort_unless($request->user()->canManageClass($class->id), 403);

        $validated = $request->validate([
            'graduation_date' => ['nullable', 'date'],
        ]);

        $class->update($validated);

        return response()->json(['success' => true]);
    }

    public function store(Request $request, Classes $class): JsonResponse
    {
        abort_unless($request->user()->canManageClass($class->id), 403);

        $validated = $request->validate([
            'item_name' => ['required', 'string', 'max:255'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $item = $class->graduationItems()->create($validated);

        return response()->json(['success' => true, 'item' => $item]);
    }

    public function destroy(Request $request, GraduationItem $graduationItem): JsonResponse
    {
        abort_unless($request->user()->canManageClass($graduationItem->class_id), 403);

        $graduationItem->delete();

        return response()->json(['success' => true]);
    }
}