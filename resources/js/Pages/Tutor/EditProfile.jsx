import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const DOT = ' \u00B7 ';
const DAYS = [['sun', 'SUN'], ['mon', 'MON'], ['tue', 'TUE'], ['wed', 'WED'], ['thu', 'THU'], ['fri', 'FRI'], ['sat', 'SAT']];
const TIME_OPTIONS = Array.from({ length: 14 }, (_, i) => String(i + 7).padStart(2, '0') + ':00');
const FIELD = 'block w-full rounded-2xl border border-black bg-white px-3 py-2 focus:border-black focus:ring-0';

function fmtTime(value) {
    const [h, m] = String(value).split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return hour + ':' + String(m).padStart(2, '0') + ' ' + suffix;
}

function initials(name) {
    return (name || '?').split(' ').map((part) => part.charAt(0)).slice(0, 2).join('').toUpperCase();
}

function Stars({ value, size = 'text-xl' }) {
    const filled = Math.max(0, Math.min(5, Math.round(value)));
    return (
        <span className={size + ' leading-none'} aria-hidden="true">
            <span className="text-[#F5B800]">{'\u2605'.repeat(filled)}</span>
            <span className="text-gray-300">{'\u2605'.repeat(5 - filled)}</span>
        </span>
    );
}

function saveProfile(profile, changes, options = {}) {
    router.patch(
        route('tutor.profile.update'),
        {
            bio: profile.bio || '',
            years_experience: profile.years_experience || '',
            specializations: profile.specializations || [],
            ...changes,
        },
        { preserveScroll: true, ...options },
    );
}

