<?php

namespace App\Http\Controllers;

use App\Models\ClassEnrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ClassEnrollmentController extends Controller
{
    public function updateStatus(Request $request, ClassEnrollment $enrollment): JsonResponse
    {
        abort_unless($request->user()->canManageClass($enrollment->class_id), 403);

        $validated = $request->validate([
            'status' => ['required', 'in:active,left,completed'],
        ]);

        $update = ['status' => $validated['status']];

        if ($validated['status'] === 'left') {
            $update['left_at'] = now();
            $update['completed_at'] = null;
        } elseif ($validated['status'] === 'completed') {
            $update['completed_at'] = now();
            $update['left_at'] = null;
        } else {
            $update['left_at'] = null;
            $update['completed_at'] = null;
        }

        $enrollment->update($update);

        return response()->json(['success' => true, 'enrollment' => $enrollment]);
    }

    public function updatePaymentStatus(Request $request, ClassEnrollment $enrollment): JsonResponse
    {
        $validated = $request->validate([
            'payment_status' => ['required', 'in:paid,not_paid'],
        ]);

        $enrollment->update($validated);

        return response()->json(['success' => true]);
    }

    public function uploadReceipt(Request $request, ClassEnrollment $enrollment): JsonResponse
    {
        abort_unless($request->user()->canManageClass($enrollment->class_id), 403);

        $request->validate([
            'receipt' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $path = $request->file('receipt')->store('payment-receipts', 'public');

        $enrollment->update([
            'payment_receipt_path' => $path,
            'payment_status' => 'paid',
        ]);

        return response()->json(['success' => true, 'path' => $path]);
    }

    public function updateTestimonial(Request $request, ClassEnrollment $enrollment): JsonResponse
    {
        abort_unless($request->user()->canManageClass($enrollment->class_id), 403);

        $validated = $request->validate([
            'testimonial' => ['nullable', 'string'],
        ]);

        $enrollment->update(['testimonial' => $validated['testimonial']]);

        return response()->json(['success' => true]);
    }
}