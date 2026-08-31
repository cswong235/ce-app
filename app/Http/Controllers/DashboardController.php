<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use App\Models\ClassRegistration;
use App\Models\CommitteeDetails;
use App\Models\Reminder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const TERM_LOOKAHEAD_DAYS = 30;
    private const WIDGET_LIMIT = 5;
    private const REMINDER_SCAN_LIMIT = 50;

    public function index(Request $request): Response
    {
        return Inertia::render('Dashboard', [
            'ongoingClasses' => $this->ongoingClasses(),
            'pendingRegistrations' => $this->pendingRegistrations(),
            'committeeTerms' => $this->committeeTerms(),
            'upcomingReminders' => $this->upcomingReminders($request),
        ]);
    }

    private function ongoingClasses(): array
    {
        $query = Classes::query()
            ->where('status', 'in_progress')
            ->with(['courseProfile:id,title', 'facilitators:id,name'])
            ->withCount('enrollments')
            ->orderByRaw('end_date IS NULL, end_date asc');

        return [
            'total' => $query->count(),
            'items' => $query->take(self::WIDGET_LIMIT)->get(),
        ];
    }

    private function pendingRegistrations(): array
    {
        $query = ClassRegistration::query()
            ->where('status', 'pending')
            ->with('batch.courseProfile:id,title')
            ->orderBy('imported_at');

        return [
            'total' => $query->count(),
            'items' => $query->take(self::WIDGET_LIMIT)->get(),
        ];
    }

    private function committeeTerms(): array
    {
        $cutoff = now()->addDays(self::TERM_LOOKAHEAD_DAYS);

        $query = CommitteeDetails::query()
            ->whereIn('role', ['chair', 'co_chair', 'committee'])
            ->whereNotNull('term_end_date')
            ->where('term_end_date', '<=', $cutoff)
            ->with('committee:id,name,email')
            ->orderBy('term_end_date');

        return [
            'total' => $query->count(),
            'items' => $query->take(self::WIDGET_LIMIT)->get(),
        ];
    }

    private function upcomingReminders(Request $request): array
    {
        $user = $request->user();

        $mine = Reminder::query()
            ->where('status', 'upcoming')
            ->orderBy('remind_at')
            ->take(self::REMINDER_SCAN_LIMIT)
            ->get()
            ->filter(fn (Reminder $reminder) => $reminder->resolveRecipients()->contains('id', $user->id))
            ->values();

        return [
            'total' => $mine->count(),
            'items' => $mine->take(self::WIDGET_LIMIT)->values(),
        ];
    }
}
