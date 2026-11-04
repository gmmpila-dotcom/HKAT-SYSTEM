import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };

function initials(name) {
    return (name || '?').split(' ').map((part) => part.charAt(0)).slice(0, 2).join('').toUpperCase();
}

function shortTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const sameDay = date.toDateString() === new Date().toDateString();
    return sameDay
        ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Index({ conversations = [] }) {
    const user = usePage().props.auth.user;
    const [query, setQuery] = useState('');
    const needle = query.trim().toLowerCase();

    const rows = conversations
        .map((conversation) => ({
            conversation,
            person: user.id === conversation.parent_id ? conversation.tutor?.name : conversation.parent?.name,
        }))
        .filter(({ conversation, person }) =>
            ((person || '') + ' ' + (conversation.session?.subject || '')).toLowerCase().includes(needle));

    return (
        <AuthenticatedLayout
            header={<h1 className="text-2xl font-bold text-gray-900" style={FONT_HEAD}>Messages</h1>}
        >
            <Head title="Messages" />

            <div className="px-6 pb-12 pt-6 sm:px-8">
                <div className="grid overflow-hidden rounded-3xl border-[1.5px] border-black bg-white md:grid-cols-[22rem_1fr]">
                    <div className="border-black md:border-r">
                        <div className="border-b border-black p-4">
                            <input
                                type="text"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search conversations"
                                className="w-full rounded-full border-0 bg-[#D9D9D9] px-5 py-2 text-sm focus:ring-2 focus:ring-[#B3DFDF]"
                            />
                        </div>

                        {rows.length === 0 && (
                            <p className="px-4 py-6 text-sm text-gray-700">
                                {conversations.length === 0
                                    ? 'No conversations yet. Use Message tutor on a session from your dashboard.'
                                    : 'No conversations match your search.'}
                            </p>
                        )}

                        {rows.map(({ conversation, person }) => (
                            <Link
                                key={conversation.id}
                                href={route('messages.show', conversation.id)}
                                className="flex items-center gap-4 border-b border-black px-4 py-4 hover:bg-[#EAF1D1]"
                            >
                                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#006B6B] text-xl font-bold text-white">
                                    {initials(person)}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-baseline justify-between gap-2">
                                        <span className="truncate text-lg font-bold">{person || 'Conversation'}</span>
                                        <span className="shrink-0 text-xs text-gray-600">{shortTime(conversation.latest_message?.created_at)}</span>
                                    </span>
                                    <span className="block truncate text-sm text-gray-700">{conversation.session?.subject || 'Tutoring session'}</span>
                                    <span className="block truncate text-sm">{conversation.latest_message?.body || 'No messages yet.'}</span>
                                </span>
                            </Link>
                        ))}
                    </div>

                    <div className="hidden min-h-[24rem] items-center justify-center bg-[#EAF1D1] p-8 text-gray-800 md:flex">
                        Please select a chat.
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}