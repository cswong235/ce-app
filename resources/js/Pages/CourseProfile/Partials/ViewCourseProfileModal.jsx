import AvailableClassesModal from './AvailableClassesModal';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { useMemo, useState } from 'react';

const modeLabels = {
    online: 'Online',
    hybrid: 'Hybrid',
    physical: 'Physical',
};

function Detail({ label, children }) {
    return (
        <div>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">
                {children ?? (
                    <span className="italic text-gray-400">TBA</span>
                )}
            </dd>
        </div>
    );
}

export default function ViewCourseProfileModal({ courseProfile, classes, onClose }) {
    const [showingClassesModal, setShowingClassesModal] = useState(false);

    const modesOffered = useMemo(() => {
        if (!courseProfile || !classes) return [];

        const modes = classes
            .filter((cls) => cls.course_profile_id === courseProfile.id)
            .map((cls) => cls.mode);

        return [...new Set(modes)].sort();
    }, [courseProfile, classes]);

    const close = () => {
        setShowingClassesModal(false);
        onClose();
    };

    return (
        <>
            <Modal show={Boolean(courseProfile)} onClose={close} maxWidth="2xl">
                {courseProfile && (
                    <div className="max-h-[85vh] overflow-y-auto p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">
                                    {courseProfile.title}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Course profile details
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={close}
                                aria-label="Close course profile"
                                className="text-2xl leading-none text-gray-400 hover:text-gray-600"
                            >
                                &times;
                            </button>
                        </div>

                        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                            <Detail label="Name">{courseProfile.title}</Detail>
                            <Detail label="Course type">
                                {courseProfile.course_type === 'facilitator'
                                    ? 'Facilitator Course'
                                    : 'Standard Course'}
                            </Detail>
                            <div className="sm:col-span-2">
                                <Detail label="Description">
                                    {courseProfile.description}
                                </Detail>
                            </div>
                            <Detail label="Target audience">
                                {courseProfile.target_audience}
                            </Detail>
                            <Detail label="Suggested class capacity">
                                {courseProfile.suggested_class_capacity !== null && courseProfile.suggested_class_capacity !== ''
                                    ? `${courseProfile.suggested_class_capacity} students`
                                    : null}
                            </Detail>
                            <Detail label="Early bird fees">
                                {courseProfile.early_bird_fees !== null && courseProfile.early_bird_fees !== ''
                                    ? `RM${courseProfile.early_bird_fees}`
                                    : null}
                            </Detail>
                            <Detail label="Standard fees">
                                {courseProfile.standard_fees !== null && courseProfile.standard_fees !== ''
                                    ? `RM${courseProfile.standard_fees}`
                                    : null}
                            </Detail>
                            <div className="sm:col-span-2">
                                <Detail label="Pre-requisites">
                                    {courseProfile.prerequisites?.length ? (
                                        <div className="inline-flex flex-wrap gap-2">
                                            {courseProfile.prerequisites.map((prerequisite) => (
                                                <span
                                                    key={prerequisite.id}
                                                    className="rounded-xl bg-indigo-100 p-2 text-sm font-medium text-indigo-900"
                                                >
                                                    {prerequisite.title}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}
                                </Detail>
                            </div>
                            <Detail label="Modes offered">
                                {modesOffered.length > 0 ? (
                                    <div className="inline-flex flex-wrap gap-2">
                                        {modesOffered.map((mode) => (
                                            <span
                                                key={mode}
                                                className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800"
                                            >
                                                {modeLabels[mode] ?? mode}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                            </Detail>
                        </dl>

                        <div className="mt-6 border-t border-gray-200 pt-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-medium text-gray-900">Available classes</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Class schedules and enrolment details.
                                    </p>
                                </div>
                                <SecondaryButton
                                    type="button"
                                    onClick={() => setShowingClassesModal(true)}
                                >
                                    View classes
                                </SecondaryButton>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <AvailableClassesModal
                show={showingClassesModal}
                onClose={() => setShowingClassesModal(false)}
                courseProfile={courseProfile}
                classes={classes}
            />
        </>
    );
}
