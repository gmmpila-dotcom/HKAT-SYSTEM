import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Index({ notifications = [] }) {
    const { patch: markAll, processing: markingAll } = useForm();

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-bold leading-tight text-gray-800">
                        Notifications
                    </h2>
                    <button
                        type="button"
                        onClick={() => markAll(route('notifications.read-all'))}
                        disabled={markingAll}
                        className="rounded-full border border-gray-800 bg-white px-4 py-2 text-sm font-medium text-gray-800 disabled:opacity-50"
                    >
                        {markingAll ? 'Updating...' : 'Mark all as read'}
                    </button>
                </div>
            }
        >
            <Head title="Notifications" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-4 sm:px-6 lg:px-8">
                    {notifications.length === 0 ? (
                        <div className="rounded-3xl border border-gray-800 bg-white p-8 text-sm text-gray-600 shadow-sm">
                            You have no notifications yet.
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <NotificationRow key={notification.id} notification={notification} />
                        ))
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function NotificationRow({ notification }) {
    const { patch, processing } = useForm();
    const data = notification.data || {};

    return (
        <div className={`rounded-3xl border border-gray-800 p-5 shadow-sm ${notification.read_at ? 'bg-white' : 'bg-[#FFF4CC]'}`}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="font-serif text-lg font-bold text-gray-800">{data.title || 'Notification'}</h3>
                    <p className="mt-1 text-sm text-gray-700">{data.message}</p>
                    <p className="mt-2 text-xs text-gray-500">{notification.created_at}</p>
                </div>
                {!notification.read_at && (
                    <button
                        type="button"
                        onClick={() => patch(route('notifications.read', notification.id))}
                        disabled={processing}
                        className="shrink-0 rounded-full border border-gray-800 bg-white px-3 py-1 text-xs font-medium text-gray-800 disabled:opacity-50"
                    >
                        Mark read
                    </button>
                )}
            </div>
            {data.url && (
                <Link href={data.url} className="mt-3 inline-block text-sm font-semibold text-[#5c8e84] underline">
                    Open related page
                </Link>
            )}
        </div>
    );
}
