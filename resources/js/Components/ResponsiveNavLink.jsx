import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    highlight = false,
    badge = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-center gap-2 border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700 focus:border-indigo-700 focus:bg-indigo-100 focus:text-indigo-800'
                    : highlight
                        ? 'border-transparent text-yellow-700 hover:border-yellow-300 hover:bg-yellow-50 focus:border-yellow-300 focus:bg-yellow-50'
                        : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
            {badge && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />}
        </Link>
    );
}
