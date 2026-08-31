<?php

namespace App\Console\Commands;

use App\Models\Reminder;
use App\Notifications\ReminderDue;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class ProcessDueReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reminders:process-due';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send notifications for due reminders and flip their status to passed';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $due = Reminder::query()
            ->where('status', 'upcoming')
            ->where('remind_at', '<=', now())
            ->get();

        foreach ($due as $reminder) {
            $recipients = $reminder->resolveRecipients();

            if (in_array('email', $reminder->notification_methods ?? [], true) && $recipients->isNotEmpty()) {
                Notification::send($recipients, new ReminderDue($reminder));
            }

            $reminder->update(['status' => 'passed', 'notified_at' => now()]);
        }

        $this->info("Processed {$due->count()} due reminder(s).");
    }
}
