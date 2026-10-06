import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Index({ sessions }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl font-semibold leading-tight text-gray-800">
                        All Sessions
                    </h2>

                    <Link
                        href={route('admin.dashboard')}
                        className="rounded-full bg-[#B8F2E6] px-5 py-2 text-sm font-medium text-gray-800 transition hover:opacity-80"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            }
        >
            <Head title="All Sessions" />

            <div className="bg-eggshell py-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="overflow-hidden rounded-3xl border border-gray-800 bg-white">
                        <div className="p-6">
                            <div className="mb-6">
                                <h1 className="font-serif text-3xl font-semibold text-gray-800">
                                    Booked Sessions
                                </h1>

                                <p className="mt-2 text-gray-600">
                                    All tutoring sessions across the platform.
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px]">
                                    <thead className="border-b border-gray-800 text-left text-sm text-gray-600">
                                        <tr>
                                            <th className="px-4 py-4 font-medium">Student</th>
                                            <th className="px-4 py-4 font-medium">Tutor</th>
                                            <th className="px-4 py-4 font-medium">Subject</th>
                                            <th className="px-4 py-4 font-medium">Date</th>
                                            <th className="px-4 py-4 font-medium">Time</th>
                                            <th className="px-4 py-4 font-medium">Status</th>
                                            <th className="px-4 py-4 font-medium">Payment</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200">
                                        {sessions.length === 0 && (
                                            <tr>
                                                <td className="px-4 py-5 text-gray-700" colSpan="7">
                                                    No sessions booked yet.
                                                </td>
                                            </tr>
                                        )}

                                        {sessions.map((s) => (
                                            <tr key={s.id}>
                                                <td className="px-4 py-5 text-gray-700">
                                                    {s.student_profile ? s.student_profile.student_name : '-'}
                                                </td>
                                                <td className="px-4 py-5 text-gray-700">
                                                    {s.tutor ? s.tutor.name : '-'}
                                                </td>
                                                <td className="px-4 py-5 text-gray-700">
                                                    {s.subject}
                                                </td>
                                                <td className="px-4 py-5 text-gray-700">
                                                    {s.session_date}
                                                </td>
                                                <td className="px-4 py-5 text-gray-700">
                                                    {s.start_time} to {s.end_time}
                                                </td>
                                                <td className="px-4 py-5">
                                                    <span className="inline-flex rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
                                                        {s.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <PaymentStatus payment={s.payment} session={s} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function PaymentStatus({ payment, session }) {
    const { patch, processing } = useForm();

    if (!payment) {
        return (
            <div className="flex flex-col items-start gap-2">
                <span className="text-sm text-gray-600">No payment</span>
                <CancelButton session={session} patch={patch} processing={processing} />
            </div>
        );
    }

    if (payment.status === 'paid') {
        return (
            <div className="flex flex-col items-start gap-2">
                <span className="inline-flex rounded-full bg-[#B8F2E6] px-3 py-1 text-xs font-medium text-gray-800">
                    Paid
                </span>
                {session.status === 'pending' && (
                    <button
                        type="button"
                        onClick={() => patch(route('admin.sessions.confirm', session.id))}
                        disabled={processing}
                        className="rounded-full border border-gray-800 bg-[#DCE7C3] px-3 py-1 text-xs font-medium text-gray-800 transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing ? 'Updating...' : 'Confirm Session'}
                    </button>
                )}
                {session.status === 'confirmed' && (
                    <button
                        type="button"
                        onClick={() => patch(route('admin.sessions.complete', session.id))}
                        disabled={processing}
                        className="rounded-full border border-gray-800 bg-[#DCE7C3] px-3 py-1 text-xs font-medium text-gray-800 transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing ? 'Updating...' : 'Complete Session'}
                    </button>
                )}
                <CancelButton session={session} patch={patch} processing={processing} />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-2">
            <span className="inline-flex rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
                {payment.status}
            </span>
            <button
                type="button"
                onClick={() => patch(route('admin.payments.mark-paid', payment.id))}
                disabled={processing}
                className="rounded-full border border-gray-800 bg-[#B8F2E6] px-3 py-1 text-xs font-medium text-gray-800 transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {processing ? 'Updating...' : 'Mark as Paid'}
            </button>
            <CancelButton session={session} patch={patch} processing={processing} />
        </div>
    );
}

function CancelButton({ session, patch, processing }) {
    if (!['pending', 'confirmed'].includes(session.status)) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={() => patch(route('admin.sessions.cancel', session.id))}
            disabled={processing}
            className="rounded-full border border-red-700 bg-red-100 px-3 py-1 text-xs font-medium text-red-800 transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {processing ? 'Updating...' : 'Cancel Session'}
        </button>
    );
}
