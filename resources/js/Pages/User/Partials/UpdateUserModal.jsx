import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function UpdateUserModal({ show, onClose, user }) {
    const { auth } = usePage().props;
    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        phone_number: '',
        role: 'committee',
        term_start_date: '',
    });

    const committeeDetails = user?.committee_details;
    const isOwnAccount = user?.id === auth.user.id;

    useEffect(() => {
        if (user) {
            setData({
                name: user.name ?? '',
                phone_number: user.phone_number ?? '',
                role: committeeDetails?.role ?? 'committee',
                term_start_date: committeeDetails?.term_start_date?.slice(0, 10) ?? '',
            });
        }
    }, [user]);

    const close = () => {
        reset();
        onClose();
    };

    const submit = (event) => {
        event.preventDefault();
        put(route('user.update', user.id), { onSuccess: close });
    };

    return (
        <Modal show={show} onClose={close} maxWidth="2xl">
            <form onSubmit={submit} className="max-h-[85vh] overflow-y-auto p-6">
                <h2 className="text-lg font-medium text-gray-900">Update Member</h2>

                <div className="mt-6 space-y-5">
                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Member Details</h3>
                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                            <div>
                                <div className="flex items-center gap-1">
                                    <InputLabel htmlFor="update-user-name" value="Full name" />
                                    <span className="text-red-500" aria-hidden="true">*</span>
                                </div>
                                <TextInput
                                    id="update-user-name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                    autoFocus
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="update-user-phone" value="Phone number" />
                                <TextInput
                                    id="update-user-phone"
                                    className="mt-1 block w-full"
                                    value={data.phone_number}
                                    onChange={(event) => setData('phone_number', event.target.value)}
                                />
                                <InputError message={errors.phone_number} className="mt-2" />
                            </div>

                            <div className="sm:col-span-2">
                                <InputLabel value="Email" />
                                <p className="mt-1 text-sm text-gray-700">{user?.email}</p>
                                <p className="mt-1 text-xs text-gray-500">
                                    Email can't be changed because it's tied to this member's login whitelist.
                                </p>
                            </div>
                        </div>
                    </section>

                    {committeeDetails && (
                        <section className="rounded-lg border border-gray-200 bg-white p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Committee Role</h3>
                            <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="update-user-role" value="Role" />
                                    <select
                                        id="update-user-role"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                                        value={data.role}
                                        onChange={(event) => setData('role', event.target.value)}
                                        disabled={isOwnAccount}
                                    >
                                        <option value="committee">CE Committee</option>
                                        <option value="co_chair">CE Co-Chair</option>
                                        <option value="chair">CE Chair</option>
                                        <option value="system_admin">System Admin</option>
                                    </select>
                                    {isOwnAccount && (
                                        <p className="mt-1 text-xs text-gray-500">You can't change your own role.</p>
                                    )}
                                    <InputError message={errors.role} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="update-user-term-start" value="Term start date" />
                                    <TextInput
                                        id="update-user-term-start"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.term_start_date}
                                        onChange={(event) => setData('term_start_date', event.target.value)}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        {data.role === 'system_admin'
                                            ? 'System Admins have no expiring term.'
                                            : 'The term ends automatically two years after the start date.'}
                                    </p>
                                    <InputError message={errors.term_start_date} className="mt-2" />
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={close}>Cancel</SecondaryButton>
                    <PrimaryButton disabled={processing}>Save Changes</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
