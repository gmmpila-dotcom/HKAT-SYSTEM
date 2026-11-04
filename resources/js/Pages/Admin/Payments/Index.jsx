import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { formatDate } from '@/utils/formatDate';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const PESO = '\u20B1';
const DOT = ' \u00B7 ';
const DASH = '\u2013';

const CATEGORY = {
    academic: { label: 'Academic Tutoring', color: '#FDE08A' },
    special: { label: 'Special teaching', color: '#F4906A' },
    arts: { label: 'Art lessons', color: '#8EDDDD' },
    home: { label: 'Home-based', color: '#FDF3D8' },
};
const ORDER = ['academic', 'special', 'arts', 'home'];
const SERVICE_LABEL = {
    academic: 'Academic Tutoring',
    special: 'Special Teaching',
    arts: 'Art Lesson',
    home: 'Home-based Session',
};
const STATUS_STYLES = {
    pending: 'bg-[#FBE7A6]',
    paid: 'bg-[#8EDDDD]',
    failed: 'bg-[#F2B3B3]',
};

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

function fmtTime(value) {
    if (!value) return '';
    const [h, m] = String(value).split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return hour + ':' + String(m).padStart(2, '0') + ' ' + suffix;
}

function hoursLabel(hours) {
    return Number(hours) === 1 ? '1 hr' : Number(hours) + ' hrs';
}

function rateApplied(p) {
    if (p.category === 'special') return 'Flat rate';
    if (p.category === 'arts') return 'Course rate';
    if (p.rate === null || p.rate === undefined) return '-';
    return money(p.rate) + '/hr' + (p.category === 'home' ? ' + fare' : '');
}

function describe(p) {
    const parts = [];
    const timed = p.category === 'academic' || p.category === 'home';
    if (timed && p.grade) parts.push(p.grade);
    if (p.subject) parts.push(p.subject);
    const base = parts.join(DOT);
    if (timed) return base + ' (' + hoursLabel(p.hours) + ')';
    return base + DOT + (p.session_type === 'class' ? 'Class' : '1-on-1');
}

function scale(max) {
    if (max <= 0) return { top: 1000, step: 250 };
    const raw = max / 4;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
    return { top: step * 4, step };
}

