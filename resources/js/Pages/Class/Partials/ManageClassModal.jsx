import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import ViewEnrollmentModal from './ViewEnrollmentModal';
import axios from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';

const PAGE_SIZE = 6;

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

const enrollmentStatusColors = {
    active: 'bg-green-100 text-green-800',
    left: 'bg-gray-100 text-gray-600',
    completed: 'bg-blue-100 text-blue-800',
};

function formatDate(dateString) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getYear(dateString) {
    if (!dateString) return '—';
    return new Date(dateString).getFullYear();
}

export default function ManageClassModal({ classId, show, onClose }) {
    const [activeTab, setActiveTab] = useState('details');
    const [loading, setLoading] = useState(false);
    const [classData, setClassData] = useState(null);
    const [graduationItems, setGraduationItems] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');

    const [graduationDate, setGraduationDate] = useState('');
    const [newItemName, setNewItemName] = useState('');
    const [newItemQty, setNewItemQty] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const [viewingEnrollment, setViewingEnrollment] = useState(null);
    const [uploadingAttendance, setUploadingAttendance] = useState(false);
    const attendanceInputRef = useRef(null);

    const fetchClass = () => {
        if (!classId) return;
        setLoading(true);
        axios.get(route('class.show', classId)).then((res) => {
            setClassData(res.data.class);
            setGraduationItems(res.data.graduationItems);
            setEnrollments(res.data.enrollments);
            setGraduationDate(res.data.class.graduation_date ?? '');
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        if (show && classId) {
            fetchClass();
            setActiveTab('details');
            setCurrentPage(1);
            setSearchTerm('');
        }
    }, [show, classId]);

    const filteredEnrollments = useMemo(() => {
        const normalized = searchTerm.trim().toLowerCase();

        return enrollments.filter((e) => {
            const matchesSearch =
                normalized.length === 0 ||
                e.student?.name?.toLowerCase().includes(normalized) ||
                e.student?.email?.toLowerCase().includes(normalized);

            const matchesStatus = enrollmentStatusFilter === 'all' || e.status === enrollmentStatusFilter;
            const matchesPayment = paymentFilter === 'all' || e.payment_status === paymentFilter;

            return matchesSearch && matchesStatus && matchesPayment;
        });
    }, [enrollments, searchTerm, enrollmentStatusFilter, paymentFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredEnrollments.length / PAGE_SIZE));
    const paginatedEnrollments = filteredEnrollments.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );
    const startIndex = filteredEnrollments.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
    const endIndex = Math.min(currentPage * PAGE_SIZE, filteredEnrollments.length);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, enrollmentStatusFilter, paymentFilter]);

    const saveGraduationDate = () => {
        axios.patch(route('graduation_item.update_date', classId), { graduation_date: graduationDate || null }).then(fetchClass);
    };

    const addGraduationItem = () => {
        if (!newItemName || !newItemQty) return;
        axios.post(route('graduation_item.store', classId), {
            item_name: newItemName,
            quantity: newItemQty,
        }).then(() => {
            setNewItemName('');
            setNewItemQty('');
            fetchClass();
        });
    };

    const removeGraduationItem = (itemId) => {
        axios.delete(route('graduation_item.destroy', itemId)).then(fetchClass);
    };

    const uploadAttendanceRecord = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('attendance_record', file);

        setUploadingAttendance(true);
        axios.post(route('class.upload_attendance_record', classId), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(fetchClass).finally(() => {
            setUploadingAttendance(false);
            event.target.value = '';
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="7xl">
            <div className="max-h-[85vh] overflow-y-auto p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">{classData?.name ?? 'Loading...'}</h2>
                        <p className="mt-1 text-sm text-gray-500">{classData?.course_profile?.title}</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close" className="text-2xl leading-none text-gray-400 hover:text-gray-600">
                        &times;
                    </button>
                </div>

                <div className="mt-4 flex gap-2 border-b border-gray-200">
                    <button
                        type="button"
                        onClick={() => setActiveTab('details')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                    >
                        Details
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('students')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'students' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                    >
                        Students ({enrollments.length})
                    </button>
                </div>

                {loading || !classData ? (
                    <p className="mt-6 text-sm text-gray-500">Loading...</p>
                ) : activeTab === 'details' ? (
                    <div className="mt-6 space-y-5">
                        <section className="rounded-lg border border-gray-200 bg-white p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Overview</h3>
                            <dl className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[classData.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {statusLabels[classData.status] ?? classData.status}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Mode</dt>
                                    <dd className="mt-1 text-sm text-gray-900 capitalize">{classData.mode}</dd>
                                </div>
                                {classData.mode === 'physical' && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Venue</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{classData.venue || '—'}</dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Dates</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {formatDate(classData.start_date)} – {formatDate(classData.end_date)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Year</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{getYear(classData.created_at)}</dd>
                                </div>
                            </dl>
                        </section>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <section className="rounded-lg border border-gray-200 bg-white p-5">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Facilitators</h3>
                                {classData.facilitators?.length > 0 ? (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {classData.facilitators.map((f) => (
                                            <span key={f.id} className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                                                {f.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm text-gray-500">No facilitators assigned yet.</p>
                                )}
                            </section>

                            <section className="rounded-lg border border-gray-200 bg-white p-5">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Class Admin</h3>
                                <p className="mt-3 text-sm text-gray-500">
                                    {classData.class_admin ? (
                                        <>
                                            <span className="font-medium text-gray-700">{classData.class_admin.committee?.name}</span> since {formatDate(classData.class_admin.assigned_at)}.
                                        </>
                                    ) : (
                                        'No class admin assigned yet.'
                                    )}
                                </p>
                            </section>
                        </div>

                        <section className="rounded-lg border border-gray-200 bg-white p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Attendance Record</h3>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                {classData.attendance_record_path && (
                                    <a
                                        href={`/storage/${classData.attendance_record_path}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        View File
                                    </a>
                                )}
                                <SecondaryButton
                                    type="button"
                                    onClick={() => attendanceInputRef.current?.click()}
                                    disabled={uploadingAttendance}
                                    className="rounded border border-indigo-600 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50"
                                >
                                    {uploadingAttendance
                                        ? 'Uploading...'
                                        : classData.attendance_record_path ? 'Replace File' : 'Upload File'}
                                </SecondaryButton>
                                <input
                                    type="file"
                                    ref={attendanceInputRef}
                                    className="hidden"
                                    disabled={uploadingAttendance}
                                    onChange={uploadAttendanceRecord}
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                {classData.attendance_record_path
                                    ? 'One attendance record on file.'
                                    : 'No attendance record uploaded yet.'}
                            </p>
                        </section>

                        <section className="rounded-lg border border-gray-200 bg-white p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Graduation</h3>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <TextInput
                                    type="date"
                                    className="block"
                                    value={graduationDate}
                                    onChange={(e) => setGraduationDate(e.target.value)}
                                />
                                <SecondaryButton type="button" onClick={saveGraduationDate}
                                    className="rounded border border-indigo-600 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50">
                                    Save Date
                                </SecondaryButton>
                            </div>

                            <div className="mt-5">
                                <InputLabel value="Graduation checklist" />
                                <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
                                    <table className="w-full text-left text-sm">
                                        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                            <tr>
                                                <th className="px-3 py-2 font-medium">Item</th>
                                                <th className="px-3 py-2 font-medium">Quantity</th>
                                                <th className="px-3 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {graduationItems.length > 0 ? (
                                                graduationItems.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="px-3 py-2">{item.item_name}</td>
                                                        <td className="px-3 py-2">{item.quantity}</td>
                                                        <td className="px-3 py-2 text-right">
                                                            <SecondaryButton type="button" onClick={() => removeGraduationItem(item.id)}
                                                                className="rounded border border-red-600 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                                                                Remove
                                                            </SecondaryButton>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="px-3 py-3 text-center text-gray-400">No checklist items yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <TextInput
                                        placeholder="Item name"
                                        className="min-w-[10rem] flex-1"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                    />
                                    <TextInput
                                        type="number"
                                        placeholder="Qty"
                                        className="w-24"
                                        value={newItemQty}
                                        onChange={(e) => setNewItemQty(e.target.value)}
                                    />
                                    <SecondaryButton type="button" onClick={addGraduationItem}
                                        className="rounded border border-indigo-600 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50">
                                        Add
                                    </SecondaryButton>
                                </div>
                            </div>
                        </section>
                    </div>
                ) : (
                    <div className="mt-6">
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="w-full sm:max-w-xs">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Search</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search students"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="w-full sm:max-w-xs">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Class Status</label>
                                <select
                                    value={enrollmentStatusFilter}
                                    onChange={(e) => setEnrollmentStatusFilter(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="all">All statuses</option>
                                    <option value="active">Active</option>
                                    <option value="left">Left</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="w-full sm:max-w-xs">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Payment</label>
                                <select
                                    value={paymentFilter}
                                    onChange={(e) => setPaymentFilter(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="all">All</option>
                                    <option value="paid">Paid</option>
                                    <option value="not_paid">Not Paid</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                            <span>
                                Showing {filteredEnrollments.length ? startIndex : 0} - {endIndex} of {filteredEnrollments.length}
                            </span>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                        </div>

                        <table className="mt-3 w-full text-left text-sm">
                            <thead className="border-b border-gray-200 bg-gray-100 text-gray-600">
                                <tr>
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Email</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2">Payment</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedEnrollments.length > 0 ? (
                                    paginatedEnrollments.map((enrollment) => (
                                        <tr key={enrollment.id} className="border-b">
                                            <td className="p-2">{enrollment.student?.name ?? 'N/A'}</td>
                                            <td className="p-2">{enrollment.student?.email ?? 'N/A'}</td>
                                            <td className="p-2">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${enrollmentStatusColors[enrollment.status]}`}>
                                                    {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="p-2">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                    enrollment.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {enrollment.payment_status === 'paid' ? 'Paid' : 'Not Paid'}
                                                </span>
                                            </td>
                                            <td className="p-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setViewingEnrollment(enrollment)}
                                                    aria-label="View enrollment"
                                                    title="View"
                                                    className="rounded p-2 text-gray-600 transition hover:bg-gray-100 hover:text-indigo-600"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.046.137.046.287 0 .424C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-4 text-center text-gray-500">No enrolled students.</td>
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
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <SecondaryButton type="button" onClick={onClose}>Close</SecondaryButton>
                </div>
            </div>

            <ViewEnrollmentModal
                enrollment={viewingEnrollment}
                show={Boolean(viewingEnrollment)}
                onClose={() => setViewingEnrollment(null)}
                onUpdated={fetchClass}
            />
        </Modal>
    );
}