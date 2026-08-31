import React from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextAreaInput from '@/Components/TextAreaInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function RejectRegistrationModal({ registration, open, onClose, onSuccess }) {
    const { data, setData, post, processing, errors } = useForm({
        status: 'rejected',
        rejection_reason: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('class_registration.update', registration.id), {
            onSuccess: () => {
                onSuccess();
                onClose();
            },
        });
    };

    if (!registration) return null;

    return (
        <Modal show={open} onClose={onClose} maxWidth="md">
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Reject Registration</h2>

                <p className="text-gray-700 mb-4">
                    You are about to reject the registration from <strong>{registration.form_name}</strong>.
                </p>

                <div className="mb-4">
                    <InputLabel htmlFor="rejection_reason" value="Reason for Rejection" />
                    <TextAreaInput
                        id="rejection_reason"
                        value={data.rejection_reason}
                        onChange={(e) => setData('rejection_reason', e.target.value)}
                        placeholder="Explain why this registration is being rejected..."
                        rows="4"
                        className="mt-1 block w-full"
                    />
                    {errors.rejection_reason && (
                        <p className="text-red-500 text-sm mt-1">{errors.rejection_reason}</p>
                    )}
                    <p className="text-gray-600 text-sm mt-2">
                        Provide a reason that can be logged for records.
                    </p>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <SecondaryButton
                        type="submit"
                        disabled={processing}
                        className="border-0 bg-red-600 text-white hover:bg-red-700"
                    >
                        {processing ? 'Rejecting...' : 'Reject'}
                    </SecondaryButton>
                </div>
            </form>
        </Modal>
    );
}
