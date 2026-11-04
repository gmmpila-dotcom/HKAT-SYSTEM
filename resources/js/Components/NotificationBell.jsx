import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };

function toPath(url) {
    try {
        const parsed = new URL(url, window.location.origin);
        return parsed.pathname + parsed.search + parsed.hash;
    } catch (error) {
        return '/';
    }
}

function BellIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z" />
            <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
    );
}

export default function NotificationBell() {
    const { auth } = usePage().props;
    const data = auth?.notifications || { unreadCount: 0, items: [] };
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState('all');

    const items = tab === 'unread' ? data.items.filter((item) => !item.readAt) : data.items;

    const markAll = () => {
        router.patch(route('notifications.read-all'), {}, { preserveScroll: true, preserveState: true });
    };

    const openItem = (item) => {
        setOpen(false);

        if (item.readAt) {
            router.visit(toPath(item.url));
            return;
        }

        router.patch(route('notifications.read', item.id), {}, {
            preserveScroll: true,
            onFinish: () => router.visit(toPath(item.url)),
        });
    };

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} aria-label="Notifications" className="relative rounded-full p-2 text-gray-900 hover:bg-[#B3DFDF]">
                <BellIcon className="h-7 w-7" />
                {data.unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#006B6B] px-1 text-xs text-white">
                        {data.unreadCount > 9 ? '9+' : data.unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setOpen(false)}>
                    <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-start justify-between gap-4 px-6 pt-6">
                            <h3 className="text-2xl font-bold" style={FONT_HEAD}>Notifications</h3>
                            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full px-2 text-3xl leading-none hover:bg-gray-100">
                                &times;
                            </button>
                        </div>

                        <div className="mt-3 flex gap-2 px-6">
                            {[{ key: 'all', label: 'All' }, { key: 'unread', label: 'Unread' }].map((option) => (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={() => setTab(option.key)}
                                    className={'rounded-full px-4 py-1 text-sm ' + (tab === option.key ? 'bg-[#B3DFDF]' : 'hover:bg-gray-100')}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 flex-1 overflow-y-auto border-t border-black/10">
                            {items.length === 0 && (
                                <p className="px-6 py-6 text-sm text-gray-700">
                                    {tab === 'unread' ? 'No unread notifications.' : 'You have no notifications yet.'}
                                </p>
                            )}
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => openItem(item)}
                                    className={'flex w-full items-start gap-3 border-b border-black/10 px-6 py-4 text-left hover:bg-[#EAF1D1] ' + (item.readAt ? 'bg-white' : 'bg-[#EAF1D1]')}
                                >
                                    {!item.readAt && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />}
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-baseline justify-between gap-3">
                                            <span className={'text-base ' + (item.readAt ? '' : 'font-semibold')}>{item.title}</span>
                                            <span className="shrink-0 text-xs text-gray-600">{item.createdAt}</span>
                                        </span>
                                        <span className="block text-sm text-gray-800">{item.message}</span>
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-black/10 px-6 py-4">
                            <button
                                type="button"
                                onClick={markAll}
                                disabled={data.unreadCount === 0}
                                className="rounded-full border-[1.5px] border-black bg-[#EAF1D1] px-4 py-1 text-sm hover:opacity-80 disabled:opacity-40"
                            >
                                Mark all as read
                            </button>
                            <Link href={route('notifications.index')} onClick={() => setOpen(false)} className="text-sm underline">
                                View all notifications
                            </Link>
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}