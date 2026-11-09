import { Head, Link, usePage } from '@inertiajs/react';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const DAYS = [['sun', 'SUN'], ['mon', 'MON'], ['tue', 'TUE'], ['wed', 'WED'], ['thu', 'THU'], ['fri', 'FRI'], ['sat', 'SAT']];

function fmtTime(value) {
    const [h, m] = String(value).split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return hour + ':' + String(m).padStart(2, '0') + ' ' + suffix;
}

function monthYear(value) {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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

function Panel({ title, subtitle, children }) {
    return (
        <section className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-white">
            <div className="border-b border-black bg-[#B3DFDF] px-6 py-4">
                <h2 className="text-2xl" style={FONT_HEAD}>{title}</h2>
                {subtitle && <p className="text-gray-700">{subtitle}</p>}
            </div>
            {children}
        </section>
    );
}

function Pill({ href, children, solid }) {
    return (
        <Link href={href} className={'inline-flex items-center rounded-xl border-[1.5px] border-black px-5 py-2 text-lg hover:opacity-80 ' + (solid ? 'bg-[#B3DFDF]' : 'bg-white')}>
            {children}
        </Link>
    );
}

export default function TutorProfile({ tutor }) {
    const user = usePage().props.auth && usePage().props.auth.user;
    const isParent = Boolean(user && user.role === 'parent');
    const first = (tutor.name || '').split(' ')[0];
    const subjects = tutor.subjects || [];
    const reviews = tutor.reviews || [];
    const portfolio = tutor.portfolio || [];
    const experience = tutor.experience || [];
    const initials = (tutor.name || '?').split(' ').map((p) => p.charAt(0)).slice(0, 2).join('').toUpperCase();

    return (
        <div className="min-h-screen bg-white px-4 py-8 sm:px-8" style={{ fontFamily: "'Lora', Georgia, serif" }}>
            <Head title={tutor.name + ' - Happy Kid Arts and Tutorials'} />
            <div className="mx-auto max-w-6xl space-y-6">
                <Link href={isParent ? '/parent/book' : '/tutors'} className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-black bg-[#EAF1D1] px-5 py-2 text-lg hover:opacity-80">
                    &larr; {isParent ? 'Back to bookings' : 'Back to tutors'}
                </Link>

                <section className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-white shadow-lg">
                    <div className="h-24 bg-[#EAF1D1]" />
                    <div className="px-6 pb-6">
                        <div className="-mt-14 flex flex-wrap items-end gap-5">
                            {tutor.photo ? (
                                <img src={tutor.photo} alt={tutor.name} className="h-36 w-36 rounded-xl border-2 border-black object-cover" />
                            ) : (
                                <div className="flex h-36 w-36 items-center justify-center rounded-xl border-2 border-black bg-[#006B6B] text-4xl font-bold text-white">{initials}</div>
                            )}
                            <div className="min-w-0 flex-1 pb-1">
                                <h1 className="text-3xl font-bold" style={FONT_HEAD}>{tutor.name}</h1>
                                <p className="text-lg text-gray-700">Verified tutor</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 pb-1">
                                {tutor.review_count > 0 ? (
                                    <span className="flex items-center gap-2"><Stars value={tutor.average_rating} />{Number(tutor.average_rating).toFixed(1)} ({tutor.review_count})</span>
                                ) : (
                                    <span className="text-gray-600">No reviews yet</span>
                                )}
                                {isParent && <Pill href="/messages">Message</Pill>}
                                <Pill href={isParent ? '/parent/book' : '/login'} solid>Book with {first}</Pill>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {subjects.map((s) => <span key={s} className="rounded-full bg-[#B3DFDF] px-4 py-1 text-lg">{s}</span>)}
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-5">
                    <div className="space-y-6 lg:col-span-3">
                        <Panel title="About">
                            <p className="whitespace-pre-line p-6 text-lg">{tutor.bio || 'This tutor has not added a bio yet.'}</p>
                        </Panel>

                        <Panel title="Portfolio">
                            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                                {portfolio.length === 0 && <p className="text-gray-600 sm:col-span-2 lg:col-span-3">No portfolio images yet.</p>}
                                {portfolio.map((item, i) => (
                                    <figure key={item.path + i} className="overflow-hidden rounded-xl border border-black bg-white">
                                        <img src={item.path} alt={item.title || 'Portfolio image'} className="h-32 w-full object-cover" />
                                        <figcaption className="p-2 text-sm">
                                            <span className="block font-semibold">{item.title || 'Untitled'}</span>
                                            <span className="block text-xs text-gray-600">{item.tag}</span>
                                        </figcaption>
                                    </figure>
                                ))}
                            </div>
                        </Panel>
                    </div>

                    <div className="space-y-6 lg:col-span-2">
                        <Panel title="Availability">
                            <div className="bg-[#EAF1D1]">
                                {DAYS.map(([key, label]) => {
                                    const list = (tutor.availability && tutor.availability[key]) || [];
                                    return (
                                        <div key={key} className="flex flex-wrap items-center gap-3 border-b border-black/50 px-6 py-4 last:border-b-0">
                                            <span className="w-14 text-lg">{label}</span>
                                            {list.length === 0 && <span className="text-gray-600">No available slots</span>}
                                            {list.map((t) => <span key={t} className="rounded-full bg-[#B3DFDF] px-3 py-1">{fmtTime(t)}</span>)}
                                        </div>
                                    );
                                })}
                            </div>
                        </Panel>

                        <Panel title="Reviews" subtitle={tutor.review_count + ' parent ' + (tutor.review_count === 1 ? 'review' : 'reviews')}>
                            <div className="border-b border-black/40 bg-[#EAF1D1] px-6 py-4">
                                {tutor.review_count > 0 ? (
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl font-bold" style={FONT_HEAD}>{Number(tutor.average_rating).toFixed(1)}</span>
                                        <div><Stars value={tutor.average_rating} /><div className="text-gray-700">Based on verified bookings</div></div>
                                    </div>
                                ) : (
                                    <p className="text-gray-700">No parent reviews yet.</p>
                                )}
                            </div>
                            {reviews.map((r, i) => (
                                <div key={i} className="border-b border-black/40 bg-[#EAF1D1] px-6 py-4 last:border-b-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-semibold" style={FONT_HEAD}>{r.reviewer || 'Parent'}</span>
                                        <span className="text-sm text-gray-600">{monthYear(r.created_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-2"><Stars value={r.rating} size="text-base" /><span className="text-sm">{r.rating}.0</span></div>
                                    {r.comment && <p className="mt-1 text-gray-800">&ldquo;{r.comment}&rdquo;</p>}
                                </div>
                            ))}
                        </Panel>
                    </div>
                </div>
            </div>
        </div>
    );
}