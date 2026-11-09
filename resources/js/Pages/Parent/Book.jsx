import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const PESO = '\u20B1';
const FIELD = 'mt-1 block w-full rounded-2xl border-[1.5px] border-black bg-white px-4 py-3 text-base focus:border-black focus:ring-0';

const KINDS = [
    { key: 'academic', label: 'Academic Tutoring', hint: 'Grade 1 - 10, by subjects', category: 'academic' },
    { key: 'art', label: 'Art Lesson', hint: 'Drawing, Painting', category: 'arts' },
    { key: 'special', label: 'Special Teaching', hint: 'For children with special needs', category: 'special' },
];

const ACADEMIC_SUBJECTS = ['Reading', 'Writing', 'Math', 'English', 'Science', 'Filipino', 'MAPEH', 'AP', 'Mandarin Chinese', 'Hokkien'];
const ART_SUBJECTS = ['Drawing', 'Painting'];

const LENGTHS = [
    { value: '1', label: '1 hour' },
    { value: '1.5', label: '1.5 hours' },
    { value: '2', label: '2 hours' },
];

function addHours(start, hours) {
    if (!start) return '';
    const [h, m] = start.split(':').map(Number);
    const total = Math.min(h * 60 + m + Math.round(hours * 60), 23 * 60 + 59);
    return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}

function todayIso() {
    const now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}

function fmtTime(value) {
    if (!value) return '';
    const [h, m] = String(value).split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return hour + ':' + String(m).padStart(2, '0') + ' ' + suffix;
}

function fmtDay(value) {
    if (!value) return '';
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' });
}

