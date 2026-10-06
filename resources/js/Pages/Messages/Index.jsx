import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index({ conversations = [] }) {
    const user = usePage().props.auth.user;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-2xl font-serif font-bold leading-tight text-gray-800">Messages</h2>}
        >
            <Head title="Messages" />
            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-4 sm:px-6 lg:px-8">
                    {conversations.length === 0 ? (
                        <div className="rounded-3xl border border-gray-800 bg-white p-8 text-sm text-gray-600 shadow-sm">
                            No conversations yet. Conversations become available for tutoring sessions.
                        </div>
                    ) : (
                        conversations.map((conversation) => {
                            const otherPerson = user.id === conversation.parent_id
                                ? conversation.tutor?.name
                                : conversation.parent?.name;

                            return (
                                <Link
                                    key={conversation.id}
                                    href={route('messages.show', conversation.id)}
                                    className="block rounded-3xl border border-gray-800 bg-white p-5 shadow-sm transition hover:bg-[#FFF4CC]"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-serif text-lg font-bold text-gray-800">{otherPerson || 'Conversation'}</h3>
                                            <p className="mt-1 text-sm text-gray-600">{conversation.session?.subject || 'Tutoring session'}</p>
                                        </div>
                                        {conversation.latest_message && (
                                            <span className="text-xs text-gray-500">{conversation.latest_message.created_at}</span>
                                        )}
                                    </div>
                                    {conversation.latest_message && (
                                        <p className="mt-3 line-clamp-2 text-sm text-gray-700">{conversation.latest_message.body}</p>
                                    )}
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
