import { Head, Link } from '@inertiajs/react';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const PESO = '\u20B1';
const DOT = ' \u00B7 ';
const LOCATION = { onsite: 'On-site', home: 'Home based', online: 'Online' };
const METHOD = { gcash: 'GCash', maya: 'Maya', card: 'Card' };

function money(value) {
    return PESO + Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function plain(value) {
    return PESO + Number(value || 0).toLocaleString('en-PH', { maximumFractionDigits: 2 });
}

function longDate(value) {
    const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function fmtTime(value) {
    const [h, m] = String(value).split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return hour + ':' + String(m).padStart(2, '0') + ' ' + suffix;
}

function hoursText(hours) {
    return Number(hours) === 1 ? '1 hr' : Number(hours) + ' hrs';
}

function Row({ label, value }) {
    return (
        <div className="flex justify-between gap-6">
            <span className="text-gray-700">{label}</span>
            <span className="text-right">{value}</span>
        </div>
    );
}

export default function Receipt({ receipt }) {
    const r = receipt;
    const type = r.session_type === 'class' ? 'Class' : '1-on-1';
    const timed = r.kind === 'academic';
    const service = timed ? r.grade + DOT + r.subject + ' (' + hoursText(r.hours) + ')' : r.subject + DOT + type;
    const tier = timed && r.band_min
        ? 'Grades ' + r.band_min + '\u2013' + r.band_max + DOT + (r.core ? 'special subject' : 'regular subject')
        : r.kind === 'special' ? 'Special Teaching' : 'Flat per session';
    const method = r.method_label ? 'Paid with ' + r.method_label : r.method ? 'Paid with ' + (METHOD[r.method] || r.method) : 'Payment recorded by the studio';

    return (
        <div className="min-h-screen bg-white px-4 py-10" style={{ fontFamily: "'Lora', Georgia, serif" }}>
            <Head title={'Receipt ' + r.invoice} />
            <div className="mx-auto max-w-5xl">
                <div className="rounded-3xl border-[1.5px] border-black bg-[#B3DFDF]">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/40 px-8 py-6">
                        <div className="flex items-center gap-4">
                            <span className="flex h-16 w-16 items-center justify-center rounded-xl border border-black bg-[#EAF1D1] text-2xl font-bold" style={FONT_HEAD}>HK</span>
                            <h1 className="text-3xl font-bold" style={FONT_HEAD}>Happy Kid Arts &amp; Tutorials</h1>
                        </div>
                        <div className="text-right">
                            <div className="text-gray-700">Receipt</div>
                            <div className="text-3xl" style={FONT_HEAD}>{r.invoice}</div>
                            <div className="text-gray-700">Issued {longDate(r.issued)}</div>
                        </div>
                    </div>

                    <div className="grid gap-6 px-8 py-6 md:grid-cols-2">
                        <div className="space-y-2 text-lg">
                            <div className="text-gray-700">Session summary</div>
                            <Row label="Student" value={r.student} />
                            <Row label="Service" value={service} />
                            <Row label="Tutor" value={r.tutor || '-'} />
                            <Row label="Date" value={longDate(r.date)} />
                            <Row label="Time" value={fmtTime(r.start) + DOT + hoursText(r.hours)} />
                            <Row label="Rate tier applied" value={tier} />
                            <Row label="Location" value={LOCATION[r.location] || r.location} />
                        </div>
                        <div className="rounded-2xl border border-black bg-[#EAF1D1] p-5 text-lg">
                            <div className="text-gray-700">Rate Breakdown</div>
                            <div className="mt-2 space-y-1">
                                {timed && r.hourly ? (
                                    <>
                                        <Row label={'Grades ' + r.band_min + '\u2013' + r.band_max + DOT + r.subject} value={plain(r.hourly) + '/hr'} />
                                        <Row label={'Duration \u00D7 ' + hoursText(r.hours)} value={plain(r.hourly * r.hours)} />
                                    </>
                                ) : (
                                    <Row label={r.subject + DOT + type} value={tier} />
                                )}
                            </div>
                            {r.tip > 0 && <div className="mt-2 flex justify-between"><span>Tip for tutor</span><span>{plain(r.tip)}</span></div>}
                            <div className="mt-6 flex justify-between border-t border-black/40 pt-3 text-2xl" style={FONT_HEAD}>
                                <span>Total paid</span>
                                <span>{money(r.amount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/40 px-8 py-5">
                        <div className="flex items-center gap-3">
                            <span className="rounded-full bg-[#B8F2C0] px-4 py-1">&#10003; Paid</span>
                            <span className="text-gray-700">{method}{r.reference ? DOT + r.reference : ''}</span>
                        </div>
                        <div className="flex gap-3 print:hidden">
                            <button type="button" onClick={() => window.print()} className="rounded-xl border-[1.5px] border-black bg-white px-5 py-2 hover:opacity-80">Download receipt</button>
                            <Link href={route('parent.dashboard')} className="rounded-xl border-[1.5px] border-black bg-[#EAF1D1] px-5 py-2 hover:opacity-80">Back to dashboard</Link>
                        </div>
                    </div>
                </div>
                <p className="mt-4 text-center text-gray-800">Happy Kid Arts and Tutorials &middot; Imus, Cavite &middot; This receipt is valid without a signature.</p>
            </div>
        </div>
    );
}