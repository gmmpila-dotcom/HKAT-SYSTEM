import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

const statusStyles = {
    pending: 'bg-gray-200 text-gray-700',
    confirmed: 'bg-[#DCE7C3] text-gray-800',
    completed: 'bg-[#B8F2E6] text-gray-800',
    cancelled: 'bg-red-100 text-red-700',
};

const paymentStyles = {
    pending: 'bg-gray-200 text-gray-700',
    paid: 'bg-[#B8F2E6] text-gray-800',
    failed: 'bg-red-100 text-red-700',
};

export default function Dashboard({ sessions = [] }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-serif font-bold leading-tight text-gray-800">
                    Parent Dashboard
                </h2>
            }
        >
            <Head title="Parent Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-8 border border-gray-800 rounded-3xl shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                Welcome, Parent! This is your dashboard.
                            </div>
                            <div className="flex gap-3">
                                <Link href={route('parent.booking.create')}>
                                    <PrimaryButton className="rounded-full">
                                        Book a Session
                                    </PrimaryButton>
                                </Link>
                                <Link href={route('parent.progress.index')}>
                                    <PrimaryButton className="rounded-full">
                                        My Progress
                                    </PrimaryButton>
                                </Link>
                                <Link href={route('parent.billing.index')}>
                                    <PrimaryButton className="rounded-full">
                                        Billing
                                    </PrimaryButton>
                                </Link>
                                <Link href={route('parent.profile.edit')}>
                                    <PrimaryButton className="rounded-full">
                                        Edit Profile
                                    </PrimaryButton>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 overflow-hidden bg-white p-8 border border-gray-800 rounded-3xl shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="text-xl font-serif font-bold text-gray-800">
                                My Sessions
                            </h3>
                            <Link
                                href={route('parent.booking.create')}
                                className="text-sm font-semibold text-[#77b2a6] underline"
                            >
                                Book another session
                            </Link>
                        </div>

                        {sessions.length === 0 ? (
                            <p className="mt-4 text-sm text-gray-600">
                                No sessions booked yet.
                            </p>
                        ) : (
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full min-w-[720px] text-left">
                                    <thead className="border-b border-gray-800 text-sm text-gray-600">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Student</th>
                                            <th className="px-4 py-3 font-medium">Tutor / Subject</th>
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 font-medium">Session</th>
                                            <th className="px-4 py-3 font-medium">Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {sessions.map((session) => (
                                            <tr key={session.id}>
                                                <td className="px-4 py-4 text-gray-700">
                                                    {session.student_profile?.student_name || '-'}
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    {session.tutor?.name || '-'} &middot; {session.subject}
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    {session.session_date}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[session.status] || statusStyles.pending}`}>
                                                        {session.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${paymentStyles[session.payment?.status] || paymentStyles.pending}`}>
                                                        {session.payment?.status || 'pending'}
                                                    </span>
                                                    <Link
                                                        href={route('messages.store')}
                                                        method="post"
                                                        data={{ session_id: session.id }}
                                                        as="button"
                                                        className="mt-2 block text-xs font-semibold text-[#5c8e84] underline"
                                                    >
                                                        Message tutor
                                                    </Link>
                                                    {session.status === 'completed' && !session.review && (
                                                        <ReviewForm session={session} />
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function ReviewForm({ session }) {
    const { data, setData, post, processing, errors } = useForm({
        rating: '5',
        comment: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('parent.sessions.review', session.id));
    };

    return (
        <form onSubmit={submit} className="mt-3 space-y-2">
            <select
                value={data.rating}
                onChange={(event) => setData('rating', event.target.value)}
                className="block rounded-md border border-gray-500 bg-white px-2 py-1 text-xs"
                aria-label="Rating"
            >
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
            </select>
            <textarea
                value={data.comment}
                onChange={(event) => setData('comment', event.target.value)}
                placeholder="Share feedback"
                className="block w-48 rounded-md border border-gray-500 p-2 text-xs"
            />
            {errors.rating && <p className="text-xs text-red-700">{errors.rating}</p>}
            <button
                type="submit"
                disabled={processing}
                className="rounded-full border border-gray-800 bg-[#DCE7C3] px-3 py-1 text-xs font-medium disabled:opacity-50"
            >
                {processing ? 'Saving...' : 'Leave review'}
            </button>
        </form>
    );
}