import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const DOT = ' \u00B7 ';
const DASH = '\u2013';
const ROW = 76;
const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const LOCATION = { onsite: 'On-site', home: 'Home based', online: 'Online' };
const BLOCK_STYLE = {
    pending: 'border-dashed bg-[#E3F1F1]',
    confirmed: 'bg-[#B3DFDF]',
    completed: 'bg-[#BFEBC4]',
};

function parseDate(value) {
    const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
}

function isoDate(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

function minutes(value) {
    const [h, m] = String(value || '0:0').split(':').map(Number);
    return h * 60 + m;
}

function fmtTime(value) {
    const [h, m] = String(value).split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return hour + ':' + String(m).padStart(2, '0') + ' ' + suffix;
}

function hourLabel(hour) {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 === 0 ? 12 : hour % 12;
    return h + ':00 ' + suffix;
}

function shortDate(value) {
    return parseDate(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function rangeLabel(startIso, endIso) {
    const a = parseDate(startIso);
    const b = parseDate(endIso);
    const sm = a.toLocaleDateString('en-US', { month: 'short' });
    const bm = b.toLocaleDateString('en-US', { month: 'short' });
    return sm + ' ' + a.getDate() + DASH + (sm === bm ? '' : bm + ' ') + b.getDate() + ', ' + b.getFullYear();
}

function layoutDay(list) {
    const sorted = [...list].sort((a, b) => minutes(a.start) - minutes(b.start));
    const lanes = [];
    const placed = sorted.map((s) => {
        let lane = lanes.findIndex((end) => end <= minutes(s.start));
        if (lane === -1) {
            lane = lanes.length;
            lanes.push(0);
        }
        lanes[lane] = minutes(s.end);
        return { s, lane };
    });
    return { placed, count: Math.max(lanes.length, 1) };
}

export default function Index({ sessions = [], upNext = [], week, summary }) {
    const start = parseDate(week.start);
    const days = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        return {
            iso: isoDate(date),
            name: DAY_NAMES[i],
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };
    });

    const startHour = Math.min(8, ...sessions.map((s) => Math.floor(minutes(s.start) / 60)));
    const endHour = Math.max(19, ...sessions.map((s) => Math.ceil(minutes(s.end) / 60)));
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
    const bodyHeight = (endHour - startHour) * ROW;
    const teaching = Number.isInteger(summary.hours) ? summary.hours : summary.hours.toFixed(1);
    const navClass = 'rounded-full border-[1.5px] border-black bg-[#EAF1D1] px-4 py-2 shadow hover:opacity-80';

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-3xl font-bold text-gray-900" style={FONT_HEAD}>My schedule</h1>
                    <p className="text-lg text-gray-800">
                        {rangeLabel(week.start, week.end)}{DOT}{summary.count} {summary.count === 1 ? 'session' : 'sessions'}{DOT}{teaching} teaching hours
                    </p>
                </div>
            }
        >
            <Head title="My Schedule" />

            <div className="space-y-4 px-6 pb-12 pt-6 sm:px-8">
                <div className="flex items-center gap-2">
                    <Link href={route('tutor.schedule.index', { week: week.offset - 1 })} preserveScroll className={navClass} aria-label="Previous week">&lsaquo;</Link>
                    <Link href={route('tutor.schedule.index')} preserveScroll className={navClass}>
                        {week.offset === 0 ? 'This week' : rangeLabel(week.start, week.end)}
                    </Link>
                    <Link href={route('tutor.schedule.index', { week: week.offset + 1 })} preserveScroll className={navClass} aria-label="Next week">&rsaquo;</Link>
                    <Link href={route('tutor.profile.edit') + '#availability'} className="ml-auto rounded-full border-[1.5px] border-black bg-[#EAF1D1] px-5 py-2 shadow hover:opacity-80">Update Availability</Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="overflow-x-auto rounded-3xl border-[1.5px] border-black bg-[#EAF1D1] p-4 lg:col-span-2">
                        <div className="min-w-[640px]">
                            <div className="grid grid-cols-[4.5rem_repeat(7,minmax(0,1fr))]">
                                <div />
                                {days.map((day) => (
                                    <div key={day.iso} className="pb-2 text-center text-sm leading-tight">
                                        <div>{day.name}</div>
                                        <div className="font-semibold">{day.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-[4.5rem_repeat(7,minmax(0,1fr))]">
                                <div className="relative" style={{ height: bodyHeight }}>
                                    {hours.map((hour, i) => (
                                        <span key={hour} className="absolute right-2 text-sm text-gray-700" style={{ top: i * ROW - 9 }}>
                                            {hourLabel(hour)}
                                        </span>
                                    ))}
                                </div>
                                {days.map((day) => {
                                    const { placed, count } = layoutDay(sessions.filter((s) => s.date === day.iso));
                                    return (
                                        <div key={day.iso} className="relative border-l border-black/50" style={{ height: bodyHeight }}>
                                            {hours.map((hour, i) => (
                                                <div key={hour} className="absolute left-0 right-0 border-t border-black/40" style={{ top: i * ROW }} />
                                            ))}
                                            {placed.map(({ s, lane }) => {
                                                const top = ((minutes(s.start) - startHour * 60) / 60) * ROW + 2;
                                                const height = Math.max(((minutes(s.end) - minutes(s.start)) / 60) * ROW - 4, 30);
                                                return (
                                                    <div
                                                        key={s.id}
                                                        title={s.subject + DOT + (s.student || '') + DOT + fmtTime(s.start) + DASH + fmtTime(s.end) + DOT + s.status}
                                                        className={'absolute overflow-hidden rounded-xl border-[1.5px] border-black px-2 py-1 text-xs leading-tight ' + (BLOCK_STYLE[s.status] || BLOCK_STYLE.confirmed)}
                                                        style={{
                                                            top,
                                                            height,
                                                            left: 'calc(' + (lane * 100) / count + '% + 2px)',
                                                            width: 'calc(' + 100 / count + '% - 4px)',
                                                        }}
                                                    >
                                                        <div className="font-bold">{s.student || 'Student'}</div>
                                                        <div>{s.subject}</div>
                                                        <div className="text-[10px]">{fmtTime(s.start)}{DASH}{fmtTime(s.end)}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {sessions.length === 0 && (
                            <p className="py-4 text-center text-gray-700">No sessions on your schedule this week.</p>
                        )}
                    </div>

                    <section className="h-fit overflow-hidden rounded-3xl border-[1.5px] border-black bg-[#EAF1D1]">
                        <div className="border-b border-black px-5 py-4">
                            <h3 className="font-bold">Up next</h3>
                            <p className="text-sm">Your confirmed sessions</p>
                        </div>
                        <div className="space-y-4 p-4">
                            {upNext.length === 0 && (
                                <p className="text-sm text-gray-800">No confirmed sessions coming up. Sessions appear here once the studio confirms them.</p>
                            )}
                            {upNext.map((s) => (
                                <div key={s.id} className="rounded-2xl border-[1.5px] border-black bg-[#B3DFDF] p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="text-lg font-bold">{s.student || 'Student'}</div>
                                            <div>{s.subject}</div>
                                        </div>
                                        <span className="rounded-full bg-[#EAF1D1] px-3 py-1 text-sm">{LOCATION[s.location] || s.location}</span>
                                    </div>
                                    <div className="mt-2 text-sm">
                                        {shortDate(s.date)}{DOT}{fmtTime(s.start)}{DASH}{fmtTime(s.end)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}