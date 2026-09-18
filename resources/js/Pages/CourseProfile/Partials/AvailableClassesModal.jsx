import Modal from '@/Components/Modal';
import { useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 8;

const statusLabels = {
    planning: 'Planning',
    open: 'Open',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

const statusColors = {
    planning: 'bg-gray-100 text-gray-600',
    open: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

function formatDate(dateString) {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getYear(dateString) {
    if (!dateString) return '—';
    return new Date(dateString).getFullYear();
}

export default function AvailableClassesModal({ show, onClose, courseProfile, classes }) {
    const [currentPage, setCurrentPage] = useState(1);

    const relatedClasses = useMemo(() => {
        if (!courseProfile || !classes) return [];
        return classes.filter((cls) => cls.course_profile_id === courseProfile.id);
    }, [courseProfile, classes]);

    useEffect(() => {
        setCurrentPage(1);
    }, [courseProfile, show]);

    const totalPages = Math.max(1, Math.ceil(relatedClasses.length / PAGE_SIZE));
    const paginatedClasses = relatedClasses.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );
    const startIndex = relatedClasses.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
    const endIndex = Math.min(currentPage * PAGE_SIZE, relatedClasses.length);

    return (
        <Modal show={show} onClose={onClose} maxWidth="5xl">
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

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>
                        Showing {relatedClasses.length ? startIndex : 0} - {endIndex} of {relatedClasses.length}
                    </span>
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                </div>

                <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 font-medium">Class name</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Facilitator</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium">Time</th>
                                <th className="px-4 py-3 font-medium">Year</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedClasses.length > 0 ? (
                                paginatedClasses.map((cls) => (
                                    <tr key={cls.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{cls.name}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${statusColors[cls.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {statusLabels[cls.status] ?? cls.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {cls.facilitators?.length ? cls.facilitators.map((f) => f.name).join(', ') : 'TBA'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {cls.start_date && cls.end_date
                                                ? `${formatDate(cls.start_date)} – ${formatDate(cls.end_date)}`
                                                : formatDate(cls.start_date) ?? 'TBA'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {cls.start_time && cls.end_time
                                                ? `${cls.start_time} – ${cls.end_time}`
                                                : 'TBA'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{getYear(cls.created_at)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="px-4 py-4 text-center text-gray-500" colSpan="6">
                                        <span className="italic text-gray-400">No classes found for this course profile</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                        disabled={currentPage === 1}
                        className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`h-8 w-8 rounded ${
                                    currentPage === page
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </Modal>
    );
}
