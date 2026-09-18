import { Link } from '@inertiajs/react';

export default function SidebarNavLink({
    active = false,
    icon: Icon,
    highlight = false,
    badge = false,
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
                    : highlight
                        ? 'text-yellow-700 hover:bg-yellow-50'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900') +
                ' ' +
                className
            }
        >
            {Icon && (
                <span className="relative shrink-0">
                    <Icon className="h-6 w-6" />
                    {badge && (
                        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
                    )}
                </span>
            )}
            <span className="ml-3 overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {children}
            </span>
        </Link>
    );
}
