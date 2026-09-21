import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const DISPLAY_MS = 5000;

export default function ErrorToast() {
    const { flash } = usePage().props;
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.error) {
            setToast({ id: Date.now(), text: flash.error });
        }
    }, [flash]);

    useEffect(() => {
        const handleEvent = (event) => setToast({ id: Date.now(), text: event.detail });

        window.addEventListener('app:error-toast', handleEvent);
        return () => window.removeEventListener('app:error-toast', handleEvent);
    }, []);

    useEffect(() => {
        if (!toast) return;

        const timeout = setTimeout(() => setToast(null), DISPLAY_MS);
        return () => clearTimeout(timeout);
    }, [toast]);

    if (!toast) return null;

    return (
        <div
            role="alert"
            className="fixed right-4 top-4 z-[60] flex max-w-sm items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-lg"
        >
            <span className="flex-1">{toast.text}</span>
            <button
                type="button"
                onClick={() => setToast(null)}
                aria-label="Dismiss"
                className="text-lg leading-none text-red-400 hover:text-red-600"
            >
                &times;
            </button>
        </div>
    );
}
