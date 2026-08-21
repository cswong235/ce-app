import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function AddStudentModal({ show, onClose }) {
    const [mode, setMode] = useState('new');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: '',
        name: '',
        email: '',
        phone_number: '',
    });

    const close = () => {
        reset();
        setMode('new');
        setSelectedUser(null);
        setSearchTerm('');
        setSearchResults([]);
        onClose();
    };

    const runSearch = (value) => {
        setSearchTerm(value);
        if (value.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        axios.get(route('user.search'), { params: { q: value, exclude_role: 'student' } })
            .then((res) => setSearchResults(res.data.users))
            .finally(() => setSearching(false));
    };

    const selectExistingUser = (user) => {
        setSelectedUser(user);
        setData('user_id', user.id);
        setSearchResults([]);
        setSearchTerm(user.name);
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('student.store'), { onSuccess: close });
    };

    return (
        <Modal show={show} onClose={close} maxWidth="lg">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Add Student</h2>

                <div className="mt-4 flex gap-2 rounded-md bg-gray-100 p-1 text-sm">
                    <button
                        type="button"
                        onClick={() => { setMode('new'); setSelectedUser(null); setData('user_id', ''); }}
                        className={`flex-1 rounded px-3 py-1.5 transition ${mode === 'new' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600'}`}
                    >
                        New Profile
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('existing')}
                        className={`flex-1 rounded px-3 py-1.5 transition ${mode === 'existing' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600'}`}
                    >
                        Existing Profile
                    </button>
                </div>

                <div className="mt-6 space-y-4">
                    {mode === 'existing' ? (
                        <div>
                            <InputLabel htmlFor="student-search" value="Search by name or email" />
                            <TextInput
                                id="student-search"
                                className="mt-1 block w-full"
                                value={searchTerm}
                                onChange={(event) => runSearch(event.target.value)}
                                placeholder="Start typing to search..."
                                autoFocus
                            />
                            {searching && <p className="mt-1 text-xs text-gray-400">Searching...</p>}
                            {searchResults.length > 0 && (
                                <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-gray-200">
                                    {searchResults.map((user) => (
                                        <button
                                            type="button"
                                            key={user.id}
                                            onClick={() => selectExistingUser(user)}
                                            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                                        >
                                            <span className="font-medium">{user.name}</span>
                                            <span className="ml-2 text-gray-500">{user.email}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {selectedUser && (
                                <div className="mt-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
                                    Selected: {selectedUser.name} ({selectedUser.email})
                                </div>
                            )}
                            <InputError message={errors.user_id} className="mt-2" />
                        </div>
                    ) : (
                        <>
                            <div>
                                <div className="flex items-center gap-1">
                                    <InputLabel htmlFor="student-name" value="Full name" />
                                    <span className="text-red-500" aria-hidden="true">*</span>
                                </div>
                                <TextInput
                                    id="student-name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <div className="flex items-center gap-1">
                                    <InputLabel htmlFor="student-email" value="Email" />
                                    <span className="text-red-500" aria-hidden="true">*</span>
                                </div>
                                <TextInput
                                    id="student-email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={data.email}
                                    onChange={(event) => setData('email', event.target.value)}
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="student-phone" value="Phone number" />
                                <TextInput
                                    id="student-phone"
                                    className="mt-1 block w-full"
                                    value={data.phone_number}
                                    onChange={(event) => setData('phone_number', event.target.value)}
                                />
                                <InputError message={errors.phone_number} className="mt-2" />
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={close}>Cancel</SecondaryButton>
                    <PrimaryButton disabled={processing || (mode === 'existing' && !data.user_id)}>
                        Add Student
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}