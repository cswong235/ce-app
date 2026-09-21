import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 8;

const facilitatorStatusLabels = {
    potential: 'Potential',
    appointed: 'Appointed',
};

export default function ManageFacilitatorsModal({ courseProfile, show, onClose }) {
    const canManage = usePage().props.auth.hasFullAccess;
    const [loading, setLoading] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchCandidates = () => {
        if (!courseProfile) return;
        setLoading(true);
        axios.get(route('course_profile.facilitators', courseProfile.id)).then((res) => {
            setCandidates(res.data.candidates);
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        if (show && courseProfile) {
            fetchCandidates();
            setSelectedIds([]);
            setCurrentPage(1);
            setSearchTerm('');
            setStatusFilter('all');
        }
    }, [show, courseProfile]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const filteredCandidates = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return candidates.filter((candidate) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                candidate.name.toLowerCase().includes(normalizedSearch);

            const status = candidate.facilitator_status?.status ?? 'not_applicable';
            const matchesStatus = statusFilter === 'all' || status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [candidates, searchTerm, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / PAGE_SIZE));
    const paginatedCandidates = filteredCandidates.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );
    const startIndex = filteredCandidates.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
    const endIndex = Math.min(currentPage * PAGE_SIZE, filteredCandidates.length);

    const toggleSelected = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
        );
    };

    const submitMarking = () => {
        if (selectedIds.length === 0) return;

        setSubmitting(true);
        axios.post(route('facilitator_status.mark_for_course', courseProfile.id), {
            student_ids: selectedIds,
        }).then(() => {
            setSelectedIds([]);
            fetchCandidates();
        }).finally(() => setSubmitting(false));
    };

    const promoteToAppointed = (facilitatorStatusId) => {
        axios.patch(route('facilitator_status.update', facilitatorStatusId), {
            status: 'appointed',
        }).then(fetchCandidates);
    };

    const revertToPotential = (facilitatorStatusId) => {
        axios.patch(route('facilitator_status.update', facilitatorStatusId), {
            status: 'potential',
        }).then(fetchCandidates);
    };

    const removeFacilitatorMark = (facilitatorStatusId) => {
        axios.delete(route('facilitator_status.destroy', facilitatorStatusId)).then(fetchCandidates);
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="4xl">
            <div className="max-h-[85vh] overflow-y-auto p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">
                            Potential Facilitators — {courseProfile?.title}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Students who have completed this course.
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
                        <div className="mt-6 overflow-hidden bg-gray-100 p-4 shadow-sm sm:rounded-lg">
                            <div className="flex flex-col gap-3 md:flex-row md:items-end">
                                <div className="w-full md:max-w-md">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Search by name</label>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder="Search candidates"
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="w-full md:max-w-xs">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Filter by status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(event) => setStatusFilter(event.target.value)}
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="all">All statuses</option>
                                        <option value="not_applicable">Not Applicable</option>
                                        <option value="potential">Potential</option>
                                        <option value="appointed">Appointed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                            <span>
                                Showing {filteredCandidates.length ? startIndex : 0} - {endIndex} of {filteredCandidates.length}
                            </span>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                        </div>

                        <table className="mt-3 w-full text-left text-sm">
                            <thead className="border-b border-gray-200 bg-gray-100 text-gray-600">
                                <tr>
                                    <th className="p-2"></th>
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Email</th>
                                    <th className="p-2">Facilitator Status</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedCandidates.length > 0 ? (
                                    paginatedCandidates.map((candidate) => (
                                        <tr key={candidate.student_id} className="border-b">
                                            <td className="p-2">
                                                {canManage && !candidate.facilitator_status && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(candidate.student_id)}
                                                        onChange={() => toggleSelected(candidate.student_id)}
                                                    />
                                                )}
                                            </td>
                                            <td className="p-2">{candidate.name}</td>
                                            <td className="p-2">{candidate.email}</td>
                                            <td className="p-2">
                                                {candidate.facilitator_status ? (
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                        candidate.facilitator_status.status === 'appointed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {facilitatorStatusLabels[candidate.facilitator_status.status]}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Not Applicable</span>
                                                )}
                                            </td>
                                            <td className="p-2">
                                                {canManage && (
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {candidate.facilitator_status?.status === 'potential' && (
                                                        <SecondaryButton type="button"
                                                            onClick={() => promoteToAppointed(candidate.facilitator_status.id)}
                                                            className="rounded border border-green-600 px-2 py-1 text-xs text-green-700 hover:bg-green-50">
                                                            Appoint
                                                        </SecondaryButton>
                                                    )}
                                                    {candidate.facilitator_status?.status === 'appointed' && (
                                                        <SecondaryButton type="button"
                                                            onClick={() => revertToPotential(candidate.facilitator_status.id)}
                                                            className="rounded border !border-amber-600 px-2 py-1 text-xs !text-amber-700 hover:!bg-amber-50">
                                                            Revert
                                                        </SecondaryButton>
                                                    )}
                                                    {candidate.facilitator_status && (
                                                        <SecondaryButton type="button"
                                                            onClick={() => removeFacilitatorMark(candidate.facilitator_status.id)}
                                                            className="rounded border border-red-600 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                                                            Remove
                                                        </SecondaryButton>
                                                    )}
                                                </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-4 text-center text-gray-500">
                                            {candidates.length === 0
                                                ? 'No students have completed this course yet.'
                                                : 'No candidates match your filters.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

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
                    {canManage && (
                        <PrimaryButton
                            type="button"
                            disabled={selectedIds.length === 0 || submitting}
                            onClick={submitMarking}
                        >
                            {submitting ? 'Marking...' : `Mark ${selectedIds.length || ''} as Potential`}
                        </PrimaryButton>
                    )}
                </div>
            </div>
        </Modal>
    );
}