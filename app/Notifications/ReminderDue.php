<?php

namespace App\Notifications;

use App\Models\Reminder;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReminderDue extends Notification
{
    public function __construct(private readonly Reminder $reminder)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject('Reminder: ' . $this->reminder->event_name)
            ->line('This is a reminder for: ' . $this->reminder->event_name);

        if ($this->reminder->event_at) {
            $message->line('Event date & time: ' . $this->reminder->event_at->format('M j, Y g:i A'));
        }

        if ($this->reminder->event_description) {
            $message->line($this->reminder->event_description);
        }

        return $message;
    }
}