function RevenueChart({ data }) {
    const labels = data.labels;
    const series = data.series;
    const totals = labels.map((_, i) => ORDER.reduce((sum, key) => sum + Number((series[key] || [])[i] || 0), 0));
    const { top, step } = scale(Math.max(0, ...totals));
    const W = 640;
    const H = 300;
    const L = 64;
    const R = 16;
    const T = 16;
    const B = 40;
    const innerW = W - L - R;
    const innerH = H - T - B;
    const slot = innerW / Math.max(labels.length, 1);
    const barW = Math.min(64, slot * 0.5);
    const y = (value) => T + innerH - (value / top) * innerH;
    const ticks = [0, 1, 2, 3, 4].map((i) => i * step);

    return (
        <svg viewBox={'0 0 ' + W + ' ' + H} className="w-full" role="img" aria-label="Revenue by service type">
            {ticks.map((tick) => (
                <g key={tick}>
                    <line x1={L} x2={W - R} y1={y(tick)} y2={y(tick)} stroke="#777" strokeWidth="0.8" />
                    <text x={L - 8} y={y(tick) + 4} textAnchor="end" fontSize="12" fill="#333">{compact(tick)}</text>
                </g>
            ))}
            {labels.map((label, i) => {
                let acc = 0;
                const x = L + slot * i + (slot - barW) / 2;
                return (
                    <g key={label + i}>
                        {ORDER.map((key) => {
                            const value = Number((series[key] || [])[i] || 0);
                            if (value <= 0) return null;
                            const rect = (
                                <rect key={key} x={x} y={y(acc + value)} width={barW} height={y(acc) - y(acc + value)} fill={CATEGORY[key].color} stroke="#222" strokeWidth="0.8" />
                            );
                            acc += value;
                            return rect;
                        })}
                        <text x={x + barW / 2} y={H - 14} textAnchor="middle" fontSize="13" fill="#333">{label}</text>
                    </g>
                );
            })}
        </svg>
    );
}
function RateCard({ rates, tutors = [], tutorRates = {} }) {
    const bands = (rates && rates.bands) || [];
    const stdSpecial = rates ? rates.special_teaching_per_session : 500;
    const stdHome = rates ? rates.home_minimum_per_hour : 350;
    const arts = (rates && rates.arts) || { drawing: 1200, painting: 1500 };
    const [tutorId, setTutorId] = useState('');
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    const custom = tutorId ? tutorRates[tutorId] || null : null;
    const own = (band, key) => {
        const row = custom && custom.bands && custom.bands[band.min];
        return row && row[key] !== undefined && row[key] !== null ? Number(row[key]) : null;
    };
    const pick = (band, key) => (own(band, key) !== null ? own(band, key) : band[key]);
    const special = custom && custom.special !== undefined && custom.special !== null ? Number(custom.special) : stdSpecial;
    const home = custom && custom.home !== undefined && custom.home !== null ? Number(custom.home) : stdHome;
    const tutorName = (tutors.find((t) => String(t.id) === String(tutorId)) || {}).name;

    const begin = () => {
        const next = { special: String(special), home: String(home) };
        bands.forEach((b) => {
            next['r' + b.min] = String(pick(b, 'regular'));
            next['c' + b.min] = String(pick(b, 'core'));
        });
        setForm(next);
        setErrors({});
        setEditing(true);
    };

    const choose = (value) => {
        setTutorId(value);
        setEditing(false);
        setErrors({});
    };

    const save = () => {
        const payload = { bands: {}, special: form.special, home: form.home };
        bands.forEach((b) => {
            payload.bands[b.min] = { regular: form['r' + b.min], core: form['c' + b.min] };
        });
        setBusy(true);
        router.put(route('admin.tutor-rates.update', tutorId), payload, {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
            onError: setErrors,
            onFinish: () => setBusy(false),
        });
    };

    const reset = () => {
        if (!window.confirm('Use the standard rates for ' + tutorName + '?')) return;
        router.delete(route('admin.tutor-rates.destroy', tutorId), { preserveScroll: true, onSuccess: () => setEditing(false) });
    };

    const Box = ({ name }) => (
        <span className="inline-flex items-center gap-1">
            {PESO}
            <input
                type="text"
                inputMode="decimal"
                value={form[name] === undefined ? '' : form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value.replace(/[^0-9.]/g, '') })}
                className="w-24 rounded-lg border-[1.5px] border-black bg-[#E8F6F8] px-2 py-1 focus:border-black focus:ring-0"
            />
        </span>
    );

    const firstError = Object.values(errors)[0];

    return (
        <section className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-[#B3DFDF]">
            <div className="px-6 py-4">
                <h3 className="text-2xl" style={FONT_HEAD}>Rate Card</h3>
                <p className="text-gray-700">Applied automatically when a session is booked</p>
                <label className="mt-3 block text-sm text-gray-800">Rates for
                    <select value={tutorId} onChange={(e) => choose(e.target.value)} className="mt-1 block w-full rounded-xl border-[1.5px] border-black bg-white py-1 focus:border-black focus:ring-0">
                        <option value="">Standard rate card</option>
                        {tutors.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}{tutorRates[t.id] ? ' (custom rates)' : ''}</option>
                        ))}
                    </select>
                </label>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    {!editing && (
                        <button type="button" disabled={!tutorId} onClick={begin} title={tutorId ? '' : 'Choose a tutor first'} className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-black bg-white px-4 py-1 hover:opacity-80 disabled:opacity-40">&#9998; Edit rates</button>
                    )}
                    {editing && (
                        <>
                            <button type="button" onClick={() => setEditing(false)} className="rounded-xl border-[1.5px] border-black bg-white px-4 py-1 hover:opacity-80">&#10005; Cancel</button>
                            <button type="button" disabled={busy} onClick={save} className="rounded-xl border-[1.5px] border-black bg-[#EAF1D1] px-4 py-1 hover:opacity-80 disabled:opacity-50">&#10003; {busy ? 'Saving...' : 'Save rates'}</button>
                        </>
                    )}
                    {custom && !editing && (
                        <button type="button" onClick={reset} className="rounded-xl border-[1.5px] border-black bg-white px-3 py-1 text-sm hover:opacity-80">Use standard rates</button>
                    )}
                </div>
                {!tutorId && <p className="mt-2 text-sm text-gray-700">Choose a tutor to edit their rates. The standard card applies to everyone else.</p>}
                {firstError && <p className="mt-2 text-sm text-red-700">{firstError}</p>}
            </div>
            <div className="text-lg">
                <div className="grid grid-cols-3 gap-2 border-t border-black/40 bg-[#EAF1D1] px-6 py-3">
                    <span>Grade level</span>
                    <span>Regular</span>
                    <span>Math / Sci / Eng</span>
                </div>
                {bands.map((band) => (
                    <div key={band.min} className="grid grid-cols-3 items-center gap-2 border-t border-black/40 px-6 py-3">
                        <span>Grades {band.min}{DASH}{band.max}</span>
                        {editing ? Box({ name: 'r' + band.min }) : <span>{PESO}{pick(band, 'regular')}/hr</span>}
                        {editing ? Box({ name: 'c' + band.min }) : <span>{PESO}{pick(band, 'core')}/hr</span>}
                    </div>
                ))}
                <div className="grid grid-cols-3 items-center gap-2 border-t border-black/40 px-6 py-3">
                    <span className="col-span-2">Special Teaching (Special needs)</span>
                    {editing ? Box({ name: "special" }) : <span>{PESO}{special}/session</span>}
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-black/40 px-6 py-3">
                    <span>Drawing<br />Painting</span>
                    <span className="col-span-2 text-base">{PESO}{arts.drawing}/session<br />{PESO}{arts.painting}/session<br />1-on-1 or class, per head</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-2 border-t border-black/40 px-6 py-3">
                    <span className="col-span-2">Private / home-based</span>
                    {editing ? Box({ name: "home" }) : <span>min {PESO}{home}/hr</span>}
                </div>
                <p className="m-4 rounded-2xl border border-black/60 bg-[#EAF1D1] p-3 text-base">
                    Private / home-based teaching starts at {PESO}{home}/hr and adds transportation fare, confirmed with the parent before the session.
                </p>
            </div>
        </section>
    );
}

