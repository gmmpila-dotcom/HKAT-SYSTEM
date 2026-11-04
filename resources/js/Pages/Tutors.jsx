import { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';

const NAV_LINKS = [
  { label: 'Find a tutor', href: '/tutors' },
  { label: 'Services', href: '/#services' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'About Us', href: '/#about' },
  { label: 'Why Choose Us', href: '/#why-us' },
];

const FILTERS = [
  { key: 'all', label: 'All Tutors' },
  { key: 'academic', label: 'Academic' },
  { key: 'arts', label: 'Arts' },
  { key: 'special', label: 'Special Teaching' },
];

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

function TutorCard({ tutor }) {
  return (
    <div className="bg-white border border-black/70 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <img
          src={tutor.photo}
          alt={tutor.name}
          className="w-20 h-20 rounded-xl object-cover border border-black/20 flex-shrink-0"
        />
        <div>
          <h3 className="font-display font-semibold text-lg leading-snug">{tutor.name}</h3>
          <p className="text-sm text-[#4b4b4b] mt-0.5">{tutor.credential}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(tutor.subjects || []).map((s) => (
          <span
            key={s}
            className="text-xs font-medium bg-[#A9D9D9]/60 border border-black/10 rounded-full px-3 py-1"
          >
            {s}
          </span>
        ))}
      </div>

      <Link
        href={`/tutors/${tutor.id}`}
        className="mt-5 flex items-center justify-center rounded-full px-6 py-2.5 font-semibold border border-black/80 bg-[#A9D9D9] hover:bg-[#93cbcb] text-[#1c1c1c] transition-colors"
      >
        View Profile
      </Link>
    </div>
  );
}

export default function Tutors({ tutors = [] }) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return tutors.filter((t) => {
      const matchesFilter = activeFilter === 'all' || (t.categories || []).includes(activeFilter);
      const haystack = [t.name, t.credential, ...(t.subjects || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesQuery = words.every((w) => haystack.includes(w));
      return matchesFilter && matchesQuery;
    });
  }, [query, activeFilter, tutors]);

  return (
    <>
      <Head title="Find a Tutor - Happy Kid Arts and Tutorials" />

      <div className="font-body text-[#232323] bg-white min-h-screen">
        <header className="sticky top-0 z-50 bg-[#A9D9D3] border-b border-black/10">
          <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
              <span className="font-display font-semibold text-lg text-[#1c1c1c]">
                Happy Kid Arts and Tutorials
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-[#1c1c1c]">
              {NAV_LINKS.map((link) => (
                <a key={link.label} href={link.href} className="hover:opacity-70 transition-opacity">
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <PillButton href="/login" variant="outline">Log in</PillButton>
              <PillButton href="/register" variant="solid">Sign up</PillButton>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <h1 className="font-display font-bold text-3xl">Tutors</h1>

            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:ml-auto">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or subject"
                  className="pl-10 pr-4 py-3 rounded-xl bg-[#e9e9e9] border border-black/10 w-full sm:w-72 outline-none focus:bg-white focus:border-black/30 transition-colors"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`rounded-full border border-black/70 px-4 py-2 text-sm font-medium transition-colors ${
                      activeFilter === f.key ? 'bg-[#DCE7C3]' : 'bg-white hover:bg-[#f5f5f5]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="mt-16 text-center text-[#666]">No tutors match that search yet.</p>
          ) : (
            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              {filtered.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-body { font-family: 'Lora', Georgia, serif; }
      `}</style>
    </>
  );
}