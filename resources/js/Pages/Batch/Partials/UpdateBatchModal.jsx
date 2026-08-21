import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export default function UpdateBatchModal({ show, onClose, batch, courseProfileOptions }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        course_profile_id: '',
        name: '',
        google_form_link: '',
    });

    useEffect(() => {
        if (batch) {
            setData({
                course_profile_id: batch.course_profile_id ?? '',
                name: batch.name ?? '',
                google_form_link: batch.google_form_link ?? '',
            });
        }
    }, [batch]);

    const close = () => {
        reset();
        onClose();
    };

    const submit = (event) => {
        event.preventDefault();
        put(route('batch.update', batch.id), { onSuccess: close });
    };

    return (
        <Modal show={show} onClose={close} maxWidth="lg">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Update Batch</h2>

                <div className="mt-6 space-y-4">
                    <div>
                        <InputLabel htmlFor="update-batch-name" value="Batch name" />
                        <TextInput
                            id="update-batch-name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            autoFocus
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="update-batch-course-profile" value="Course profile" />
                        <select
                            id="update-batch-course-profile"
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
                        <InputLabel htmlFor="update-batch-google-form-link" value="Google Form link (optional)" />
                        <TextInput
                            id="update-batch-google-form-link"
                            type="url"
                            className="mt-1 block w-full"
                            value={data.google_form_link}
                            onChange={(event) => setData('google_form_link', event.target.value)}
                        />
                        <InputError message={errors.google_form_link} className="mt-2" />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={close}>Cancel</SecondaryButton>
                    <PrimaryButton disabled={processing}>Save Changes</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}