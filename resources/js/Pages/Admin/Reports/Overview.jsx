import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const PESO = '\u20B1';
const DASH = ' \u2013 ';
const DOT = ' \u00B7 ';
const SUBJECT_COLORS = ['#5B9B4B', '#A66BE0', '#2EC4D6', '#D63A3A'];
const ATTENDED = '#8EDDDD';
const MISSED = '#F4A6A6';

function money(value) {
    const number = Number(value || 0);
    return PESO + number.toLocaleString('en-PH', {
        minimumFractionDigits: Number.isInteger(number) ? 0 : 2,
        maximumFractionDigits: 2,
    });
}

function compact(value) {
    return value >= 1000 ? PESO + value / 1000 + 'k' : PESO + value;
}

function scale(max, integer = false) {
    const m = integer ? Math.max(max, 4) : max;
    if (m <= 0) return { top: 1000, step: 250 };
    const raw = m / 4;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const options = integer ? [1, 2, 5, 10] : [1, 2, 2.5, 5, 10];
    const step = options.map((o) => o * mag).find((s) => s >= raw);
    return { top: step * 4, step };
}

function smoothPath(points) {
    if (points.length === 0) return '';
    if (points.length === 1) return 'M' + points[0].x + ' ' + points[0].y;
    let d = 'M' + points[0].x + ' ' + points[0].y;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] || points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;
        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;
        d += ' C' + c1x + ' ' + c1y + ',' + c2x + ' ' + c2y + ',' + p2.x + ' ' + p2.y;
    }
    return d;
}

function LineChart({ labels, series, integer = false, width = 880, height = 340, formatTick, formatValue, tipTitle, tipFill }) {
    const [hover, setHover] = useState(null);
    const L = 64;
    const R = 28;
    const T = 20;
    const B = 44;
    const innerW = width - L - R;
    const innerH = height - T - B;
    const max = Math.max(0, ...series.flatMap((s) => s.values));
    const { top, step } = scale(max, integer);
    const x = (i) => (labels.length < 2 ? L + innerW / 2 : L + (innerW * i) / (labels.length - 1));
    const y = (v) => T + innerH - (v / top) * innerH;
    const ticks = [0, 1, 2, 3, 4].map((i) => i * step);

    const onMove = (event) => {
        const box = event.currentTarget.getBoundingClientRect();
        const px = ((event.clientX - box.left) / box.width) * width;
        let best = 0;
        let bestDistance = Infinity;
        labels.forEach((_, i) => {
            const distance = Math.abs(x(i) - px);
            if (distance < bestDistance) {
                best = i;
                bestDistance = distance;
            }
        });
        setHover(best);
    };

    const tipW = 190;
    const tipH = 34 + series.length * 20;
    const tipX = hover === null ? 0 : (x(hover) + 16 + tipW > width - 4 ? x(hover) - 16 - tipW : x(hover) + 16);
    const tipY = T + 8;

    return (
        <svg viewBox={'0 0 ' + width + ' ' + height} className="w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img">
            {ticks.map((tick) => (
                <g key={tick}>
                    <line x1={L} x2={width - R} y1={y(tick)} y2={y(tick)} stroke="#777" strokeWidth="0.8" />
                    <text x={L - 10} y={y(tick) + 4} textAnchor="end" fontSize="13" fill="#333">{formatTick(tick)}</text>
                </g>
            ))}
            {labels.map((label, i) => (
                <text key={label + i} x={x(i)} y={height - 14} textAnchor="middle" fontSize="14" fill="#333">{label}</text>
            ))}
            {series.map((s) => (
                <path
                    key={s.name}
                    d={smoothPath(s.values.map((value, i) => ({ x: x(i), y: y(value) })))}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
            ))}
            {hover !== null && (
                <g pointerEvents="none">
                    <line x1={x(hover)} x2={x(hover)} y1={T} y2={T + innerH} stroke="#333" strokeWidth="1" />
                    {series.map((s) => (
                        <circle key={s.name} cx={x(hover)} cy={y(s.values[hover])} r="4.5" fill={s.color} stroke="#fff" strokeWidth="1.5" />
                    ))}
                    <rect x={tipX} y={tipY} width={tipW} height={tipH} rx="8" fill={tipFill} stroke="#333" strokeWidth="1" />
                    <text x={tipX + 14} y={tipY + 24} fontSize="15" fill="#111">{tipTitle(hover)}</text>
                    {series.map((s, idx) => (
                        <text key={s.name} x={tipX + 14} y={tipY + 46 + idx * 20} fontSize="14" fill={s.color}>
                            {s.name}: {formatValue(s.values[hover])}
                        </text>
                    ))}
                </g>
            )}
        </svg>
    );
}

