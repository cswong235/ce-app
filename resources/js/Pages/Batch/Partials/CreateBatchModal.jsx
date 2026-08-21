import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';

export default function CreateBatchModal({ show, onClose, courseProfileOptions }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        course_profile_id: '',
        name: '',
        google_form_link: '',
    });

    const close = () => {
        reset();
        onClose();
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('batch.store'), { onSuccess: close });
    };

    return (
        <Modal show={show} onClose={close} maxWidth="lg">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Add New Batch</h2>

                <div className="mt-6 space-y-4">
                    <div>
                        <div className="flex items-center gap-1">
                            <InputLabel htmlFor="batch-name" value="Batch name" />
                            <span className="text-red-500" aria-hidden="true">*</span>
                        </div>
                        <TextInput
                            id="batch-name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            placeholder="e.g. Disciple Red — March 2026 Intake"
                            autoFocus
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <div className="flex items-center gap-1">
                            <InputLabel htmlFor="batch-course-profile" value="Course profile" />
                            <span className="text-red-500" aria-hidden="true">*</span>
                        </div>
                        <select
                            id="batch-course-profile"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.course_profile_id}
                            onChange={(event) => setData('course_profile_id', event.target.value)}
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
                        <InputLabel htmlFor="batch-google-form-link" value="Google Form link (optional)" />
                        <TextInput
                            id="batch-google-form-link"
                            type="url"
                            className="mt-1 block w-full"
                            value={data.google_form_link}
                            onChange={(event) => setData('google_form_link', event.target.value)}
                            placeholder="https://..."
                        />
                        <InputError message={errors.google_form_link} className="mt-2" />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={close}>Cancel</SecondaryButton>
                    <PrimaryButton disabled={processing}>Save Batch</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}