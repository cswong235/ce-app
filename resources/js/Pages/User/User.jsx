import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import AddStudentModal from './Partials/AddStudentModal';
import AddCommitteeModal from './Partials/AddCommitteeModal';
import UpdateUserModal from './Partials/UpdateUserModal';
import ExportPotentialFacilitatorsModal from './Partials/ExportPotentialFacilitatorsModal';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import ViewUserModal from './Partials/ViewUserModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import placeholder_avatar from '@/Assets/Placeholder.png';

const PAGE_SIZE = 8;

export default function UserPage({ users = [] }) {
    const canManage = usePage().props.auth.hasFullAccess;
    const [selectedUser, setSelectedUser] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showingAddStudentModal, setShowingAddStudentModal] = useState(false);
    const [showingAddCommitteeModal, setShowingAddCommitteeModal] = useState(false);
    const [showingExportFacilitatorsModal, setShowingExportFacilitatorsModal] = useState(false);

    useEffect(() => {
        setCurrentPage(1);
    }, [users.length, searchTerm, roleFilter]);

    const getRoleTags = (user) => {
        const tags = [];
        if (user.committee_details) tags.push('Committee');
        if (user.student_details) tags.push('Student');
        return tags;
    };

    const filteredUsers = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return [...users].filter((user) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                user.name.toLowerCase().includes(normalizedSearch) ||
                user.email.toLowerCase().includes(normalizedSearch);

            const tags = getRoleTags(user);
            const matchesRole =
                roleFilter === 'all' ||
                (roleFilter === 'committee' && tags.includes('Committee')) ||
                (roleFilter === 'student' && tags.includes('Student'));

            return matchesSearch && matchesRole;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [users, searchTerm, roleFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );
    const startIndex = filteredUsers.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
    const endIndex = Math.min(currentPage * PAGE_SIZE, filteredUsers.length);

    const handleDelete = (user) => setDeletingUser(user);

    const confirmDelete = () => {
        setDeleteProcessing(true);
        router.delete(route('user.destroy', deletingUser.id), {
            onSuccess: () => setDeletingUser(null),
            onFinish: () => setDeleteProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Members</h2>}
        >
            <Head title="Members" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex w-full items-center justify-between">
                                <h1 className="text-xl font-semibold leading-tight text-gray-800">
                                    Member List
                                </h1>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowingExportFacilitatorsModal(true)}
                                        className="rounded border border-indigo-600 px-4 py-2 text-indigo-600 transition duration-150 ease-in-out hover:bg-indigo-50"
                                    >
                                        Export Potential Facilitators
                                    </button>
                                    {canManage && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setShowingAddStudentModal(true)}
                                                className="rounded bg-indigo-600 px-4 py-2 text-white transition duration-150 ease-in-out hover:scale-105 hover:bg-indigo-500"
                                            >
                                                + Add Student
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowingAddCommitteeModal(true)}
                                                className="rounded bg-indigo-600 px-4 py-2 text-white transition duration-150 ease-in-out hover:scale-105 hover:bg-indigo-500"
                                            >
                                                + Add Committee
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="mt-2 overflow-hidden bg-gray-100 p-4 shadow-sm sm:rounded-lg">
                                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                                    <div className="w-full md:max-w-md">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Search by name or email
                                        </label>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(event) => setSearchTerm(event.target.value)}
                                            placeholder="Search members"
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="w-full md:max-w-xs">
                                        <label className="mb-1 block text-sm font-medium text-gray-700">
                                            Filter by role
                                        </label>
                                        <select
                                            value={roleFilter}
                                            onChange={(event) => setRoleFilter(event.target.value)}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="all">All roles</option>
                                            <option value="committee">Committee</option>
                                            <option value="student">Student</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                                <span>
                                    Showing {filteredUsers.length ? startIndex : 0} - {endIndex} of {filteredUsers.length}
                                </span>
                                <span>
                                    Page {currentPage} of {totalPages}
                                </span>
                            </div>

                            <table className="mt-3 w-full text-left">
                                <thead className="border-b border-default bg-gray-100 text-sm text-body">
                                    <tr>
                                        <th className="p-2">Name</th>
                                        <th>Role</th>
                                        <th>Phone Number</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedUsers.length > 0 ? (
                                        paginatedUsers.map((user) => (
                                            <tr className="border-b" key={user.id}>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={user.profile_picture || placeholder_avatar}
                                                            alt={user.name}
                                                            className="h-9 w-9 rounded-full object-cover"
                                                        />
                                                        <span>{user.name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex flex-wrap gap-1">
                                                        {getRoleTags(user).map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                                    tag === 'Committee'
                                                                        ? 'bg-purple-100 text-purple-800'
                                                                        : 'bg-blue-100 text-blue-800'
                                                                }`}
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {getRoleTags(user).length === 0 && (
                                                            <span className="text-xs text-gray-400">—</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>{user.phone_number ?? '—'}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedUser(user)}
                                                            aria-label="View member"
                                                            title="View"
                                                            className="rounded p-2 text-gray-600 transition hover:bg-gray-100 hover:text-indigo-600"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.046.137.046.287 0 .424C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                        </button>
                                                        {canManage && (<>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingUser(user)}
                                                            aria-label="Edit member"
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
                                                            onClick={() => handleDelete(user)}
                                                            aria-label="Archive member"
                                                            title="Archive"
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
                                            <td className="p-4 text-sm text-gray-500" colSpan="5">
                                                No members found.
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

            <ViewUserModal
                userId={selectedUser?.id}
                show={Boolean(selectedUser)}
                onClose={() => setSelectedUser(null)}
            />

            <UpdateUserModal
                show={Boolean(editingUser)}
                user={editingUser}
                onClose={() => setEditingUser(null)}
            />

            <ConfirmDeleteModal
                show={Boolean(deletingUser)}
                onClose={() => setDeletingUser(null)}
                onConfirm={confirmDelete}
                title="Archive member"
                itemName={deletingUser?.name}
                processing={deleteProcessing}
            />

            <AddStudentModal
                show={showingAddStudentModal}
                onClose={() => setShowingAddStudentModal(false)}
            />

            <AddCommitteeModal
                show={showingAddCommitteeModal}
                onClose={() => setShowingAddCommitteeModal(false)}
            />

            <ExportPotentialFacilitatorsModal
                show={showingExportFacilitatorsModal}
                onClose={() => setShowingExportFacilitatorsModal(false)}
            />

        </AuthenticatedLayout>
    );
}