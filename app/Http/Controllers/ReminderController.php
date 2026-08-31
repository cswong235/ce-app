<?php

namespace App\Http\Controllers;

use App\Models\Reminder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReminderController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Reminder/Reminder', [
            'reminders' => Reminder::query()
                ->with(['creator:id,name', 'recipients:id,name'])
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateReminder($request);

        $peopleIds = $validated['people_ids'] ?? [];
        unset($validated['people_ids']);

        $reminder = Reminder::create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        $reminder->recipients()->sync($peopleIds);

        return redirect()->route('reminder');
    }

    public function update(Request $request, Reminder $reminder): RedirectResponse
    {
        $validated = $this->validateReminder($request);

        $peopleIds = $validated['people_ids'] ?? [];
        unset($validated['people_ids']);

        $reminder->update($validated);
        $reminder->recipients()->sync($peopleIds);

        return redirect()->route('reminder');
    }

    public function destroy(Reminder $reminder): RedirectResponse
    {
        $reminder->delete();

        return redirect()->route('reminder');
    }

    public function nextDue(Request $request): JsonResponse
    {
        $user = $request->user();

        $next = Reminder::query()
            ->where('status', 'upcoming')
            ->orderBy('remind_at')
            ->get()
            ->first(fn (Reminder $reminder) => $reminder->resolveRecipients()->contains('id', $user->id));

        return response()->json(['remind_at' => $next?->remind_at]);
    }

    public function notifications(Request $request): JsonResponse
    {
        $user = $request->user();

        $due = Reminder::query()
            ->where('status', 'passed')
            ->where('notified_at', '>=', now()->subMinutes(5))
            ->get()
            ->filter(fn (Reminder $reminder) => in_array('browser', $reminder->notification_methods ?? [], true)
                && $reminder->resolveRecipients()->contains('id', $user->id))
            ->values();

        return response()->json(['reminders' => $due]);
    }

    private function validateReminder(Request $request): array
    {
        return $request->validate([
            'event_name' => ['required', 'string', 'max:255'],
            'event_description' => ['nullable', 'string'],
            'event_at' => ['nullable', 'date'],
            'remind_at' => ['required', 'date'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['in:' . implode(',', Reminder::ROLES)],
            'notify_self' => ['boolean'],
            'people_ids' => ['nullable', 'array'],
            'people_ids.*' => ['integer', 'exists:users,id'],
            'notification_methods' => ['required', 'array', 'min:1'],
            'notification_methods.*' => ['in:email,browser'],
        ]);
    }
}