function InvoiceModal({ payment, onClose }) {
    if (!payment) return null;

    const rows = [
        ['Invoice no.', payment.invoice],
        ['Date', formatDate(payment.date)],
        ['Student', payment.student || '-'],
        ['Tutor', payment.tutor || '-'],
        ['Service', SERVICE_LABEL[payment.category] + (payment.subject ? DOT + payment.subject : '')],
        ['Session', payment.session_date ? formatDate(payment.session_date) + DOT + fmtTime(payment.start_time) + ' - ' + fmtTime(payment.end_time) : '-'],
        ['Rate applied', rateApplied(payment)],
        ['Status', payment.status],
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl" style={FONT_HEAD}>Invoice</h3>
                    <button type="button" onClick={onClose} aria-label="Close" className="rounded-full px-2 text-2xl leading-none hover:bg-gray-100">&times;</button>
                </div>
                <div className="mt-4 space-y-2 rounded-2xl border-[1.5px] border-black bg-[#EAF1D1] p-4 text-sm">
                    {rows.map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-4">
                            <span className="text-gray-700">{label}</span>
                            <span className="text-right capitalize">{value}</span>
                        </div>
                    ))}
                    <div className="flex justify-between border-t border-black/40 pt-2 text-lg font-bold">
                        <span>Total</span>
                        <span>{money(payment.amount)}</span>
                    </div>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => window.print()} className="rounded-full border-[1.5px] border-black bg-[#EAF1D1] px-5 py-2 hover:opacity-80">Print</button>
                    <button type="button" onClick={onClose} className="rounded-full border-[1.5px] border-black bg-white px-5 py-2 hover:opacity-80">Close</button>
                </div>
            </div>
        </div>
    );
}

