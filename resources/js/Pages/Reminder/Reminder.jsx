import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import CreateReminderModal from './Partials/CreateReminderModal';
import UpdateReminderModal from './Partials/UpdateReminderModal';
import ViewReminderModal from './Partials/ViewReminderModal';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 8;

const statusLabels = {
    upcoming: 'Upcoming',
    passed: 'Passed',
};

const statusColors = {
    upcoming: 'bg-indigo-100 text-indigo-700',
    passed: 'bg-gray-100 text-gray-600',
};

const sortOptions = [
    { value: 'remind_soonest', label: 'Reminder Date (Soonest)' },
    { value: 'remind_latest', label: 'Reminder Date (Latest)' },
    { value: 'name_asc', label: 'Event Name (A–Z)' },
    { value: 'name_desc', label: 'Event Name (Z–A)' },
    { value: 'created_desc', label: 'Recently Created' },
    { value: 'created_asc', label: 'Oldest Created' },
];

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

export default function ReminderPage({ reminders = [] }) {
    const [showingCreateModal, setShowingCreateModal] = useState(false);
    const [viewingReminder, setViewingReminder] = useState(null);
    const [editingReminder, setEditingReminder] = useState(null);
    const [deletingReminder, setDeletingReminder] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('remind_soonest');

    useEffect(() => {
        setCurrentPage(1);
    }, [reminders.length, searchTerm, statusFilter, sortBy]);

    const filteredReminders = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const filtered = reminders.filter((reminder) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                reminder.event_name?.toLowerCase().includes(normalizedSearch) ||
                reminder.event_description?.toLowerCase().includes(normalizedSearch);

            const matchesStatus = statusFilter === 'all' || reminder.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'remind_latest':
                    return new Date(b.remind_at) - new Date(a.remind_at);
                case 'name_asc':
                    return a.event_name.localeCompare(b.event_name);
                case 'name_desc':
                    return b.event_name.localeCompare(a.event_name);
                case 'created_desc':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'created_asc':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'remind_soonest':
                default:
                    return new Date(a.remind_at) - new Date(b.remind_at);
            }
        });
    }, [reminders, searchTerm, statusFilter, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredReminders.length / PAGE_SIZE));
    const paginatedReminders = filteredReminders.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );
    const startIndex = filteredReminders.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
    const endIndex = Math.min(currentPage * PAGE_SIZE, filteredReminders.length);

    const handleDelete = (reminder) => {
        setDeletingReminder(reminder);
    };

    const confirmDelete = () => {
        setDeleteProcessing(true);
        router.delete(route('reminder.destroy', deletingReminder.id), {
            onSuccess: () => setDeletingReminder(null),
            onFinish: () => setDeleteProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Reminders
                </h2>
            }
        >
            <Head title="Reminders" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex w-full items-center justify-between">
                                <h1 className="text-xl font-semibold leading-tight text-gray-800">
                                    Reminder List
                                </h1>
                                <button
                                    type="button"
                                    onClick={() => setShowingCreateModal(true)}
                                    className="rounded bg-indigo-600 px-4 py-2 text-white transition duration-150 ease-in-out hover:scale-105 hover:bg-indigo-500"
                                >
                                    + Add New Reminder
                                </button>
                            </div>

                            <div className="mt-2 overflow-hidden bg-gray-100 p-4 shadow-sm sm:rounded-lg">
                                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                                    <div className="w-full md:max-w-md">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Search
                                        </label>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(event) => setSearchTerm(event.target.value)}
                                            placeholder="Search reminders"
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="w-full md:max-w-xs">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Filter by status
                                        </label>
                                        <select
                                            value={statusFilter}
                                            onChange={(event) => setStatusFilter(event.target.value)}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="all">All statuses</option>
                                            <option value="upcoming">Upcoming</option>
                                            <option value="passed">Passed</option>
                                        </select>
                                    </div>

                                    <div className="w-full md:max-w-xs">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Sort by
                                        </label>
                                        <select
                                            value={sortBy}
                                            onChange={(event) => setSortBy(event.target.value)}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {sortOptions.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                                <span>
                                    Showing {filteredReminders.length ? startIndex : 0} - {endIndex} of {filteredReminders.length}
                                </span>
                                <span>
                                    Page {currentPage} of {totalPages}
                                </span>
                            </div>

                            <table className="mt-3 w-full text-left">
                                <thead className="border-b border-default bg-gray-100 text-sm text-body">
                                    <tr>
                                        <th className="p-2">Event Title</th>
                                        <th>Status</th>
                                        <th>Event Date &amp; Time</th>
                                        <th>Reminder Date &amp; Time</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedReminders.length > 0 ? (
                                        paginatedReminders.map((reminder) => (
                                            <tr className="border-b" key={reminder.id}>
                                                <td className="p-3">{reminder.event_name}</td>
                                                <td>
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[reminder.status]}`}>
                                                        {statusLabels[reminder.status] ?? reminder.status}
                                                    </span>
                                                </td>
                                                <td>{formatDateTime(reminder.event_at) ?? 'TBA'}</td>
                                                <td>{formatDateTime(reminder.remind_at)}</td>
                                                <td>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewingReminder(reminder)}
                                                            aria-label="View reminder"
                                                            title="View"
                                                            className="rounded p-2 text-gray-600 transition hover:bg-gray-100 hover:text-indigo-600"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.046.137.046.287 0 .424C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingReminder(reminder)}
                                                            aria-label="Edit reminder"
                                                            title="Edit"
                                                            className="rounded p-2 text-gray-600 transition hover:bg-gray-100 hover:text-indigo-600"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13l-3.43.978.978-3.43a4.5 4.5 0 011.13-1.897L16.862 4.487z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L16.875 4.5" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(reminder)}
                                                            aria-label="Delete reminder"
                                                            title="Delete"
                                                            className="rounded p-2 text-gray-600 transition hover:bg-gray-100 hover:text-red-600"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M3 6h18"></path>
                                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="p-4 text-sm text-gray-500" colSpan="5">
                                                No reminders found.
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
                        </div>
                    </div>
                </div>
            </div>

            <CreateReminderModal
                show={showingCreateModal}
                onClose={() => setShowingCreateModal(false)}
            />

            <ViewReminderModal
                show={Boolean(viewingReminder)}
                reminder={viewingReminder}
                onClose={() => setViewingReminder(null)}
            />

            <UpdateReminderModal
                show={Boolean(editingReminder)}
                reminder={editingReminder}
                onClose={() => setEditingReminder(null)}
            />

            <ConfirmDeleteModal
                show={Boolean(deletingReminder)}
                onClose={() => setDeletingReminder(null)}
                onConfirm={confirmDelete}
                title="Delete reminder"
                itemName={deletingReminder?.event_name}
                processing={deleteProcessing}
            />
        </AuthenticatedLayout>
    );
}
