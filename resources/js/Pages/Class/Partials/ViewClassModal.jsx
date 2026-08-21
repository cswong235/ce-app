import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';

function Detail({ label, children }) {
    return (
        <div>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">
                {children ?? (
                    <span className="italic text-gray-400">TBA</span>
                )}
            </dd>
        </div>
    );
}

const statusLabels = {
    planning: 'Planning',
    open: 'Open',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export default function ViewClassModal({ classItem, onClose }) {
    const close = () => {
        onClose();
    };

    return (
        <Modal show={Boolean(classItem)} onClose={close} maxWidth="2xl">
            {classItem && (
                <div className="max-h-[85vh] overflow-y-auto p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">{classItem.name}</h2>
                            <p className="mt-1 text-sm text-gray-500">Class details</p>
                        </div>
                        <button
                            type="button"
                            onClick={close}
                            aria-label="Close class"
                            className="text-2xl leading-none text-gray-400 hover:text-gray-600"
                        >
                            &times;
                        </button>
                    </div>

                    <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                        <Detail label="Class name">{classItem.name}</Detail>
                        <Detail label="Status">{statusLabels[classItem.status] ?? classItem.status}</Detail>
                        <Detail label="Course profile">{classItem.course_profile?.title ?? classItem.course_profile_id}</Detail>
                        <Detail label="Facilitator">{classItem.facilitator?.name ?? 'TBA'}</Detail>
                        <div className="sm:col-span-2">
                            <Detail label="Description">{classItem.description}</Detail>
                        </div>
                        <Detail label="Language">{classItem.language}</Detail>
                        <Detail label="Mode">{classItem.mode === 'online'
                                    ? 'Online'
                                    : classItem.mode === 'physical' ? 'Physical' : 'Hybrid'}</Detail>
                        {classItem.mode === 'physical' && (
                            <Detail label="Venue">{classItem.venue}</Detail>
                        )}
                        <Detail label="Start date">
                            {classItem.start_date
                                ? new Date(classItem.start_date).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                })
                                : null}
                        </Detail>
                        <Detail label="End date">
                            {classItem.end_date
                                ? new Date(classItem.end_date).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                })
                                : null}
                        </Detail>
                        <Detail label="Start time">{classItem.start_time}</Detail>
                        <Detail label="End time">{classItem.end_time}</Detail>
                    </dl>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={close}>Close</SecondaryButton>
                    </div>
                </div>
            )}
        </Modal>
    );
}
