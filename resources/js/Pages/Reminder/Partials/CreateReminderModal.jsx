import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import axios from 'axios';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const roleOptions = [
    { value: 'chair', label: 'CE Chair' },
    { value: 'co_chair', label: 'CE Co-Chair' },
    { value: 'committee', label: 'CE Committee' },
    { value: 'student', label: 'Students' },
    { value: 'system_admin', label: 'System Admin' },
];

export default function CreateReminderModal({ show, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        event_name: '',
        event_description: '',
        event_at: '',
        remind_at: '',
        roles: [],
        notify_self: false,
        people_ids: [],
        notification_methods: [],
    });

    const [selectedPeople, setSelectedPeople] = useState([]);
    const [peopleSearch, setPeopleSearch] = useState('');
    const [peopleResults, setPeopleResults] = useState([]);

    useEffect(() => {
        if (!peopleSearch.trim()) {
            setPeopleResults([]);
            return;
        }

        const timeout = setTimeout(() => {
            axios.get(route('user.search'), { params: { q: peopleSearch } }).then((res) => {
                setPeopleResults(res.data.users);
            });
        }, 300);

        return () => clearTimeout(timeout);
    }, [peopleSearch]);

    const close = () => {
        reset();
        setSelectedPeople([]);
        setPeopleSearch('');
        setPeopleResults([]);
        onClose();
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('reminder.store'), { onSuccess: close });
    };

    const toggleRole = (role) => {
        setData('roles', data.roles.includes(role)
            ? data.roles.filter((r) => r !== role)
            : [...data.roles, role]);
    };

    const toggleNotificationMethod = (method) => {
        setData('notification_methods', data.notification_methods.includes(method)
            ? data.notification_methods.filter((m) => m !== method)
            : [...data.notification_methods, method]);
    };

    const addPerson = (person) => {
        if (data.people_ids.includes(person.id)) return;
        setSelectedPeople([...selectedPeople, person]);
        setData('people_ids', [...data.people_ids, person.id]);
        setPeopleSearch('');
        setPeopleResults([]);
    };

    const removePerson = (personId) => {
        setSelectedPeople(selectedPeople.filter((p) => p.id !== personId));
        setData('people_ids', data.people_ids.filter((id) => id !== personId));
    };

    return (
        <Modal show={show} onClose={close} maxWidth="3xl">
            <form onSubmit={submit} className="max-h-[85vh] overflow-y-auto p-6">
                <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-medium text-gray-900">Add New Reminder</h2>
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close"
                        className="text-2xl leading-none text-gray-400 hover:text-gray-600"
                    >
                        &times;
                    </button>
                </div>

                <div className="mt-6 space-y-5">
                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Reminder Details</h3>
                        <div className="mt-3 space-y-4">
                            <div>
                                <div className="flex items-center gap-1">
                                    <InputLabel htmlFor="event-name" value="Event name" />
                                    <span className="text-red-500" aria-hidden="true">*</span>
                                </div>
                                <TextInput
                                    id="event-name"
                                    className="mt-1 block w-full"
                                    value={data.event_name}
                                    onChange={(event) => setData('event_name', event.target.value)}
                                    autoFocus
                                />
                                <InputError message={errors.event_name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="event-description" value="Event description" />
                                <textarea
                                    id="event-description"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.event_description}
                                    onChange={(event) => setData('event_description', event.target.value)}
                                />
                                <InputError message={errors.event_description} className="mt-2" />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="event-at" value="Event date & time" />
                                    <TextInput
                                        id="event-at"
                                        type="datetime-local"
                                        className="mt-1 block w-full"
                                        value={data.event_at}
                                        onChange={(event) => setData('event_at', event.target.value)}
                                    />
                                    <InputError message={errors.event_at} className="mt-2" />
                                </div>

                                <div>
                                    <div className="flex items-center gap-1">
                                        <InputLabel htmlFor="remind-at" value="Reminder date & time" />
                                        <span className="text-red-500" aria-hidden="true">*</span>
                                    </div>
                                    <TextInput
                                        id="remind-at"
                                        type="datetime-local"
                                        className="mt-1 block w-full"
                                        value={data.remind_at}
                                        onChange={(event) => setData('remind_at', event.target.value)}
                                    />
                                    <InputError message={errors.remind_at} className="mt-2" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Involved Roles</h3>
                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={data.notify_self}
                                    onChange={(event) => setData('notify_self', event.target.checked)}
                                />
                                Yourself
                            </label>
                            {roleOptions.map((role) => (
                                <label key={role.value} className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={data.roles.includes(role.value)}
                                        onChange={() => toggleRole(role.value)}
                                    />
                                    {role.label}
                                </label>
                            ))}
                        </div>
                        <InputError message={errors.roles} className="mt-2" />
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Involved People</h3>
                        <div className="relative mt-3">
                            <TextInput
                                className="block w-full"
                                placeholder="Search by name or email"
                                value={peopleSearch}
                                onChange={(event) => setPeopleSearch(event.target.value)}
                            />
                            {peopleResults.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                                    {peopleResults.map((person) => (
                                        <button
                                            type="button"
                                            key={person.id}
                                            onClick={() => addPerson(person)}
                                            className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            {person.name} <span className="text-gray-400">({person.email})</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {selectedPeople.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {selectedPeople.map((person) => (
                                    <span key={person.id} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-3 pr-2 text-xs text-gray-700">
                                        {person.name}
                                        <button type="button" onClick={() => removePerson(person.id)} className="text-gray-400 hover:text-gray-600">
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Notification Method</h3>
                        <div className="mt-3 flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={data.notification_methods.includes('email')}
                                    onChange={() => toggleNotificationMethod('email')}
                                />
                                Email
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={data.notification_methods.includes('browser')}
                                    onChange={() => toggleNotificationMethod('browser')}
                                />
                                Browser / Desktop Notification
                            </label>
                        </div>
                        <p className="mt-3 text-xs text-gray-500">
                            <span className="font-semibold text-gray-600">Note:</span> for browser/desktop notifications to work, allow notifications when your browser prompts for permission, and keep the CE App open in a browser tab — it can be in the background or a different tab, it just can't be closed.
                        </p>
                        <InputError message={errors.notification_methods} className="mt-2" />
                    </section>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={close}>Cancel</SecondaryButton>
                    <PrimaryButton disabled={processing}>Save Reminder</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
