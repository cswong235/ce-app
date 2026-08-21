import React, { useState, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PrimaryButton, DangerButton } from '@/Components/Button';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PaginationControls from '@/Components/PaginationControls';
import ViewRegistrationModal from './Partials/ViewRegistrationModal';
import ApproveRegistrationModal from './Partials/ApproveRegistrationModal';
import RejectRegistrationModal from './Partials/RejectRegistrationModal';

export default function ClassRegistration() {
    const { registrations = [] } = usePage().props;
    
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);

    const itemsPerPage = 10;

    // Filter by status and search term
    const filteredRegistrations = useMemo(() => {
        return registrations.filter(reg => {
            const matchesStatus = !statusFilter || reg.status === statusFilter;
            const matchesSearch =
                reg.form_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reg.form_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (reg.class?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [registrations, statusFilter, searchTerm]);

    // Paginate
    const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRegistrations = filteredRegistrations.slice(
        startIndex,
        startIndex + itemsPerPage,
    );

    const handleView = (registration) => {
        setSelectedRegistration(registration);
        setViewModalOpen(true);
    };

    const handleApprove = (registration) => {
        setSelectedRegistration(registration);
        setApproveModalOpen(true);
    };

    const handleReject = (registration) => {
        setSelectedRegistration(registration);
        setRejectModalOpen(true);
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-bold mb-6">Class Registrations</h2>

                            {/* Filters */}
                            <div className="mb-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <InputLabel htmlFor="status_filter" value="Status" />
                                        <select
                                            id="status_filter"
                                            value={statusFilter}
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="search" value="Search" />
                                        <TextInput
                                            id="search"
                                            placeholder="Name, email, or class..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="mt-1 block w-full"
                                        />
                                    </div>

                                    <div className="flex items-end">
                                        <button
                                            onClick={() => {
                                                setStatusFilter('pending');
                                                setSearchTerm('');
                                                setCurrentPage(1);
                                            }}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Results Summary */}
                            <div className="mb-4 text-sm text-gray-600">
                                Showing {paginatedRegistrations.length === 0 ? 0 : startIndex + 1} to{' '}
                                {Math.min(startIndex + itemsPerPage, filteredRegistrations.length)} of{' '}
                                {filteredRegistrations.length} registrations
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Class
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedRegistrations.length > 0 ? (
                                            paginatedRegistrations.map((registration) => (
                                                <tr key={registration.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {registration.form_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {registration.form_email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {registration.class?.name || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                                                                registration.status,
                                                            )}`}
                                                        >
                                                            {registration.status.charAt(0).toUpperCase() +
                                                                registration.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                                        <button
                                                            onClick={() => handleView(registration)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            View
                                                        </button>
                                                        {registration.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() =>
                                                                        handleApprove(registration)
                                                                    }
                                                                    className="text-green-600 hover:text-green-900"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleReject(registration)
                                                                    }
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="px-6 py-4 text-center text-gray-500"
                                                >
                                                    No registrations found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages || 1}
                                </div>
                                <PaginationControls
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {selectedRegistration && (
                <>
                    <ViewRegistrationModal
                        registration={selectedRegistration}
                        open={viewModalOpen}
                        onClose={() => setViewModalOpen(false)}
                    />
                    <ApproveRegistrationModal
                        registration={selectedRegistration}
                        open={approveModalOpen}
                        onClose={() => {
                            setApproveModalOpen(false);
                            setSelectedRegistration(null);
                        }}
                        onSuccess={() => {
                            setApproveModalOpen(false);
                            router.reload();
                        }}
                    />
                    <RejectRegistrationModal
                        registration={selectedRegistration}
                        open={rejectModalOpen}
                        onClose={() => {
                            setRejectModalOpen(false);
                            setSelectedRegistration(null);
                        }}
                        onSuccess={() => {
                            setRejectModalOpen(false);
                            router.reload();
                        }}
                    />
                </>
            )}
        </AuthenticatedLayout>
    );
}
