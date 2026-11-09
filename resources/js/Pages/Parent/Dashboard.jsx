import JoinButton from '@/Components/JoinButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { formatDate } from '@/utils/formatDate';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const PESO = '\u20B1';

const RATE_ROWS = [
    { grade: 'Grades 1-3', regular: 200, core: 250 },
    { grade: 'Grades 4-6', regular: 250, core: 300 },
    { grade: 'Grades 7-10', regular: 350, core: 400 },
];

const LOCATION_LABEL = { onsite: 'On-site', home: 'Home based', online: 'Online' };

const STATUS_STYLES = {
    pending: 'bg-white text-gray-700',
    confirmed: 'bg-[#EAF1D1] text-gray-800',
    completed: 'bg-[#EAF1D1] text-gray-800',
    cancelled: 'bg-red-100 text-red-700',
};

const PAYMENT_STYLES = {
    pending: 'bg-white text-gray-700',
    paid: 'bg-[#BFEBC4] text-gray-800',
    failed: 'bg-red-100 text-red-700',
};

function money(value) {
    return PESO + Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toDate(value) {
    if (!value) return null;
    const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
}

function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function dayParts(value) {
    const date = toDate(value);
    if (!date) return { wd: '', day: '' };
    return { wd: date.toLocaleDateString('en-US', { weekday: 'short' }), day: date.getDate() };
}

function fullDate(value) {
    const date = toDate(value);
    return date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '';
}

function fmtTime(value) {
    if (!value) return '';
    const [h, m] = String(value).split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return hour + ':' + String(m).padStart(2, '0') + ' ' + suffix;
}

function Badge({ children, className = '' }) {
    return (
        <span className={'inline-flex items-center rounded-full border border-black/60 px-3 py-0.5 text-xs capitalize ' + className}>
            {children}
        </span>
    );
}

function Card({ title, subtitle, action, children, className = '' }) {
    return (
        <section className={'overflow-hidden rounded-3xl border-[1.5px] border-black bg-[#B3DFDF] ' + className}>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/30 px-6 py-4">
                <div>
                    <h3 className="text-2xl" style={FONT_HEAD}>{title}</h3>
                    {subtitle && <p className="text-sm text-gray-700">{subtitle}</p>}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}
function PillLink({ href, children, className = '' }) {
    return (
        <Link
            href={href}
            className={'inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-black bg-[#EAF1D1] px-5 py-2 text-base hover:opacity-80 ' + className}
        >
            {children}
        </Link>
    );
}

function SessionRow({ session, onDetails }) {
    const day = dayParts(session.session_date);
    const online = session.location_type === 'online';
    const label = LOCATION_LABEL[session.location_type] || session.location_type;
    const paymentStatus = session.payment?.status || 'pending';

    return (
        <div className="flex flex-wrap items-center gap-4 border-b border-black/30 px-6 py-4 last:border-b-0">
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border-[1.5px] border-black bg-white leading-tight">
                <span className="text-sm">{day.wd}</span>
                <span className="text-xl">{day.day}</span>
            </div>

            <div className="min-w-0 flex-1">
                <div className="text-lg leading-snug">{session.subject}</div>
                <div className="text-sm text-gray-800">
                    {fmtTime(session.start_time)} - {fmtTime(session.end_time)} &middot; {session.tutor?.name || 'Tutor'}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge className={STATUS_STYLES[session.status] || STATUS_STYLES.pending}>{session.status}</Badge>
                    <Badge className={PAYMENT_STYLES[paymentStatus] || PAYMENT_STYLES.pending}>Payment {paymentStatus}</Badge>
                    <Link
                        href={route('messages.store')}
                        method="post"
                        data={{ session_id: session.id }}
                        as="button"
                        className="text-xs underline"
                    >
                        Message tutor
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <span className="rounded-full border-[1.5px] border-black bg-white px-4 py-1 text-sm">{label}</span>
                <JoinButton session={session} />
                <button
                    type="button"
                    onClick={() => onDetails(session)}
                    className="rounded-full border-[1.5px] border-black bg-[#EAF1D1] px-4 py-1 text-sm hover:opacity-80"
                >
                    View details
                </button>
            </div>
        </div>
    );
}
function SessionModal({ session, onClose }) {
    if (!session) return null;

    const tutor = session.tutor || {};
    const profile = tutor.tutor_profile || null;
    const online = session.location_type === 'online';
    const label = LOCATION_LABEL[session.location_type] || session.location_type;
    const initials = (tutor.name || '?').split(' ').map((part) => part.charAt(0)).slice(0, 2).join('').toUpperCase();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl" style={FONT_HEAD}>{session.subject}</h3>
                    <button type="button" onClick={onClose} aria-label="Close" className="rounded-full px-2 text-2xl leading-none hover:bg-gray-100">
                        &times;
                    </button>
                </div>

                <div className="mt-4 flex items-center gap-4 rounded-2xl border-[1.5px] border-black bg-[#EAF1D1] p-4">
                    {profile?.photo_path ? (
                        <img src={profile.photo_path} alt={tutor.name} className="h-20 w-20 shrink-0 rounded-xl border border-black/40 object-cover" />
                    ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#006B6B] text-xl font-bold text-white">{initials}</div>
                    )}
                    <div className="min-w-0 flex-1 text-sm text-gray-800">
                        <div className="text-lg font-semibold text-gray-900">{tutor.name}</div>
                        <div>{label}</div>
                        <div>{fmtTime(session.start_time)} - {fmtTime(session.end_time)}</div>
                        <div>{fullDate(session.session_date)}</div>
                    </div>
                    {profile?.id && (
                        <Link href={route('tutors.show', profile.id)} className="shrink-0 rounded-full bg-[#B3DFDF] px-4 py-1 text-sm hover:opacity-80">
                            View profile
                        </Link>
                    )}
                </div>

                <div className="mt-4 rounded-xl bg-[#B3DFDF] px-4 py-3 text-center text-sm text-gray-800">
                    {online
                        ? (session.meeting_url
                            ? 'Use the Join button on your dashboard when the session starts.'
                            : 'Your tutor will add the meeting link before the session.')
                        : 'Please arrive 10 minutes before the scheduled session.'}
                </div>
            </div>
        </div>
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
        <form onSubmit={submit} className="mt-3 flex flex-wrap items-start gap-2">
            <select
                value={data.rating}
                onChange={(event) => setData('rating', event.target.value)}
                className="rounded-md border border-gray-600 bg-white px-2 py-1 text-xs"
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
                className="w-48 rounded-md border border-gray-600 bg-white p-2 text-xs"
            />
            {errors.rating && <p className="text-xs text-red-700">{errors.rating}</p>}
            <button
                type="submit"
                disabled={processing}
                className="rounded-full border border-black bg-[#EAF1D1] px-3 py-1 text-xs font-medium disabled:opacity-50"
            >
                {processing ? 'Saving...' : 'Leave review'}
            </button>
        </form>
    );
}
export default function Dashboard({ sessions = [], students = [], flashStatus }) {
    const { auth } = usePage().props;
    const [selected, setSelected] = useState(null);

    const firstName = (auth?.user?.name || '').split(' ')[0];
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    const student = students[0] || null;
    const studentName = student?.student_name || sessions[0]?.student_profile?.student_name || 'Your child';

    const today = startOfToday();
    const weekOffset = (today.getDay() + 6) % 7;
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - weekOffset);
    const weekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - weekOffset + 7);

    const sortKey = (s) => String(s.session_date).slice(0, 10) + ' ' + String(s.start_time);
    const upcoming = sessions
        .filter((s) => ['pending', 'confirmed'].includes(s.status) && toDate(s.session_date) >= today)
        .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    const history = sessions.filter((s) => !upcoming.includes(s));
    const thisWeek = sessions.filter((s) => {
        const d = toDate(s.session_date);
        return s.status !== 'cancelled' && d >= weekStart && d < weekEnd;
    });
    const next = upcoming[0] || null;
    const latestNote = students[0]?.progress_notes?.[0] || null;

    const live = sessions.filter((s) => s.status !== 'cancelled');
    const due = live
        .filter((s) => (s.payment?.status || 'pending') === 'pending')
        .reduce((sum, s) => sum + Number(s.rate_applied || 0), 0);

    const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const heroTitle = thisWeek.length > 0
        ? studentName + ' has ' + thisWeek.length + (thisWeek.length === 1 ? ' lesson' : ' lessons') + ' this week.'
        : 'No lessons scheduled this week.';
    const heroText = next
        ? next.subject + ' with ' + (next.tutor?.name || 'your tutor') + ' on ' + fullDate(next.session_date) + ', ' + fmtTime(next.start_time) + '.'
        : 'Book a session to get started.';

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-gray-900" style={FONT_HEAD}>
                        {greeting}{firstName ? ', ' + firstName : ''}
                    </h1>
                    <p className="text-lg text-gray-800">Welcome back, here's what's happening with your child today.</p>
                </div>
            }
        >
            <Head title="Parent Dashboard" />

            <div className="px-6 pb-12 pt-6 sm:px-8">
                {flashStatus === 'session-booked' && (
                    <div className="mb-6 rounded-3xl border-[1.5px] border-black bg-[#EAF1D1] p-4 text-sm font-medium text-gray-800">
                        Session booked. Waiting for admin review.
                    </div>
                )}

                <section className="rounded-3xl border-[1.5px] border-black bg-[#B3DFDF] p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-gray-800">{todayLabel}</p>
                            <h2 className="mt-1 text-3xl font-bold text-gray-900">{heroTitle}</h2>
                            <p className="mt-2 text-gray-800">{heroText}</p>
                        </div>
                        <PillLink href={route('parent.booking.create')}>Book a new session</PillLink>
                    </div>
                </section>

                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card
                            title="Upcoming Sessions"
                            subtitle={studentName + (student?.grade_level ? ' - ' + student.grade_level : '')}
                            action={<PillLink href={route('parent.progress.index')}>View Progress</PillLink>}
                        >
                            {upcoming.length === 0 ? (
                                <p className="px-6 py-5 text-sm text-gray-800">No upcoming sessions yet.</p>
                            ) : (
                                upcoming.map((s) => <SessionRow key={s.id} session={s} onDetails={setSelected} />)
                            )}
                        </Card>

                        <Card title="Recent Progress">
                            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
                                <p className="text-sm text-gray-800">
                                    {latestNote ? '"' + latestNote.note + '" - ' + (latestNote.tutor?.name || 'Tutor') : 'Your tutor notes about ' + studentName + ' appear in My Progress.'}
                                </p>
                                <PillLink href={route('parent.progress.index')}>Open My Progress</PillLink>
                            </div>
                        </Card>

                        {history.length > 0 && (
                            <Card title="Session History">
                                {history.map((s) => (
                                    <div key={s.id} className="border-b border-black/30 px-6 py-3 last:border-b-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="text-sm">
                                                <span className="font-semibold">{s.subject}</span> &middot; {s.tutor?.name || 'Tutor'} &middot; {formatDate(s.session_date)}
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge className={STATUS_STYLES[s.status] || STATUS_STYLES.pending}>{s.status}</Badge>
                                                <Badge className={PAYMENT_STYLES[s.payment?.status || 'pending'] || PAYMENT_STYLES.pending}>
                                                    Payment {s.payment?.status || 'pending'}
                                                </Badge>
                                            </div>
                                        </div>
                                        {s.status === 'completed' && !s.review && <ReviewForm session={s} />}
                                    </div>
                                ))}
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card title="Rate Card" subtitle="Rates may vary by tutor. The exact price is shown when you choose a tutor.">
                            <div className="text-sm">
                                <div className="grid grid-cols-3 gap-2 bg-[#EAF1D1] px-6 py-2">
                                    <span>Grade level</span>
                                    <span>Regular</span>
                                    <span>Math / Sci / Eng</span>
                                </div>
                                {RATE_ROWS.map((row) => (
                                    <div key={row.grade} className="grid grid-cols-3 gap-2 border-t border-black/30 px-6 py-2">
                                        <span>{row.grade}</span>
                                        <span>{PESO}{row.regular}/hr</span>
                                        <span>{PESO}{row.core}/hr</span>
                                    </div>
                                ))}
                                <div className="grid grid-cols-3 gap-2 border-t border-black/30 px-6 py-2">
                                    <span className="col-span-2">Special Teaching (Special needs)</span>
                                    <span>{PESO}500/session</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 border-t border-black/30 px-6 py-2">
                                    <span>Drawing<br />Painting</span>
                                    <span className="col-span-2">{PESO}1,200/session<br />{PESO}1,500/session<br />1-on-1 or class, per child</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 border-t border-black/30 px-6 py-2">
                                    <span className="col-span-2">Private / home-based</span>
                                    <span>min {PESO}350/hr</span>
                                </div>
                                <p className="m-4 rounded-2xl border border-black/60 bg-[#EAF1D1] p-3">
                                    Private / home-based teaching starts at {PESO}350/hr and adds transportation fare, confirmed with the parent before the session.
                                </p>
                            </div>
                        </Card>

                        <Card title="Billing and Payment snapshot">
                            <div className="p-4">
                                <div className="rounded-2xl border border-black/60 bg-white p-4">
                                    {live.length === 0 ? (
                                        <p className="text-sm text-gray-700">No payments yet.</p>
                                    ) : (
                                        <>
                                            <Badge className={due > 0 ? 'bg-[#EAF1D1]' : 'bg-[#BFEBC4]'}>
                                                {due > 0 ? 'Payment due' : 'Fully Paid'}
                                            </Badge>
                                            <div className="mt-2 flex items-center justify-between gap-3">
                                                <div className="text-2xl" style={FONT_HEAD}>{money(due)} Balance</div>
                                                <Link
                                                    href={route('parent.billing.index')}
                                                    className="rounded-full border border-black bg-[#EAF1D1] px-4 py-1 text-sm hover:opacity-80"
                                                >
                                                    View billing
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <SessionModal session={selected} onClose={() => setSelected(null)} />
        </AuthenticatedLayout>
    );
}