function money(value) {
    return PESO + Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Section({ number, title, children }) {
    return (
        <section className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-[#B3DFDF]">
            <div className="border-b border-black/30 px-6 py-4">
                <h3 className="text-2xl" style={FONT_HEAD}>{number}. {title}</h3>
            </div>
            <div className="p-6">{children}</div>
        </section>
    );
}

function Label({ children }) {
    return <span className="block text-lg">{children}</span>;
}

function FieldError({ message }) {
    return message ? <p className="mt-1 text-sm text-red-700">{message}</p> : null;
}

function Row({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-gray-800">{label}</span>
            <span className="text-right">{value}</span>
        </div>
    );
}
function TutorCard({ tutor, selected, unavailable, onSelect }) {
    const initials = tutor.name.split(' ').map((part) => part.charAt(0)).slice(0, 2).join('').toUpperCase();
    const look = unavailable
        ? 'cursor-not-allowed border-black/40 opacity-60'
        : selected
            ? 'cursor-pointer border-black ring-4 ring-[#EAF1D1]'
            : 'cursor-pointer border-black/60 hover:border-black';

    return (
        <div
            role="button"
            tabIndex={unavailable ? -1 : 0}
            aria-disabled={unavailable ? 'true' : 'false'}
            onClick={unavailable ? undefined : onSelect}
            onKeyDown={(event) => {
                if (!unavailable && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    onSelect();
                }
            }}
            className={'relative w-80 shrink-0 rounded-3xl border-[1.5px] bg-white p-4 transition ' + look}
        >
            <div className="flex items-start gap-3">
                {tutor.photo ? (
                    <img src={tutor.photo} alt={tutor.name} className="h-20 w-20 shrink-0 rounded-xl border border-black/40 object-cover" />
                ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#006B6B] text-xl font-bold text-white">{initials}</div>
                )}
                <div className="min-w-0">
                    <div className="text-xl leading-snug" style={FONT_HEAD}>{tutor.name}</div>
                    {tutor.credential && <div className="text-sm text-gray-700">Verified tutor</div>}
                    <div className="mt-1 text-sm">
                        {tutor.rating ? '\u2605 ' + tutor.rating + ' (' + tutor.review_count + ')' : 'No reviews yet'}
                    </div>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {(tutor.subjects || []).slice(0, 6).map((subject) => (
                    <span key={subject} className="rounded-full bg-[#B3DFDF] px-3 py-0.5 text-sm">{subject}</span>
                ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
                <a
                    href={route('tutors.show', tutor.profile_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="flex-1 rounded-full border-[1.5px] border-black bg-[#EAF1D1] px-4 py-2 text-center text-sm hover:opacity-80"
                >
                    View Profile
                </a>
                {selected && !unavailable && <span className="rounded-full bg-black px-3 py-1 text-xs text-white">Selected</span>}
            </div>

            {tutor.match && !unavailable && <p className="mt-2 text-xs text-gray-700">Matches your subject</p>}

            {unavailable && (
                <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xl font-bold tracking-wide text-black">
                    UNAVAILABLE
                </span>
            )}
        </div>
    );
}
export default function Book({ tutors = [], students = [], onlinePaymentsEnabled = false, standardRates = null }) {
    const [kind, setKind] = useState('academic');
    const [length, setLength] = useState('1');
    const [fee, setFee] = useState(null);
    const [busy, setBusy] = useState([]);

    const { data, setData, post, errors, processing } = useForm({
        student_profile_id: students.length === 1 ? String(students[0].id) : '',
        tutor_id: '',
        subject: '',
        session_type: '1on1',
        location_type: 'onsite',
        session_date: '',
        start_time: '',
        end_time: '',
    });

    const kindDef = KINDS.find((item) => item.key === kind);
    const student = students.find((item) => String(item.id) === String(data.student_profile_id)) || null;
    const lilyOnly = Boolean((tutors.find((x) => String(x.id) === String(data.tutor_id)) || {}).rates?.online_only);
    const endTime = addHours(data.start_time, lilyOnly ? 10 : Number(length));
    const subjectChoices = kind === 'art' ? ART_SUBJECTS : ACADEMIC_SUBJECTS;
    const subjectKey = (data.subject || '').toLowerCase();

    const eligible = tutors
        .filter((tutor) => (tutor.categories || []).includes(kindDef.category))
        .filter((tutor) => subjectKey.trim() === '' || (tutor.subjects || []).some((s) => String(s).trim().toLowerCase() === subjectKey.trim()))
        .map((tutor) => ({
            ...tutor,
            match: subjectKey !== '' && (tutor.subjects || []).some((subject) => {
                const name = subject.toLowerCase();
                return name.includes(subjectKey) || subjectKey.includes(name);
            }),
        }))
        .sort((a, b) => Number(b.match) - Number(a.match));

    const offIds = eligible.filter((tutor) => !(tutor.subjects || []).some((s) => String(s).trim().toLowerCase() === subjectKey.trim())).map((tutor) => Number(tutor.id));
    const selectedTutor = eligible.find((tutor) => String(tutor.id) === String(data.tutor_id)) || null;
    const progRates = selectedTutor && selectedTutor.rates && selectedTutor.rates.program ? selectedTutor.rates.program : null;
    const onlyOnline = Boolean(selectedTutor && selectedTutor.rates && selectedTutor.rates.online_only);
    const progPick = progRates ? (progRates[data.subject] || Object.values(progRates)[0]) : null;
    useEffect(() => {
        if (onlyOnline && data.location_type !== 'online') setData('location_type', 'online');
    }, [onlyOnline]);
    const ready = Boolean(data.student_profile_id && data.subject && data.tutor_id && data.session_date && data.start_time) && !busy.includes(Number(data.tutor_id)) && !(subjectKey !== '' && offIds.includes(Number(data.tutor_id)));

    const feeNote = kind === 'art'
        ? 'Flat price per session (about 2 hours), per child.'
        : data.location_type === 'home'
            ? 'Plus transportation fare, confirmed with you before the session.'
            : '';

    useEffect(() => {
        setData('end_time', endTime);
    }, [endTime]);

    useEffect(() => {
        if (!data.student_profile_id || !data.subject || !data.start_time || !endTime) {
            setFee(null);
            return undefined;
        }

        const params = new URLSearchParams({
            student_profile_id: data.student_profile_id,
            subject: data.subject,
            location_type: data.location_type,
            start_time: data.start_time,
            end_time: endTime,
        });

        let cancelled = false;

        fetch(route('parent.booking.rate') + '?' + params.toString() + (data.tutor_id ? '&tutor_id=' + data.tutor_id : ''), {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((json) => {
                if (!cancelled) setFee(json ? json.rate : null);
            })
            .catch(() => {
                if (!cancelled) setFee(null);
            });

        return () => {
            cancelled = true;
        };
    }, [data.student_profile_id, data.subject, data.location_type, data.start_time, endTime, data.tutor_id]);

    useEffect(() => {
        if (!data.session_date || !data.start_time || !endTime) {
            setBusy([]);
            return undefined;
        }

        const params = new URLSearchParams({
            session_date: data.session_date,
            start_time: data.start_time,
            end_time: endTime,
        });

        let cancelled = false;

        fetch(route('parent.booking.availability') + '?' + params.toString(), {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((json) => {
                if (!cancelled) setBusy(json ? json.unavailable : []);
            })
            .catch(() => {
                if (!cancelled) setBusy([]);
            });

        return () => {
            cancelled = true;
        };
    }, [data.session_date, data.start_time, endTime]);

    const chooseKind = (key) => {
        setKind(key);
        setData({
            ...data,
            subject: key === 'special' ? 'Special Teaching' : '',
            session_type: '1on1',
            tutor_id: '',
        });
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('parent.booking.store'));
    };
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-gray-900" style={FONT_HEAD}>Book a session</h1>
                    <p className="text-lg text-gray-800">Your tutor's rate is applied automatically - no surprises at checkout.</p>
                </div>
            }
        >
            <Head title="Book a Session" />

            <form onSubmit={submit} className="space-y-6 px-6 pb-12 pt-6 sm:px-8">
                {students.length === 0 && (
                    <div className="rounded-3xl border-[1.5px] border-black bg-[#EAF1D1] p-4 text-sm">
                        You have no children on your account yet.{' '}
                        <Link href={route('parent.profile.edit')} className="font-semibold underline">
                            Add a student profile first.
                        </Link>
                    </div>
                )}

                <Section number="1" title="What kind of session?">
                    <div className="grid gap-4 md:grid-cols-3">
                        {KINDS.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => chooseKind(item.key)}
                                className={'rounded-3xl border-[1.5px] border-black px-4 py-5 text-center transition ' + (kind === item.key ? 'bg-[#EAF1D1] shadow-md' : 'bg-white hover:bg-white/70')}
                            >
                                <span className="block text-xl">{item.label}</span>
                                <span className="block text-sm text-gray-700">{item.hint}</span>
                            </button>
                        ))}
                    </div>
                </Section>

                <Section number="2" title="Details">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block">
                                <Label>Child</Label>
                                <select className={FIELD} value={data.student_profile_id} onChange={(e) => setData('student_profile_id', e.target.value)}>
                                    <option value="">Select a child</option>
                                    {students.map((item) => (
                                        <option key={item.id} value={item.id}>{item.student_name}</option>
                                    ))}
                                </select>
                            </label>
                            <FieldError message={errors.student_profile_id} />
                        </div>

                        <div>
                            <Label>Grade level</Label>
                            <div className={FIELD}>{student ? student.grade_level : '-'}</div>
                        </div>

                        <div>
                            {kind === 'special' ? (
                                <>
                                    <Label>Subject</Label>
                                    <div className={FIELD}>Special Teaching</div>
                                </>
                            ) : (
                                <label className="block">
                                    <Label>Subject</Label>
                                    <select className={FIELD} value={data.subject} onChange={(e) => setData('subject', e.target.value)}>
                                        <option value="">Select a subject</option>
                                        {subjectChoices.map((name) => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </label>
                            )}
                            <FieldError message={errors.subject} />
                        </div>

                        <label className="block">
                            <Label>Session length</Label>
                            {lilyOnly && <div className={FIELD}>10 hours (full program)</div>}
                        <select className={FIELD + (lilyOnly ? ' hidden' : '')} value={length} onChange={(e) => setLength(e.target.value)}>
                                {LENGTHS.map((item) => (
                                    <option key={item.value} value={item.value}>{item.label}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {kind === 'art' && (
                        <div className="mt-6">
                            <Label>Lesson format</Label>
                            <div className="mt-1 flex gap-3">
                                {[{ key: '1on1', label: '1-on-1' }, { key: 'class', label: 'Class' }].map((option) => (
                                    <button
                                        key={option.key}
                                        type="button"
                                        onClick={() => setData('session_type', option.key)}
                                        className={'rounded-full border-[1.5px] border-black px-6 py-2 ' + (data.session_type === option.key ? 'bg-[#EAF1D1] shadow-md' : 'bg-white')}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <Label>Session location</Label>
                        <div className={'grid gap-3 ' + (kind === 'academic' ? 'sm:grid-cols-3' : 'sm:grid-cols-2') + (onlyOnline ? ' sm:!grid-cols-1' : '')}>
                            {[
                                { key: 'onsite', title: 'On-site', text: 'At the Happy Kids Art Studio, Gentri' },
                                { key: 'home', title: 'Home based', text: 'Tutor travels to you - min ' + PESO + '350/hr + fare' },
        ...(kind === 'academic' ? [{ key: 'online', title: 'Online class', text: PESO + '150/hr' }] : []),
                            ].filter((option) => !onlyOnline || option.key === 'online').map((option) => (onlyOnline && progPick ? { ...option, text: PESO + Number(progPick.price).toLocaleString('en-PH') + ' per ' + progPick.hours + '-hour program' } : option)).map((option) => (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={() => setData('location_type', option.key)}
                                    className={'rounded-2xl border-[1.5px] border-black px-4 py-3 text-left ' + (data.location_type === option.key ? 'bg-[#EAF1D1] shadow-md' : 'bg-white')}
                                >
                                    <span className="block text-lg">{option.title}</span>
                                    <span className="block text-sm text-gray-700">{option.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </Section>

                <Section number="3" title="Preferred date and time">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block">
                                <Label>Date</Label>
                                <input type="date" min={todayIso()} className={FIELD} value={data.session_date} onChange={(e) => setData('session_date', e.target.value)} />
                            </label>
                            <FieldError message={errors.session_date} />
                        </div>
                        <div>
                            <label className="block">
                                <Label>Time slot</Label>
                                <input type="time" className={FIELD} value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} />
                            </label>
                            {endTime && <p className="mt-1 text-sm text-gray-800">Ends at {fmtTime(endTime)}</p>}
                            <FieldError message={errors.start_time || errors.end_time} />
                        </div>
                    </div>
                </Section>

                <Section number="4" title="Choose a tutor">
                    {eligible.length === 0 ? (
                        <p className="text-gray-800">No tutor teaches this subject yet.</p>
                    ) : (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {eligible.map((tutor) => (
                                <TutorCard
                                    key={tutor.id}
                                    tutor={tutor}
                                    selected={String(data.tutor_id) === String(tutor.id)}
                                    unavailable={busy.includes(Number(tutor.id))}
                                    onSelect={() => setData('tutor_id', String(tutor.id))}
                                />
                            ))}
                        </div>
                    )}
                    <FieldError message={errors.tutor_id} />
                </Section>

                <section className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-[#B3DFDF] p-6">
                    <div className="space-y-2 text-lg">
                        <Row label="Tutor" value={selectedTutor ? selectedTutor.name : '-'} />
                        <Row
                            label="Session"
                            value={data.session_date && data.start_time ? fmtDay(data.session_date) + ' - ' + fmtTime(data.start_time) + ' to ' + fmtTime(endTime) : '-'}
                        />
                        <Row label="Subject" value={data.subject || '-'} />
                        <hr className="border-black/30" />
                        <Row label="Session fee" value={fee !== null ? money(fee) : '-'} />
                    </div>

                    {feeNote && <p className="mt-3 text-sm text-gray-800">{feeNote}</p>}
                {selectedTutor && standardRates && (() => {
                    const taught = (selectedTutor.subjects || []).map((s) => String(s).toLowerCase());
                    const teaches = (word) => taught.some((s) => s.includes(word));
                    const academic = taught.some((s) => !/draw|paint|mural|special|art/.test(s));
                    const custom = selectedTutor.rates || {};
                    if (custom.program) {
                        return (
                            <div className="mt-4 rounded-2xl border border-black bg-[#EAF1D1] p-4 text-sm">
                                <div className="mb-2 text-lg font-semibold">Rates for {selectedTutor.name}</div>
                                {Object.entries(custom.program).map(([name, p]) => (
                                    <div key={name} className="flex justify-between border-t border-black/30 py-1">
                                        <span>{name}</span>
                                        <span>{'\u20B1'}{Number(p.price).toLocaleString('en-PH')} per {p.hours}-hour program &middot; Online</span>
                                    </div>
                                ))}
                            </div>
                        );
                    }
                    const std = standardRates;
                    const peso = '\u20B1';
                    const row = (band, key) => {
                        const own = custom.bands && custom.bands[band.min] ? custom.bands[band.min][key] : undefined;
                        return own !== undefined && own !== null ? own : band[key];
                    };
                    const special = custom.special !== undefined && custom.special !== null ? custom.special : std.special_teaching_per_session;
                    const home = custom.home !== undefined && custom.home !== null ? custom.home : std.home_minimum_per_hour;
                    return (
                        <div className="mt-4 rounded-2xl border border-black bg-[#EAF1D1] p-4 text-sm">
                            <div className="mb-2 text-lg font-semibold">Rates for {selectedTutor.name}</div>
                            {academic && std.bands.map((band) => (
                                <div key={band.min} className="flex justify-between border-t border-black/30 py-1">
                                    <span>Grades {band.min}&ndash;{band.max}</span>
                                    <span>{peso}{row(band, 'regular')}/hr &middot; Math / Sci / Eng {peso}{row(band, 'core')}/hr</span>
                                </div>
                            ))}
                            {teaches('special') && <div className="flex justify-between border-t border-black/30 py-1"><span>Special Teaching</span><span>{peso}{special}/session</span></div>}
                            {teaches('draw') && <div className="flex justify-between border-t border-black/30 py-1"><span>Drawing</span><span>{peso}{std.arts.drawing}/session</span></div>}
                            {teaches('paint') && <div className="flex justify-between border-t border-black/30 py-1"><span>Painting</span><span>{peso}{std.arts.painting}/session</span></div>}
                            {academic && <div className="flex justify-between border-t border-black/30 py-1"><span>Home-based</span><span>min {peso}{home}/hr + fare</span></div>}
                        </div>
                    );
                })()}

                    <p className="mt-6 text-lg">Payment is required to confirm the session. Tutoring starts once payment clears.</p>

                    <button
                        type="submit"
                        disabled={!ready || processing}
                        className="mt-4 w-full rounded-full border-[1.5px] border-black bg-[#EAF1D1] py-3 text-xl hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing ? 'Booking...' : onlinePaymentsEnabled ? 'Confirm and Pay' : 'Confirm booking'}
                    </button>
                </section>
            </form>
        </AuthenticatedLayout>
    );
}