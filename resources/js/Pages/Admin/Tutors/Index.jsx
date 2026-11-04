import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const DOT = ' \u00B7 ';
const FIELD = 'mt-1 block w-full rounded-2xl border-[1.5px] border-black bg-white px-4 py-3 text-base focus:border-black focus:ring-0';

const FILTERS = [
    { key: 'all', label: 'All Tutors' },
    { key: 'academic', label: 'Academic' },
    { key: 'arts', label: 'Arts' },
    { key: 'special', label: 'Special Teaching' },
    { key: 'verify', label: 'Needs Verification' },
];

const CATEGORY_OPTIONS = [
    { key: 'academic', label: 'Academic Tutoring' },
    { key: 'arts', label: 'Art Lesson' },
    { key: 'special', label: 'Special Teaching' },
];

const AVAILABILITY = {
    open: { label: 'Open for new students', dot: '#0E7C86', text: 'text-[#0E7C86]' },
    limited: { label: 'Limited slots', dot: '#E0B000', text: 'text-[#C99A00]' },
    full: { label: 'Fully booked', dot: '#555555', text: 'text-gray-700' },
};

function initials(name) {
    return (name || '?').split(' ').map((part) => part.charAt(0)).slice(0, 2).join('').toUpperCase();
}

function Stars({ rating }) {
    const filled = Math.max(0, Math.min(5, Math.round(rating)));
    return (
        <span className="text-xl leading-none" aria-hidden="true">
            <span className="text-[#F5B800]">{'\u2605'.repeat(filled)}</span>
            <span className="text-gray-300">{'\u2605'.repeat(5 - filled)}</span>
        </span>
    );
}

function VerifiedBadge({ verified }) {
    if (!verified) {
        return (
            <span className="inline-flex items-center rounded-full border-[1.5px] border-black/60 bg-[#FBE7A6] px-4 py-1 text-base">
                Awaiting verification
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#006B6B] bg-[#D6EEF0] px-4 py-1 text-base text-[#064E50]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M8 12.5l3 3 5-6" />
            </svg>
            Verified
        </span>
    );
}

function PencilIcon() {
    return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
            <path d="M13.5 6.5l4 4" />
        </svg>
    );
}

