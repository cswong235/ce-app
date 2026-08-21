import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ConfirmDeleteModal({ show, onClose, onConfirm, title, itemName, processing = false }) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    {title ?? 'Delete this item?'}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    {itemName ? (
                        <>
                            Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
                        </>
                    ) : (
                        'Are you sure? This action cannot be undone.'
                    )}
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>
                        Cancel
                    </SecondaryButton>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className="rounded bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700 disabled:opacity-50"
                    >
                        {processing ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}