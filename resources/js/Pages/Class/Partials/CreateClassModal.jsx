import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export default function CreateClassModal({ show, onClose, courseProfileOptions, facilitatorOptions }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        course_profile_id: '',
        facilitator_ids: [],
        name: '',
        description: '',
        language: '',
        mode: 'online',
        venue: '',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
    });

    useEffect(() => {
        if (data.mode !== 'physical') {
            setData('venue', '');
        }
    }, [data.mode]);

    const close = () => {
        reset();
        onClose();
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('class.store'), { onSuccess: close });
    };

    const isPhysicalMode = data.mode === 'physical';

    return (
        <Modal show={show} onClose={close} maxWidth="4xl">
            <form onSubmit={submit} className="max-h-[85vh] overflow-y-auto p-6">
                <h2 className="text-lg font-medium text-gray-900">Add New Class</h2>

                <div className="mt-6 space-y-5">
                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Class Details</h3>
                        <div className="mt-3 space-y-4">
                            <div>
                                <div className="flex items-center gap-1">
                                    <InputLabel htmlFor="class-name" value="Class name" />
                                    <span className="text-red-500" aria-hidden="true">*</span>
                                </div>
                                <TextInput
                                    id="class-name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                    autoFocus
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="class-description" value="Description" />
                                <textarea
                                    id="class-description"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.description}
                                    onChange={(event) => setData('description', event.target.value)}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <div className="flex items-center gap-1">
                                        <InputLabel htmlFor="class-course-profile" value="Course profile" />
                                        <span className="text-red-500" aria-hidden="true">*</span>
                                    </div>
                                    <select
                                        id="class-course-profile"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.course_profile_id}
                                        onChange={(event) => setData((previous) => ({
                                            ...previous,
                                            course_profile_id: event.target.value,
                                            facilitator_ids: [],
                                        }))}
                                    >
                                        <option value="">Select course profile</option>
                                        {courseProfileOptions?.map((profile) => (
                                            <option key={profile.id} value={profile.id}>
                                                {profile.title}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.course_profile_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="class-language" value="Language" />
                                    <TextInput
                                        id="class-language"
                                        className="mt-1 block w-full"
                                        value={data.language}
                                        onChange={(event) => setData('language', event.target.value)}
                                    />
                                    <InputError message={errors.language} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="class-mode" value="Mode" />
                                    <select
                                        id="class-mode"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.mode}
                                        onChange={(event) => setData('mode', event.target.value)}
                                    >
                                        <option value="online">Online</option>
                                        <option value="hybrid">Hybrid</option>
                                        <option value="physical">Physical</option>
                                    </select>
                                    <InputError message={errors.mode} className="mt-2" />
                                </div>

                                {isPhysicalMode && (
                                    <div>
                                        <InputLabel htmlFor="class-venue" value="Venue" />
                                        <TextInput
                                            id="class-venue"
                                            className="mt-1 block w-full"
                                            value={data.venue}
                                            onChange={(event) => setData('venue', event.target.value)}
                                            placeholder="e.g. Room A-3, 1st Floor"
                                        />
                                        <InputError message={errors.venue} className="mt-2" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Organization</h3>
                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel value="Facilitators" />
                                {!data.course_profile_id ? (
                                    <p className="mt-1 text-xs text-gray-500">Select a course profile first.</p>
                                ) : (facilitatorOptions?.[data.course_profile_id] ?? []).length === 0 ? (
                                    <p className="mt-1 text-xs text-gray-500">No appointed facilitators for this course profile yet.</p>
                                ) : (
                                    <div className="mt-1 max-h-40 space-y-1 overflow-y-auto rounded-md border border-gray-300 p-2">
                                        {(facilitatorOptions?.[data.course_profile_id] ?? []).map((facilitator) => (
                                            <label key={facilitator.id} className="flex items-center gap-2 text-sm text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={data.facilitator_ids.includes(facilitator.id)}
                                                    onChange={(event) => setData('facilitator_ids', event.target.checked
                                                        ? [...data.facilitator_ids, facilitator.id]
                                                        : data.facilitator_ids.filter((id) => id !== facilitator.id))}
                                                />
                                                {facilitator.name}
                                            </label>
                                        ))}
                                    </div>
                                )}
                                <InputError message={errors.facilitator_ids} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="class-start-date" value="Start date" />
                                <TextInput
                                    id="class-start-date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.start_date}
                                    onChange={(event) => setData('start_date', event.target.value)}
                                />
                                <InputError message={errors.start_date} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="class-end-date" value="End date" />
                                <TextInput
                                    id="class-end-date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.end_date}
                                    onChange={(event) => setData('end_date', event.target.value)}
                                />
                                <InputError message={errors.end_date} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="class-start-time" value="Start time" />
                                <TextInput
                                    id="class-start-time"
                                    type="time"
                                    className="mt-1 block w-full"
                                    value={data.start_time}
                                    onChange={(event) => setData('start_time', event.target.value)}
                                />
                                <InputError message={errors.start_time} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="class-end-time" value="End time" />
                                <TextInput
                                    id="class-end-time"
                                    type="time"
                                    className="mt-1 block w-full"
                                    value={data.end_time}
                                    onChange={(event) => setData('end_time', event.target.value)}
                                />
                                <InputError message={errors.end_time} className="mt-2" />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={close}>Cancel</SecondaryButton>
                    <PrimaryButton disabled={processing}>Save Class</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}