function TutorCard({ tutor, onEdit }) {
    const status = AVAILABILITY[tutor.availability] || AVAILABILITY.open;

    return (
        <div className="rounded-3xl border-[1.5px] border-black bg-white p-6">
            <div className="flex items-start gap-4">
                {tutor.photo ? (
                    <img src={tutor.photo} alt={tutor.name} className="h-28 w-28 shrink-0 rounded-xl border-2 border-black object-cover" />
                ) : (
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#006B6B] text-3xl font-bold text-white">
                        {initials(tutor.name)}
                    </div>
                )}
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-3xl leading-tight" style={FONT_HEAD}>{tutor.name}</h3>
                        <VerifiedBadge verified={tutor.verified} />
                    </div>
                    {tutor.credential && <p className="text-lg text-gray-700">{tutor.credential}</p>}
                    <div className="mt-1 flex items-center gap-2 text-gray-800">
                        {tutor.rating ? (
                            <>
                                <Stars rating={tutor.rating} />
                                <span>{tutor.rating} ({tutor.review_count})</span>
                            </>
                        ) : (
                            <span>No reviews yet</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {(tutor.specializations || []).length === 0 && <span className="text-sm text-gray-600">No subjects listed</span>}
                {(tutor.specializations || []).map((subject) => (
                    <span key={subject} className="rounded-full bg-[#B3DFDF] px-4 py-1 text-base">{subject}</span>
                ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-black/50 pt-3">
                <div>
                    <div className="text-xl">Students</div>
                    <div className="text-xl">{tutor.students}</div>
                </div>
                <div>
                    <div className="text-xl">Hrs / week</div>
                    <div className="text-xl">{tutor.hours}</div>
                </div>
            </div>

            <div className={'mt-3 flex items-center gap-2 text-lg ' + status.text}>
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: status.dot }} />
                {status.label}
            </div>

            <div className="mt-3 flex items-center gap-3">
                <Link
                    href={route('tutors.show', tutor.id)}
                    className="flex-1 rounded-lg border-2 border-black bg-[#B3DFDF] py-2 text-center text-lg hover:opacity-80"
                >
                    View Profile
                </Link>
                <button
                    type="button"
                    onClick={() => onEdit(tutor)}
                    className="inline-flex items-center gap-2 rounded-lg border-[1.5px] border-black bg-white px-4 py-2 text-lg hover:opacity-80"
                >
                    <PencilIcon />
                    Edit
                </button>
            </div>
        </div>
    );
}
function FieldError({ message }) {
    return message ? <p className="mt-1 text-sm text-red-700">{message}</p> : null;
}

function Modal({ title, subtitle, onClose, onSubmit, footer, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div
                className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border-[1.5px] border-black bg-white shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 bg-[#B3DFDF] px-6 py-4">
                    <div>
                        <h3 className="text-2xl" style={FONT_HEAD}>{title}</h3>
                        {subtitle && <p className="text-sm text-gray-800">{subtitle}</p>}
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close" className="rounded-full px-2 text-3xl leading-none hover:bg-white/50">
                        &times;
                    </button>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="space-y-4 px-6 py-5">{children}</div>
                    <div className="flex items-center justify-end gap-3 bg-[#B3DFDF] px-6 py-4">{footer}</div>
                </form>
            </div>
        </div>
    );
}

function AddTutorModal({ onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        category: 'academic',
        specialization: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('admin.tutors.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal
            title="Add tutor"
            subtitle="A temporary password is shown once after you add the tutor."
            onClose={onClose}
            onSubmit={submit}
            footer={
                <>
                    <button type="button" onClick={onClose} className="rounded-xl border-[1.5px] border-black bg-white px-5 py-2 hover:opacity-80">Cancel</button>
                    <button type="submit" disabled={processing} className="rounded-xl border-[1.5px] border-black bg-[#EAF1D1] px-5 py-2 hover:opacity-80 disabled:opacity-50">
                        {processing ? 'Adding...' : 'Add Tutor'}
                    </button>
                </>
            }
        >
            <div>
                <label className="block text-lg">Full name
                    <input type="text" className={FIELD} placeholder="e.g. Katrina Lopez" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                </label>
                <FieldError message={errors.name} />
            </div>
            <div>
                <label className="block text-lg">Email Address
                    <input type="email" className={FIELD} placeholder="name@happykidsart.ph" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                </label>
                <FieldError message={errors.email} />
            </div>
            <div>
                <label className="block text-lg">Tutor type
                    <select className={FIELD} value={data.category} onChange={(e) => setData('category', e.target.value)}>
                        {CATEGORY_OPTIONS.map((option) => (
                            <option key={option.key} value={option.key}>{option.label}</option>
                        ))}
                    </select>
                </label>
                <FieldError message={errors.category} />
            </div>
            <div>
                <label className="block text-lg">Primary specialization
                    <input type="text" className={FIELD} placeholder="e.g. Math, Science" value={data.specialization} onChange={(e) => setData('specialization', e.target.value)} />
                </label>
                <p className="mt-1 text-sm text-gray-600">Separate several subjects with commas.</p>
                <FieldError message={errors.specialization} />
            </div>
        </Modal>
    );
}

function EditTutorModal({ tutor, onClose }) {
    const { data, setData, patch, processing, errors } = useForm({
        categories: tutor.categories || [],
        specializations: (tutor.specializations || []).join(', '),
        credential: tutor.credential || '',
        years_experience: tutor.years_experience || '',
    });

    const toggle = (key) => {
        const next = data.categories.includes(key)
            ? data.categories.filter((item) => item !== key)
            : [...data.categories, key];
        setData('categories', next);
    };

    const submit = (event) => {
        event.preventDefault();
        patch(route('admin.tutors.update', tutor.id), { preserveScroll: true, onSuccess: onClose });
    };

    const remove = () => {
        if (!window.confirm('Remove ' + tutor.name + ' permanently? This cannot be undone.')) return;
        router.delete(route('admin.tutors.destroy', tutor.id), {
            preserveScroll: true,
            onSuccess: onClose,
            onError: (e) => window.alert(Object.values(e)[0] || 'Could not remove this tutor.'),
        });
    };

    const toggleVerified = () => {
        router.patch(route('admin.tutors.toggle-verified', tutor.id), {}, { preserveScroll: true, onSuccess: onClose });
    };

    return (
        <Modal
            title={'Edit ' + tutor.name}
            subtitle={tutor.email}
            onClose={onClose}
            onSubmit={submit}
            footer={
                <>
                    <button type="button" onClick={remove} className="rounded-xl border-[1.5px] border-red-700 bg-white px-4 py-2 text-red-700 hover:opacity-80">Remove tutor</button>
                    <button type="button" onClick={toggleVerified} className="mr-auto rounded-xl border-[1.5px] border-black bg-white px-4 py-2 hover:opacity-80">
                        {tutor.verified ? 'Remove verification' : 'Verify tutor'}
                    </button>
                    <button type="button" onClick={onClose} className="rounded-xl border-[1.5px] border-black bg-white px-4 py-2 hover:opacity-80">Cancel</button>
                    <button type="submit" disabled={processing} className="rounded-xl border-[1.5px] border-black bg-[#EAF1D1] px-4 py-2 hover:opacity-80 disabled:opacity-50">
                        {processing ? 'Saving...' : 'Save'}
                    </button>
                </>
            }
        >
            <div>
                <div className="text-lg">Tutor type</div>
                <div className="mt-1 flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map((option) => (
                        <button
                            key={option.key}
                            type="button"
                            onClick={() => toggle(option.key)}
                            className={'rounded-full border-[1.5px] border-black px-4 py-1 ' + (data.categories.includes(option.key) ? 'bg-[#EAF1D1] shadow' : 'bg-white')}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <FieldError message={errors.categories} />
            </div>
            <div>
                <label className="block text-lg">Subjects
                    <input type="text" className={FIELD} value={data.specializations} onChange={(e) => setData('specializations', e.target.value)} />
                </label>
                <FieldError message={errors.specializations} />
            </div>
            <div>
                <label className="block text-lg">Credential
                    <input type="text" className={FIELD} value={data.credential} onChange={(e) => setData('credential', e.target.value)} />
                </label>
                <FieldError message={errors.credential} />
            </div>
            <div>
                <label className="block text-lg">Years of experience
                    <input type="text" className={FIELD} value={data.years_experience} onChange={(e) => setData('years_experience', e.target.value)} />
                </label>
                <FieldError message={errors.years_experience} />
            </div>
        </Modal>
    );
}

export default function Index({ tutors = [], counts = {}, notice = {} }) {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState(null);

    const needle = query.trim().toLowerCase();
    const rows = tutors.filter((tutor) => {
        const inFilter = filter === 'all'
            || (filter === 'verify' ? !tutor.verified : (tutor.categories || []).includes(filter));
        const text = (tutor.name + ' ' + (tutor.specializations || []).join(' ')).toLowerCase();
        return inFilter && text.includes(needle);
    });

    const total = counts.total || 0;
    const awaiting = counts.awaiting || 0;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-3xl font-bold text-gray-900" style={FONT_HEAD}>Tutors</h1>
                    <p className="text-lg text-gray-800">
                        {total} {total === 1 ? 'tutor' : 'tutors'}{DOT}{awaiting} awaiting credential verification
                    </p>
                </div>
            }
        >
            <Head title="Tutors" />

            <div className="space-y-5 px-6 pb-12 pt-4 sm:px-8">
                {notice.tempPassword && (
                    <div className="rounded-2xl border-[1.5px] border-black bg-[#EAF1D1] p-4">
                        <p className="text-lg font-semibold">Tutor added.</p>
                        <p>
                            Temporary password for {notice.tutorEmail}:{' '}
                            <span className="rounded bg-white px-2 py-0.5 font-mono">{notice.tempPassword}</span>
                        </p>
                        <p className="text-sm text-gray-700">Share it privately. It is shown only once, and the tutor can change it in Settings.</p>
                    </div>
                )}
                {notice.status === 'tutor-updated' && (
                    <p className="rounded-2xl border-[1.5px] border-black bg-[#EAF1D1] p-3">Tutor updated.</p>
                )}

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => setAdding(true)}
                        className="rounded-xl border-[1.5px] border-black bg-[#EAF1D1] px-5 py-3 text-lg hover:opacity-80"
                    >
                        + Add Tutor
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-full max-w-md">
                        <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search by name or subject"
                            className="w-full rounded-2xl border-[1.5px] border-black bg-[#D9D9D9] py-3 pl-12 pr-4 text-lg focus:border-black focus:ring-0"
                        />
                    </div>
                    {FILTERS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setFilter(item.key)}
                            className={'rounded-xl border-[1.5px] border-black px-4 py-2 text-lg ' + (filter === item.key ? 'bg-[#EAF1D1] shadow' : 'bg-white hover:bg-gray-50')}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {rows.length === 0 ? (
                    <p className="py-8 text-center text-gray-700">
                        {tutors.length === 0 ? 'No tutors yet. Use Add Tutor to create the first one.' : 'No tutors match this filter.'}
                    </p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {rows.map((tutor) => (
                            <TutorCard key={tutor.id} tutor={tutor} onEdit={setEditing} />
                        ))}
                    </div>
                )}
            </div>

            {adding && <AddTutorModal onClose={() => setAdding(false)} />}
            {editing && <EditTutorModal key={editing.id} tutor={editing} onClose={() => setEditing(null)} />}
        </AuthenticatedLayout>
    );
}