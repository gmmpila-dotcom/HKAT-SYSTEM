import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { formatDate } from '@/utils/formatDate';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };

function initials(name) {
    return (name || '?').split(' ').map((part) => part.charAt(0)).slice(0, 2).join('').toUpperCase();
}

function shortTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function Show({ conversation }) {
    const user = usePage().props.auth.user;
    const { data, setData, post, processing, reset, errors } = useForm({ body: '' });
    const bottom = useRef(null);
    const messages = conversation.messages || [];
    const otherPerson = user.id === conversation.parent_id ? conversation.tutor?.name : conversation.parent?.name;

    useEffect(() => {
        bottom.current?.scrollIntoView({ block: 'end' });
    }, [messages.length]);

    const submit = (event) => {
        event.preventDefault();
        post(route('messages.send', conversation.id), {
            preserveScroll: true,
            onSuccess: () => reset('body'),
        });
    };

    return (
        <AuthenticatedLayout
            header={<h1 className="text-2xl font-bold text-gray-900" style={FONT_HEAD}>Messages</h1>}
        >
            <Head title={'Messages with ' + (otherPerson || 'participant')} />

            <div className="px-6 pb-12 pt-6 sm:px-8">
                <div className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-white">
                    <div className="flex items-center gap-4 border-b border-black px-5 py-4">
                        <Link href={route('messages.index')} className="text-3xl leading-none" aria-label="All messages">
                            &lsaquo;
                        </Link>
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#006B6B] font-bold text-white">
                            {initials(otherPerson)}
                        </span>
                        <div className="min-w-0">
                            <div className="truncate text-xl font-bold" style={FONT_HEAD}>{otherPerson || 'Conversation'}</div>
                            <div className="truncate text-sm text-gray-700">
                                {conversation.session?.subject || 'Tutoring session'}
                                {conversation.session?.session_date ? ' - ' + formatDate(conversation.session.session_date) : ''}
                            </div>
                        </div>
                    </div>

                    <div className="max-h-[60vh] min-h-[22rem] space-y-3 overflow-y-auto bg-[#B3DFDF] p-6">
                        {messages.length === 0 && <p className="text-center text-sm text-gray-800">No messages yet. Say hello!</p>}
                        {messages.map((message) => {
                            const mine = message.sender_id === user.id;
                            return (
                                <div
                                    key={message.id}
                                    className={'max-w-[80%] rounded-3xl px-5 py-3 ' + (mine ? 'ml-auto bg-[#EAF1D1]' : 'bg-[#D9D9D9]')}
                                >
                                    <p className="whitespace-pre-wrap">{message.body}</p>
                                    <p className="mt-1 text-xs text-gray-600">{shortTime(message.created_at)}</p>
                                </div>
                            );
                        })}
                        <div ref={bottom} />
                    </div>

                    <form onSubmit={submit} className="flex items-center gap-3 border-t border-black p-4">
                        <input
                            type="text"
                            value={data.body}
                            onChange={(event) => setData('body', event.target.value)}
                            placeholder="Type a message..."
                            className="min-w-0 flex-1 rounded-full border-[1.5px] border-black bg-[#D9D9D9] px-5 py-3 focus:border-black focus:ring-0"
                        />
                        <button
                            type="submit"
                            disabled={processing || !data.body.trim()}
                            className="rounded-full border-[1.5px] border-black bg-[#B3DFDF] px-6 py-3 text-lg hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                    {errors.body && <p className="px-5 pb-4 text-sm text-red-700">{errors.body}</p>}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}