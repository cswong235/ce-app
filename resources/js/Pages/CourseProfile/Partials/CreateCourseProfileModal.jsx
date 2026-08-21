import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';

export default function CreateCourseProfileModal({
    show,
    onClose,
    prerequisiteOptions,
}) {
    const availablePrerequisiteOptions = prerequisiteOptions ?? [];
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        target_audience: '',
        early_bird_fees: '',
        standard_fees: '',
        course_type: 'standard',
        suggested_class_capacity: '',
        prerequisite_course_profile_ids: [],
    });

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

        post(route('course_profile.store'), {
            onSuccess: close,
        });
    };

    return (
        <Modal show={show} onClose={close} maxWidth="3xl">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    Add New Course Profile
                </h2>

                <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center gap-1">
                                <InputLabel htmlFor="title" value="Title" />
                                <span className="text-red-500" aria-hidden="true">*</span>
                            </div>
                            <TextInput
                                id="title"
                                className="mt-1 block w-full"
                                value={data.title}
                                onChange={(event) => setData('title', event.target.value)}
                                autoFocus
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Description" />
                            <textarea
                                id="description"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="target_audience" value="Target audience" />
                                <TextInput
                                    id="target_audience"
                                    className="mt-1 block w-full"
                                    value={data.target_audience}
                                    onChange={(event) => setData('target_audience', event.target.value)}
                                />
                                <InputError message={errors.target_audience} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="course_type" value="Course type" />
                                <select
                                    id="course_type"
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
                                <InputLabel htmlFor="early_bird_fees" value="Early bird fees" />
                                <TextInput
                                    id="early_bird_fees"
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
                                <InputLabel htmlFor="standard_fees" value="Standard fees" />
                                <TextInput
                                    id="standard_fees"
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
                                <InputLabel htmlFor="suggested_class_capacity" value="Suggested class capacity" />
                                <TextInput
                                    id="suggested_class_capacity"
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

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-3">
                            <InputLabel value="Pre-requisites" />
                        </div>

                        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                            {availablePrerequisiteOptions.length > 0 ? (
                                availablePrerequisiteOptions.map((courseProfile) => {
                                    const isSelected = data.prerequisite_course_profile_ids.includes(
                                        Number(courseProfile.id),
                                    );

                                    return (
                                        <label
                                            key={courseProfile.id}
                                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2 transition ${
                                                isSelected
                                                    ? 'border-indigo-200 bg-indigo-100 text-indigo-900'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200 hover:bg-indigo-50'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => togglePrerequisite(courseProfile.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm font-medium">{courseProfile.title}</span>
                                        </label>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-gray-500">No course profiles available yet.</p>
                            )}
                        </div>

                        <InputError
                            message={errors.prerequisite_course_profile_ids}
                            className="mt-3"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={close}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        Save Profile
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
