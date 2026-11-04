import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const DOT = ' \u00B7 ';

function getJson(url) {
    return fetch(url, {
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
    }).then((res) => (res.ok ? res.json() : Promise.reject(res)));
}

function fmtTime(value) {
    const [h, m] = String(value).split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return hour + ':' + String(m).padStart(2, '0') + ' ' + suffix;
}

function shortDay(value) {
    const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function initials(name) {
    return (name || '?').split(' ').map((part) => part.charAt(0)).slice(0, 2).join('').toUpperCase();
}

function Factor({ title, value, note, boxed = true }) {
    return (
        <div className={'rounded-2xl border border-black/60 px-4 py-3 ' + (boxed ? 'bg-white' : '')}>
            <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{title}</span>
                <span>{value}</span>
            </div>
            <p className="text-sm text-gray-700">{note}</p>
        </div>
    );
}

export default function AutoAssignModal({ onClose }) {
    const [requests, setRequests] = useState(null);
    const [requestId, setRequestId] = useState('');
    const [data, setData] = useState(null);
    const [index, setIndex] = useState(0);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        getJson(route('admin.autoassign.pending'))
            .then((json) => setRequests(json.sessions))
            .catch(() => setError('Could not load the pending requests.'));
    }, []);

    useEffect(() => {
        if (!requestId) {
            setData(null);
            return;
        }
        setError('');
        setIndex(0);
        getJson(route('admin.sessions.suggestions', requestId))
            .then(setData)
            .catch(() => setError('Could not compare tutors for this request.'));
    }, [requestId]);

    const candidate = data && data.candidates.length > 0 ? data.candidates[index % data.candidates.length] : null;
    const selected = requests && requests.find((r) => String(r.id) === String(requestId));

    const assign = () => {
        setBusy(true);
        router.patch(route('admin.sessions.assign', requestId), { tutor_id: candidate.id }, {
            preserveScroll: true,
            onSuccess: onClose,
            onError: (errors) => setError(Object.values(errors)[0] || 'Could not assign this tutor.'),
            onFinish: () => setBusy(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-4 border-b border-black/30 px-6 py-4">
                    <div>
                        <h3 className="text-2xl" style={FONT_HEAD}>&#10022; AI auto-assign</h3>
                        <p className="text-gray-700">
                            {selected
                                ? 'Pending request' + DOT + selected.student + DOT + selected.grade + ' ' + selected.subject + DOT + shortDay(selected.date) + DOT + fmtTime(selected.start) + DOT + (data ? data.session.hours + ' hrs' : '')
                                : 'Choose a pending request to find the best tutor.'}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close" className="text-3xl leading-none hover:opacity-60">&times;</button>
                </div>

                <div className="space-y-4 px-6 py-5">
                    {requests === null && !error && <p className="text-gray-700">Loading requests...</p>}
                    {requests && requests.length === 0 && <p className="rounded-2xl bg-[#EAF1D1] p-4">No pending requests need a tutor right now.</p>}

                    {requests && requests.length > 0 && (
                        <select
                            value={requestId}
                            onChange={(e) => setRequestId(e.target.value)}
                            className="block w-full rounded-2xl border-[1.5px] border-black bg-white px-4 py-3 focus:border-black focus:ring-0"
                        >
                            <option value="">Select a pending request...</option>
                            {requests.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.student + DOT + r.subject + DOT + shortDay(r.date) + ' ' + fmtTime(r.start) + (r.tutor ? DOT + 'now with ' + r.tutor : '')}
                                </option>
                            ))}
                        </select>
                    )}

                    {error && <p className="rounded-2xl bg-red-100 p-3 text-red-700">{error}</p>}

                    {data && !candidate && (
                        <p className="rounded-2xl bg-[#FBE7A6] p-4">No tutor is free for this time. All {data.excluded} compared tutors are busy or outside their saved hours.</p>
                    )}

                    {candidate && (
                        <>
                            <div className="flex items-center gap-4 rounded-2xl bg-[#D6EEF0] p-4">
                                {candidate.photo ? (
                                    <img src={candidate.photo} alt={candidate.name} className="h-16 w-16 rounded-xl border border-black/40 object-cover" />
                                ) : (
                                    <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#006B6B] text-xl font-bold text-white">{initials(candidate.name)}</span>
                                )}
                                <div className="flex-1">
                                    <div className="text-xl" style={FONT_HEAD}>{candidate.name}</div>
                                    <div className="text-gray-700">{candidate.credential || 'Verified tutor'}</div>
                                </div>
                                <span className="rounded-full bg-[#EAF1D1] px-3 py-1 text-sm">{index % data.candidates.length === 0 ? 'Best match' : 'Option ' + ((index % data.candidates.length) + 1)}</span>
                            </div>

                            <p className="text-gray-700">
                                The system compared all {data.compared} verified tutors against this request. {data.excluded > 0 ? data.excluded + ' were left out because they are busy or outside their saved hours. ' : ''}
                                Overall score {candidate.score}%. Nothing is booked until you confirm.
                            </p>

                            <Factor title="Subject match" value={candidate.subject.score + '%'} note={candidate.subject.note} />
                            <Factor title="Availability" value={candidate.availability.label} note={candidate.availability.note} />
                            <Factor title="Workload balance" value={candidate.workload.hours + ' / ' + candidate.workload.cap + ' hrs'} note={candidate.workload.note} />
                            <Factor title="Family history" value={candidate.history.count + ' past ' + (candidate.history.count === 1 ? 'session' : 'sessions')} note={candidate.history.note} />

                            {data.session.location === 'home' && (
                                <p className="rounded-2xl bg-[#EAF1D1] p-3 text-sm">Home-based session. Transportation fare is not included and must be confirmed with the parent before the visit.</p>
                            )}
                        </>
                    )}
                </div>

                <div className="flex flex-wrap justify-end gap-3 border-t border-black/30 px-6 py-4">
                    {candidate && data.candidates.length > 1 && (
                        <button type="button" onClick={() => setIndex((i) => i + 1)} className="rounded-xl bg-[#EAF1D1] px-5 py-2 hover:opacity-80">Choose another tutor</button>
                    )}
                    {candidate && (
                        <button type="button" disabled={busy} onClick={assign} className="rounded-xl bg-[#B3DFDF] px-5 py-2 hover:opacity-80 disabled:opacity-50">
                            {busy ? 'Assigning...' : 'Assign ' + candidate.name.split(' ')[0]}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}