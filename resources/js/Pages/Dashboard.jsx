import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

const roleLabels = {
    chair: 'CE Chair',
    co_chair: 'CE Co-Chair',
    committee: 'CE Committee',
};

function formatDate(dateString) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateString) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function daysUntil(dateString) {
    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function DashboardCard({ title, count, viewAllHref, viewAllLabel, children }) {
    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
                {typeof count === 'number' && (
                    <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                        {count}
                    </span>
                )}
            </div>
            <div className="mt-3">{children}</div>
            {viewAllHref && (
                <div className="mt-4 border-t border-gray-100 pt-3">
                    <Link href={viewAllHref} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        {viewAllLabel} &rarr;
                    </Link>
                </div>
            )}
        </section>
    );
}

function EmptyState({ children }) {
    return <p className="py-4 text-center text-sm italic text-gray-400">{children}</p>;
}

export default function Dashboard({ ongoingClasses, pendingRegistrations, committeeTerms, upcomingReminders }) {
    const user = usePage().props.auth.user;

    return (
        <AuthenticatedLayout
            header={
                <>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Dashboard
                    </h2>
                    <p className="text-l font-semibold leading-tight text-gray-800">
                        Hello, {user.name}.
                    </p>
                </>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-xl font-semibold text-gray-900">
                            <h1>Today's Agenda</h1>
                            <hr className="mt-3" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="-mt-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid gap-5 lg:grid-cols-2">
                        <DashboardCard
                            title="Ongoing Classes"
                            count={ongoingClasses.total}
                            viewAllHref={route('class')}
                            viewAllLabel="View all classes"
                        >
                            {ongoingClasses.items.length > 0 ? (
                                <ul className="divide-y divide-gray-100">
                                    {ongoingClasses.items.map((cls) => (
                                        <li key={cls.id} className="py-2.5 first:pt-0 last:pb-0">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-sm font-medium text-gray-900">{cls.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    {cls.enrollments_count} students
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-gray-500">
                                                {cls.course_profile?.title ?? 'N/A'} &middot; {formatDate(cls.start_date)} – {formatDate(cls.end_date)}
                                            </p>
                                            <p className="mt-0.5 text-xs text-gray-500">
                                                {cls.start_time && cls.end_time ? `${cls.start_time} – ${cls.end_time}` : 'Time TBA'}
                                                {' '}&middot; <span className="capitalize">{cls.mode}</span>
                                                {cls.mode === 'physical' && ` · ${cls.venue || 'Venue TBA'}`}
                                            </p>
                                            <p className="mt-0.5 text-xs text-gray-400">
                                                {cls.facilitators?.length
                                                    ? `Facilitator(s): ${cls.facilitators.map((f) => f.name).join(', ')}`
                                                    : 'No facilitator assigned'}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <EmptyState>No classes are currently in progress.</EmptyState>
                            )}
                        </DashboardCard>

                        <DashboardCard
                            title="Pending Registrations"
                            count={pendingRegistrations.total}
                            viewAllHref={route('class_registration.index')}
                            viewAllLabel="Review registrations"
                        >
                            {pendingRegistrations.items.length > 0 ? (
                                <ul className="divide-y divide-gray-100">
                                    {pendingRegistrations.items.map((registration) => (
                                        <li key={registration.id} className="py-2.5 first:pt-0 last:pb-0">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-sm font-medium text-gray-900">{registration.form_name}</span>
                                                <span className="text-xs text-gray-500">{formatDate(registration.imported_at)}</span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-gray-500">
                                                {registration.form_email} &middot; {registration.batch?.course_profile?.title ?? 'N/A'}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <EmptyState>No pending registrations.</EmptyState>
                            )}
                        </DashboardCard>

                        <DashboardCard
                            title="Upcoming Reminders"
                            count={upcomingReminders.total}
                            viewAllHref={route('reminder')}
                            viewAllLabel="View all reminders"
                        >
                            {upcomingReminders.items.length > 0 ? (
                                <ul className="divide-y divide-gray-100">
                                    {upcomingReminders.items.map((reminder) => (
                                        <li key={reminder.id} className="py-2.5 first:pt-0 last:pb-0">
                                            <span className="text-sm font-medium text-gray-900">{reminder.event_name}</span>
                                            <p className="mt-0.5 text-xs text-gray-500">
                                                Reminder: {formatDateTime(reminder.remind_at)}
                                            </p>
                                            {reminder.event_at && (
                                                <p className="mt-0.5 text-xs text-gray-400">
                                                    Event: {formatDateTime(reminder.event_at)}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <EmptyState>No upcoming reminders.</EmptyState>
                            )}
                        </DashboardCard>

                        <DashboardCard
                            title="Committee Terms"
                            count={committeeTerms.total}
                            viewAllHref={route('user')}
                            viewAllLabel="View committee members"
                        >
                            {committeeTerms.items.length > 0 ? (
                                <ul className="divide-y divide-gray-100">
                                    {committeeTerms.items.map((term) => {
                                        const remaining = daysUntil(term.term_end_date);
                                        const expired = remaining < 0;

                                        return (
                                            <li key={term.committee_id} className="py-2.5 first:pt-0 last:pb-0">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {term.committee?.name ?? 'N/A'}
                                                    </span>
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        expired ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {expired ? `Expired ${Math.abs(remaining)}d ago` : `Expires in ${remaining}d`}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    {roleLabels[term.role] ?? term.role} &middot; term ends {formatDate(term.term_end_date)}
                                                </p>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <EmptyState>No committee terms are expiring soon.</EmptyState>
                            )}
                        </DashboardCard>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