function Panel({ title, action, children, id }) {
    return (
        <section id={id} className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-black bg-[#B3DFDF] px-6 py-4">
                <h3 className="text-2xl" style={FONT_HEAD}>{title}</h3>
                {action}
            </div>
            {children}
        </section>
    );
}

function SmallButton({ children, ...props }) {
    return (
        <button type="button" className="rounded-xl border-[1.5px] border-black bg-white px-4 py-1 hover:opacity-80 disabled:opacity-50" {...props}>
            {children}
        </button>
    );
}

function HeaderCard({ profile, rating }) {
    const [adding, setAdding] = useState(false);
    const [value, setValue] = useState('');
    const specs = profile.specializations || [];

    const add = (event) => {
        event.preventDefault();
        const clean = value.trim();
        if (!clean || specs.includes(clean)) return;
        saveProfile(profile, { specializations: [...specs, clean] }, {
            onSuccess: () => {
                setValue('');
                setAdding(false);
            },
        });
    };

    const remove = (item) => saveProfile(profile, { specializations: specs.filter((s) => s !== item) });

    return (
        <section className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-white shadow-md">
            <div className="h-24 bg-[#EAF1D1]" />
            <div className="px-6 pb-6">
                <div className="-mt-14 flex flex-wrap items-end gap-5">
                    {profile.photo ? (
                        <img src={profile.photo} alt={profile.name} className="h-36 w-36 rounded-xl border-2 border-black object-cover" />
                    ) : (
                        <div className="flex h-36 w-36 items-center justify-center rounded-xl border-2 border-black bg-[#006B6B] text-4xl font-bold text-white">
                            {initials(profile.name)}
                        </div>
                    )}
                    <div className="min-w-0 flex-1 pb-1">
                        <h2 className="text-3xl font-bold" style={FONT_HEAD}>{profile.name}</h2>
                        {profile.credential && <p className="text-lg text-gray-700">{profile.credential}</p>}
                    </div>
                    <div className="flex items-center gap-2 pb-2">
                        {rating.average ? (
                            <>
                                <Stars value={rating.average} />
                                <span>{rating.average} ({rating.count})</span>
                            </>
                        ) : (
                            <span className="text-gray-600">No reviews yet</span>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {specs.map((item) => (
                        <span key={item} className="inline-flex items-center gap-2 rounded-full bg-[#B3DFDF] px-4 py-1 text-lg">
                            {item}
                            <button type="button" onClick={() => remove(item)} aria-label={'Remove ' + item} className="text-gray-600 hover:text-black">&times;</button>
                        </span>
                    ))}
                    {adding ? (
                        <form onSubmit={add} className="flex items-center gap-2">
                            <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. Face Painting" className="rounded-full border border-black px-4 py-1 focus:border-black focus:ring-0" />
                            <button type="submit" className="rounded-full border-[1.5px] border-black bg-[#EAF1D1] px-4 py-1">Add</button>
                            <button type="button" onClick={() => setAdding(false)} className="underline">Cancel</button>
                        </form>
                    ) : (
                        <button type="button" onClick={() => setAdding(true)} className="rounded-full border border-dashed border-black px-4 py-1 text-lg hover:bg-gray-50">
                            + Add specialization
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}

function AboutCard({ profile }) {
    const [editing, setEditing] = useState(false);
    const [bio, setBio] = useState(profile.bio || '');
    const [years, setYears] = useState(profile.years_experience || '');
    const [busy, setBusy] = useState(false);

    const save = () => {
        setBusy(true);
        saveProfile(profile, { bio, years_experience: years }, {
            onSuccess: () => setEditing(false),
            onFinish: () => setBusy(false),
        });
    };

    return (
        <Panel
            title="About"
            action={
                editing
                    ? <SmallButton onClick={save} disabled={busy}>{busy ? 'Saving...' : 'Save'}</SmallButton>
                    : <SmallButton onClick={() => setEditing(true)}>Edit bio</SmallButton>
            }
        >
            <div className="p-6">
                {editing ? (
                    <div className="space-y-3">
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} className={FIELD + ' min-h-[140px]'} />
                        <label className="block">Years of experience
                            <input value={years} onChange={(e) => setYears(e.target.value)} className={FIELD + ' mt-1'} />
                        </label>
                    </div>
                ) : (
                    <>
                        <p className="whitespace-pre-line text-lg">{profile.bio || 'Add a short bio so parents can get to know you.'}</p>
                        {profile.years_experience && <p className="mt-2 text-gray-600">{profile.years_experience} years of experience</p>}
                    </>
                )}
            </div>
        </Panel>
    );
}

function AvailabilityCard({ profile }) {
    const [editing, setEditing] = useState(false);
    const [slots, setSlots] = useState(profile.availability);
    const [adding, setAdding] = useState(null);
    const [busy, setBusy] = useState(false);

    const begin = () => {
        setSlots(profile.availability);
        setEditing(true);
    };

    const addSlot = (day, time) => {
        if (!time) return;
        const next = [...new Set([...(slots[day] || []), time])].sort();
        setSlots({ ...slots, [day]: next });
        setAdding(null);
    };

    const removeSlot = (day, time) => setSlots({ ...slots, [day]: (slots[day] || []).filter((t) => t !== time) });

    const save = () => {
        setBusy(true);
        router.patch(route('tutor.availability.update'), { availability: slots }, {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
            onFinish: () => setBusy(false),
        });
    };

    const view = editing ? slots : profile.availability;

    return (
        <Panel
            id="availability"
            title="Availability"
            action={
                editing
                    ? <SmallButton onClick={save} disabled={busy}>{busy ? 'Saving...' : 'Save'}</SmallButton>
                    : <SmallButton onClick={begin}>Edit</SmallButton>
            }
        >
            <div className="bg-[#EAF1D1]">
                {DAYS.map(([key, label]) => {
                    const list = view[key] || [];
                    return (
                        <div key={key} className="flex flex-wrap items-center gap-3 border-b border-black/50 px-6 py-4 last:border-b-0">
                            <span className="w-14 text-lg">{label}</span>
                            {list.length === 0 && <span className="text-gray-600">No available slots</span>}
                            {list.map((time) => (
                                <span key={time} className="inline-flex items-center gap-2 rounded-full bg-[#B3DFDF] px-3 py-1">
                                    {fmtTime(time)}
                                    {editing && (
                                        <button type="button" onClick={() => removeSlot(key, time)} aria-label={'Remove ' + fmtTime(time)} className="text-gray-700 hover:text-black">&times;</button>
                                    )}
                                </span>
                            ))}
                            {editing && (
                                adding === key ? (
                                    <select autoFocus defaultValue="" onChange={(e) => addSlot(key, e.target.value)} onBlur={() => setAdding(null)} className="rounded-full border border-black py-1 focus:border-black focus:ring-0">
                                        <option value="" disabled>Pick time</option>
                                        {TIME_OPTIONS.map((time) => (
                                            <option key={time} value={time}>{fmtTime(time)}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <button type="button" onClick={() => setAdding(key)} aria-label={'Add a time on ' + label} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#B3DFDF] text-xl hover:opacity-80">+</button>
                                )
                            )}
                        </div>
                    );
                })}
            </div>
            <p className="border-t border-black/50 px-6 py-3 text-sm text-gray-600">
                Your availability is saved on your profile. The studio uses it when assigning sessions.
            </p>
        </Panel>
    );
}
function PortfolioCard({ profile }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({ image: null, title: '', tag: '' });
    const items = profile.portfolio || [];

    const submit = (event) => {
        event.preventDefault();
        post(route('tutor.portfolio.store'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    const remove = (index) => {
        if (window.confirm('Remove this image from your portfolio?')) {
            router.delete(route('tutor.portfolio.destroy', { index }), { preserveScroll: true });
        }
    };

    return (
        <Panel title="Portfolio" action={<SmallButton onClick={() => setOpen((v) => !v)}>{open ? 'Cancel' : 'Upload images'}</SmallButton>}>
            {open && (
                <form onSubmit={submit} className="space-y-3 border-b border-black/40 bg-[#EAF1D1] p-6">
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setData('image', e.target.files[0] || null)} />
                    {errors.image && <p className="text-sm text-red-700">{errors.image}</p>}
                    <div className="grid gap-3 sm:grid-cols-2">
                        <input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="Title (optional)" className={FIELD} />
                        <input value={data.tag} onChange={(e) => setData('tag', e.target.value)} placeholder="Tag, e.g. Mural" className={FIELD} />
                    </div>
                    <button type="submit" disabled={processing || !data.image} className="rounded-xl border-[1.5px] border-black bg-[#B3DFDF] px-5 py-2 hover:opacity-80 disabled:opacity-50">
                        {processing ? 'Uploading...' : 'Upload'}
                    </button>
                </form>
            )}
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.length === 0 && <p className="text-gray-600 sm:col-span-2 lg:col-span-3">No portfolio images yet. Upload photos of your students&rsquo; work.</p>}
                {items.map((item, index) => (
                    <figure key={item.path + index} className="overflow-hidden rounded-xl border border-black bg-white">
                        <img src={item.path} alt={item.title || 'Portfolio image'} className="h-32 w-full object-cover" />
                        <figcaption className="flex items-start justify-between gap-2 p-2 text-sm">
                            <span>
                                <span className="block font-semibold">{item.title || 'Untitled'}</span>
                                <span className="block text-xs text-gray-600">{item.tag}</span>
                            </span>
                            <button type="button" onClick={() => remove(index)} aria-label="Remove image" className="text-gray-600 hover:text-red-700">&times;</button>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </Panel>
    );
}

function pick(item, keys) {
    for (const key of keys) {
        if (item && item[key]) return String(item[key]);
    }
    return '';
}

function normalize(item) {
    if (typeof item === 'string') return { title: item, sub: '', note: '', cert: false };
    const title = pick(item, ['title', 'name', 'position', 'role', 'certificate', 'certification']);
    const org = pick(item, ['organization', 'organisation', 'company', 'institution', 'school', 'place', 'issuer', 'org']);
    const when = pick(item, ['period', 'years', 'year', 'date', 'duration']);
    const note = pick(item, ['description', 'details', 'summary']);
    const cert = /cert|licen|training|workshop/i.test(pick(item, ['type', 'kind']) + ' ' + title);
    return { title, sub: [org, when].filter(Boolean).join(DOT), note, cert };
}

function ExperienceCard({ items }) {
    const rows = (items || []).map(normalize).filter((row) => row.title);

    return (
        <Panel title="Certifications & Experiences">
            {rows.length === 0 ? (
                <p className="p-6 text-gray-600">No certifications or experience listed yet. Ask the studio to add them to your profile.</p>
            ) : (
                rows.map((row, index) => (
                    <div key={row.title + index} className="flex items-start gap-4 border-b border-black/40 px-6 py-4 last:border-b-0">
                        <span className={'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ' + (row.cert ? 'bg-[#EAF1D1]' : 'bg-[#B3DFDF]')} aria-hidden="true">
                            {row.cert ? '\u2605' : '\u25A0'}
                        </span>
                        <div>
                            <div className="text-lg">{row.title}</div>
                            {row.sub && <div className="text-gray-600">{row.sub}</div>}
                            {row.note && <div className="text-sm text-gray-600">{row.note}</div>}
                        </div>
                    </div>
                ))
            )}
        </Panel>
    );
}

function ReviewsCard({ reviews, rating }) {
    return (
        <Panel title="Reviews">
            <div className="border-b border-black/40 bg-[#EAF1D1] px-6 py-4">
                {rating.average ? (
                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-bold" style={FONT_HEAD}>{rating.average}</span>
                        <div>
                            <Stars value={rating.average} />
                            <div className="text-gray-700">Based on verified bookings</div>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-700">No parent reviews yet.</p>
                )}
            </div>
            {reviews.map((review) => (
                <div key={review.id} className="border-b border-black/40 bg-[#EAF1D1] px-6 py-4 last:border-b-0">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold" style={FONT_HEAD}>{review.name}</span>
                        <span className="text-sm text-gray-600">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Stars value={review.rating} size="text-base" />
                        <span className="text-sm">{review.rating}.0</span>
                    </div>
                    {review.comment && <p className="mt-1 text-gray-800">&ldquo;{review.comment}&rdquo;</p>}
                </div>
            ))}
        </Panel>
    );
}

export default function EditProfile({ profile, reviews = [], rating, status }) {
    const flash = {
        'availability-updated': 'Availability saved.',
        'portfolio-updated': 'Portfolio updated.',
        'profile-updated': 'Profile saved.',
    }[status];

    return (
        <AuthenticatedLayout
            header={<h1 className="text-3xl font-bold text-gray-900" style={FONT_HEAD}>My profile</h1>}
        >
            <Head title="My Profile" />

            <div className="space-y-6 px-6 pb-12 pt-4 sm:px-8">
                {flash && <p className="rounded-2xl border-[1.5px] border-black bg-[#EAF1D1] p-3">{flash}</p>}
                <HeaderCard profile={profile} rating={rating} />
                <div className="grid gap-6 lg:grid-cols-5">
                    <div className="space-y-6 lg:col-span-3">
                        <AboutCard profile={profile} />
                        <PortfolioCard profile={profile} />
                        <ExperienceCard items={profile.experience} />
                    </div>
                    <div className="space-y-6 lg:col-span-2">
                        <AvailabilityCard profile={profile} />
                        <ReviewsCard reviews={reviews} rating={rating} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}