import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-eggshell pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-24 w-auto" />
                </Link>
            </div>

            <div className="mt-8 w-full overflow-hidden bg-white px-8 py-8 border border-gray-800 rounded-3xl shadow-sm sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
