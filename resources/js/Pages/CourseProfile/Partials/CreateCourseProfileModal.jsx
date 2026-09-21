import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import MultiSelectPicker from '@/Components/MultiSelectPicker';
import { useForm } from '@inertiajs/react';

export default function CreateCourseProfileModal({
    show,
    onClose,
    prerequisiteOptions,
}) {
    const availablePrerequisiteOptions = (prerequisiteOptions ?? [])
        .map((option) => ({ id: Number(option.id), name: option.title }));
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

    const submit = (event) => {
        event.preventDefault();

        post(route('course_profile.store'), {
            onSuccess: close,
        });
    };

    return (
        <Modal show={show} onClose={close} maxWidth="3xl">
            <form onSubmit={submit} className="max-h-[85vh] overflow-y-auto p-6">
                <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-medium text-gray-900">Add New Course Profile</h2>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close"
                        className="text-2xl leading-none text-gray-400 hover:text-gray-600"
                    >
                        &times;
                    </button>
                </div>

                <div className="mt-6 space-y-5">
                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Course Profile Details</h3>
                        <div className="mt-3 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <div className="flex items-center gap-1">
                                        <InputLabel htmlFor="title" value="Title" />
                                        <InputLabel className="text-red-500" aria-hidden="true">*</InputLabel>
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
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Organization</h3>
                        <div className="mt-3 space-y-4">
                            <div>
                                <InputLabel value="Pre-requisites" />
                                <MultiSelectPicker
                                    options={availablePrerequisiteOptions}
                                    value={data.prerequisite_course_profile_ids}
                                    onChange={(ids) => setData('prerequisite_course_profile_ids', ids)}
                                    placeholder="Search course profiles..."
                                    emptyMessage="No course profiles available yet."
                                />
                                <InputError message={errors.prerequisite_course_profile_ids} className="mt-2" />
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
                            </div>
                        </div>
                    </section>
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
