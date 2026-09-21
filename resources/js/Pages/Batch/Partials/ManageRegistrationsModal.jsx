import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import HoverTooltip from '@/Components/HoverTooltip';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, useMemo } from 'react';

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
};

export default function ManageRegistrationsModal({ batchId, show, onClose }) {
    const PAGE_SIZE = 6;
    const canManage = usePage().props.auth.hasFullAccess;

    const [loading, setLoading] = useState(false);
    const [batch, setBatch] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [eligibleClasses, setEligibleClasses] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [showingRejectModal, setShowingRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectReasonError, setRejectReasonError] = useState('');
    const [manualEntry, setManualEntry] = useState({
        form_name: '',
        form_email: '',
        form_phone: '',
        church: '',
        course_interest: '',
        previous_course: '',
        remarks: '',
    });

    const [showManualForm, setShowManualForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [excelUploading, setExcelUploading] = useState(false);
    const [excelResult, setExcelResult] = useState(null);
    const excelInputRef = useRef(null);

    const statusLabels = {
        rejected: 'Rejected',
        pending: 'Pending',
        approved: 'Approved',
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [registrations.length, searchTerm, statusFilter]);

    const filteredRegistrations = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return registrations.filter((registration) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                registration.form_name?.toLowerCase().includes(normalizedSearch) ||
                registration.form_email?.toLowerCase().includes(normalizedSearch);

            const matchesStatus = statusFilter === 'all' || registration.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [registrations, searchTerm, statusFilter]);
    

    const totalPages = Math.max(1, Math.ceil(filteredRegistrations.length / PAGE_SIZE));
    const paginatedRegistrations = filteredRegistrations.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );
    const startIndex = filteredRegistrations.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
    const endIndex = Math.min(currentPage * PAGE_SIZE, filteredRegistrations.length);

    const fetchBatch = () => {
        if (!batchId) return;
        setLoading(true);
        axios.get(route('batch.show', batchId)).then((res) => {
            setBatch(res.data.batch);
            setRegistrations(res.data.registrations);
            setEligibleClasses(res.data.eligibleClasses);
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        if (show && batchId) {
            fetchBatch();
            setSelectedIds([]);
            setSelectedClassId('');
        }
    }, [show, batchId]);

    const toggleSelected = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
        );
    };

    const toggleSelectAllPending = () => {
        const pendingIds = registrations.filter((r) => r.status === 'pending').map((r) => r.id);
        const allSelected = pendingIds.every((id) => selectedIds.includes(id)) && pendingIds.length > 0;
        setSelectedIds(allSelected ? [] : pendingIds);
    };

    const handleAssign = () => {
        if (!selectedClassId || selectedIds.length === 0) return;

        setAssigning(true);
        axios.post(route('class_registration.bulk_approve', batchId), {
            registration_ids: selectedIds,
            class_id: selectedClassId,
        }).then(() => {
            fetchBatch();
            setSelectedIds([]);
            setSelectedClassId('');
        }).finally(() => setAssigning(false));
    };

    const openRejectModal = () => {
        if (selectedIds.length === 0) return;
        setRejectReason('');
        setRejectReasonError('');
        setShowingRejectModal(true);
    };

    const closeRejectModal = () => {
        setShowingRejectModal(false);
        setRejectReason('');
        setRejectReasonError('');
    };

    const confirmBulkReject = (event) => {
        event.preventDefault();

        if (!rejectReason.trim()) {
            setRejectReasonError('A reason for rejection is required.');
            return;
        }

        setRejecting(true);
        axios.post(route('class_registration.bulk_reject', batchId), {
            registration_ids: selectedIds,
            rejection_reason: rejectReason,
        }).then(() => {
            fetchBatch();
            setSelectedIds([]);
            closeRejectModal();
        }).finally(() => setRejecting(false));
    };

    const submitManualEntry = (event) => {
        event.preventDefault();
        const { form_name, form_email, form_phone, ...answers } = manualEntry;

        axios.post(route('class_registration.store_manual', batchId), {
            form_name,
            form_email,
            form_phone,
            form_answers: answers,
        }).then(() => {
            setManualEntry({ form_name: '', form_email: '', form_phone: '', church: '', course_interest: '', previous_course: '', remarks: '' });
            setShowManualForm(false);
            fetchBatch();
        });
    };

    const pendingCount = registrations.filter((r) => r.status === 'pending').length;

    const handleExcelUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setExcelUploading(true);
        setExcelResult(null);

        axios.post(route('class_registration.import_excel', batchId), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then((res) => {
            setExcelResult(res.data);
            fetchBatch();
        }).finally(() => {
            setExcelUploading(false);
            event.target.value = ''; // allows re-uploading the same filename later
        });
    };

    const selectedClass = eligibleClasses.find((cls) => cls.id === Number(selectedClassId));
    const suggestedCapacity = batch?.course_profile?.suggested_class_capacity;
    const wouldExceedCapacity =
        selectedClass &&
        suggestedCapacity &&
        (selectedClass.enrollments_count + selectedIds.length) > suggestedCapacity;

    return (
        <>
        <Modal show={show} onClose={onClose} maxWidth="7xl">
            <div className="max-h-[85vh] overflow-y-auto p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">
                            {batch?.name ?? 'Loading...'}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {batch?.course_profile?.title} · Manage registrations
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
                    <p className="mt-6 text-sm text-gray-500">Loading registrations...</p>
                ) : (
                    <>
                        {/* Intake actions */}
                        {canManage && (
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <SecondaryButton
                                type="button"
                                onClick={() => setShowManualForm((prev) => !prev)}
                                className="rounded border border-indigo-600 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50"
                            >
                                + Add Manually
                            </SecondaryButton>

                            <SecondaryButton
                                type="button"
                                onClick={() => excelInputRef.current?.click()}
                                disabled={excelUploading}
                                className="rounded border border-indigo-600 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50"
                            >
                                {excelUploading ? 'Uploading...' : 'Upload Excel'}
                            </SecondaryButton>
                            <input
                                type="file"
                                ref={excelInputRef}
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={handleExcelUpload}
                                disabled={excelUploading}
                            />
                        </div>
                        )}

                        {excelResult && (
                            <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
                                <p className="text-gray-700">
                                    Imported {excelResult.created_count} registration{excelResult.created_count === 1 ? '' : 's'}.
                                </p>
                                {excelResult.skipped.length > 0 && (
                                    <div className="mt-2 text-amber-700">
                                        <p>{excelResult.skipped.length} row{excelResult.skipped.length === 1 ? '' : 's'} skipped:</p>
                                        <ul className="ml-4 list-disc">
                                            {excelResult.skipped.map((item, index) => (
                                                <li key={index}>Row {item.row}: {item.reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {showManualForm && (
                            <form onSubmit={submitManualEntry} className="mt-3 grid gap-3 rounded-md border border-gray-200 bg-gray-50 p-4 sm:grid-cols-3">
                                <div>
                                    <InputLabel value="Full name" />
                                    <TextInput className="mt-1 block w-full" value={manualEntry.form_name}
                                        onChange={(e) => setManualEntry({ ...manualEntry, form_name: e.target.value })} required />
                                </div>
                                <div>
                                    <InputLabel value="Email" />
                                    <TextInput type="email" className="mt-1 block w-full" value={manualEntry.form_email}
                                        onChange={(e) => setManualEntry({ ...manualEntry, form_email: e.target.value })} required />
                                </div>
                                <div>
                                    <InputLabel value="Phone" />
                                    <TextInput className="mt-1 block w-full" value={manualEntry.form_phone}
                                        onChange={(e) => setManualEntry({ ...manualEntry, form_phone: e.target.value })} />
                                </div>
                                <div>
                                    <InputLabel value="Church" />
                                    <TextInput className="mt-1 block w-full" value={manualEntry.church}
                                        onChange={(e) => setManualEntry({ ...manualEntry, church: e.target.value })} />
                                </div>
                                <div>
                                    <InputLabel value="Course to join" />
                                    <TextInput className="mt-1 block w-full" value={manualEntry.course_interest}
                                        onChange={(e) => setManualEntry({ ...manualEntry, course_interest: e.target.value })} />
                                </div>
                                <div>
                                    <InputLabel value="Most recently completed course" />
                                    <TextInput className="mt-1 block w-full" value={manualEntry.previous_course}
                                        onChange={(e) => setManualEntry({ ...manualEntry, previous_course: e.target.value })} />
                                </div>
                                <div className="sm:col-span-3">
                                    <InputLabel value="Remarks and comments" />
                                    <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={manualEntry.remarks} onChange={(e) => setManualEntry({ ...manualEntry, remarks: e.target.value })} />
                                </div>
                                <div className="sm:col-span-3 flex justify-end">
                                    <PrimaryButton type="submit">Add Registration</PrimaryButton>
                                </div>
                            </form>
                        )}

                        <div className="mt-4 overflow-hidden bg-gray-100 p-4 shadow-sm sm:rounded-lg">
                            <div className="flex flex-col gap-3 md:flex-row md:items-end">
                                <div className="w-full md:max-w-md">
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Search by name or email</label>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder="Search registrations"
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
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {wouldExceedCapacity && (
                            <div className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 sm:col-span-3">
                                <strong>{selectedClass.name}</strong> currently has {selectedClass.enrollments_count} enrolled
                                (suggested capacity: {suggestedCapacity}). Assigning {selectedIds.length} more would bring it to{' '}
                                {selectedClass.enrollments_count + selectedIds.length}. Consider creating a new class for the remaining registrations.
                            </div>
                        )}

                        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                            <span>Showing {filteredRegistrations.length ? startIndex : 0} - {endIndex} of {filteredRegistrations.length}</span>
                            <span>Page {currentPage} of {totalPages}</span>
                        </div>

                        {/* Registrations table */}
                        <div className="overflow-x-auto">
                            <table className="mt-6 w-full text-left text-sm">
                                <thead className="border-b border-gray-200 bg-gray-100 text-gray-600">
                                    <tr>
                                        <th className="p-2">
                                            {canManage && (
                                                <input
                                                    type="checkbox"
                                                    checked={pendingCount > 0 && selectedIds.length === pendingCount}
                                                    onChange={toggleSelectAllPending}
                                                />
                                            )}
                                        </th>
                                        <th className="p-2">Name</th>
                                        <th className="p-2">Email</th>
                                        <th className="p-2">Phone</th>
                                        <th className="p-2">Church</th>
                                        <th className="p-2">Course</th>
                                        <th className="p-2">Completed Course</th>
                                        <th className="p-2">Remarks</th>
                                        <th className="p-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedRegistrations.length > 0 ? (
                                        paginatedRegistrations.map((registration) => {
                                            const isDecided = registration.status !== 'pending';
                                            const answers = registration.form_answers ?? {};

                                            return (
                                                <tr
                                                    key={registration.id}
                                                    className={`border-b transition ${isDecided ? 'bg-gray-50 text-gray-400' : ''}`}
                                                >
                                                    <td className="p-2">
                                                        {canManage && (
                                                            <input
                                                                type="checkbox"
                                                                disabled={isDecided}
                                                                checked={selectedIds.includes(registration.id)}
                                                                onChange={() => toggleSelected(registration.id)}
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="p-2">{registration.form_name}</td>
                                                    <td className="p-2">{registration.form_email}</td>
                                                    <td className="p-2">{registration.form_phone ?? '—'}</td>
                                                    <td className="p-2 max-w-[10rem] truncate" title={answers.church ?? ''}>
                                                        {answers.church || '—'}
                                                    </td>
                                                    <td className="p-2 max-w-[10rem] truncate" title={answers.course_interest ?? ''}>
                                                        {answers.course_interest || '—'}
                                                    </td>
                                                    <td className="p-2 max-w-[10rem] truncate" title={answers.previous_course ?? ''}>
                                                        {answers.previous_course || '—'}
                                                    </td>
                                                    <td className="p-2">
                                                        {answers.remarks ? (
                                                            <HoverTooltip content={answers.remarks}>
                                                                <button
                                                                    type="button"
                                                                    aria-label="View remarks"
                                                                    className={`rounded p-1 transition hover:bg-gray-200 ${isDecided ? 'text-gray-400' : 'text-gray-600 hover:text-indigo-600'}`}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.046.137.046.287 0 .424C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    </svg>
                                                                </button>
                                                            </HoverTooltip>
                                                        ) : (
                                                            <span>—</span>
                                                        )}
                                                    </td>
                                                    <td className="p-2">
                                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[registration.status]}`}>
                                                            {statusLabels[registration.status] ?? registration.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="p-4 text-center text-gray-500">
                                                No registrations yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                            <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                                className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50">
                                Previous
                            </button>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button key={page} type="button" onClick={() => setCurrentPage(page)}
                                        className={`h-8 w-8 rounded ${currentPage === page ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50">
                                Next
                            </button>
                        </div>

                        {/* Bulk action bar */}
                        {canManage && (
                        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
                                        {selectedIds.length} selected
                                    </span>
                                    {eligibleClasses.length === 0 && (
                                        <span className="text-xs text-gray-500">
                                            No open classes found for this course profile.
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="flex rounded-md shadow-sm">
                                        <select
                                            value={selectedClassId}
                                            onChange={(e) => setSelectedClassId(e.target.value)}
                                            className="w-full rounded-l-md rounded-r-none border-gray-300 border-r-0 text-sm focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 sm:w-56"
                                        >
                                            <option value="">Select an open class...</option>
                                            {eligibleClasses.map((cls) => (
                                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                                            ))}
                                        </select>
                                        <PrimaryButton
                                            type="button"
                                            disabled={selectedIds.length === 0 || !selectedClassId || assigning}
                                            onClick={handleAssign}
                                            className="rounded-l-none border-transparent bg-indigo-600 hover:bg-indigo-500 focus:bg-indigo-500 active:bg-indigo-700"
                                        >
                                            {assigning ? 'Assigning...' : 'Assign to Class'}
                                        </PrimaryButton>
                                    </div>

                                    <div className="hidden h-8 w-px bg-gray-200 sm:block" />

                                    <SecondaryButton
                                        type="button"
                                        onClick={openRejectModal}
                                        disabled={selectedIds.length === 0 || rejecting}
                                        className="rounded border border-red-600 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {rejecting ? 'Rejecting...' : 'Reject'}
                                    </SecondaryButton>
                                </div>
                            </div>
                        </div>
                        )}
                    </>
                )}

                <div className="mt-6 flex justify-end">
                    <SecondaryButton type="button" onClick={onClose}>Close</SecondaryButton>
                </div>
            </div>
        </Modal>

        <Modal show={showingRejectModal} onClose={closeRejectModal} maxWidth="md">
            <form onSubmit={confirmBulkReject} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Reject Registrations</h2>

                <p className="mt-2 text-sm text-gray-600">
                    You are about to reject <strong>{selectedIds.length}</strong> registration(s).
                </p>

                <div className="mt-4">
                    <div className="flex items-center gap-1">
                        <InputLabel htmlFor="bulk-rejection-reason" value="Reason for rejection" />
                        <span className="text-red-500" aria-hidden="true">*</span>
                    </div>
                    <textarea
                        id="bulk-rejection-reason"
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.target.value)}
                        placeholder="Explain why these registrations are being rejected..."
                        rows="4"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <InputError message={rejectReasonError} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={closeRejectModal}>Cancel</SecondaryButton>
                    <PrimaryButton type="submit" disabled={rejecting} className="!bg-red-600 hover:!bg-red-700">
                        {rejecting ? 'Rejecting...' : 'Reject'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
        </>
    );
}