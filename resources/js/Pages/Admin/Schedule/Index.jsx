import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AutoAssignModal from '@/Components/AutoAssignModal';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const DOT = ' \u00B7 ';
const DASH = ' \u2013 ';
const COLORS = ['#DDD3A0', '#F2B3B3', '#B3DFDF', '#B3F0B8', '#DCD6F7', '#F4D6A8', '#C9E4A8'];
const ROW = 76;
const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

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

export default function Index({ sessions = [], tutors = [], week }) {
    const [assigning, setAssigning] = useState(false);
    const start = parseDate(week.start);
    const days = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        return {
            iso: isoDate(date),
            name: DAY_NAMES[i],
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };
    });

    const colorOf = (id) => {
        const index = tutors.findIndex((t) => Number(t.id) === Number(id));
        return COLORS[(index < 0 ? Number(id) : index) % COLORS.length];
    };

    const startHour = Math.min(8, ...sessions.map((s) => Math.floor(minutes(s.start) / 60)));
    const endHour = Math.max(19, ...sessions.map((s) => Math.ceil(minutes(s.end) / 60)));
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
    const bodyHeight = (endHour - startHour) * ROW;
    const range = days[0].label + DASH + days[6].label;

    const navClass = 'rounded-full border-[1.5px] border-black bg-[#EAF1D1] px-4 py-2 shadow hover:opacity-80';

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-3xl font-bold text-gray-900" style={FONT_HEAD}>Schedule</h1>
                    <p className="text-lg text-gray-800">All booked sessions across tutors{DOT}color-coded per tutor</p>
                </div>
            }
        >
            <Head title="Schedule" />

            <div className="space-y-4 px-6 pb-12 pt-6 sm:px-8">
                <div className="flex flex-wrap items-center justify-end gap-3">
                    <div className="flex items-center gap-2">
                        <Link href={route('admin.schedule.index', { week: week.offset - 1 })} preserveScroll className={navClass} aria-label="Previous week">&lsaquo;</Link>
                        <Link href={route('admin.schedule.index')} preserveScroll className={navClass}>
                            {week.offset === 0 ? 'This week' : range}
                        </Link>
                        <Link href={route('admin.schedule.index', { week: week.offset + 1 })} preserveScroll className={navClass} aria-label="Next week">&rsaquo;</Link>
                        <button type="button" onClick={() => setAssigning(true)} className="rounded-full border-[1.5px] border-black bg-[#EAF1D1] px-5 py-2 shadow hover:opacity-80">&#10022; AI auto-assign</button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-lg">
                    {tutors.length === 0 && <span className="text-gray-700">No verified tutors yet.</span>}
                    {tutors.map((tutor) => (
                        <span key={tutor.id} className="inline-flex items-center gap-2">
                            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: colorOf(tutor.id) }} />
                            {tutor.name}
                        </span>
                    ))}
                </div>

                <div className="overflow-x-auto rounded-3xl border-[1.5px] border-black bg-[#EAF1D1] p-4">
                    <div className="min-w-[860px]">
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
                                                    title={s.subject + DOT + (s.tutor || '') + DOT + fmtTime(s.start) + DASH + fmtTime(s.end)}
                                                    className="absolute overflow-hidden rounded-xl border-[1.5px] border-black px-2 py-1 text-xs leading-tight"
                                                    style={{
                                                        top,
                                                        height,
                                                        left: 'calc(' + (lane * 100) / count + '% + 2px)',
                                                        width: 'calc(' + 100 / count + '% - 4px)',
                                                        backgroundColor: colorOf(s.tutor_id),
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
                </div>

                {sessions.length === 0 && (
                    <p className="text-center text-gray-700">No sessions are booked for this week.</p>
                )}
            </div>
            {assigning && <AutoAssignModal onClose={() => setAssigning(false)} />}
        </AuthenticatedLayout>
    );
}