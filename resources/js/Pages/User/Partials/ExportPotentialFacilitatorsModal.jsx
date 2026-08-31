import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import axios from 'axios';
import { useEffect, useState } from 'react';

const PAGE_SIZE = 8;

export default function ExportPotentialFacilitatorsModal({ show, onClose }) {
    const [loading, setLoading] = useState(false);
    const [facilitators, setFacilitators] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (show) {
            setLoading(true);
            setCurrentPage(1);
            axios.get(route('facilitator_status.potential')).then((res) => {
                setFacilitators(res.data.facilitators);
            }).finally(() => setLoading(false));
        }
    }, [show]);

    const totalPages = Math.max(1, Math.ceil(facilitators.length / PAGE_SIZE));
    const paginatedFacilitators = facilitators.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );
    const startIndex = facilitators.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
    const endIndex = Math.min(currentPage * PAGE_SIZE, facilitators.length);

    const handleExport = () => {
        window.location.href = route('facilitator_status.potential_export');
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="4xl">
            <div className="max-h-[85vh] overflow-y-auto p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">Export Potential Facilitators</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Everyone currently marked as a potential facilitator for at least one course.
                        </p>
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

                {loading ? (
                    <p className="mt-6 text-sm text-gray-500">Loading...</p>
                ) : (
                    <>
                        <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                            <span>
                                Showing {facilitators.length ? startIndex : 0} - {endIndex} of {facilitators.length}
                            </span>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                        </div>

                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-200 bg-gray-100 text-gray-600">
                                    <tr>
                                        <th className="p-2">Name</th>
                                        <th className="p-2">Email</th>
                                        <th className="p-2">Phone Number</th>
                                        <th className="p-2">Courses</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedFacilitators.length > 0 ? (
                                        paginatedFacilitators.map((facilitator) => (
                                            <tr key={facilitator.id} className="border-b">
                                                <td className="p-2">{facilitator.name}</td>
                                                <td className="p-2">{facilitator.email}</td>
                                                <td className="p-2">{facilitator.phone_number ?? '—'}</td>
                                                <td className="p-2">
                                                    <div className="flex flex-wrap gap-1">
                                                        {facilitator.courses.map((course) => (
                                                            <span
                                                                key={course}
                                                                className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800"
                                                            >
                                                                {course}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="p-4 text-center text-gray-500">
                                                No potential facilitators found.
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
                    </>
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>Close</SecondaryButton>
                    <PrimaryButton type="button" disabled={loading || facilitators.length === 0} onClick={handleExport}>
                        Confirm &amp; Export
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}
