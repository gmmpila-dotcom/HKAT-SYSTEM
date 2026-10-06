import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-gray-800 bg-sage text-gray-900 focus:border-gray-900 focus:bg-icyAqua focus:text-gray-900 font-semibold'
                    : 'border-transparent text-gray-600 hover:border-icyAqua hover:bg-sage/40 hover:text-gray-900 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
