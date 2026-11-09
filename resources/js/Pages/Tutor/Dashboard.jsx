import JoinButton from '@/Components/JoinButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { formatDate } from '@/utils/formatDate';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const DOT = ' \u00B7 ';
const DASH = ' \u2013 ';
const LOCATION = { onsite: 'On-site', home: 'Home based', online: 'Online' };
const STATUS_STYLES = {
    pending: 'bg-[#FBE7A6]',
    confirmed: 'bg-[#B3DFDF]',
    completed: 'bg-[#BFEBC4]',
    cancelled: 'bg-[#F2B3B3]',
};
const PAYMENT_STYLES = {
    pending: 'bg-white',
    paid: 'bg-[#BFEBC4]',
    failed: 'bg-[#F2B3B3]',
};

function fmtTime(value) {
    if (!value) return '';
    const [h, m] = String(value).split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return hour + ':' + String(m).padStart(2, '0') + ' ' + suffix;
}

export default function Dashboard({ sessions = [] }) {
    const { auth } = usePage().props;
    const firstName = (auth?.user?.name || '').split(' ')[0];
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-3xl font-bold text-gray-900" style={FONT_HEAD}>{greeting}{firstName ? ', ' + firstName : ''}</h1>
                    <p className="text-lg text-gray-800">{sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} on your list</p>
                </div>
            }
        >
            <Head title="Tutor Dashboard" />

            <div className="space-y-6 px-6 pb-12 pt-6 sm:px-8">
                <div className="flex flex-wrap gap-3">
                    <Link href={route('tutor.schedule.index')} className="rounded-xl border-[1.5px] border-black bg-[#EAF1D1] px-5 py-2 hover:opacity-80">My Schedule</Link>
                    <Link href={route('tutor.students.index')} className="rounded-xl border-[1.5px] border-black bg-[#B3DFDF] px-5 py-2 hover:opacity-80">My Students</Link>
                    <Link href={route('tutor.profile.edit')} className="rounded-xl border-[1.5px] border-black bg-white px-5 py-2 hover:opacity-80">My Profile</Link>
                </div>

                <section className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-white">
                    <div className="border-b border-black bg-[#EAF1D1] px-6 py-4">
                        <h3 className="text-2xl" style={FONT_HEAD}>Upcoming sessions</h3>
                        <p className="text-gray-700">Sessions booked with you</p>
                    </div>

                    {sessions.length === 0 && <p className="px-6 py-5 text-gray-800">You have no sessions booked yet.</p>}

                    {sessions.map((session) => (
                        <div key={session.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-black/40 px-6 py-4 last:border-b-0">
                            <div>
                                <div className="text-lg font-semibold">
                                    {session.student_profile ? session.student_profile.student_name : 'Student'}{DOT}{session.subject}
                                </div>
                                <div className="text-gray-700">
                                    {formatDate(session.session_date)}{DOT}{fmtTime(session.start_time)}{DASH}{fmtTime(session.end_time)}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {session.session_type === 'class' ? 'Class' : '1-on-1'}{DOT}{LOCATION[session.location_type] || session.location_type} <JoinButton session={session} />
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={'rounded-full border border-black/50 px-3 py-1 text-sm capitalize ' + (STATUS_STYLES[session.status] || 'bg-white')}>
                                    {session.status}
                                </span>
                                <span className={'rounded-full border border-black/50 px-3 py-1 text-sm ' + (session.payment ? PAYMENT_STYLES[session.payment.status] || 'bg-white' : 'bg-white')}>
                                    Payment: {session.payment ? session.payment.status : 'No payment'}
                                </span>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}