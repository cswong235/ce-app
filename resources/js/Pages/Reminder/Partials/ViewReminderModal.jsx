import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';

const statusLabels = {
    upcoming: 'Upcoming',
    passed: 'Passed',
};

const statusColors = {
    upcoming: 'bg-indigo-100 text-indigo-700',
    passed: 'bg-gray-100 text-gray-600',
};

const roleLabels = {
    chair: 'CE Chair',
    co_chair: 'CE Co-Chair',
    committee: 'CE Committee',
    student: 'Students',
    system_admin: 'System Admin',
};

function formatDateTime(dateString) {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function ViewReminderModal({ show, onClose, reminder }) {
    const roleTags = [
        ...(reminder?.notify_self ? ['Yourself'] : []),
        ...(reminder?.roles ?? []).map((role) => roleLabels[role] ?? role),
    ];

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">{reminder?.event_name}</h2>
                        <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[reminder?.status]}`}>
                            {statusLabels[reminder?.status] ?? reminder?.status}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-2xl leading-none text-gray-400 hover:text-gray-600"
                    >
                        &times;
                    </button>
                </div>

                <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Event Date &amp; Time</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDateTime(reminder?.event_at) ?? 'TBA'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Reminder Date &amp; Time</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDateTime(reminder?.remind_at)}</dd>
                    </div>
                </dl>

                <div className="mt-4">
                    <dt className="text-sm font-medium text-gray-500">Event Description</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                        {reminder?.event_description || <span className="text-gray-400">No description provided.</span>}
                    </dd>
                </div>

                <div className="mt-4">
                    <dt className="text-sm font-medium text-gray-500">Involved Roles</dt>
                    <dd className="mt-1.5">
                        {roleTags.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {roleTags.map((tag) => (
                                    <span key={tag} className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-sm text-gray-400">No roles selected.</span>
                        )}
                    </dd>
                </div>

                <div className="mt-4">
                    <dt className="text-sm font-medium text-gray-500">Involved People</dt>
                    <dd className="mt-1.5">
                        {reminder?.recipients?.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {reminder.recipients.map((person) => (
                                    <span key={person.id} className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                        {person.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-sm text-gray-400">No individual people selected.</span>
                        )}
                    </dd>
                </div>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton type="button" onClick={onClose}>Close</SecondaryButton>
                </div>
            </div>
        </Modal>
    );
}
