import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-serif font-bold leading-tight text-gray-800">
                    Admin Dashboard
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-8 border border-gray-800 rounded-3xl shadow-sm">
                        <p className="mb-6">Welcome, Admin! This is your dashboard.</p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={route('admin.tutors.index')}
                                className="rounded-full bg-[#B8F2E6] px-5 py-2 text-sm font-medium text-gray-800 hover:opacity-80"
                            >
                                Tutor Directory
                            </Link>
                            <Link
                                href={route('admin.tutors.create')}
                                className="rounded-full bg-[#B8F2E6] px-5 py-2 text-sm font-medium text-gray-800 hover:opacity-80"
                            >
                                Add Tutor
                            </Link>
                            <Link
                                href={route('admin.sessions.index')}
                                className="rounded-full bg-[#B8F2E6] px-5 py-2 text-sm font-medium text-gray-800 hover:opacity-80"
                            >
                                All Sessions
                            </Link>
                            <Link
                                href={route('admin.reports.index')}
                                className="rounded-full bg-[#B8F2E6] px-5 py-2 text-sm font-medium text-gray-800 hover:opacity-80"
                            >
                                Reports
                            </Link>
                            <Link
                                href={route('admin.applications.index')}
                                className="rounded-full bg-[#B8F2E6] px-5 py-2 text-sm font-medium text-gray-800 hover:opacity-80"
                            >
                                Tutor Applications
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}