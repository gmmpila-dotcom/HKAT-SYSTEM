import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import NotificationBell from '@/Components/NotificationBell';

const NAV = {
    parent: [
        { label: 'Dashboard', href: 'parent.dashboard', match: 'parent.dashboard', icon: 'grid' },
        { label: 'Book a session', href: 'parent.booking.create', match: 'parent.booking.*', icon: 'calendar' },
        { label: 'Billing', href: 'parent.billing.index', match: 'parent.billing.*', icon: 'card' },
        { label: 'My Progress', href: 'parent.progress.index', match: 'parent.progress.*', icon: 'chart' },
    ],
    tutor: [
        { label: 'Dashboard', href: 'tutor.dashboard', match: 'tutor.dashboard', icon: 'grid' },
        { label: 'My Schedule', href: 'tutor.schedule.index', match: 'tutor.schedule.*', icon: 'calendar' },
        { label: 'My Students', href: 'tutor.students.index', match: 'tutor.students.*', icon: 'users' },
        { label: 'My Profile', href: 'tutor.profile.edit', match: 'tutor.profile.*', icon: 'person' },
    ],
    admin: [
        { label: 'Dashboard', href: 'admin.dashboard', match: 'admin.dashboard', icon: 'grid' },
        { label: 'Schedule', href: 'admin.schedule.index', match: 'admin.schedule.*', icon: 'calendar' },
        { label: 'Tutors', href: 'admin.tutors.index', match: 'admin.tutors.*', icon: 'users' },
        { label: 'Students', href: 'admin.students.index', match: 'admin.students.*', icon: 'person' },
        { label: 'Payments', href: 'admin.payments.index', match: 'admin.payments.*', icon: 'card' },
        { label: 'Sessions', href: 'admin.sessions.index', match: 'admin.sessions.*', icon: 'list' },
        { label: 'Reports', href: 'admin.reports.index', match: 'admin.reports.*', icon: 'chart' },
    ],
    default: [
        { label: 'Dashboard', href: 'dashboard', match: 'dashboard', icon: 'grid' },
    ],
};

const ICONS = {
    grid: (<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
    calendar: (<><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" /></>),
    card: (<><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19" /></>),
    chart: <path d="M5 20V12M12 20V5M19 20v-9" />,
    users: (<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.4c2.2.7 3.5 2.6 3.5 5.6" /></>),
    list: <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
    person: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></>),
    bell: (<><path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z" /><path d="M10 20a2 2 0 0 0 4 0" /></>),
    mail: (<><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7l8.5 6 8.5-6" /></>),
    settings: (<><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></>),
};

function Icon({ name, className = 'h-6 w-6' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {ICONS[name]}
        </svg>
    );
}

function Logo({ className = 'h-10 w-10' }) {
    const petals = 10;
    return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
            {Array.from({ length: petals }).map((_, i) => (
                <ellipse
                    key={i}
                    cx="50"
                    cy="22"
                    rx="10"
                    ry="20"
                    fill={`hsl(${(360 / petals) * i}, 75%, 58%)`}
                    transform={`rotate(${(360 / petals) * i} 50 50)`}
                />
            ))}
            <circle cx="50" cy="50" r="18" fill="#FFD23F" />
            <circle cx="43" cy="47" r="2.2" fill="#2b2b2b" />
            <circle cx="57" cy="47" r="2.2" fill="#2b2b2b" />
            <path d="M42 55 Q50 62 58 55" stroke="#2b2b2b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </svg>
    );
}
export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth?.user ?? {};
    const role = user.role ?? '';
    const [menuOpen, setMenuOpen] = useState(false);

    const links = NAV[role] ?? NAV.default;
    const firstName = (user.name ?? '').split(' ')[0];
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    const headingFont = { fontFamily: "'Playfair Display', Georgia, serif" };

    return (
        <div className="min-h-screen bg-white">
            <aside className="group fixed inset-y-0 left-0 z-40 flex w-[72px] flex-col overflow-hidden border-r-[1.5px] border-black bg-[#B3DFDF] transition-all duration-200 hover:w-64">
                <Link href="/" className="flex h-[72px] shrink-0 items-center gap-3 border-b border-black/20 px-3">
                    <Logo className="h-11 w-11 shrink-0" />
                    <span className="whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="block text-xl font-bold leading-none" style={headingFont}>HKAT</span>
                        <span className="block text-xs">Happy Kid Arts &amp; Tutorial</span>
                    </span>
                </Link>

                <nav className="mt-6 flex flex-col gap-2 px-3">
                    {links.map((link) => {
                        const active = route().current(link.match);
                        return (
                            <Link
                                key={link.label}
                                href={route(link.href)}
                                className={
                                    'flex items-center gap-4 whitespace-nowrap rounded-2xl px-3 py-3 text-lg text-[#1c1c1c] transition-colors ' +
                                    (active ? 'bg-[#EAF1D1] shadow-md' : 'hover:bg-white/40')
                                }
                            >
                                <Icon name={link.icon} className="h-7 w-7 shrink-0" />
                                <span className="opacity-0 transition-opacity group-hover:opacity-100">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <div className="pl-[72px]">
                <header className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-8">
                    <div className="min-w-0 flex-1">
                        {header ?? (
                            <h1 className="text-2xl font-bold text-gray-900" style={headingFont}>
                                {greeting}{firstName ? `, ${firstName}` : ''}
                            </h1>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                        <NotificationBell />
                        <Link href={route('messages.index')} aria-label="Messages" className="rounded-full p-2 text-gray-900 hover:bg-[#B3DFDF]">
                            <Icon name="mail" className="h-7 w-7" />
                        </Link>
                        <Link href={route('profile.edit')} aria-label="Settings" className="rounded-full p-2 text-gray-900 hover:bg-[#B3DFDF]">
                            <Icon name="settings" className="h-7 w-7" />
                        </Link>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setMenuOpen((open) => !open)}
                                className="flex items-center gap-2 rounded-2xl border-[1.5px] border-black/60 bg-white px-3 py-1.5 text-left"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8FB27A] text-sm font-bold text-white">
                                    {(user.name ?? '?').charAt(0).toUpperCase()}
                                </span>
                                <span className="hidden leading-tight sm:block">
                                    <span className="block max-w-[9rem] truncate text-sm text-gray-700">{user.name}</span>
                                    <span className="inline-block rounded-full bg-[#EAF1D1] px-2 text-xs capitalize text-gray-700">{role}</span>
                                </span>
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border-[1.5px] border-black bg-white p-2 shadow-lg">
                                    <Link href={route('profile.edit')} className="block rounded-xl px-3 py-2 text-sm hover:bg-[#EAF1D1]">
                                        Settings
                                    </Link>
                                    <Link
                                        method="post"
                                        href={route('logout')}
                                        as="button"
                                        className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-[#EAF1D1]"
                                    >
                                        Log out
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main>{children}</main>
            </div>
        </div>
    );
}