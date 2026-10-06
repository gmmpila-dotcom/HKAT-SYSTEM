import { Head, Link } from '@inertiajs/react';

/**
 * Happy Kid Arts and Tutorials — Tutor Profile (database-driven)
 * Drop this in resources/js/Pages/TutorProfile.jsx (replaces the static-data version)
 *
 * Now receives a single `tutor` object as an Inertia prop from
 * PublicTutorController@show, matched by route model binding on
 * /tutors/{tutorProfile}, instead of looking the tutor up in a static file.
 */

function Logo({ className = 'h-9 w-9' }) {
  const petals = 10;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {Array.from({ length: petals }).map((_, i) => {
        const hue = (360 / petals) * i;
        return (
          <ellipse
            key={i}
            cx="50"
            cy="22"
            rx="10"
            ry="20"
            fill={`hsl(${hue}, 75%, 58%)`}
            transform={`rotate(${(360 / petals) * i} 50 50)`}
          />
        );
      })}
      <circle cx="50" cy="50" r="18" fill="#FFD23F" />
      <circle cx="43" cy="47" r="2.2" fill="#2b2b2b" />
      <circle cx="57" cy="47" r="2.2" fill="#2b2b2b" />
      <path d="M42 55 Q50 62 58 55" stroke="#2b2b2b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function PillButton({ children, href = '#', variant = 'solid', className = '' }) {
  const base = 'inline-flex items-center justify-center rounded-full px-6 py-2.5 font-semibold border border-black/80 transition-colors';
  const styles = {
    solid: 'bg-[#DCE7C3] hover:bg-[#cfe0ac] text-[#25311f]',
    outline: 'bg-white hover:bg-[#f5f5f5] text-[#25311f]',
  };
  return (
    <Link href={href} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </Link>
  );
}

function Card({ title, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-black/10 overflow-hidden bg-white shadow-sm ${className}`}>
      <div className="bg-[#A9D9D9] px-6 py-3">
        <h2 className="font-display font-semibold">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

const EXPERIENCE_ICONS = {
  education: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 2 8l10 5 10-5-10-5Z" strokeLinejoin="round" />
      <path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" />
    </svg>
  ),
  work: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  certification: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="5" />
      <path d="M8.5 12.5 7 21l5-2.5L17 21l-1.5-8.5" />
    </svg>
  ),
  award: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="9" r="5" />
      <path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.5-7" />
    </svg>
  ),
};

export default function TutorProfile({ tutor }) {
  if (!tutor) {
    return (
      <>
        <Head title="Tutor not found — Happy Kid Arts and Tutorials" />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 font-body">
          <p className="text-lg">We couldn't find that tutor.</p>
          <PillButton href="/tutors" variant="solid">Back to tutors</PillButton>
        </div>
      </>
    );
  }

  const subjects = tutor.subjects ?? [];
  const experience = tutor.experience ?? [];
  const reviews = tutor.reviews ?? [];
  const firstName = tutor.name?.split(' ')[0] ?? 'This tutor';

  return (
    <>
      <Head title={`${tutor.name} — Happy Kid Arts and Tutorials`} />

      <div className="font-body text-[#232323] bg-white min-h-screen">
        {/* ---------- NAVBAR ---------- */}
        <header className="sticky top-0 z-50 bg-[#A9D9D3] border-b border-black/10">
          <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
              <span className="font-display font-semibold text-lg text-[#1c1c1c]">
                Happy Kid Arts and Tutorials
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <PillButton href="/login" variant="outline">Log in</PillButton>
              <PillButton href="/register" variant="solid">Sign up</PillButton>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-6 py-8">
          <Link
            href="/tutors"
            className="inline-flex items-center gap-1.5 rounded-full border border-black/70 bg-white px-4 py-1.5 text-sm font-medium hover:bg-[#f5f5f5] transition-colors"
          >
            <span aria-hidden="true">&larr;</span> Back to tutors
          </Link>

          {/* ---------- PROFILE HEADER ---------- */}
          <div className="mt-6 rounded-2xl bg-[#E4EDCE] p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
            <img
              src={tutor.photo}
              alt={tutor.name}
              className="w-28 h-28 rounded-xl object-cover border border-black/20 flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-display font-semibold text-2xl">{tutor.name}</h1>
                  <p className="text-[#4b4b4b] mt-1">{tutor.credential}</p>
                </div>
                <PillButton href="/parent/book" variant="solid" className="whitespace-nowrap">
                  Book a session
                </PillButton>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-medium bg-white border border-black/10 rounded-full px-3 py-1"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ---------- CONTENT GRID ---------- */}
          <div className="mt-8 grid md:grid-cols-2 gap-6 items-start">
            <Card title="About">
              <p className="text-[#333] leading-relaxed">{tutor.bio}</p>
            </Card>

            <Card title="Availability">
              <p className="text-[#333] leading-relaxed">
                This tutor hasn't set up a public schedule yet. Start a booking to ask about
                current openings and choose an available session time.
              </p>
            </Card>

            <Card title="Certifications & Experience" className="md:col-span-2">
              {experience.length === 0 ? (
                <p className="text-[#555]">No certifications or experience listed yet.</p>
              ) : (
                <ul className="space-y-5">
                  {experience.map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-[#A9D9D9]/50 flex items-center justify-center text-[#20261d]">
                        {EXPERIENCE_ICONS[item.type] ?? EXPERIENCE_ICONS.work}
                      </span>
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        {item.subtitle && <p className="text-sm text-[#555]">{item.subtitle}</p>}
                        {item.detail && <p className="text-sm text-[#444] mt-1">{item.detail}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Reviews" className="md:col-span-2">
              {reviews.length === 0 ? (
                <p className="text-[#555]">No reviews yet.</p>
              ) : (
                <div className="space-y-5">
                  <p className="font-semibold">Average rating: {Number(tutor.average_rating || 0).toFixed(2)} / 5</p>
                  {reviews.map((review, index) => (
                    <div key={`${review.created_at}-${index}`} className="border-t border-black/10 pt-4">
                      <p className="text-[#c08b19]">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                      {review.comment && <p className="mt-1 text-[#333]">{review.comment}</p>}
                      <p className="mt-1 text-sm text-[#555]">{review.reviewer || 'Parent'}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-body { font-family: 'Lora', Georgia, serif; }
      `}</style>
    </>
  );
}