function AttendanceChart({ weeks }) {
    const [hover, setHover] = useState(null);
    const W = 640;
    const H = 340;
    const L = 48;
    const R = 16;
    const T = 20;
    const B = 44;
    const innerW = W - L - R;
    const innerH = H - T - B;
    const max = Math.max(0, ...weeks.map((w) => w.attended + w.missed));
    const { top, step } = scale(max, true);
    const slot = innerW / weeks.length;
    const barW = Math.min(64, slot * 0.6);
    const y = (v) => T + innerH - (v / top) * innerH;
    const ticks = [0, 1, 2, 3, 4].map((i) => i * step);
    const tipW = 150;
    const tipH = 82;
    const current = hover === null ? null : weeks[hover];
    const tipX = hover === null ? 0 : Math.max(4, Math.min(W - tipW - 4, L + slot * hover + slot / 2 - tipW / 2));
    const tipY = current ? Math.max(4, y(current.attended + current.missed) - tipH - 8) : 0;

    return (
        <svg viewBox={'0 0 ' + W + ' ' + H} className="w-full" onMouseLeave={() => setHover(null)} role="img">
            {ticks.map((tick) => (
                <g key={tick}>
                    <line x1={L} x2={W - R} y1={y(tick)} y2={y(tick)} stroke="#777" strokeWidth="0.8" />
                    <text x={L - 8} y={y(tick) + 4} textAnchor="end" fontSize="13" fill="#333">{tick}</text>
                </g>
            ))}
            {weeks.map((w, i) => {
                const bx = L + slot * i + (slot - barW) / 2;
                return (
                    <g key={w.label}>
                        {hover === i && <rect x={L + slot * i} y={T} width={slot} height={innerH} fill="#D0D0D0" />}
                        <rect x={bx} y={y(w.attended)} width={barW} height={y(0) - y(w.attended)} fill={ATTENDED} stroke="#222" strokeWidth="0.8" />
                        <rect x={bx} y={y(w.attended + w.missed)} width={barW} height={y(w.attended) - y(w.attended + w.missed)} fill={MISSED} stroke="#222" strokeWidth="0.8" />
                        <text x={bx + barW / 2} y={H - 14} textAnchor="middle" fontSize="14" fill="#333">{w.label}</text>
                        <rect x={L + slot * i} y={T} width={slot} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} />
                    </g>
                );
            })}
            {current && (
                <g pointerEvents="none">
                    <rect x={tipX} y={tipY} width={tipW} height={tipH} rx="8" fill="#fff" stroke="#333" strokeWidth="1" />
                    <text x={tipX + 14} y={tipY + 24} fontSize="15" fill="#111">{current.label}</text>
                    <text x={tipX + 14} y={tipY + 46} fontSize="14" fill="#2AA9A9">Attended: {current.attended}</text>
                    <text x={tipX + 14} y={tipY + 66} fontSize="14" fill="#D9707A">Missed: {current.missed}</text>
                </g>
            )}
        </svg>
    );
}
function Card({ title, subtitle, footer, children }) {
    return (
        <section className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-white">
            <div className="border-b border-black/60 px-6 py-4">
                <h3 className="text-2xl" style={FONT_HEAD}>{title}</h3>
                {subtitle && <p className="text-gray-700">{subtitle}</p>}
            </div>
            <div className="px-4 py-4">{children}</div>
            {footer && <div className="border-t border-black/60 px-6 py-4 text-gray-800">{footer}</div>}
        </section>
    );
}

function Legend({ items }) {
    return (
        <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
            {items.map((item) => (
                <span key={item.name} className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                </span>
            ))}
        </div>
    );
}

export default function Overview({ months = [], revenue, attendance, progress, range }) {
    const labels = months.map((m) => m.label);
    const shorts = months.map((m) => m.short);
    const hasRevenue = revenue.series.some((v) => v > 0);
    const subjects = progress.subjects || [];
    const progressSeries = subjects.map((s, i) => ({
        name: s.name,
        color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
        values: s.series,
    }));
    const best = subjects.length > 0 ? subjects[0] : null;
    const rate = attendance.rate;
    const topMissed = attendance.topMissed;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-3xl font-bold text-gray-900" style={FONT_HEAD}>Reports</h1>
                    <p className="text-lg text-gray-800">
                        {range.from}{DASH}{range.to} {range.year}{DOT}attendance, progress and revenue
                    </p>
                </div>
            }
        >
            <Head title="Reports" />

            <div className="space-y-6 px-6 pb-12 pt-6 sm:px-8">
                <Card title="Revenue trend" subtitle={'Total booked ' + money(revenue.totalBooked) + ' across all service types'}>
                    <LineChart
                        labels={labels}
                        series={[{ name: 'Total Revenue', color: '#B91C1C', values: revenue.series }]}
                        formatTick={compact}
                        formatValue={money}
                        tipTitle={(i) => labels[i]}
                        tipFill="#B3DFDF"
                    />
                    {!hasRevenue && (
                        <p className="mt-2 text-center text-sm text-gray-700">No paid payments in this period yet. Revenue appears once payments are marked as paid.</p>
                    )}
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card
                        title="Attendance"
                        subtitle="Sessions attended vs missed, last 5 weeks"
                        footer={
                            rate === null ? (
                                'No completed or cancelled sessions in the last 5 weeks yet.'
                            ) : (
                                <>
                                    Attendance holding at <strong>{rate}%</strong>. Missed means cancelled sessions.
                                    {topMissed && topMissed.count > 0 ? ' Most cancelled: ' + topMissed.name + ' (' + topMissed.count + ').' : ''}
                                </>
                            )
                        }
                    >
                        <AttendanceChart weeks={attendance.weeks} />
                        <Legend items={[{ name: 'Attended', color: ATTENDED }, { name: 'Missed', color: MISSED }]} />
                    </Card>

                    <Card
                        title="Sessions completed over time"
                        subtitle="Completed sessions per subject, by month"
                        footer={
                            best
                                ? best.name + ' has the most completed sessions (' + best.total + ') in this period.'
                                : 'Completed sessions appear here as lessons are finished.'
                        }
                    >
                        {progressSeries.length === 0 ? (
                            <p className="px-2 py-10 text-center text-gray-700">No completed sessions in this period yet.</p>
                        ) : (
                            <>
                                <LineChart
                                    labels={shorts}
                                    series={progressSeries}
                                    integer
                                    width={560}
                                    height={360}
                                    formatTick={(v) => v}
                                    formatValue={(v) => v}
                                    tipTitle={(i) => labels[i]}
                                    tipFill="#FFFFFF"
                                />
                                <Legend items={progressSeries} />
                            </>
                        )}
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}