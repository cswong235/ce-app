import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import HoverTooltip from '@/Components/HoverTooltip';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import placeholder_avatar from '@/Assets/Placeholder.png';

const roleLabels = {
    chair: 'CE Chair',
    co_chair: 'CE Co-Chair',
    committee: 'CE Committee',
    system_admin: 'System Admin',
};

const studentStatusLabels = {
    potential: 'Potential Student',
    current: 'Current Student',
    not_eligible: 'Not Eligible',
};

const facilitatorStatusLabels = {
    potential: 'Potential',
    appointed: 'Appointed',
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

const PAGE_SIZE = 5;

function paginate(items, page) {
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const paginated = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const startIndex = items.length ? (page - 1) * PAGE_SIZE + 1 : 0;
    const endIndex = Math.min(page * PAGE_SIZE, items.length);
    return { totalPages, paginated, startIndex, endIndex };
}

function TablePagination({ page, totalPages, startIndex, endIndex, total, onPageChange }) {
    if (total <= PAGE_SIZE) return null;

    return (
        <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-4 py-2">
            <span className="text-xs text-gray-500">
                Showing {total ? startIndex : 0} - {endIndex} of {total}
            </span>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

function Section({ accent, title, badge, children }) {
    const accentClasses = {
        purple: 'border-purple-200 bg-purple-50/40',
        blue: 'border-blue-200 bg-blue-50/40',
    }[accent];

    const dotClasses = {
        purple: 'bg-purple-500',
        blue: 'bg-blue-500',
    }[accent];

    const titleClasses = {
        purple: 'text-purple-900',
        blue: 'text-blue-900',
    }[accent];

    return (
        <section className={`rounded-xl border p-5 ${accentClasses}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`inline-flex h-2.5 w-2.5 rounded-full ${dotClasses}`} />
                    <h3 className={`text-base font-semibold ${titleClasses}`}>{title}</h3>
                </div>
                {badge}
            </div>
            <div className="mt-4 space-y-6">{children}</div>
        </section>
    );
}

function SubTable({ title, columns, actions, children }) {
    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-medium text-gray-500">{title}</h4>
                {actions}
            </div>
            <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                            {columns.map((column) => (
                                <th key={column} className="px-4 py-2 font-medium">{column}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">{children}</tbody>
                </table>
            </div>
        </div>
    );
}

export default function ViewUserModal({ userId, show, onClose }) {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [markingCourseId, setMarkingCourseId] = useState(null);
    const [adminClassesPage, setAdminClassesPage] = useState(1);
    const [enrollmentsPage, setEnrollmentsPage] = useState(1);
    const [facilitatorStatusesPage, setFacilitatorStatusesPage] = useState(1);
    const [adminSearchTerm, setAdminSearchTerm] = useState('');
    const [enrollmentSearchTerm, setEnrollmentSearchTerm] = useState('');
    const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState('all');
    const [facilitatorSearchTerm, setFacilitatorSearchTerm] = useState('');
    const [facilitatorStatusFilter, setFacilitatorStatusFilter] = useState('all');

    useEffect(() => {
        if (show && userId) {
            setLoading(true);
            axios.get(route('user.show', userId)).then((res) => {
                setUser(res.data);
                setAdminClassesPage(1);
                setEnrollmentsPage(1);
                setFacilitatorStatusesPage(1);
                setAdminSearchTerm('');
                setEnrollmentSearchTerm('');
                setEnrollmentStatusFilter('all');
                setFacilitatorSearchTerm('');
                setFacilitatorStatusFilter('all');
            }).finally(() => setLoading(false));
        }
    }, [show, userId]);

    const refetchUser = () => {
        axios.get(route('user.show', userId)).then((res) => setUser(res.data));
    };

    const markAsPotential = (courseProfileId) => {
        setMarkingCourseId(courseProfileId);
        axios.post(route('facilitator_status.mark_for_student', userId), {
            course_profile_ids: [courseProfileId],
        }).then(refetchUser).finally(() => setMarkingCourseId(null));
    };

    const promoteToAppointed = (facilitatorStatusId) => {
        axios.patch(route('facilitator_status.update', facilitatorStatusId), {
            status: 'appointed',
        }).then(refetchUser);
    };

    const revertToPotential = (facilitatorStatusId) => {
        axios.patch(route('facilitator_status.update', facilitatorStatusId), {
            status: 'potential',
        }).then(refetchUser);
    };

    const removeFacilitatorMark = (facilitatorStatusId) => {
        axios.delete(route('facilitator_status.destroy', facilitatorStatusId)).then(refetchUser);
    };

    const facilitatorRows = useMemo(() => {
        if (!user?.student) return [];

        const marked = user.student.facilitator_statuses.map((fs) => ({
            id: `fs-${fs.id}`,
            courseProfile: fs.course_profile,
            facilitatorStatus: fs,
        }));
        const unmarked = user.student.eligible_facilitator_course_profiles.map((cp) => ({
            id: `cp-${cp.id}`,
            courseProfile: cp,
            facilitatorStatus: null,
        }));

        return [...marked, ...unmarked].sort((a, b) =>
            (a.courseProfile?.title ?? '').localeCompare(b.courseProfile?.title ?? '')
        );
    }, [user]);

    const filteredAdminClasses = useMemo(() => {
        const normalized = adminSearchTerm.trim().toLowerCase();
        const adminClasses = user?.committee?.admin_classes ?? [];
        if (!normalized) return adminClasses;

        return adminClasses.filter((assignment) =>
            assignment.classes?.name?.toLowerCase().includes(normalized)
        );
    }, [user, adminSearchTerm]);

    const filteredEnrollments = useMemo(() => {
        const normalized = enrollmentSearchTerm.trim().toLowerCase();
        const enrollments = user?.student?.enrollments ?? [];

        return enrollments.filter((enrollment) => {
            const matchesSearch =
                normalized.length === 0 ||
                enrollment.classes?.name?.toLowerCase().includes(normalized) ||
                enrollment.classes?.course_profile?.title?.toLowerCase().includes(normalized);

            const matchesStatus = enrollmentStatusFilter === 'all' || enrollment.status === enrollmentStatusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [user, enrollmentSearchTerm, enrollmentStatusFilter]);

    const filteredFacilitatorRows = useMemo(() => {
        const normalized = facilitatorSearchTerm.trim().toLowerCase();

        return facilitatorRows.filter((row) => {
            const matchesSearch =
                normalized.length === 0 ||
                row.courseProfile?.title?.toLowerCase().includes(normalized);

            const status = row.facilitatorStatus?.status ?? 'not_applicable';
            const matchesStatus = facilitatorStatusFilter === 'all' || status === facilitatorStatusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [facilitatorRows, facilitatorSearchTerm, facilitatorStatusFilter]);

    useEffect(() => {
        setAdminClassesPage(1);
    }, [adminSearchTerm]);

    useEffect(() => {
        setEnrollmentsPage(1);
    }, [enrollmentSearchTerm, enrollmentStatusFilter]);

    useEffect(() => {
        setFacilitatorStatusesPage(1);
    }, [facilitatorSearchTerm, facilitatorStatusFilter]);

    return (
        <Modal show={show} onClose={onClose} maxWidth="4xl">
            <div className="max-h-[85vh] overflow-y-auto">
                {loading || !user ? (
                    <p className="p-6 text-sm text-gray-500">Loading...</p>
                ) : (
                    <>
                        <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-gray-50 px-6 py-5">
                            <div className="flex items-center gap-4">
                                <img
                                    src={user.profile_picture || placeholder_avatar}
                                    alt={user.name}
                                    className="h-16 w-16 rounded-full object-cover"
                                />
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
                                    <p className="mt-0.5 text-sm text-gray-500">{user.email}</p>
                                    <p className="text-sm text-gray-500">{user.phone_number ?? '—'}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close"
                                className="-mr-1 -mt-1 rounded p-1 text-2xl leading-none text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="space-y-6 p-6">
                            {user.committee && (
                                <Section accent="purple" title="Committee Member">
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Role</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {roleLabels[user.committee.role] ?? user.committee.role}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Term</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {formatDate(user.committee.term_start_date)} – {formatDate(user.committee.term_end_date)}
                                            </dd>
                                        </div>
                                    </div>

                                    <SubTable
                                        title="Class Admin Assignments"
                                        columns={['Class', 'Assigned']}
                                        actions={
                                            user.committee.admin_classes.length > 0 && (
                                                <input
                                                    type="text"
                                                    value={adminSearchTerm}
                                                    onChange={(e) => setAdminSearchTerm(e.target.value)}
                                                    placeholder="Search classes..."
                                                    className="w-48 rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                            )
                                        }
                                    >
                                        {filteredAdminClasses.length > 0 ? (
                                            paginate(filteredAdminClasses, adminClassesPage).paginated.map((assignment) => (
                                                <tr key={assignment.id}>
                                                    <td className="px-4 py-2">{assignment.classes?.name ?? 'N/A'}</td>
                                                    <td className="px-4 py-2">{formatDate(assignment.assigned_at)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2" className="px-4 py-3 text-gray-400">
                                                    {user.committee.admin_classes.length === 0 ? 'No class assignments.' : 'No classes match your search.'}
                                                </td>
                                            </tr>
                                        )}
                                    </SubTable>
                                    {filteredAdminClasses.length > 0 && (
                                        <TablePagination
                                            {...paginate(filteredAdminClasses, adminClassesPage)}
                                            total={filteredAdminClasses.length}
                                            page={adminClassesPage}
                                            onPageChange={setAdminClassesPage}
                                        />
                                    )}
                                </Section>
                            )}

                            {user.student && (
                                <Section
                                    accent="blue"
                                    title="Student"
                                    badge={
                                        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                                            {studentStatusLabels[user.student.status] ?? user.student.status}
                                        </span>
                                    }
                                >
                                    <div>
                                        <SubTable
                                            title="Attended Courses & Testimonials"
                                            columns={['Class', 'Course Profile', 'Status', 'Year', 'Testimonial']}
                                            actions={
                                                user.student.enrollments.length > 0 && (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={enrollmentSearchTerm}
                                                            onChange={(e) => setEnrollmentSearchTerm(e.target.value)}
                                                            placeholder="Search classes..."
                                                            className="w-48 rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        />
                                                        <select
                                                            value={enrollmentStatusFilter}
                                                            onChange={(e) => setEnrollmentStatusFilter(e.target.value)}
                                                            className="rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        >
                                                            <option value="all">All statuses</option>
                                                            <option value="active">Active</option>
                                                            <option value="left">Left</option>
                                                            <option value="completed">Completed</option>
                                                        </select>
                                                    </div>
                                                )
                                            }
                                        >
                                            {filteredEnrollments.length > 0 ? (
                                                paginate(filteredEnrollments, enrollmentsPage).paginated.map((enrollment) => (
                                                    <tr key={enrollment.id} className="align-top">
                                                        <td className="px-4 py-2">{enrollment.classes?.name ?? 'N/A'}</td>
                                                        <td className="px-4 py-2">{enrollment.classes?.course_profile?.title ?? 'N/A'}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${enrollmentStatusColors[enrollment.status]}`}>
                                                                {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2">{getYear(enrollment.classes?.created_at)}</td>
                                                        <td className="px-4 py-2 text-gray-600">
                                                            {enrollment.testimonial ? (
                                                                <HoverTooltip content={enrollment.testimonial}>
                                                                    <button
                                                                        type="button"
                                                                        aria-label="View testimonial"
                                                                        className="rounded p-1 text-gray-600 transition hover:bg-gray-200 hover:text-indigo-600"
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
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-4 py-3 text-gray-400">
                                                        {user.student.enrollments.length === 0 ? 'No enrollments yet.' : 'No enrollments match your filters.'}
                                                    </td>
                                                </tr>
                                            )}
                                        </SubTable>
                                        {filteredEnrollments.length > 0 && (
                                            <TablePagination
                                                {...paginate(filteredEnrollments, enrollmentsPage)}
                                                total={filteredEnrollments.length}
                                                page={enrollmentsPage}
                                                onPageChange={setEnrollmentsPage}
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <SubTable
                                            title="Facilitator Status by Course"
                                            columns={['Course Profile', 'Status', 'Actions']}
                                            actions={
                                                facilitatorRows.length > 0 && (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={facilitatorSearchTerm}
                                                            onChange={(e) => setFacilitatorSearchTerm(e.target.value)}
                                                            placeholder="Search courses..."
                                                            className="w-48 rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        />
                                                        <select
                                                            value={facilitatorStatusFilter}
                                                            onChange={(e) => setFacilitatorStatusFilter(e.target.value)}
                                                            className="rounded-md border-gray-300 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        >
                                                            <option value="all">All statuses</option>
                                                            <option value="not_applicable">Not Applicable</option>
                                                            <option value="potential">Potential</option>
                                                            <option value="appointed">Appointed</option>
                                                        </select>
                                                    </div>
                                                )
                                            }
                                        >
                                            {filteredFacilitatorRows.length > 0 ? (
                                                paginate(filteredFacilitatorRows, facilitatorStatusesPage).paginated.map((row) => (
                                                    <tr key={row.id}>
                                                        <td className="px-4 py-2">{row.courseProfile?.title ?? 'N/A'}</td>
                                                        <td className="px-4 py-2">
                                                            {row.facilitatorStatus ? (
                                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                                    row.facilitatorStatus.status === 'appointed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                                                }`}>
                                                                    {facilitatorStatusLabels[row.facilitatorStatus.status] ?? row.facilitatorStatus.status}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">Not Applicable</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {!row.facilitatorStatus && (
                                                                    <SecondaryButton
                                                                        type="button"
                                                                        disabled={markingCourseId === row.courseProfile.id}
                                                                        onClick={() => markAsPotential(row.courseProfile.id)}
                                                                        className="rounded border border-indigo-600 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
                                                                    >
                                                                        {markingCourseId === row.courseProfile.id ? 'Marking...' : 'Mark as Potential'}
                                                                    </SecondaryButton>
                                                                )}
                                                                {row.facilitatorStatus?.status === 'potential' && (
                                                                    <SecondaryButton
                                                                        type="button"
                                                                        onClick={() => promoteToAppointed(row.facilitatorStatus.id)}
                                                                        className="rounded border border-green-600 px-2 py-1 text-xs text-green-700 hover:bg-green-50"
                                                                    >
                                                                        Appoint
                                                                    </SecondaryButton>
                                                                )}
                                                                {row.facilitatorStatus?.status === 'appointed' && (
                                                                    <SecondaryButton
                                                                        type="button"
                                                                        onClick={() => revertToPotential(row.facilitatorStatus.id)}
                                                                        className="rounded border !border-amber-600 px-2 py-1 text-xs !text-amber-700 hover:!bg-amber-50"
                                                                    >
                                                                        Revert
                                                                    </SecondaryButton>
                                                                )}
                                                                {row.facilitatorStatus && (
                                                                    <SecondaryButton
                                                                        type="button"
                                                                        onClick={() => removeFacilitatorMark(row.facilitatorStatus.id)}
                                                                        className="rounded border border-red-600 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                                                                    >
                                                                        Remove
                                                                    </SecondaryButton>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="px-4 py-3 text-gray-400">
                                                        {facilitatorRows.length === 0 ? 'Not Applicable for any course.' : 'No courses match your filters.'}
                                                    </td>
                                                </tr>
                                            )}
                                        </SubTable>
                                        {filteredFacilitatorRows.length > 0 && (
                                            <TablePagination
                                                {...paginate(filteredFacilitatorRows, facilitatorStatusesPage)}
                                                total={filteredFacilitatorRows.length}
                                                page={facilitatorStatusesPage}
                                                onPageChange={setFacilitatorStatusesPage}
                                            />
                                        )}
                                    </div>
                                </Section>
                            )}
                        </div>
                    </>
                )}

                <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <SecondaryButton type="button" onClick={onClose}>Close</SecondaryButton>
                </div>
            </div>
        </Modal>
    );
}
