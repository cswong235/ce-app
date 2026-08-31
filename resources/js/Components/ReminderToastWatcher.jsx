import axios from 'axios';
import { useEffect, useRef } from 'react';

const SHOWN_KEY = 'shown_reminder_toasts';
const DUE_CHECK_ATTEMPTS = 4;
const DUE_CHECK_INTERVAL_MS = 20000;

function getShownIds() {
    try {
        return new Set(JSON.parse(localStorage.getItem(SHOWN_KEY) ?? '[]'));
    } catch {
        return new Set();
    }
}

function markShown(id) {
    const shown = getShownIds();
    shown.add(id);
    localStorage.setItem(SHOWN_KEY, JSON.stringify([...shown]));
}

export default function ReminderToastWatcher() {
    const timeoutRef = useRef(null);
    const checkCountRef = useRef(0);

    useEffect(() => {
        if (typeof Notification === 'undefined') return;

        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const checkForDueReminders = () => {
            axios.get(route('reminder.notifications')).then((res) => {
                const shown = getShownIds();

                res.data.reminders.forEach((reminder) => {
                    if (shown.has(reminder.id)) return;

                    if (Notification.permission === 'granted') {
                        new Notification(reminder.event_name, {
                            body: reminder.event_description || 'This reminder is now due.',
                        });
                    }

                    markShown(reminder.id);
                });
            });
        };

        const scheduleNextCheck = () => {
            axios.get(route('reminder.next_due')).then((res) => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);

                if (!res.data.remind_at) return;

                const delay = Math.max(0, new Date(res.data.remind_at) - new Date());
                checkCountRef.current = 0;

                timeoutRef.current = setTimeout(function attempt() {
                    checkForDueReminders();
                    checkCountRef.current += 1;

                    if (checkCountRef.current < DUE_CHECK_ATTEMPTS) {
                        timeoutRef.current = setTimeout(attempt, DUE_CHECK_INTERVAL_MS);
                    } else {
                        scheduleNextCheck();
                    }
                }, delay);
            });
        };

        scheduleNextCheck();

        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') scheduleNextCheck();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, []);

    return null;
}
