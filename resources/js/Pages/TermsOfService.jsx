import { Head, Link } from '@inertiajs/react';

const NAV_LINKS = [
  { label: 'Find a tutor', href: '/tutors' },
  { label: 'Services', href: '/#services' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'About Us', href: '/#about' },
  { label: 'Why Choose Us', href: '/#why-us' },
];

const SECTIONS = [
  {
    title: '1. Reservation Policy',
    items: [
      "Full payment is required upon booking to reserve a student's slot in any class or tutorial session.",
      'Once payment is confirmed, the selected slot will be reserved exclusively for the student.',
    ],
  },
  {
    title: '2. No-Refund Policy',
    items: [
      'All payments are non-refundable once the booking has been confirmed.',
      "This policy applies because the student's slot is immediately reserved and allocated exclusively to them, preventing another student from taking the same slot.",
    ],
  },
  {
    title: '3. Rescheduling Instead of Refund',
    items: [
      'If a student is unable to attend their scheduled session, they may request to reschedule or rebook the session instead of requesting a refund.',
      "Rescheduling is subject to the tutor's and/or class's available slots.",
    ],
  },
  {
    title: '4. Rescheduling Guidelines',
    items: [
      'Rescheduling requests must be submitted at least 24 hours before the scheduled session.',
      'Rescheduled sessions are subject to slot availability.',
      'Each payment allows up to one reschedule.',
      'Requests made less than 24 hours before the session may not be eligible for rescheduling.',
    ],
  },
  {
    title: '5. No-Show Policy',
    items: [
      'Students who miss their scheduled session without prior notice will forfeit the session.',
      'No-shows without prior notice are not eligible for rebooking or rescheduling.',
    ],
  },
];

const ACKNOWLEDGMENT =
  'By making a payment and reserving a session, the parent/guardian acknowledges and agrees to these Terms and Conditions and confirms their understanding that payments are non-refundable but may be rescheduled subject to the guidelines above.';

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
    white: 'bg-white hover:bg-[#f5f5f5] text-[#25311f]',
  };
  return (
    <Link href={href} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </Link>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h5 className="font-display font-semibold mb-4">{title}</h5>
      <ul className="space-y-2 text-sm text-[#333]">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="hover:underline">{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TermsOfService() {
  return (
    <>
      <Head title="Terms of Service - Happy Kid Arts and Tutorials" />

      <div className="font-body text-[#232323] bg-white">
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

        <section className="bg-[#E4EDCE] px-6 py-16 text-center">
          <h1 className="font-display font-bold text-4xl tracking-wide text-[#1c1c1c]">
            TERMS OF SERVICE
          </h1>
          <p className="mt-3 text-[#3c3c3c]">Payment and Rescheduling Policy</p>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="space-y-8">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="font-display font-semibold text-lg text-[#1c1c1c] mb-2">
                  {section.title}
                </h2>
                <ul className="space-y-1.5 pl-5">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-[#333] leading-relaxed list-disc marker:text-[#333]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h2 className="font-display font-semibold text-lg text-[#1c1c1c] mb-2">
                6. Acknowledgment
              </h2>
              <p className="text-[#333] leading-relaxed">{ACKNOWLEDGMENT}</p>
            </div>
          </div>
        </section>
        <footer className="bg-[#E4EDCE] pt-16">
          <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-2">
                <Logo className="h-8 w-8" />
                <span className="font-display font-semibold">Happy Kid Arts and Tutorials</span>
              </div>
              <p className="mt-4 text-sm text-[#444] max-w-xs">
                Nurturing young artists and learners since day one. From step-by-step art coaching to
                school tutoring and party painting events, we make learning fun.
              </p>
            </div>

            <FooterColumn
              title="Quick Links"
              links={[
                { label: 'Find a Tutor', href: '/tutors' },
                { label: 'Services', href: '/#services' },
                { label: 'How It Works', href: '/#how-it-works' },
                { label: 'About Us', href: '/#about' },
                { label: 'Why Choose Us', href: '/#why-us' },
              ]}
            />
            <FooterColumn
              title="Support"
              links={[
                { label: 'Help Center', href: '#' },
                { label: 'FAQs', href: '#' },
                { label: 'Report A Problem', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms Of Service', href: '/terms-of-service' },
              ]}
            />
          </div>

          <div className="mt-14 bg-[#A9D9D9] py-4">
            <p className="text-center text-sm text-[#1c1c1c]">
              &copy; {new Date().getFullYear()} Happy Kid Arts and Services - All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      <style>{`
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-body { font-family: 'Lora', Georgia, serif; }
      `}</style>
    </>
  );
}
