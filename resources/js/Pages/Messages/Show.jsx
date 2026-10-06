import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Show({ conversation }) {
    const user = usePage().props.auth.user;
    const { data, setData, post, processing, reset, errors } = useForm({ body: '' });
    const otherPerson = user.id === conversation.parent_id
        ? conversation.tutor?.name
        : conversation.parent?.name;

    const submit = (event) => {
        event.preventDefault();
        post(route('messages.send', conversation.id), {
            onSuccess: () => reset('body'),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-serif font-bold leading-tight text-gray-800">{otherPerson || 'Conversation'}</h2>
                    <Link href={route('messages.index')} className="text-sm font-semibold text-[#5c8e84] underline">
                        All messages
                    </Link>
                </div>
            }
        >
            <Head title={`Messages with ${otherPerson || 'participant'}`} />
            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl border border-gray-800 bg-white p-6 shadow-sm">
                        <p className="mb-5 text-sm text-gray-600">
                            {conversation.session?.subject || 'Tutoring session'}
                            {conversation.session?.session_date ? ` · ${conversation.session.session_date}` : ''}
                        </p>
                        <div className="space-y-3">
                            {conversation.messages?.length === 0 && (
                                <p className="text-sm text-gray-600">No messages yet.</p>
                            )}
                            {(conversation.messages || []).map((message) => (
                                <div
                                    key={message.id}
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${message.sender_id === user.id ? 'ml-auto bg-[#DCE7C3] text-gray-800' : 'bg-[#F3F3F3] text-gray-800'}`}
                                >
                                    <p className="mb-1 text-xs font-semibold text-gray-600">{message.sender?.name || 'Participant'}</p>
                                    <p>{message.body}</p>
                                    <p className="mt-1 text-[11px] text-gray-500">{message.created_at}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={submit} className="rounded-3xl border border-gray-800 bg-white p-5 shadow-sm">
                        <textarea
                            value={data.body}
                            onChange={(event) => setData('body', event.target.value)}
                            placeholder="Write a message..."
                            className="min-h-24 w-full rounded-2xl border border-gray-800 bg-transparent p-3 text-sm focus:border-[#77b2a6] focus:ring-[#77b2a6]"
                        />
                        {errors.body && <p className="mt-2 text-sm text-red-700">{errors.body}</p>}
                        <button
                            type="submit"
                            disabled={processing || !data.body.trim()}
                            className="mt-3 rounded-full border border-gray-800 bg-[#B8F2E6] px-5 py-2 text-sm font-medium text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Sending...' : 'Send message'}
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
