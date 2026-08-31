import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import axios from 'axios';
import { useEffect, useState } from 'react';

const statusColors = {
    active: 'bg-green-100 text-green-800',
    left: 'bg-gray-100 text-gray-600',
    completed: 'bg-blue-100 text-blue-800',
};

const statusDots = {
    active: 'bg-green-500',
    left: 'bg-gray-400',
    completed: 'bg-blue-500',
};

function isUrl(value) {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

function initials(name) {
    if (!name) return '?';
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export default function ViewEnrollmentModal({ enrollment, show, onClose, onUpdated }) {
    const [status, setStatus] = useState('active');
    const [testimonial, setTestimonial] = useState('');
    const [savingTestimonial, setSavingTestimonial] = useState(false);
    const [uploadingReceipt, setUploadingReceipt] = useState(false);

    useEffect(() => {
        if (enrollment) {
            setStatus(enrollment.status);
            setTestimonial(enrollment.testimonial ?? '');
        }
    }, [enrollment]);

    const updateStatus = (newStatus) => {
        setStatus(newStatus);
        axios.patch(route('class_enrollment.update_status', enrollment.id), { status: newStatus })
            .then(onUpdated);
    };

    const uploadReceipt = (file) => {
        const formData = new FormData();
        formData.append('receipt', file);
        setUploadingReceipt(true);
        axios.post(route('class_enrollment.upload_receipt', enrollment.id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(onUpdated).finally(() => setUploadingReceipt(false));
    };

    const saveTestimonial = () => {
        setSavingTestimonial(true);
        axios.patch(route('class_enrollment.update_testimonial', enrollment.id), { testimonial })
            .then(onUpdated)
            .finally(() => setSavingTestimonial(false));
    };

    if (!enrollment) return null;

    const isPaid = enrollment.payment_status === 'paid';
    const hasReceipt = Boolean(enrollment.payment_receipt_path);

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="flex items-start gap-4 px-6 py-5">
                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold text-gray-900">
                        {enrollment.student?.name ?? 'N/A'}
                    </h2>
                    <p className="truncate text-sm text-gray-500">{enrollment.student?.email ?? '—'}</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="-mr-1 -mt-1 rounded p-1 text-2xl leading-none text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
                >
                    &times;
                </button>
            </div>

            <div className="px-6 py-5">
                <dl className="divide-y divide-gray-200 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between gap-4 px-4 py-3">
                        <dt className="text-sm font-medium text-gray-700">Status</dt>
                        <dd className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${statusDots[status] ?? 'bg-gray-400'}`} />
                            <select
                                value={status}
                                onChange={(e) => updateStatus(e.target.value)}
                                className={`rounded-md border-gray-300 py-1.5 pl-3 pr-8 text-sm font-medium shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${statusColors[status] ?? ''}`}
                            >
                                <option value="active">Active</option>
                                <option value="left">Left</option>
                                <option value="completed">Completed</option>
                            </select>
                        </dd>
                    </div>

                    <div className="flex items-center justify-between gap-4 px-4 py-3">
                        <dt className="text-sm font-medium text-gray-700">Payment</dt>
                        <dd className="flex flex-wrap items-center justify-end gap-2">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {isPaid ? 'Paid' : 'Not Paid'}
                            </span>
                            {hasReceipt && (
                                <a
                                    href={`/storage/${enrollment.payment_receipt_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    View receipt
                                </a>
                            )}
                            <label className={`rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 ${
                                uploadingReceipt ? 'cursor-wait opacity-50' : 'cursor-pointer'
                            }`}>
                                {uploadingReceipt ? 'Uploading…' : hasReceipt ? 'Replace' : 'Upload'}
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    disabled={uploadingReceipt}
                                    onChange={(e) => e.target.files?.[0] && uploadReceipt(e.target.files[0])}
                                />
                            </label>
                        </dd>
                    </div>
                </dl>

                <div className="mt-5">
                    <div className="flex items-center justify-between">
                        <label htmlFor="enrollment-testimonial" className="text-sm font-medium text-gray-700">
                            Testimonial
                        </label>
                        {enrollment.testimonial && isUrl(enrollment.testimonial) && (
                            <a
                                href={enrollment.testimonial}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-medium text-indigo-600 hover:underline"
                            >
                                Open link ↗
                            </a>
                        )}
                    </div>
                    <textarea
                        id="enrollment-testimonial"
                        className="mt-1.5 block w-full resize-none rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        rows="4"
                        value={testimonial}
                        onChange={(e) => setTestimonial(e.target.value)}
                        placeholder="Written testimonial or a YouTube link..."
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50 px-6 py-4">
                <SecondaryButton type="button" onClick={onClose}>Close</SecondaryButton>
                <button
                    type="button"
                    onClick={saveTestimonial}
                    disabled={savingTestimonial}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {savingTestimonial ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </Modal>
    );
}