export default function Index({ payments = [], charts, totals = {}, rates, tutors = [], tutorRates = {} }) {
    const [range, setRange] = useState('week');
    const [invoice, setInvoice] = useState(null);
    const data = charts[range];

    const cashPaid = (id) => {
        const who = window.prompt('Who received the cash? Type owner or tutor.', 'owner');
        if (!who) return;
        router.patch(route('admin.payments.cash', id), { received_by: who.trim().toLowerCase() }, {
            preserveScroll: true,
            onError: (e) => window.alert(Object.values(e)[0] || 'Could not record the cash payment.'),
        });
    };

    const markPaid = (id) => {
        router.patch(route('admin.payments.mark-paid', id), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-3xl font-bold text-gray-900" style={FONT_HEAD}>Payments</h1>
                    <p className="text-lg text-gray-800">Last 30 days{DOT}rates applied from the current rate card</p>
                </div>
            }
        >
            <Head title="Payments" />
            <style>{`@media print { body * { visibility: hidden; } #revenue-print, #revenue-print * { visibility: visible; } #revenue-print { position: absolute; left: 0; top: 0; width: 100%; border: 1px solid #000; } }`}</style>

            <div className="space-y-6 px-6 pb-12 pt-6 sm:px-8">
                <div className="grid gap-6 lg:grid-cols-5">
                    <section id="revenue-print" className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-white lg:col-span-3">
                        <div className="hidden print:block border-b border-black/40 px-6 py-3 text-sm">Happy Kid Arts and Tutorials &middot; Revenue report &middot; Printed {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/40 px-6 py-4">
                            <div>
                                <h3 className="text-2xl" style={FONT_HEAD}>Revenue by service type</h3>
                                <p className="text-gray-700">Last {data.labels.length} {range === 'week' ? 'weeks' : 'months'}</p>
                            </div>
                            <button type="button" onClick={() => window.print()} className="print:hidden rounded-xl border-[1.5px] border-black bg-white px-4 py-1 hover:opacity-80">Print</button>
                            <div className="flex gap-2 rounded-2xl border-[1.5px] border-black p-1 print:hidden">
                                {[{ key: 'week', label: 'By Week' }, { key: 'month', label: 'By Month' }].map((option) => (
                                    <button
                                        key={option.key}
                                        type="button"
                                        onClick={() => setRange(option.key)}
                                        className={'rounded-xl border border-black/60 px-3 py-1 text-sm ' + (range === option.key ? 'bg-[#EAF1D1]' : 'bg-white')}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="px-4 py-4">
                            <RevenueChart data={data} />
                            <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
                                {ORDER.map((key) => (
                                    <span key={key} className="inline-flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CATEGORY[key].color }} />
                                        {CATEGORY[key].label}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-black/40 px-6 py-4">
                            <div>
                                <div className="text-sm uppercase tracking-wide text-gray-700">Collected</div>
                                <div className="text-xl">{money(totals.collected)}</div>
                            </div>
                            <div>
                                <div className="text-sm uppercase tracking-wide text-gray-700">Pending</div>
                                <div className="text-xl">{money(totals.pending)}</div>
                            </div>
                        </div>
                    </section>

                    <div className="lg:col-span-2">
                        <RateCard rates={rates} tutors={tutors} tutorRates={tutorRates} />
                    </div>
                </div>

                <section className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-white">
                    <div className="border-b border-black/40 px-6 py-4">
                        <h3 className="text-2xl" style={FONT_HEAD}>Invoices</h3>
                        <p className="text-gray-700">{payments.length} {payments.length === 1 ? 'record' : 'records'}</p>
                    </div>
                    {payments.length === 0 ? (
                        <p className="px-6 py-5 text-gray-800">No payments yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] text-left text-sm">
                                <thead className="bg-[#B3DFDF] text-base">
                                    <tr>
                                        <th className="px-6 py-3 font-normal">Student</th>
                                        <th className="px-3 py-3 font-normal">Service</th>
                                        <th className="px-3 py-3 font-normal">Description</th>
                                        <th className="px-3 py-3 font-normal">Rate Applied</th>
                                        <th className="px-3 py-3 font-normal">Amount</th>
                                        <th className="px-3 py-3 font-normal">Date</th>
                                        <th className="px-3 py-3 font-normal">Status</th>
                                        <th className="px-6 py-3 font-normal">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p) => (
                                        <tr key={p.id} className="border-t border-black/30 align-top">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold">{p.student || '-'}</div>
                                                <div className="text-xs text-gray-600">{p.invoice}</div>
                                            </td>
                                            <td className="px-3 py-4">{SERVICE_LABEL[p.category]}</td>
                                            <td className="px-3 py-4">{describe(p)}</td>
                                            <td className="px-3 py-4">{rateApplied(p)}</td>
                                            <td className="px-3 py-4">{money(p.amount)}</td>
                                            <td className="px-3 py-4">{formatDate(p.date)}</td>
                                            <td className="px-3 py-4">
                                                <span className={'inline-flex rounded-full border border-black/50 px-3 py-0.5 capitalize ' + (STATUS_STYLES[p.status] || 'bg-white')}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {p.status === 'pending' && (
                                                        <button type="button" onClick={() => markPaid(p.id)} className="rounded-xl border-[1.5px] border-black bg-[#EAF1D1] px-3 py-1 hover:opacity-80">
                                                            Mark paid
                                                        </button>
                                                    )}
                                                    <button type="button" onClick={() => setInvoice(p)} className="rounded-xl border-[1.5px] border-black bg-white px-3 py-1 hover:opacity-80">
                                                        Generate Invoice</button>
                                                    {p.status === 'pending' && (
                                                        <button type="button" onClick={() => cashPaid(p.id)} className="rounded-xl border-[1.5px] border-black bg-white px-3 py-1 hover:opacity-80">Cash received</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            <InvoiceModal payment={invoice} onClose={() => setInvoice(null)} />
        </AuthenticatedLayout>
    );
}