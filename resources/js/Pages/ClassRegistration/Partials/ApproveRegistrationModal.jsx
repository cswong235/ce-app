import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { usePage } from '@inertiajs/react';

export default function ApproveRegistrationModal({ registration, open, onClose, onSuccess }) {
    const { users = [] } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        status: 'approved',
        student_id: registration?.student_id || '',
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Approve Registration</h2>

                <p className="text-gray-700 mb-4">
                    Are you sure you want to approve this registration for{' '}
                    <strong>{registration.form_name}</strong>?
                </p>

                <div className="mb-4">
                    <InputLabel
                        htmlFor="student_id"
                        value="Link to Existing Student (Optional)"
                    />
                    <select
                        id="student_id"
                        value={data.student_id}
                        onChange={(e) => setData('student_id', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">No student selected</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({user.email})
                            </option>
                        ))}
                    </select>
                    {errors.student_id && (
                        <p className="text-red-500 text-sm mt-1">{errors.student_id}</p>
                    )}
                    <p className="text-gray-600 text-sm mt-2">
                        Optionally link this registration to an existing student account.
                    </p>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Approving...' : 'Approve'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
