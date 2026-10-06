import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ sessions = [] }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-serif font-bold leading-tight text-gray-800">
                    Tutor Dashboard
                </h2>
            }
        >
            <Head title="Tutor Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-8 border border-gray-800 rounded-3xl shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                Welcome, Tutor! This is your dashboard.
                            </div>
                            <div className="flex gap-3">
                                <Link href={route('tutor.students.index')}>
                                    <PrimaryButton className="rounded-full">
                                        My Students
                                    </PrimaryButton>
                                </Link>
                                <Link href={route('tutor.profile.edit')}>
                                    <PrimaryButton className="rounded-full">
                                        Edit Profile
                                    </PrimaryButton>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white p-8 border border-gray-800 rounded-3xl shadow-sm">
                        <h3 className="mb-4 text-xl font-serif font-bold text-gray-800">
                            Upcoming Sessions
                        </h3>

                        {sessions.length === 0 && (
                            <p className="text-sm text-gray-600">
                                You have no sessions booked yet.
                            </p>
                        )}

                        {sessions.length > 0 && (
                            <div className="space-y-4">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="border border-gray-800 rounded-2xl p-4"
                                    >
                                        <div className="font-semibold text-gray-800">
                                            {session.subject}
                                            {session.student_profile
                                                ? ' with ' + session.student_profile.student_name
                                                : ''}
                                        </div>
                                        <div className="mt-1 text-sm text-gray-600">
                                            {session.session_date} from {session.start_time} to {session.end_time}
                                        </div>
                                        <div className="mt-1 text-sm text-gray-600">
                                            Type: {session.session_type} / Location: {session.location_type}
                                        </div>
                                        <div className="mt-1">
                                            <span className="inline-flex rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
                                                {session.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}