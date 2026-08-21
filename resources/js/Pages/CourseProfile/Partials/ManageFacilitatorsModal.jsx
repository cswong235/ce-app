import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import axios from 'axios';
import { useEffect, useState } from 'react';

const facilitatorStatusLabels = {
    potential: 'Potential',
    appointed: 'Appointed',
};

export default function ManageFacilitatorsModal({ courseProfile, show, onClose }) {
    const [loading, setLoading] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const fetchCandidates = () => {
        if (!courseProfile) return;
        setLoading(true);
        axios.get(route('course_profile.facilitators', courseProfile.id)).then((res) => {
            setCandidates(res.data.candidates);
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        if (show && courseProfile) {
            fetchCandidates();
            setSelectedIds([]);
        }
    }, [show, courseProfile]);

    const toggleSelected = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
        );
    };

    const submitMarking = () => {
        if (selectedIds.length === 0) return;

        setSubmitting(true);
        axios.post(route('facilitator_status.mark_for_course', courseProfile.id), {
            student_ids: selectedIds,
        }).then(() => {
            setSelectedIds([]);
            fetchCandidates();
        }).finally(() => setSubmitting(false));
    };

    const promoteToAppointed = (facilitatorStatusId) => {
        axios.patch(route('facilitator_status.update', facilitatorStatusId), {
            status: 'appointed',
        }).then(fetchCandidates);
    };

    const revertToPotential = (facilitatorStatusId) => {
        axios.patch(route('facilitator_status.update', facilitatorStatusId), {
            status: 'potential',
        }).then(fetchCandidates);
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="3xl">
            <div className="max-h-[85vh] overflow-y-auto p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    Potential Facilitators — {courseProfile?.title}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Students who have completed this course.
                </p>

                {loading ? (
                    <p className="mt-6 text-sm text-gray-500">Loading...</p>
                ) : (
                    <>
                        <table className="mt-6 w-full text-left text-sm">
                            <thead className="border-b border-gray-200 bg-gray-100 text-gray-600">
                                <tr>
                                    <th className="p-2"></th>
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Email</th>
                                    <th className="p-2">Facilitator Status</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {candidates.length > 0 ? (
                                    candidates.map((candidate) => (
                                        <tr key={candidate.student_id} className="border-b">
                                            <td className="p-2">
                                                {!candidate.facilitator_status && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(candidate.student_id)}
                                                        onChange={() => toggleSelected(candidate.student_id)}
                                                    />
                                                )}
                                            </td>
                                            <td className="p-2">{candidate.name}</td>
                                            <td className="p-2">{candidate.email}</td>
                                            <td className="p-2">
                                                {candidate.facilitator_status ? (
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                        candidate.facilitator_status.status === 'appointed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {facilitatorStatusLabels[candidate.facilitator_status.status]}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Not Applicable</span>
                                                )}
                                            </td>
                                            <td className="p-2">
                                                {candidate.facilitator_status?.status === 'potential' && (
                                                    <button type="button"
                                                        onClick={() => promoteToAppointed(candidate.facilitator_status.id)}
                                                        className="text-xs text-green-700 hover:text-green-900">
                                                        Appoint
                                                    </button>
                                                )}
                                                {candidate.facilitator_status?.status === 'appointed' && (
                                                    <button type="button"
                                                        onClick={() => revertToPotential(candidate.facilitator_status.id)}
                                                        className="text-xs text-amber-700 hover:text-amber-900">
                                                        Revert
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-4 text-center text-gray-500">
                                            No students have completed this course yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="mt-4 flex justify-end">
                            <PrimaryButton
                                type="button"
                                disabled={selectedIds.length === 0 || submitting}
                                onClick={submitMarking}
                            >
                                {submitting ? 'Marking...' : `Mark ${selectedIds.length || ''} as Potential`}
                            </PrimaryButton>
                        </div>
                    </>
                )}

                <div className="mt-6 flex justify-end">
                    <SecondaryButton type="button" onClick={onClose}>Close</SecondaryButton>
                </div>
            </div>
        </Modal>
    );
}