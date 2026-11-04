import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { formatDate } from '@/utils/formatDate';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const PESO = '\u20B1';
const DOT = ' \u00B7 ';
const MASK = '\u2022\u2022\u2022\u2022';
const NAMES = { gcash: 'GCash', bpi: 'BPI Bank Transfer' };
const BRAND = { gcash: '#2563C9', bpi: '#9E1B1B' };
const STATUS_STYLES = { pending: 'bg-[#FBE7A6]', paid: 'bg-[#B8F2C0]', failed: 'bg-[#F2B3B3]' };
const FIELD = 'mt-1 block w-full rounded-2xl border-[1.5px] border-black bg-white px-4 py-3 focus:border-black focus:ring-0';

function money(value) {
    const number = Number(value || 0);
    return PESO + number.toLocaleString('en-PH', { minimumFractionDigits: Number.isInteger(number) ? 0 : 2, maximumFractionDigits: 2 });
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

function typeLabel(type) {
    return type === 'class' ? 'Class' : '1-on-1';
}

function methodText(method) {
    return method ? NAMES[method.type] + ' ' + MASK + ' ' + method.last4 : '';
}

function serviceText(payment) {
    const s = payment.session || {};
    const b = payment.breakdown;
    const student = s.student_profile || {};
    if (b && b.kind === 'academic') return student.grade_level + DOT + s.subject + ' (' + hoursLabel(b.hours) + ')';
    return s.subject + DOT + typeLabel(s.session_type);
}

function rateApplied(payment) {
    const b = payment.breakdown;
    if (!b) return '-';
    if (b.kind === 'special') return 'Flat rate';
    if (b.kind === 'arts') return 'Flat per session';
    return money(b.hourly) + '/hr';
}

function baseFee(payment) {
    return Number(payment.amount) - Number(payment.tip_amount || 0);
}

function Shell({ children, onClose, wide = false }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className={'max-h-[92vh] w-full overflow-y-auto rounded-3xl bg-white shadow-xl ' + (wide ? 'max-w-xl' : 'max-w-lg')} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}

function Buttons({ left, right }) {
    return <div className="mt-6 grid grid-cols-2 gap-4">{left}{right}</div>;
}

const GHOST = 'rounded-xl border-[1.5px] border-black bg-white py-2 text-lg hover:opacity-80';
const SOLID = 'rounded-xl border-[1.5px] border-black bg-[#EAF1D1] py-2 text-lg hover:opacity-80 disabled:opacity-50';

function SummaryRows({ fee, tip, total }) {
    return (
        <div className="rounded-2xl border border-black p-4 text-lg">
            <div className="flex justify-between"><span>Session fee</span><span>{money(fee)}</span></div>
            <div className="flex justify-between"><span>Tip</span><span>{money(tip)}</span></div>
            <div className="mt-4 flex justify-between border-t border-black/50 pt-3 text-xl font-bold"><span>Total Amount</span><span>{money(total)}</span></div>
        </div>
    );
}

function TipModal({ payment, onClose }) {
    const presets = [50, 100, 200];
    const current = Number(payment.tip_amount || 0);
    const [choice, setChoice] = useState(current > 0 && !presets.includes(current) ? 'custom' : current || 50);
    const [custom, setCustom] = useState(current > 0 && !presets.includes(current) ? String(current) : '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const tip = choice === 'custom' ? Number(custom || 0) : Number(choice);
    const fee = baseFee(payment);

    const save = (value) => {
        setBusy(true);
        router.post(route('parent.payments.tip', payment.id), { tip: value }, {
            preserveScroll: true,
            onSuccess: onClose,
            onError: (errors) => setError(errors.tip || 'Could not save the tip.'),
            onFinish: () => setBusy(false),
        });
    };

    return (
        <Shell onClose={onClose}>
            <div className="p-6">
                <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#B3DFDF] text-2xl text-white">&#9829;</span>
                    <div>
                        <h3 className="text-2xl font-bold" style={FONT_HEAD}>Add a Tip for your Tutor</h3>
                        <p className="text-gray-700">Optional &mdash; show your appreciation</p>
                    </div>
                </div>
                <div className="mt-5 grid grid-cols-4 gap-3">
                    {presets.map((value) => (
                        <button key={value} type="button" onClick={() => setChoice(value)} className={'rounded-2xl border-[1.5px] border-black py-6 text-xl ' + (choice === value ? 'bg-[#B3DFDF]' : 'bg-white')}>{PESO}{value}</button>
                    ))}
                    <button type="button" onClick={() => setChoice('custom')} className={'rounded-2xl border-[1.5px] border-black py-6 text-xl ' + (choice === 'custom' ? 'bg-[#B3DFDF]' : 'bg-white')}>Custom</button>
                </div>
                {choice === 'custom' && (
                    <input type="number" min="0" max="5000" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Enter an amount" className={FIELD} />
                )}
                {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
                <div className="mt-5"><SummaryRows fee={fee} tip={tip} total={fee + tip} /></div>
                <Buttons
                    left={<button type="button" onClick={onClose} className={GHOST}>Cancel</button>}
                    right={<button type="button" disabled={busy || tip < 0} onClick={() => save(tip)} className={SOLID}>{busy ? 'Saving...' : 'Add Tip'}</button>}
                />
                {current > 0 && <button type="button" onClick={() => save(0)} className="mt-3 w-full text-center underline">Remove tip</button>}
            </div>
        </Shell>
    );
}

function MethodModal({ current, onClose }) {
    const [type, setType] = useState(current ? current.type : 'gcash');
    const [number, setNumber] = useState('');
    const [name, setName] = useState(current ? current.name : '');
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    const save = () => {
        setBusy(true);
        router.patch(route('parent.payment-method.update'), { type, number, name }, {
            preserveScroll: true,
            onSuccess: onClose,
            onError: setErrors,
            onFinish: () => setBusy(false),
        });
    };

    const Option = ({ value, title, sub }) => (
        <label className={'flex cursor-pointer items-center gap-3 rounded-2xl border border-black/60 px-4 py-3 ' + (type === value ? 'bg-[#D6EEF0]' : '')}>
            <input type="radio" name="type" checked={type === value} onChange={() => setType(value)} />
            <span className="font-bold" style={{ color: BRAND[value] }}>{value === 'gcash' ? 'G' : 'BPI'}</span>
            <span><span className="block text-lg">{title}</span><span className="block text-sm text-gray-600">{sub}</span></span>
        </label>
    );

    return (
        <Shell onClose={onClose}>
            <div className="p-6">
                <h3 className="text-2xl font-bold" style={FONT_HEAD}>Update Payment Method</h3>
                {current && (
                    <>
                        <p className="mt-4 text-lg">Current payment method</p>
                        <div className="mt-2 rounded-2xl bg-[#B3DFDF] p-4 text-lg">
                            {methodText(current)}
                            <div className="text-sm text-gray-700">Payment method on file &middot; {current.name}</div>
                        </div>
                    </>
                )}
                <p className="mt-5 text-lg">Choose a new payment method</p>
                <div className="mt-2 space-y-2">
                    <Option value="gcash" title="GCash" sub="Mobile wallet - fast and secure" />
                    <Option value="bpi" title="Bank Transfer (BPI)" sub="Pay from your BPI account" />
                </div>
                <label className="mt-4 block text-lg">{type === 'gcash' ? 'GCash Number' : 'Account Number'}
                    <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder={type === 'gcash' ? '09XX XXX XXXX' : 'Account number'} className={FIELD} />
                </label>
                {errors.number && <p className="mt-1 text-sm text-red-700">{errors.number}</p>}
                <label className="mt-3 block text-lg">Account Name
                    <input value={name} onChange={(e) => setName(e.target.value)} className={FIELD} />
                </label>
                {errors.name && <p className="mt-1 text-sm text-red-700">{errors.name}</p>}
                <p className="mt-3 text-sm text-gray-600">Only the last 4 digits are kept. The full number is never stored.</p>
                <Buttons
                    left={<button type="button" onClick={onClose} className={GHOST}>Cancel</button>}
                    right={<button type="button" disabled={busy} onClick={save} className={SOLID}>{busy ? 'Saving...' : 'Save Changes'}</button>}
                />
            </div>
        </Shell>
    );
}
function SummaryModal({ payment, method, online, onClose, onChange, onContinue }) {
    const kind = online ? null : method.type;
    const fee = baseFee(payment);
    const tip = Number(payment.tip_amount || 0);

    return (
        <Shell onClose={onClose}>
            <div className="p-6">
                <h3 className="text-2xl font-bold" style={FONT_HEAD}>{online ? 'Pay securely online' : 'Pay with ' + (kind === 'gcash' ? 'GCash' : 'BPI')}</h3>
                <p className="text-gray-700">Secure and fast way to pay</p>
                {!online && (
                    <div className="mt-4 flex items-center justify-between rounded-2xl border border-black/60 p-4">
                        <div>
                            <div className="text-lg">{methodText(method)}</div>
                            <div className="text-gray-600">{method.name}</div>
                        </div>
                        <button type="button" onClick={onChange} className="text-[#006B6B] underline">Change</button>
                    </div>
                )}
                <div className="mt-4 overflow-hidden rounded-2xl border border-black/60">
                    <div className="bg-[#B3DFDF] px-4 py-2 text-lg">Payment Summary</div>
                    <div className="space-y-1 p-4 text-lg">
                        <div className="flex justify-between"><span>Session Fee</span><span>{money(fee)}</span></div>
                        <div className="flex justify-between"><span>Tip</span><span>{money(tip)}</span></div>
                        <div className="mt-3 flex justify-between border-t border-black/50 pt-2 font-bold"><span>Total Amount</span><span>{money(payment.amount)}</span></div>
                    </div>
                </div>
                <p className="mt-4 rounded-2xl bg-[#D6EEF0] p-3 text-[#064E50]">
                    {online ? 'You will be redirected to the secure PayMongo checkout to complete your payment.' : 'Demo payment: no real money moves. The studio uses this to show how checkout works.'}
                </p>
                <Buttons
                    left={<button type="button" onClick={onClose} className={GHOST}>Cancel</button>}
                    right={<button type="button" onClick={onContinue} className={SOLID}>{online ? 'Continue' : 'Continue to ' + (kind === 'gcash' ? 'GCash' : 'BPI')}</button>}
                />
            </div>
        </Shell>
    );
}

function CheckoutModal({ payment, method, busy, error, onBack, onPay }) {
    const brand = BRAND[method.type];

    return (
        <Shell onClose={onBack}>
            <div className="flex items-center gap-3 px-5 py-4 text-white" style={{ backgroundColor: brand }}>
                <button type="button" onClick={onBack} aria-label="Back" className="text-2xl">&larr;</button>
                <span className="text-xl font-bold">{method.type === 'gcash' ? 'GCash' : 'BPI'}</span>
            </div>
            <div className="bg-[#F7FAFD] p-6">
                <h3 className="text-center text-2xl font-bold text-[#1F3A5F]" style={FONT_HEAD}>Pay via {method.type === 'gcash' ? 'GCash' : 'BPI'}</h3>
                <div className="mt-5 rounded-2xl border border-black/50 bg-white p-4">
                    <div className="text-xl font-bold" style={FONT_HEAD}>HKAT</div>
                    <div className="text-gray-600">Tutor Payment</div>
                    <div className="mt-3 text-2xl font-bold">{money(payment.amount)}</div>
                </div>
                <div className="mt-4 rounded-2xl border border-black/50 bg-white p-4 text-lg">
                    <div className="border-b border-black/40 pb-2">Payment Details</div>
                    <div className="mt-2 flex justify-between"><span className="text-gray-700">Merchant</span><span>HKAT</span></div>
                    <div className="flex justify-between"><span className="text-gray-700">Order No.</span><span>ORD{String(payment.id).padStart(6, '0')}</span></div>
                    <div className="flex justify-between"><span className="text-gray-700">Total Amount</span><span>{money(payment.amount)}.00</span></div>
                </div>
                <p className="mt-3 text-center text-sm text-gray-600">Demo payment &mdash; no real money moves.</p>
                {error && <p className="mt-2 text-center text-red-700">{error}</p>}
                <button type="button" disabled={busy} onClick={onPay} className="mt-6 w-full rounded-xl py-3 text-xl text-white hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: brand }}>
                    {busy ? 'Processing...' : 'Pay Now'}
                </button>
            </div>
        </Shell>
    );
}

function SuccessModal({ payment, onDone }) {
    const s = payment.session || {};
    const rows = [
        ['Tutor', (s.tutor && s.tutor.name) || '-'],
        ['Service', serviceText(payment)],
        ['Date & Time', formatDate(s.session_date) + DOT + fmtTime(s.start_time)],
        ['Transaction ID', payment.transaction_reference || '-'],
    ];

    return (
        <Shell onClose={onDone}>
            <div className="p-6 text-center">
                <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#22A03A] text-5xl text-white">&#10003;</span>
                <h3 className="mt-4 text-2xl font-bold" style={FONT_HEAD}>Payment Successful</h3>
                <p className="text-gray-700">You have successfully paid using {payment.method_label || 'the studio'}</p>
                <div className="mt-5 space-y-2 rounded-2xl border border-black p-4 text-left text-lg">
                    {rows.map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-4"><span className="text-gray-700">{label}</span><span className="text-right">{value}</span></div>
                    ))}
                </div>
                <Buttons
                    left={<button type="button" onClick={() => router.visit(route('parent.receipts.show', payment.id))} className={GHOST}>View Receipt</button>}
                    right={<button type="button" onClick={onDone} className={SOLID}>Done</button>}
                />
            </div>
        </Shell>
    );
}

function BreakdownCard({ payment, onTip, onPay }) {
    const b = payment.breakdown;
    const fee = baseFee(payment);
    const tip = Number(payment.tip_amount || 0);
    const timed = b && b.kind === 'academic';
    const title = timed ? b.band + ' \u2022 ' + (b.core ? 'special subject' : 'regular subject') : (payment.session && payment.session.subject) || 'Your session';
    const line = timed
        ? (payment.session.student_profile.grade_level) + ' ' + payment.session.subject + (b.core ? ' (special subject)' : '')
        : (payment.session && payment.session.subject) + DOT + typeLabel(payment.session && payment.session.session_type);

    return (
        <section className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-[#B3DFDF]">
            <div className="border-b border-black bg-[#EAF1D1] px-6 py-4">
                <h3 className="text-2xl" style={FONT_HEAD}>Payment Breakdown</h3>
                <p className="text-gray-700">Details of your current payment</p>
            </div>
            <div className="p-4">
                <div className="overflow-hidden rounded-2xl border border-black bg-[#EAF1D1]">
                    <div className="border-b border-black/50 px-5 py-3">
                        <div className="text-xl" style={FONT_HEAD}>Your rate</div>
                        <div className="text-gray-700">{title}</div>
                    </div>
                    <div className="space-y-3 px-5 py-4 text-lg">
                        <div className="flex justify-between"><span>{line}</span><span>{timed ? money(b.hourly) + '/hr' : b && b.kind === 'special' ? 'Flat rate' : 'Flat per session'}</span></div>
                        {timed && <div className="flex justify-between"><span>Duration &times; {hoursLabel(b.hours)}</span><span>{money(fee)}</span></div>}
                        <div className="flex items-center justify-between"><span>Tip for Tutor (Optional)</span>
                            <span className="flex items-center gap-3">{money(tip)}
                                <button type="button" onClick={onTip} className="rounded-xl border-[1.5px] border-black bg-white px-3 py-1 hover:opacity-80">+ {tip > 0 ? 'Change Tip' : 'Add Tip'}</button>
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-between border-t border-black/50 px-5 py-4 text-xl font-bold"><span>Total Amount Due</span><span>{money(payment.amount)}</span></div>
                    <div className="border-t border-black/50 px-5 py-4">
                        <p className="text-gray-700">&#128274; Payment is required to confirm the session. Tutoring starts once payment clears.</p>
                        <button type="button" onClick={onPay} className="mt-3 w-full rounded-xl border-[1.5px] border-black bg-white py-2 text-xl hover:opacity-80">Pay</button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Index({ payments = [], onlinePaymentsEnabled = false, flashStatus, flashPaid = null, paymentMethod = null }) {
    const errors = usePage().props.errors || {};
    const [modal, setModal] = useState(null);
    const [target, setTarget] = useState(null);
    const [busy, setBusy] = useState(false);
    const [flowError, setFlowError] = useState('');
    const [doneId, setDoneId] = useState(flashPaid);

    const pending = payments.filter((p) => p.status === 'pending');
    const student = payments[0] && payments[0].session ? payments[0].session.student_profile : null;
    const subtitle = student ? student.student_name + DOT + student.grade_level + DOT + 'all amounts follow the published rate card' : 'All amounts follow the published rate card';
    const flash = flashStatus === 'session-booked' ? 'Session booked. Pay below to confirm it.' : flashStatus;
    const done = doneId ? payments.find((p) => p.id === doneId) : null;

    const startPay = (payment) => {
        setTarget(payment);
        setFlowError('');
        setModal(onlinePaymentsEnabled || paymentMethod ? 'summary' : 'method');
    };

    const live = target ? payments.find((p) => p.id === target.id) || target : null;

    const pay = () => {
        setBusy(true);
        router.post(route('parent.payments.demo', live.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setModal(null);
                setDoneId(live.id);
            },
            onError: (e) => setFlowError(e.payment || 'Payment failed.'),
            onFinish: () => setBusy(false),
        });
    };

    const online = () => router.post(route('parent.payments.checkout', live.id));

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-gray-900" style={FONT_HEAD}>Billing</h1>
                    <p className="text-lg text-gray-800">{subtitle}</p>
                </div>
            }
        >
            <Head title="Billing" />

            <div className="space-y-6 px-6 pb-12 pt-6 sm:px-8">
                {flash && <p className="rounded-2xl border-[1.5px] border-black bg-[#EAF1D1] p-3">{flash}</p>}
                {errors.payment && <p className="rounded-2xl border-[1.5px] border-black bg-red-100 p-3 text-red-700">{errors.payment}</p>}

                {pending.length === 0 ? (
                    <section className="rounded-3xl border-[1.5px] border-black bg-[#EAF1D1] p-6">
                        <h3 className="text-2xl" style={FONT_HEAD}>You are all paid up</h3>
                        <p className="text-gray-800">There are no payments waiting right now.</p>
                    </section>
                ) : (
                    pending.map((payment) => (
                        <BreakdownCard key={payment.id} payment={payment} onTip={() => { setTarget(payment); setModal('tip'); }} onPay={() => startPay(payment)} />
                    ))
                )}

                <section className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-[#B3DFDF] p-4">
                    <div className="overflow-hidden rounded-2xl border border-black bg-[#EAF1D1]">
                        <div className="border-b border-black/50 px-5 py-3">
                            <div className="text-xl" style={FONT_HEAD}>Payment Method</div>
                            <div className="text-gray-700">Your preferred payment method</div>
                        </div>
                        <div className="flex items-center justify-between gap-4 px-5 py-4">
                            <div className="flex items-center gap-4">
                                <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-black bg-white text-lg font-bold" style={{ color: paymentMethod ? BRAND[paymentMethod.type] : '#555' }}>{paymentMethod ? (paymentMethod.type === 'gcash' ? 'G' : 'BPI') : '?'}</span>
                                <div>
                                    <div className="text-xl">{paymentMethod ? methodText(paymentMethod) : 'No payment method saved yet'}</div>
                                    {paymentMethod && <div className="text-gray-700">{paymentMethod.name}</div>}
                                    {!paymentMethod && onlinePaymentsEnabled && <div className="text-gray-700">You can pay online with GCash, Maya or a card using Pay.</div>}
                                </div>
                            </div>
                            <button type="button" onClick={() => setModal('method')} className="rounded-xl border-[1.5px] border-black bg-white px-5 py-2 hover:opacity-80">{paymentMethod ? 'Change' : 'Add'}</button>
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-[#B3DFDF]">
                    <div className="border-b border-black/30 px-6 py-4">
                        <h3 className="text-2xl" style={FONT_HEAD}>Payment history</h3>
                        <p className="text-gray-700">{payments.length} {payments.length === 1 ? 'record' : 'records'}</p>
                    </div>
                    {payments.length === 0 ? (
                        <p className="px-6 py-5 text-gray-800">No payments yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left">
                                <thead className="bg-[#EAF1D1] text-lg">
                                    <tr>
                                        <th className="px-6 py-3 font-normal">Date</th>
                                        <th className="px-3 py-3 font-normal">Service</th>
                                        <th className="px-3 py-3 font-normal">Rate Applied</th>
                                        <th className="px-3 py-3 font-normal">Amount</th>
                                        <th className="px-3 py-3 font-normal">Status</th>
                                        <th className="px-6 py-3 font-normal">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment) => {
                                        const paid = payment.status === 'paid';
                                        return (
                                            <tr key={payment.id} className="border-t border-black/30">
                                                <td className="px-6 py-4">{formatDate(payment.paid_at || payment.created_at)}</td>
                                                <td className="px-3 py-4">{serviceText(payment)}</td>
                                                <td className="px-3 py-4">{rateApplied(payment)}</td>
                                                <td className="px-3 py-4">{money(payment.amount)}</td>
                                                <td className="px-3 py-4">
                                                    <span className={'inline-flex rounded-full border border-black/50 px-3 py-0.5 text-sm capitalize ' + (STATUS_STYLES[payment.status] || STATUS_STYLES.pending)}>{paid ? '\u2713 Paid' : payment.status}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {paid ? (
                                                        <button type="button" onClick={() => router.visit(route('parent.receipts.show', payment.id))} className="rounded-lg border-[1.5px] border-black bg-white px-3 py-1 hover:opacity-80">View</button>
                                                    ) : ('-')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            {modal === 'tip' && live && <TipModal payment={live} onClose={() => setModal(null)} />}
            {modal === 'method' && <MethodModal current={paymentMethod} onClose={() => setModal(live && pending.length > 0 && !paymentMethod ? 'summary' : null)} />}
            {modal === 'summary' && live && (onlinePaymentsEnabled || paymentMethod) && (
                <SummaryModal payment={live} method={paymentMethod} online={onlinePaymentsEnabled} onClose={() => setModal(null)} onChange={() => setModal('method')} onContinue={() => (onlinePaymentsEnabled ? online() : setModal('checkout'))} />
            )}
            {modal === 'checkout' && live && paymentMethod && (
                <CheckoutModal payment={live} method={paymentMethod} busy={busy} error={flowError} onBack={() => setModal('summary')} onPay={pay} />
            )}
            {done && <SuccessModal payment={done} onDone={() => setDoneId(null)} />}
        </AuthenticatedLayout>
    );
}