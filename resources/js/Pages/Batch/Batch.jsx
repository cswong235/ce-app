import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import CreateBatchModal from './Partials/CreateBatchModal';
import UpdateBatchModal from './Partials/UpdateBatchModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import SecondaryButton from '@/Components/SecondaryButton';
import ManageRegistrationsModal from './Partials/ManageRegistrationsModal';
import { router } from '@inertiajs/react';

const PAGE_SIZE = 8;

export default function BatchPage({ batches = [], courseProfileOptions = [] }) {
    const canManage = usePage().props.auth.hasFullAccess;
    const [showingCreateModal, setShowingCreateModal] = useState(false);
    const [editingBatch, setEditingBatch] = useState(null);
    const [managingBatch, setManagingBatch] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [courseProfileFilter, setCourseProfileFilter] = useState('all');
    const [deletingBatch, setDeletingBatch] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    useEffect(() => {
        setCurrentPage(1);
    }, [batches.length, searchTerm, courseProfileFilter]);

    const filteredBatches = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return [...batches].filter((batch) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                batch.name?.toLowerCase().includes(normalizedSearch) ||
                batch.course_profile?.title?.toLowerCase().includes(normalizedSearch);

            const matchesCourseProfile =
                courseProfileFilter === 'all' || batch.course_profile_id === Number(courseProfileFilter);

            return matchesSearch && matchesCourseProfile;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [batches, searchTerm, courseProfileFilter]);

    const handleDelete = (batch) => {
        setDeletingBatch(batch);
    };

    const totalPages = Math.max(1, Math.ceil(filteredBatches.length / PAGE_SIZE));
    const paginatedBatches = filteredBatches.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );
    const startIndex = filteredBatches.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
    const endIndex = Math.min(currentPage * PAGE_SIZE, filteredBatches.length);

    const confirmDelete = () => {
        setDeleteProcessing(true);
        router.delete(route('batch.destroy', deletingBatch.id), {
            onSuccess: () => setDeletingBatch(null),
            onFinish: () => setDeleteProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Registration Batches</h2>}
        >
            <Head title="Registration Batches" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex w-full items-center justify-between">
                                <h1 className="text-xl font-semibold leading-tight text-gray-800">
                                    Registration Batch List
                                </h1>
                                {canManage && (
                                    <button
                                        type="button"
                                        onClick={() => setShowingCreateModal(true)}
                                        className="rounded bg-indigo-600 px-4 py-2 text-white transition duration-150 ease-in-out hover:scale-105 hover:bg-indigo-500"
                                    >
                                        + Add New Batch
                                    </button>
                                )}
                            </div>

                            <div className="mt-2 overflow-hidden bg-gray-100 p-4 shadow-sm sm:rounded-lg">
                                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                                    <div className="w-full md:max-w-md">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Search by name
                                        </label>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(event) => setSearchTerm(event.target.value)}
                                            placeholder="Search batches"
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="w-full md:max-w-xs">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Filter by course profile
                                        </label>
                                        <select
                                            value={courseProfileFilter}
                                            onChange={(event) => setCourseProfileFilter(event.target.value)}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="all">All course profiles</option>
                                            {courseProfileOptions.map((profile) => (
                                                <option key={profile.id} value={profile.id}>
                                                    {profile.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                                <span>
                                    Showing {filteredBatches.length ? startIndex : 0} - {endIndex} of {filteredBatches.length}
                                </span>
                                <span>
                                    Page {currentPage} of {totalPages}
                                </span>
                            </div>

                            <table className="mt-3 w-full text-left">
                                <thead className="border-b border-default bg-gray-100 text-sm text-body">
                                    <tr>
                                        <th className="p-2">Batch Name</th>
                                        <th>Course Profile</th>
                                        <th>Registrations</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedBatches.length > 0 ? (
                                        paginatedBatches.map((batch) => (
                                            <tr className="border-b" key={batch.id}>
                                                <td className="p-3">{batch.name}</td>
                                                <td>{batch.course_profile?.title ?? 'N/A'}</td>
                                                <td>{batch.registrations_count ?? 0}</td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <SecondaryButton
                                                            type="button"
                                                            onClick={() => setManagingBatch(batch)}
                                                            className="rounded border border-indigo-600 px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50"
                                                        >
                                                            Manage Registrations
                                                        </SecondaryButton>
                                                        {canManage && (<>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingBatch(batch)}
                                                            aria-label="Edit batch"
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
                                                            onClick={() => handleDelete(batch)}
                                                            aria-label="Delete batch"
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
                                                        </>)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="p-4 text-sm text-gray-500" colSpan="4">
                                                No batches found.
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

            <CreateBatchModal show={showingCreateModal} onClose={() => setShowingCreateModal(false)} courseProfileOptions={courseProfileOptions} />
            <UpdateBatchModal show={Boolean(editingBatch)} batch={editingBatch} courseProfileOptions={courseProfileOptions} onClose={() => setEditingBatch(null)} />
            <ManageRegistrationsModal batchId={managingBatch?.id} show={Boolean(managingBatch)} onClose={() => setManagingBatch(null)} />

            <ConfirmDeleteModal
                show={Boolean(deletingBatch)}
                onClose={() => setDeletingBatch(null)}
                onConfirm={confirmDelete}
                title="Delete batch"
                itemName={deletingBatch?.name}
                processing={deleteProcessing}
            />
        </AuthenticatedLayout>
    );
}