import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import SidebarNavLink from '@/Components/SidebarNavLink';
import ReminderToastWatcher from '@/Components/ReminderToastWatcher';
import ErrorToast from '@/Components/ErrorToast';
import {
    ClassIcon,
    CourseProfileIcon,
    DashboardIcon,
    MemberListIcon,
    RegistrationIcon,
    ReminderIcon,
    UserCircleIcon,
} from '@/Components/NavIcons';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import logo from '@/Assets/CEApp.png';

const navigation = [
    { name: 'Dashboard', route: 'dashboard', icon: DashboardIcon },
    { name: 'Course Profiles', route: 'course_profile', icon: CourseProfileIcon },
    { name: 'Classes', route: 'class', icon: ClassIcon },
    { name: 'Registrations', route: 'batch', icon: RegistrationIcon },
    { name: 'Reminders', route: 'reminder', icon: ReminderIcon },
    { name: 'Member List', route: 'user', icon: MemberListIcon },
];

export default function AuthenticatedLayout({ header, children }) {
    const { auth, pendingRegistrationsCount } = usePage().props;
    const user = auth.user;
    const hasPendingRegistrations = pendingRegistrationsCount > 0;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [showingUserMenu, setShowingUserMenu] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <ReminderToastWatcher />
            <ErrorToast />
            {/* Desktop vertical sidebar: collapsed to icons, slides out on hover */}
            <aside className="group fixed inset-y-0 left-0 z-40 hidden w-16 flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out hover:w-64 hover:shadow-xl sm:flex">
                <div className="flex h-16 shrink-0 items-center justify-center overflow-hidden border-b border-gray-100 px-4">
                    <Link
                        href={route('dashboard')}
                        className="flex shrink-0 items-center"
                    >
                        <img
                            src={logo}
                            alt="CE App logo"
                            className="h-8"
                        />
                    </Link>
                </div>

                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 py-4">
                    {navigation.map((item) => {
                        const isRegistrations = item.route === 'batch';

                        return (
                            <SidebarNavLink
                                key={item.name}
                                href={route(item.route)}
                                active={route().current(item.route)}
                                icon={item.icon}
                                highlight={isRegistrations && hasPendingRegistrations}
                                badge={isRegistrations && hasPendingRegistrations}
                            >
                                {item.name}
                            </SidebarNavLink>
                        );
                    })}
                </nav>

                <div className="relative shrink-0 border-t border-gray-100 p-2">
                    <button
                        type="button"
                        onClick={() =>
                            setShowingUserMenu((previousState) => !previousState)
                        }
                        className="flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 transition duration-150 ease-in-out hover:bg-gray-50 hover:text-gray-900"
                    >
                        <UserCircleIcon className="h-6 w-6 shrink-0" />
                        <span className="ml-3 overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            {user.name}
                        </span>
                    </button>

                    {showingUserMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowingUserMenu(false)}
                            />
                            <div className="absolute bottom-full left-2 z-50 mb-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                                <Link
                                    href={route('profile.edit')}
                                    className="block px-4 py-2 text-sm text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100"
                                    onClick={() => setShowingUserMenu(false)}
                                >
                                    Profile
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="block w-full px-4 py-2 text-start text-sm text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100"
                                    onClick={() => setShowingUserMenu(false)}
                                >
                                    Log Out
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </aside>

            {/* Mobile top nav */}
            <nav className="border-b border-gray-100 bg-white sm:hidden">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex h-16 justify-between">
                        <div className="flex shrink-0 items-center">
                            <Link href="/dashboard">
                                <img src={logo} alt="CE App logo" className="h-8" />
                            </Link>
                        </div>

                        <div className="-me-2 flex items-center">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={showingNavigationDropdown ? 'block' : 'hidden'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('course_profile')}
                            active={route().current('course_profile')}
                        >
                            Course Profiles
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('class')}
                            active={route().current('class')}
                        >
                            Classes
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('batch')}
                            active={route().current('batch')}
                            highlight={hasPendingRegistrations}
                            badge={hasPendingRegistrations}
                        >
                            Registrations
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('reminder')}
                            active={route().current('reminder')}
                        >
                            Reminders
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('user')}
                            active={route().current('user')}
                        >
                            Member List
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="sm:pl-16">
                {header && (
                    <header className="bg-white shadow">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main>{children}</main>
            </div>
        </div>
    );
}
