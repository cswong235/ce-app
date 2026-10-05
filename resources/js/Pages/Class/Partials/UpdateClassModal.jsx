import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import MultiSelectPicker from '@/Components/MultiSelectPicker';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

function toTimeInputValue(value) {
    return value ? value.slice(0, 5) : '';
}

export default function UpdateClassModal({ show, onClose, classItem, courseProfileOptions, facilitatorOptions, committeeOptions }) {
    const { data, setData, processing, errors, reset, put } = useForm({
        course_profile_id: '',
        facilitator_ids: [],
        class_admin_id: '',
        name: '',
        description: '',
        status: 'planning',
        language: '',
        mode: 'online',
        venue: '',
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
    });

    const [graduationItems, setGraduationItems] = useState([]);
    const [graduationDate, setGraduationDate] = useState('');
    const [newItemName, setNewItemName] = useState('');
    const [newItemQty, setNewItemQty] = useState('');
    const [attendancePath, setAttendancePath] = useState('');
    const [wrapupPath, setWrapupPath] = useState('');
    const [uploadingAttendance, setUploadingAttendance] = useState(false);
    const [uploadingWrapup, setUploadingWrapup] = useState(false);
    const attendanceInputRef = useRef(null);
    const wrapupInputRef = useRef(null);

    useEffect(() => {
        if (classItem) {
            setData({
                course_profile_id: classItem.course_profile_id ?? '',
                facilitator_ids: classItem.facilitators?.map((f) => f.id) ?? [],
                class_admin_id: classItem.class_admin?.committee_id ?? '',
                name: classItem.name ?? '',
                description: classItem.description ?? '',
                status: classItem.status ?? 'planning',
                language: classItem.language ?? '',
                mode: classItem.mode ?? 'online',
                venue: classItem.venue ?? '',
                start_date: classItem.start_date ?? '',
                end_date: classItem.end_date ?? '',
                start_time: toTimeInputValue(classItem.start_time),
                end_time: toTimeInputValue(classItem.end_time),
            });
            setGraduationDate(classItem.graduation_date ?? '');
            setAttendancePath(classItem.attendance_record_path ?? '');
            setWrapupPath(classItem.wrapup_report_path ?? '');
        }
    }, [classItem]);

    useEffect(() => {
        if (data.mode !== 'physical') {
            setData('venue', '');
        }
    }, [data.mode]);

    const refreshExtras = () => {
        if (!classItem) return;
        axios.get(route('class.show', classItem.id)).then((res) => {
            setGraduationItems(res.data.graduationItems);
            setGraduationDate(res.data.class.graduation_date ?? '');
            setAttendancePath(res.data.class.attendance_record_path ?? '');
            setWrapupPath(res.data.class.wrapup_report_path ?? '');
        });
    };

    useEffect(() => {
        if (show && classItem) {
            refreshExtras();
        }
    }, [show, classItem]);

    const close = () => {
        reset();
        onClose();
    };

    const submit = (event) => {
        event.preventDefault();
        put(route('class.update', classItem.id), { onSuccess: close });
    };

    const saveGraduationDate = () => {
        axios.patch(route('graduation_item.update_date', classItem.id), { graduation_date: graduationDate || null }).then(refreshExtras);
    };

    const addGraduationItem = () => {
        if (!newItemName || !newItemQty) return;
        axios.post(route('graduation_item.store', classItem.id), {
            item_name: newItemName,
            quantity: newItemQty,
        }).then(() => {
            setNewItemName('');
            setNewItemQty('');
            refreshExtras();
        });
    };

    const removeGraduationItem = (itemId) => {
        axios.delete(route('graduation_item.destroy', itemId)).then(refreshExtras);
    };

    const uploadAttendanceRecord = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('attendance_record', file);

        setUploadingAttendance(true);
        axios.post(route('class.upload_attendance_record', classItem.id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(refreshExtras).finally(() => {
            setUploadingAttendance(false);
            event.target.value = '';
        });
    };

    const uploadWrapupReport = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('wrapup_report', file);

        setUploadingWrapup(true);
        axios.post(route('class.upload_wrapup_report', classItem.id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(refreshExtras).finally(() => {
            setUploadingWrapup(false);
            event.target.value = '';
        });
    };

    const isPhysicalMode = data.mode === 'physical';

    return (
        <Modal show={show} onClose={close} maxWidth="4xl">
            <form onSubmit={submit} className="max-h-[85vh] overflow-y-auto p-6">
                <h2 className="text-lg font-medium text-gray-900">Update Class</h2>

                <div className="mt-6 space-y-5">
                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Class Details</h3>
                        <div className="mt-3 space-y-4">
                            <div>
                                <div className="flex items-center gap-1">
                                    <InputLabel htmlFor="update-class-name" value="Class name" />
                                    <span className="text-red-500" aria-hidden="true">*</span>
                                </div>
                                <TextInput
                                    id="update-class-name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(event) => setData('name', event.target.value)}
                                    autoFocus
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="update-class-description" value="Description" />
                                <textarea
                                    id="update-class-description"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.description}
                                    onChange={(event) => setData('description', event.target.value)}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <div className="flex items-center gap-1">
                                        <InputLabel htmlFor="update-class-course-profile" value="Course profile" />
                                        <span className="text-red-500" aria-hidden="true">*</span>
                                    </div>
                                    <select
                                        id="update-class-course-profile"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.course_profile_id}
                                        onChange={(event) => setData((previous) => ({
                                            ...previous,
                                            course_profile_id: event.target.value,
                                            facilitator_ids: [],
                                        }))}
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
                                    <InputLabel htmlFor="update-class-language" value="Language" />
                                    <TextInput
                                        id="update-class-language"
                                        className="mt-1 block w-full"
                                        value={data.language}
                                        onChange={(event) => setData('language', event.target.value)}
                                    />
                                    <InputError message={errors.language} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="update-class-mode" value="Mode" />
                                    <select
                                        id="update-class-mode"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.mode}
                                        onChange={(event) => setData('mode', event.target.value)}
                                    >
                                        <option value="online">Online</option>
                                        <option value="hybrid">Hybrid</option>
                                        <option value="physical">Physical</option>
                                    </select>
                                    <InputError message={errors.mode} className="mt-2" />
                                </div>

                                {isPhysicalMode && (
                                    <div>
                                        <InputLabel htmlFor="update-class-venue" value="Venue" />
                                        <TextInput
                                            id="update-class-venue"
                                            className="mt-1 block w-full"
                                            value={data.venue}
                                            onChange={(event) => setData('venue', event.target.value)}
                                            placeholder="e.g. Room A-3, 12th Floor"
                                        />
                                        <InputError message={errors.venue} className="mt-2" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Organization</h3>
                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="update-class-status" value="Status" />
                                <select
                                    id="update-class-status"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.status}
                                    onChange={(event) => setData('status', event.target.value)}
                                >
                                    <option value="planning">Planning</option>
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel value="Facilitators" />
                                {!data.course_profile_id ? (
                                    <p className="mt-1 text-xs text-gray-500">Select a course profile first.</p>
                                ) : (
                                    <div className="mt-1">
                                        <MultiSelectPicker
                                            options={facilitatorOptions?.[data.course_profile_id] ?? []}
                                            knownItems={classItem?.facilitators ?? []}
                                            value={data.facilitator_ids}
                                            onChange={(ids) => setData('facilitator_ids', ids)}
                                            placeholder="Search facilitators"
                                            emptyMessage="No appointed facilitators for this course profile yet."
                                        />
                                    </div>
                                )}
                                <InputError message={errors.facilitator_ids} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="update-class-admin" value="Class admin" />
                                <select
                                    id="update-class-admin"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.class_admin_id}
                                    onChange={(event) => setData('class_admin_id', event.target.value)}
                                >
                                    <option value="">No class admin</option>
                                    {committeeOptions?.map((member) => (
                                        <option key={member.id} value={member.id}>{member.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.class_admin_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="update-class-start-date" value="Start date" />
                                <TextInput
                                    id="update-class-start-date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.start_date}
                                    onChange={(event) => setData('start_date', event.target.value)}
                                />
                                <InputError message={errors.start_date} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="update-class-end-date" value="End date" />
                                <TextInput
                                    id="update-class-end-date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.end_date}
                                    onChange={(event) => setData('end_date', event.target.value)}
                                />
                                <InputError message={errors.end_date} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="update-class-start-time" value="Start time" />
                                <TextInput
                                    id="update-class-start-time"
                                    type="time"
                                    className="mt-1 block w-full"
                                    value={data.start_time}
                                    onChange={(event) => setData('start_time', event.target.value)}
                                />
                                <InputError message={errors.start_time} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="update-class-end-time" value="End time" />
                                <TextInput
                                    id="update-class-end-time"
                                    type="time"
                                    className="mt-1 block w-full"
                                    value={data.end_time}
                                    onChange={(event) => setData('end_time', event.target.value)}
                                />
                                <InputError message={errors.end_time} className="mt-2" />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Graduation</h3>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <TextInput
                                type="date"
                                className="block"
                                value={graduationDate}
                                onChange={(e) => setGraduationDate(e.target.value)}
                            />
                            <SecondaryButton type="button" onClick={saveGraduationDate}
                                className="rounded border border-indigo-600 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50">
                                Save Date
                            </SecondaryButton>
                        </div>

                        <div className="mt-5">
                            <InputLabel value="Graduation checklist" />
                            <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th className="px-3 py-2 font-medium">Item</th>
                                            <th className="px-3 py-2 font-medium">Quantity</th>
                                            <th className="px-3 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {graduationItems.length > 0 ? (
                                            graduationItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-3 py-2">{item.item_name}</td>
                                                    <td className="px-3 py-2">{item.quantity}</td>
                                                    <td className="px-3 py-2 text-right">
                                                        <SecondaryButton type="button" onClick={() => removeGraduationItem(item.id)}
                                                            className="rounded border border-red-600 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                                                            Remove
                                                        </SecondaryButton>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="px-3 py-3 text-center text-gray-400">No checklist items yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <TextInput
                                    placeholder="Item name"
                                    className="min-w-[10rem] flex-1"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                />
                                <TextInput
                                    type="number"
                                    placeholder="Qty"
                                    className="w-24"
                                    value={newItemQty}
                                    onChange={(e) => setNewItemQty(e.target.value)}
                                />
                                <SecondaryButton type="button" onClick={addGraduationItem}
                                    className="rounded border border-indigo-600 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50">
                                    Add
                                </SecondaryButton>
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <section className="rounded-lg border border-gray-200 bg-white p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Attendance Record</h3>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                {attendancePath && (
                                    <a
                                        href={`/storage/${attendancePath}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        View File
                                    </a>
                                )}
                                <SecondaryButton
                                    type="button"
                                    onClick={() => attendanceInputRef.current?.click()}
                                    disabled={uploadingAttendance}
                                    className="rounded border border-indigo-600 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50"
                                >
                                    {uploadingAttendance
                                        ? 'Uploading...'
                                        : attendancePath ? 'Replace File' : 'Upload File'}
                                </SecondaryButton>
                                <input
                                    type="file"
                                    ref={attendanceInputRef}
                                    className="hidden"
                                    disabled={uploadingAttendance}
                                    onChange={uploadAttendanceRecord}
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                {attendancePath ? 'One attendance record on file.' : 'No attendance record uploaded yet.'}
                            </p>
                        </section>

                        <section className="rounded-lg border border-gray-200 bg-white p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Wrap-up Report</h3>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                {wrapupPath && (
                                    <a
                                        href={`/storage/${wrapupPath}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        View Report
                                    </a>
                                )}
                                <SecondaryButton
                                    type="button"
                                    onClick={() => wrapupInputRef.current?.click()}
                                    disabled={uploadingWrapup}
                                    className="rounded border border-indigo-600 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50"
                                >
                                    {uploadingWrapup
                                        ? 'Uploading...'
                                        : wrapupPath ? 'Replace Report' : 'Upload Report'}
                                </SecondaryButton>
                                <input
                                    type="file"
                                    ref={wrapupInputRef}
                                    className="hidden"
                                    disabled={uploadingWrapup}
                                    onChange={uploadWrapupReport}
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                {wrapupPath ? 'One wrap-up report on file.' : 'No wrap-up report uploaded yet.'}
                            </p>
                        </section>
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