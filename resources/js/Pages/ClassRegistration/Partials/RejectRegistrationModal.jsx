import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function RejectRegistrationModal({ registration, open, onClose, onSuccess }) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        rejection_reason: '',
    });

    const close = () => {
        reset();
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('class_registration.reject', registration.id), {
            onSuccess: () => {
                reset();
                onSuccess();
            },
        });
    };

    if (!registration) return null;

    return (
        <Modal show={open} onClose={close} maxWidth="md">
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Reject Registration</h2>

                <p className="mt-2 text-sm text-gray-600">
                    You are about to reject the registration from <strong>{registration.form_name}</strong>.
                </p>

                <div className="mt-4">
                    <div className="flex items-center gap-1">
                        <InputLabel htmlFor="rejection_reason" value="Reason for rejection" />
                        <span className="text-red-500" aria-hidden="true">*</span>
                    </div>
                    <textarea
                        id="rejection_reason"
                        value={data.rejection_reason}
                        onChange={(e) => setData('rejection_reason', e.target.value)}
                        placeholder="Explain why this registration is being rejected..."
                        rows="4"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <InputError message={errors.rejection_reason} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={close}>Cancel</SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing} className="!bg-red-600 hover:!bg-red-700">
                        {processing ? 'Rejecting...' : 'Reject'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
