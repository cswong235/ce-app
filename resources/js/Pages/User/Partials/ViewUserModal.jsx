import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import axios from 'axios';
import { useEffect, useState } from 'react';
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

function formatDate(dateString) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ViewUserModal({ userId, show, onClose }) {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [showFacilitatorMarking, setShowFacilitatorMarking] = useState(false);
    const [selectedCourseIds, setSelectedCourseIds] = useState([]);
    const [markingSubmitting, setMarkingSubmitting] = useState(false);

    useEffect(() => {
        if (show && userId) {
            setLoading(true);
            axios.get(route('user.show', userId)).then((res) => {
                setUser(res.data);
            }).finally(() => setLoading(false));
        }
    }, [show, userId]);

    const toggleCourseSelection = (id) => {
        setSelectedCourseIds((prev) =>
            prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
        );
    };

    const refetchUser = () => {
        axios.get(route('user.show', userId)).then((res) => setUser(res.data));
    };

    const submitFacilitatorMarking = () => {
        if (selectedCourseIds.length === 0) return;

        setMarkingSubmitting(true);
        axios.post(route('facilitator_status.mark_for_student', userId), {
            course_profile_ids: selectedCourseIds,
        }).then(() => {
            setSelectedCourseIds([]);
            setShowFacilitatorMarking(false);
            refetchUser();
        }).finally(() => setMarkingSubmitting(false));
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
        if (!window.confirm('Remove this facilitator mark? Status will return to Not Applicable.')) return;
        axios.delete(route('facilitator_status.destroy', facilitatorStatusId)).then(refetchUser);
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="max-h-[85vh] overflow-y-auto p-6">
                {loading || !user ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                ) : (
                    <>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <img
                                    src={user.profile_picture || placeholder_avatar}
                                    alt={user.name}
                                    className="h-16 w-16 rounded-full object-cover"
                                />
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900">{user.name}</h2>
                                    <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                                    <p className="text-sm text-gray-500">{user.phone_number ?? '—'}</p>
                                </div>
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

                        {user.committee && (
                            <div className="mt-6 rounded-lg border border-purple-200 bg-purple-50/50 p-4">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-purple-500" />
                                    <h3 className="text-md font-semibold text-purple-900">Committee Member</h3>
                                </div>

                                <div className="mt-3 grid gap-4 sm:grid-cols-2">
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

                                <div className="mt-4">
                                    <dt className="text-sm font-medium text-gray-500">Class Admin Assignments</dt>
                                    <table className="mt-2 w-full text-left text-sm">
                                        <thead className="border-b border-purple-200 text-gray-600">
                                            <tr>
                                                <th className="py-1">Class</th>
                                                <th className="py-1">Assigned</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {user.committee.admin_classes.length > 0 ? (
                                                user.committee.admin_classes.map((assignment) => (
                                                    <tr key={assignment.id} className="border-b border-purple-100">
                                                        <td className="py-1">{assignment.classes?.name ?? 'N/A'}</td>
                                                        <td className="py-1">{formatDate(assignment.assigned_at)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="2" className="py-2 text-gray-400">No class assignments.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {user.student && (
                            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                                        <h3 className="text-md font-semibold text-blue-900">Student</h3>
                                    </div>
                                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                        {studentStatusLabels[user.student.status] ?? user.student.status}
                                    </span>
                                </div>

                                <div className="mt-4">
                                    <dt className="text-sm font-medium text-gray-500">Attended Courses & Testimonials</dt>
                                    <table className="mt-2 w-full text-left text-sm">
                                        <thead className="border-b border-blue-200 text-gray-600">
                                            <tr>
                                                <th className="py-1">Class</th>
                                                <th className="py-1">Status</th>
                                                <th className="py-1">Testimonial</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {user.student.enrollments.length > 0 ? (
                                                user.student.enrollments.map((enrollment) => (
                                                    <tr key={enrollment.id} className="border-b border-blue-100 align-top">
                                                        <td className="py-1">{enrollment.classes?.name ?? 'N/A'}</td>
                                                        <td className="py-1 capitalize">{enrollment.status}</td>
                                                        <td className="py-1 text-gray-600">
                                                            {enrollment.testimonial || '—'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="py-2 text-gray-400">No enrollments yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4">
                                    <dt className="text-sm font-medium text-gray-500">Facilitator Status by Course</dt>
                                    <table className="mt-2 w-full text-left text-sm">
                                        <thead className="border-b border-blue-200 text-gray-600">
                                            <tr>
                                                <th className="py-1">Course Profile</th>
                                                <th className="py-1">Status</th>
                                                <th className="py-1">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {user.student.facilitator_statuses.length > 0 ? (
                                                user.student.facilitator_statuses.map((fs) => (
                                                    <tr key={fs.id} className="border-b border-blue-100">
                                                        <td className="py-1">{fs.course_profile?.title ?? 'N/A'}</td>
                                                        <td className="py-1">
                                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                                fs.status === 'appointed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                                            }`}>
                                                                {facilitatorStatusLabels[fs.status] ?? fs.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-1 space-x-2">
                                                            {fs.status === 'potential' ? (
                                                                <button type="button" onClick={() => promoteToAppointed(fs.id)}
                                                                    className="text-xs text-green-700 hover:text-green-900">
                                                                    Appoint
                                                                </button>
                                                            ) : (
                                                                <button type="button" onClick={() => revertToPotential(fs.id)}
                                                                    className="text-xs text-amber-700 hover:text-amber-900">
                                                                    Revert
                                                                </button>
                                                            )}
                                                            <button type="button" onClick={() => removeFacilitatorMark(fs.id)}
                                                                className="text-xs text-red-600 hover:text-red-800">
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="py-2 text-gray-400">Not Applicable for any course.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowFacilitatorMarking((prev) => !prev)}
                                        className="rounded border border-indigo-600 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50"
                                    >
                                        Mark as Potential Facilitator
                                    </button>

                                    {showFacilitatorMarking && (
                                        <div className="mt-3 rounded-md border border-gray-200 bg-white p-4">
                                            {user.student.eligible_facilitator_course_profiles.length > 0 ? (
                                                <>
                                                    <p className="text-sm text-gray-600">
                                                        Select completed courses to mark this student as a potential facilitator for:
                                                    </p>
                                                    <div className="mt-2 space-y-2">
                                                        {user.student.eligible_facilitator_course_profiles.map((cp) => (
                                                            <label key={cp.id} className="flex items-center gap-2 text-sm">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedCourseIds.includes(cp.id)}
                                                                    onChange={() => toggleCourseSelection(cp.id)}
                                                                />
                                                                {cp.title}
                                                            </label>
                                                        ))}
                                                    </div>
                                                    <div className="mt-3 flex justify-end">
                                                        <PrimaryButton
                                                            type="button"
                                                            disabled={selectedCourseIds.length === 0 || markingSubmitting}
                                                            onClick={submitFacilitatorMarking}
                                                        >
                                                            {markingSubmitting ? 'Marking...' : 'Confirm'}
                                                        </PrimaryButton>
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-sm text-gray-500">
                                                    No eligible completed courses without an existing facilitator mark.
                                                </p>
                                            )}
                                        </div>
                                    )}
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
    );
}