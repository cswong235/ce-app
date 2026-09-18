import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import CreateClassModal from './Partials/CreateClassModal';
import UpdateClassModal from './Partials/UpdateClassModal';
import ManageClassModal from './Partials/ManageClassModal';

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

export default function ClassPage({ classes = [], courseProfileOptions = [], facilitatorOptions = [] }) {
    const [showingCreateModal, setShowingCreateModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [editingClass, setEditingClass] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deletingClass, setDeletingClass] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [courseProfileFilter, setCourseProfileFilter] = useState('all');

    useEffect(() => {
        setCurrentPage(1);
    }, [classes.length, searchTerm, statusFilter, courseProfileFilter]);

    const filteredClasses = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return [...classes].filter((classItem) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                classItem.name?.toLowerCase().includes(normalizedSearch) ||
                classItem.course_profile?.title?.toLowerCase().includes(normalizedSearch);

            const matchesStatus =
                statusFilter === 'all' || classItem.status === statusFilter;

            const matchesCourseProfile =
                courseProfileFilter === 'all' || classItem.course_profile_id === Number(courseProfileFilter);

            return matchesSearch && matchesStatus && matchesCourseProfile;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [classes, searchTerm, statusFilter, courseProfileFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredClasses.length / PAGE_SIZE));
    const paginatedClasses = filteredClasses.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );
    const startIndex = filteredClasses.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
    const endIndex = Math.min(currentPage * PAGE_SIZE, filteredClasses.length);

    const handleDelete = (classItem) => {
        setDeletingClass(classItem);
    };

    const confirmDelete = () => {
        setDeleteProcessing(true);
        router.delete(route('class.destroy', deletingClass.id), {
            onSuccess: () => setDeletingClass(null),
            onFinish: () => setDeleteProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Classes
                </h2>
            }
        >
            <Head title="Classes" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex w-full items-center justify-between">
                                <h1 className="text-xl font-semibold leading-tight text-gray-800">
                                    Class List
                                </h1>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowingCreateModal(true)}
                                        className="rounded bg-indigo-600 px-4 py-2 text-white transition duration-150 ease-in-out hover:scale-105 hover:bg-indigo-500"
                                    >
                                        + Add New Class
                                    </button>
                                </div>
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
                                            placeholder="Search classes"
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="w-full md:max-w-xs">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Filter by course
                                        </label>
                                        <select
                                            value={courseProfileFilter}
                                            onChange={(event) => setCourseProfileFilter(event.target.value)}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="all">All courses</option>
                                            {courseProfileOptions.map((profile) => (
                                                <option key={profile.id} value={profile.id}>{profile.title}</option>
                                            ))}
                                        </select>
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
                                            <option value="planning">Planning</option>
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                                <span>
                                    Showing {filteredClasses.length ? startIndex : 0} - {endIndex} of {filteredClasses.length}
                                </span>
                                <span>
                                    Page {currentPage} of {totalPages}
                                </span>
                            </div>

                            <table className="mt-3 w-full text-left">
                                <thead className="border-b border-default bg-gray-100 text-sm text-body">
                                    <tr>
                                        <th className="p-2">Class Name</th>
                                        <th>Course Profile</th>
                                        <th>Status</th>
                                        <th>Registered Students</th>
                                        <th>Dates</th>
                                        <th>Time</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedClasses.length > 0 ? (
                                        paginatedClasses.map((classItem) => (
                                            <tr className="border-b" key={classItem.id}>
                                                <td className="p-3">{classItem.name}</td>
                                                <td>{classItem.course_profile?.title ?? 'N/A'}</td>
                                                <td>
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[classItem.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                        {statusLabels[classItem.status] ?? classItem.status}
                                                    </span>
                                                </td>
                                                <td>{classItem.enrollments_count ?? 0}</td>
                                                <td>
                                                    {classItem.start_date && classItem.end_date
                                                        ? `${new Date(classItem.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} – ${new Date(classItem.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                                                        : 'TBA'}
                                                </td>
                                                <td>
                                                    {classItem.start_time && classItem.end_time
                                                        ? `${classItem.start_time} – ${classItem.end_time}`
                                                        : 'TBA'}
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedClass(classItem)}
                                                            aria-label="View class"
                                                            title="View"
                                                            className="rounded p-2 text-gray-600 transition hover:bg-gray-100 hover:text-indigo-600"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth="1.5"
                                                                stroke="currentColor"
                                                                className="h-5 w-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.046.137.046.287 0 .424C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingClass(classItem)}
                                                            aria-label="Edit class"
                                                            title="Edit"
                                                            className="rounded p-2 text-gray-600 transition hover:bg-gray-100 hover:text-indigo-600"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth="1.5"
                                                                stroke="currentColor"
                                                                className="h-5 w-5"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13l-3.43.978.978-3.43a4.5 4.5 0 011.13-1.897L16.862 4.487z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M19.5 7.125L16.875 4.5"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(classItem)}
                                                            aria-label="Delete class"
                                                            title="Delete"
                                                            className="rounded p-2 text-gray-600 transition hover:bg-gray-100 hover:text-red-600"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                className="h-5 w-5"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            >
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
                                            <td className="p-4 text-sm text-gray-500" colSpan="7">
                                                No classes found.
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

            <CreateClassModal
                show={showingCreateModal}
                onClose={() => setShowingCreateModal(false)}
                courseProfileOptions={courseProfileOptions}
                facilitatorOptions={facilitatorOptions}
            />

            <UpdateClassModal
                show={Boolean(editingClass)}
                classItem={editingClass}
                courseProfileOptions={courseProfileOptions}
                facilitatorOptions={facilitatorOptions}
                onClose={() => setEditingClass(null)}
            />

            <ManageClassModal
                classId={selectedClass?.id}
                show={Boolean(selectedClass)}
                onClose={() => setSelectedClass(null)}
            />

            <ConfirmDeleteModal
                show={Boolean(deletingClass)}
                onClose={() => setDeletingClass(null)}
                onConfirm={confirmDelete}
                title="Delete class"
                itemName={deletingClass?.name}
                processing={deleteProcessing}
            />

        </AuthenticatedLayout>
    );
}
