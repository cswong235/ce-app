import Modal from '@/Components/Modal';
import { useMemo } from 'react';

export default function AvailableClassesModal({ show, onClose, courseProfile, classes }) {
    const relatedClasses = useMemo(() => {
        if (!courseProfile || !classes) return [];
        return classes.filter((cls) => cls.course_profile_id === courseProfile.id);
    }, [courseProfile, classes]);

    return (
        <Modal show={show} onClose={onClose} maxWidth="3xl">
            <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">Available classes</h2>
                        {courseProfile && (
                            <p className="mt-1 text-sm text-gray-500">{courseProfile.title}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close available classes"
                        className="text-2xl leading-none text-gray-400 hover:text-gray-600"
                    >
                        &times;
                    </button>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 font-medium">Class name</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Facilitator</th>
                                <th className="px-4 py-3 font-medium">Start date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {relatedClasses.length > 0 ? (
                                relatedClasses.map((cls) => (
                                    <tr key={cls.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{cls.name}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            <span className="inline-block rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                                {cls.status === 'planning' && 'Planning'}
                                                {cls.status === 'open' && 'Open'}
                                                {cls.status === 'in_progress' && 'In Progress'}
                                                {cls.status === 'completed' && 'Completed'}
                                                {cls.status === 'cancelled' && 'Cancelled'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{cls.facilitator?.name ?? 'TBA'}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {cls.start_date
                                                ? new Date(cls.start_date).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })
                                                : 'TBA'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="px-4 py-4 text-center text-gray-500" colSpan="4">
                                        <span className="italic text-gray-400">No classes found for this course profile</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    );
}
