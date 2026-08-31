import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import PrerequisiteChecklist from './PrerequisiteChecklist';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export default function UpdateCourseProfileModal({
    show,
    onClose,
    courseProfile,
    prerequisiteOptions,
}) {
    const availablePrerequisiteOptions = (prerequisiteOptions ?? []).filter(
        (option) => Number(option.id) !== Number(courseProfile?.id),
    );

    const { data, setData, processing, errors, reset, put } = useForm({
        title: '',
        description: '',
        target_audience: '',
        early_bird_fees: '',
        standard_fees: '',
        course_type: 'standard',
        suggested_class_capacity: '',
        prerequisite_course_profile_ids: [],
    });

    useEffect(() => {
        if (courseProfile) {
            setData({
                title: courseProfile.title ?? '',
                description: courseProfile.description ?? '',
                target_audience: courseProfile.target_audience ?? '',
                early_bird_fees: courseProfile.early_bird_fees ?? '',
                standard_fees: courseProfile.standard_fees ?? '',
                course_type: courseProfile.course_type ?? 'standard',
                suggested_class_capacity: courseProfile.suggested_class_capacity ?? '',
                prerequisite_course_profile_ids:
                    courseProfile.prerequisites?.map((prerequisite) => Number(prerequisite.id)) ?? [],
            });
        }
    }, [courseProfile]);

    const close = () => {
        reset();
        onClose();
    };

    const togglePrerequisite = (courseProfileId) => {
        const id = Number(courseProfileId);
        const selected = data.prerequisite_course_profile_ids.includes(id)
            ? data.prerequisite_course_profile_ids.filter((selectedId) => selectedId !== id)
            : [...data.prerequisite_course_profile_ids, id];

        setData('prerequisite_course_profile_ids', selected);
    };

    const submit = (event) => {
        event.preventDefault();

        put(route('course_profile.update', courseProfile.id), {
            onSuccess: close,
        });
    };

    return (
        <Modal show={show} onClose={close} maxWidth="3xl">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    Update Course Profile
                </h2>

                <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center gap-1">
                                <InputLabel htmlFor="update-title" value="Title" />
                                <span className="text-red-500" aria-hidden="true">*</span>
                            </div>
                            <TextInput
                                id="update-title"
                                className="mt-1 block w-full"
                                value={data.title}
                                onChange={(event) => setData('title', event.target.value)}
                                autoFocus
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="update-description" value="Description" />
                            <textarea
                                id="update-description"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="update-target_audience" value="Target audience" />
                                <TextInput
                                    id="update-target_audience"
                                    className="mt-1 block w-full"
                                    value={data.target_audience}
                                    onChange={(event) => setData('target_audience', event.target.value)}
                                />
                                <InputError message={errors.target_audience} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="update-course_type" value="Course type" />
                                <select
                                    id="update-course_type"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.course_type}
                                    onChange={(event) => setData('course_type', event.target.value)}
                                >
                                    <option value="standard">Standard</option>
                                    <option value="facilitator">Facilitator</option>
                                </select>
                                <InputError message={errors.course_type} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="update-early_bird_fees" value="Early bird fees" />
                                <TextInput
                                    id="update-early_bird_fees"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="mt-1 block w-full"
                                    value={data.early_bird_fees}
                                    onChange={(event) => setData('early_bird_fees', event.target.value)}
                                />
                                <InputError message={errors.early_bird_fees} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="update-standard_fees" value="Standard fees" />
                                <TextInput
                                    id="update-standard_fees"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="mt-1 block w-full"
                                    value={data.standard_fees}
                                    onChange={(event) => setData('standard_fees', event.target.value)}
                                />
                                <InputError message={errors.standard_fees} className="mt-2" />
                            </div>

                            <div className="sm:col-span-2">
                                <InputLabel htmlFor="update-suggested_class_capacity" value="Suggested class capacity" />
                                <TextInput
                                    id="update-suggested_class_capacity"
                                    type="number"
                                    min="1"
                                    className="mt-1 block w-full"
                                    value={data.suggested_class_capacity}
                                    onChange={(event) => setData('suggested_class_capacity', event.target.value)}
                                />
                                <InputError message={errors.suggested_class_capacity} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    <div className="hidden border-l border-gray-200" aria-hidden="true" />

                    <PrerequisiteChecklist
                        options={availablePrerequisiteOptions}
                        selectedIds={data.prerequisite_course_profile_ids}
                        onToggle={togglePrerequisite}
                        error={errors.prerequisite_course_profile_ids}
                    />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={close}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        Save Changes
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
