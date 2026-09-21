import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import CreateCourseProfileModal from './Partials/CreateCourseProfileModal';
import UpdateCourseProfileModal from './Partials/UpdateCourseProfileModal';
import AvailableClassesModal from './Partials/AvailableClassesModal';
import ViewCourseProfileModal from './Partials/ViewCourseProfileModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import ManageFacilitatorsModal from './Partials/ManageFacilitatorsModal';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';

const PAGE_SIZE = 8;

export default function CourseProfile({ courseProfiles, prerequisiteOptions, classes }) {
    const canManage = usePage().props.auth.hasFullAccess;
    const [showingCreateModal, setShowingCreateModal] = useState(false);
    const [showingClassesModal, setShowingClassesModal] = useState(false);
    const [classesCourseProfile, setClassesCourseProfile] = useState(null);
    const [viewingCourseProfile, setViewingCourseProfile] = useState(null);
    const [editingCourseProfile, setEditingCourseProfile] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [courseTypeFilter, setCourseTypeFilter] = useState('all');
    const [deletingCourseProfile, setDeletingCourseProfile] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [managingFacilitatorsFor, setManagingFacilitatorsFor] = useState(null);

    useEffect(() => {
        setCurrentPage(1);
    }, [courseProfiles.length, searchTerm, courseTypeFilter]);

    const filteredCourseProfiles = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return [...courseProfiles].filter((courseProfile) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                courseProfile.title.toLowerCase().includes(normalizedSearch);

            const matchesType =
                courseTypeFilter === 'all' ||
                courseProfile.course_type === courseTypeFilter;

            return matchesSearch && matchesType;
        }).sort((a, b) => {
            if (courseTypeFilter === 'all') {
                return a.title.localeCompare(b.title);
            }

            return a.title.localeCompare(b.title);
        });
    }, [courseProfiles, searchTerm, courseTypeFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredCourseProfiles.length / PAGE_SIZE));
    const paginatedCourseProfiles = filteredCourseProfiles.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );
    const startIndex = filteredCourseProfiles.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
    const endIndex = Math.min(currentPage * PAGE_SIZE, filteredCourseProfiles.length);

    const handleDelete = (courseProfile) => {
        setDeletingCourseProfile(courseProfile);
    };

    const confirmDelete = () => {
        setDeleteProcessing(true);
        router.delete(route('course_profile.destroy', deletingCourseProfile.id), {
            onSuccess: () => setDeletingCourseProfile(null),
            onFinish: () => setDeleteProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Course Profiles
                </h2>
            }
        >
            <Head title="Course Profiles" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex w-full items-center justify-between">
                                <h1 className="text-xl font-semibold leading-tight text-gray-800">
                                    Course Profile List
                                </h1>
                                {canManage && (
                                    <button
                                        type="button"
                                        onClick={() => setShowingCreateModal(true)}
                                        className="rounded bg-indigo-600 px-4 py-2 text-white transition duration-150 ease-in-out hover:scale-105 hover:bg-indigo-500"
                                    >
                                        + Add New Profile
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
                                            placeholder="Search course profiles"
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="w-full md:max-w-xs">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Sort by course type
                                        </label>
                                        <select
                                            value={courseTypeFilter}
                                            onChange={(event) => setCourseTypeFilter(event.target.value)}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="all">All types</option>
                                            <option value="standard">Standard</option>
                                            <option value="facilitator">Facilitator</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                                <span>
                                    Showing {filteredCourseProfiles.length ? startIndex : 0} - {endIndex} of {filteredCourseProfiles.length}
                                </span>
                                <span>
                                    Page {currentPage} of {totalPages}
                                </span>
                            </div>

                            <table className="mt-3 w-full text-left">
                                <thead className="border-b border-default bg-gray-100 text-sm text-body">
                                    <tr>
                                        <th className="p-2">Course Profile Name</th>
                                        <th>Course Type</th>
                                        <th>Classes</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedCourseProfiles.length > 0 ? (
                                        paginatedCourseProfiles.map((courseProfile) => (
                                            <tr className="border-b" key={courseProfile.id}>
                                                <td className="p-3">{courseProfile.title}</td>
                                                <td>
                                                    {courseProfile.course_type === 'facilitator'
                                                        ? 'Facilitator Course'
                                                        : 'Standard Course'}
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <SecondaryButton
                                                            type="button"
                                                            onClick={() => {
                                                                setClassesCourseProfile(courseProfile);
                                                                setShowingClassesModal(true);
                                                            }}
                                                            className="rounded border border-indigo-600 px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50"
                                                        >
                                                            Check Classes
                                                        </SecondaryButton>
                                                        <SecondaryButton
                                                            type="button"
                                                            onClick={() => setManagingFacilitatorsFor(courseProfile)}
                                                            className="rounded border border-indigo-600 px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50"
                                                        >
                                                            Facilitators
                                                        </SecondaryButton>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewingCourseProfile(courseProfile)}
                                                            aria-label="View course profile"
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
                                                        {canManage && (<>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingCourseProfile(courseProfile)}
                                                            aria-label="Edit course profile"
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
                                                            onClick={() => handleDelete(courseProfile)}
                                                            aria-label="Delete course profile"
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
                                                No course profiles found.
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

            <CreateCourseProfileModal
                show={showingCreateModal}
                onClose={() => setShowingCreateModal(false)}
                prerequisiteOptions={prerequisiteOptions}
            />

            <UpdateCourseProfileModal
                show={Boolean(editingCourseProfile)}
                courseProfile={editingCourseProfile}
                prerequisiteOptions={prerequisiteOptions}
                onClose={() => setEditingCourseProfile(null)}
            />

            <AvailableClassesModal
                show={showingClassesModal}
                onClose={() => setShowingClassesModal(false)}
                courseProfile={classesCourseProfile}
                classes={classes}
            />

            <ViewCourseProfileModal
                courseProfile={viewingCourseProfile}
                classes={classes}
                onClose={() => setViewingCourseProfile(null)}
            />

            <ConfirmDeleteModal
                show={Boolean(deletingCourseProfile)}
                onClose={() => setDeletingCourseProfile(null)}
                onConfirm={confirmDelete}
                title="Delete course profile"
                itemName={deletingCourseProfile?.title}
                processing={deleteProcessing}
            />

            <ManageFacilitatorsModal
                show={Boolean(managingFacilitatorsFor)}
                courseProfile={managingFacilitatorsFor}
                onClose={() => setManagingFacilitatorsFor(null)}
            />

        </AuthenticatedLayout>
    );
}
