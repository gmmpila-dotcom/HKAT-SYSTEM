import JoinButton from '@/Components/JoinButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const PESO = '\u20B1';
const DOT = ' \u00B7 ';
const DASH = ' \u2013 ';
const TUTOR_COLORS = ['#3F6B3F', '#D9B600', '#B03030', '#A64BC8', '#7F9BC0', '#2E8B8B', '#C97B2A'];
const LOCATION = { onsite: 'On-site', home: 'Home based', online: 'Online' };
const STATUS_LABEL = { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' };

function money(value) {
    const number = Number(value || 0);
    return PESO + number.toLocaleString('en-PH', {
        minimumFractionDigits: Number.isInteger(number) ? 0 : 2,
        maximumFractionDigits: 2,
    });
}

function minutes(value) {
    const [h, m] = String(value || '0:0').split(':').map(Number);
    return h * 60 + m;
}

function fmtTime(value) {
    if (!value) return '';
    const [h, m] = String(value).split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return hour + ':' + String(m).padStart(2, '0') + ' ' + suffix;
}

function duration(start, end) {
    const total = minutes(end) - minutes(start);
    if (total <= 0) return '';
    if (total < 60) return total + ' mins';
    const hrs = total / 60;
    return (Number.isInteger(hrs) ? hrs : hrs.toFixed(1)) + (hrs === 1 ? ' hr' : ' hrs');
}

function shortDay(value) {
    if (!value) return '';
    const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function tutorColor(id) {
    return TUTOR_COLORS[Number(id || 0) % TUTOR_COLORS.length];
}

function typeLabel(type) {
    return type === 'class' ? 'Class' : '1-on-1';
}

function initials(name) {
    return (name || '?').split(' ').map((part) => part.charAt(0)).slice(0, 2).join('').toUpperCase();
}

function SectionCard({ title, subtitle, badge, action, children }) {
    return (
        <section className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black bg-[#EAF1D1] px-6 py-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div>
                        <h3 className="text-2xl" style={FONT_HEAD}>{title}</h3>
                        {subtitle && <p className="text-gray-700">{subtitle}</p>}
                    </div>
                    {badge && <span className="rounded-full bg-[#B3DFDF] px-3 py-1 text-sm">{badge}</span>}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

function TodayRow({ session }) {
    const student = session.student_profile || {};
    const tutor = session.tutor || {};

    return (
        <div className="flex items-center gap-4 border-b border-black/40 px-6 py-4 last:border-b-0">
            <div className="w-28 shrink-0 text-sm leading-snug">
                <div className="font-semibold">{fmtTime(session.start_time)}{DASH}</div>
                <div className="font-semibold">{fmtTime(session.end_time)}</div>
                <div className="text-gray-600">{duration(session.start_time, session.end_time)}</div>
            </div>
            <span className="h-14 w-1 shrink-0 rounded-full" style={{ backgroundColor: tutorColor(session.tutor_id) }} />
            <div className="min-w-0 flex-1">
                <div className="text-lg font-semibold">{student.student_name || '-'}</div>
                <div className="truncate text-gray-800">{session.subject}{DOT}{tutor.name || 'Tutor'} <span className="ml-2"><JoinButton session={session} /></span></div>
            </div>
            <span className="rounded-full bg-[#B3DFDF] px-4 py-1 text-sm">{STATUS_LABEL[session.status] || session.status}</span>
        </div>
    );
}

function StatRow({ label, note, value }) {
    return (
        <div className="flex items-center justify-between gap-4 border-t border-black/40 px-6 py-6">
            <div>
                <div className="text-lg">{label}</div>
                <div className="text-gray-700">{note}</div>
            </div>
            <div className="text-4xl font-bold" style={FONT_HEAD}>{value}</div>
        </div>
    );
}
function RequestRow({ request }) {
    const [busy, setBusy] = useState(false);
    const student = request.student_profile || {};
    const parent = student.parent || {};
    const tutor = request.tutor || {};
    const photo = tutor.tutor_profile ? tutor.tutor_profile.photo_path : null;
    const payment = request.payment || null;
    const paid = Boolean(payment && payment.status === 'paid');
    const price = payment ? payment.amount : request.rate_applied;

    const act = (url) => {
        setBusy(true);
        router.patch(url, {}, { preserveScroll: true, onFinish: () => setBusy(false) });
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/60 px-6 py-5 last:border-b-0">
            <div className="min-w-0 flex-1">
                <div className="text-lg">
                    <span className="font-bold">{student.student_name || '-'}</span> {student.grade_level}{DOT}{request.subject}
                </div>
                <div className="text-gray-800">
                    {shortDay(request.session_date)}{DOT}{fmtTime(request.start_time)}{DOT}{typeLabel(request.session_type)}{DOT}{LOCATION[request.location_type] || request.location_type}{parent.name ? DOT + 'requested by ' + parent.name : ''}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#B3DFDF] px-3 py-1 text-sm">
                        {photo ? (
                            <img src={photo} alt={tutor.name} className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#006B6B] text-xs text-white">{initials(tutor.name)}</span>
                        )}
                        {tutor.name || 'Tutor'}
                    </span>
                    <span className="rounded-full bg-[#EAF1D1] px-3 py-1 text-sm">{money(price)}</span>
                    <span className={'rounded-full border border-black/50 px-3 py-1 text-sm ' + (paid ? 'bg-[#BFEBC4]' : 'bg-white')}>
                        {paid ? 'Paid' : 'Payment pending'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => act(route('admin.sessions.cancel', request.id))}
                    className="rounded-2xl bg-[#F2D4D4] px-5 py-2 hover:opacity-80 disabled:opacity-50"
                >
                    &#10005; Decline
                </button>
                {paid ? (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => act(route('admin.sessions.confirm', request.id))}
                        className="rounded-2xl bg-[#EAF1D1] px-5 py-2 hover:opacity-80 disabled:opacity-50"
                    >
                        &#10003; Confirm
                    </button>
                ) : (
                    <button
                        type="button"
                        disabled={busy || !payment}
                        onClick={() => act(route('admin.payments.mark-paid', payment.id))}
                        className="rounded-2xl bg-[#B3DFDF] px-5 py-2 hover:opacity-80 disabled:opacity-50"
                    >
                        Mark paid
                    </button>
                )}
            </div>
        </div>
    );
}

export default function Dashboard({ todaySessions = [], pendingRequests = [], stats = {} }) {
    const { auth, errors = {} } = usePage().props;
    const firstName = (auth?.user?.name || '').split(' ')[0];
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const requestCount = pendingRequests.length;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-3xl font-bold text-gray-900" style={FONT_HEAD}>
                        {greeting}{firstName ? ', ' + firstName : ''}
                    </h1>
                    <p className="text-lg text-gray-800">
                        {todayLabel}{DOT}{todaySessions.length} {todaySessions.length === 1 ? 'session' : 'sessions'} today, {requestCount} {requestCount === 1 ? 'request' : 'requests'} waiting on you
                    </p>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="space-y-6 px-6 pb-12 pt-6 sm:px-8">
                {errors.session && (
                    <p className="rounded-2xl border-[1.5px] border-black bg-red-100 p-3 text-sm text-red-700">{errors.session}</p>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <SectionCard
                            title="Today's sessions"
                            subtitle="All tutors"
                            action={<Link href={route('admin.sessions.index')} className="text-[#006B6B] underline">All sessions</Link>}
                        >
                            {todaySessions.length === 0 ? (
                                <p className="px-6 py-5 text-gray-800">No sessions scheduled today.</p>
                            ) : (
                                todaySessions.map((session) => <TodayRow key={session.id} session={session} />)
                            )}
                        </SectionCard>
                    </div>

                    <section className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-white">
                        <div className="bg-[#B3DFDF] px-6 py-5">
                            <div className="text-lg uppercase tracking-wide text-gray-700">Revenue this month</div>
                            <div className="mt-1 text-5xl font-bold" style={FONT_HEAD}>{money(stats.revenueMonth)}</div>
                            <div className="mt-2 text-lg text-gray-800">{money(stats.pendingAmount)} pending payment</div>
                        </div>
                        <StatRow label="Active students" note={(stats.newStudents || 0) + ' enrolled this month'} value={stats.activeStudents || 0} />
                        <StatRow label="Active tutors" note={(stats.awaitingTutors || 0) + ' awaiting verification'} value={stats.activeTutors || 0} />
                        <StatRow label="Sessions this week" note={(stats.weekPending || 0) + ' still pending'} value={stats.sessionsThisWeek || 0} />
                    </section>
                </div>

                <SectionCard title="Pending session requests" badge={requestCount + ' need confirmation'}>
                    {requestCount === 0 ? (
                        <p className="px-6 py-5 text-gray-800">No requests waiting. New bookings appear here.</p>
                    ) : (
                        pendingRequests.map((request) => <RequestRow key={request.id} request={request} />)
                    )}
                    <p className="border-t border-black/40 bg-[#EAF1D1] px-6 py-3 text-sm text-gray-800">
                        A session can only be confirmed after its payment is marked as paid.
                    </p>
                </SectionCard>
            </div>
        </AuthenticatedLayout>
    );
}