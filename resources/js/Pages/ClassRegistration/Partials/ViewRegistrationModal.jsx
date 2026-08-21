import React from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';

export default function ViewRegistrationModal({ registration, open, onClose }) {
    if (!registration) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <Modal show={open} onClose={onClose} maxWidth="2xl">
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Registration Details</h2>
                        <p className="text-sm text-gray-600 mt-1">ID: {registration.id}</p>
                    </div>
                    <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            registration.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : registration.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                    </span>
                </div>

                <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Full Name" />
                                <p className="mt-1 text-gray-700">{registration.form_name}</p>
                            </div>
                            <div>
                                <InputLabel value="Email" />
                                <p className="mt-1 text-gray-700">{registration.form_email}</p>
                            </div>
                            {registration.form_phone && (
                                <div>
                                    <InputLabel value="Phone" />
                                    <p className="mt-1 text-gray-700">{registration.form_phone}</p>
                                </div>
                            )}
                            <div>
                                <InputLabel value="Class" />
                                <p className="mt-1 text-gray-700">
                                    {registration.class?.name || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">Submitted:</span>
                                <p className="text-gray-600">{formatDate(registration.imported_at)}</p>
                            </div>
                            {registration.reviewed_at && (
                                <div>
                                    <span className="font-medium text-gray-700">Reviewed:</span>
                                    <p className="text-gray-600">
                                        {formatDate(registration.reviewed_at)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Answers */}
                    {registration.form_answers && Object.keys(registration.form_answers).length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Additional Answers
                            </h3>
                            <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                                {Object.entries(registration.form_answers).map(
                                    ([key, value]) => (
                                        <div key={key}>
                                            <InputLabel value={key} />
                                            <p className="mt-1 text-gray-700">{value || 'N/A'}</p>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    )}

                    {/* Rejection Reason */}
                    {registration.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <h3 className="font-semibold text-red-900 mb-2">Rejection Reason</h3>
                            <p className="text-red-700">{registration.rejection_reason}</p>
                        </div>
                    )}

                    {/* Linked Student */}
                    {registration.student && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <h3 className="font-semibold text-blue-900 mb-2">Linked Student</h3>
                            <p className="text-blue-700">
                                {registration.student.name} ({registration.student.email})
                            </p>
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}
