import { Link } from '@inertiajs/react';

export default function SidebarNavLink({
    active = false,
    icon: Icon,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition duration-150 ease-in-out ' +
                (active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900') +
                ' ' +
                className
            }
        >
            {Icon && <Icon className="h-6 w-6 shrink-0" />}
            <span className="ml-3 overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {children}
            </span>
        </Link>
    );
}
