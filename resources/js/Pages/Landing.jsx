import { Head, Link } from '@inertiajs/react';

/**
 * Happy Kid Arts and Tutorials â€” Landing page
 *
 * Drop this in resources/js/Pages/Landing.jsx
 * Route it from web.php, e.g.:
 *   Route::get('/', fn () => Inertia::render('Landing'));
 *
 * Fonts: add these once in your root layout's <head> (e.g. app.blade.php)
 * so they aren't re-fetched on every page:
 *   <link rel="preconnect" href="https://fonts.googleapis.com">
 *   <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&family=Lora:wght@400;500;600&display=swap" rel="stylesheet">
 *
 * Images: the hero photo and "man pointing" CTA photo are placeholders
 * (soft blobs with an icon). Replace the two <PhotoPlaceholder> usages
 * below with real <img> tags once you have final assets.
 */

const NAV_LINKS = [
  { label: 'Find a tutor', href: '/tutors' },
  { label: 'Services', href: '#services' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About Us', href: '#about' },
  { label: 'Why Choose Us', href: '#why-us' },
];

const ART_SERVICES = [
  'Drawing and Painting Lessons',
  'Mural Painting',
  'Costume Making',
  'Art Party Painting',
  'Face Painting for Events',
  'Art Lessons',
  'Commission Painting',
  'Props Making for Stage Designs',
  'Digital Arts',
];

const ACADEMIC_SERVICES = [
  'Regular Academic Tutoring',
  'Entrance Examination Review',
  'Examination Review',
];

const STEPS = [
  {
    number: '01',
    title: 'Book your session',
    desc: "Tell us your goals and we'll match a private tutor to your child's level, personality and pace.",
  },
  {
    number: '02',
    title: 'Meet your tutor',
    desc: 'A relaxed first lesson with zero commitment. Keep the tutor you love, or switch for free anytime.',
  },
  {
    number: '03',
    title: 'Watch grades grow',
    desc: 'A personalized plan, weekly lessons and progress you can actually see term after term.',
  },
];

const WHY_US = [
  {
    title: "All-in-one for kids' development",
    desc: "Art skills and academic tutoring under one roof, so you're not juggling separate providers",
  },
  {
    title: 'Fun beyond lessons',
    desc: 'Art Party Painting events turn birthdays and celebrations into a creative experience, not just a class',
  },
  {
    title: 'Flexible format',
    desc: 'Online or face-to-face, fits different schedules and comfort levels',
  },
  {
    title: 'Builds confidence through creativity',
    desc: 'Find potential tutors in one organized platform instead of searching through different sources',
  },
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

function PhotoPlaceholder({ className = '', label }) {
  return (
    <div
      className={`flex items-center justify-center bg-[#cfe7e5] text-[#3c5a57]/60 font-medium text-sm ${className}`}
    >
      {label}
    </div>
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

function SectionHeading({ children, subtitle }) {
  return (
    <div className="text-center mb-12">
      <h2 className="font-display italic text-4xl md:text-[2.75rem] text-[#20261d]">{children}</h2>
      {subtitle && <p className="mt-4 text-[#4b4b4b]">{subtitle}</p>}
    </div>
  );
}

export default function Landing() {
  return (
    <>
      <Head title="Happy Kid Arts and Tutorials" />

      <div className="font-body text-[#232323] bg-white">
        {/* ---------- NAVBAR ---------- */}
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

        {/* ---------- HERO ---------- */}
        <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#eef0fb] to-[#dcdff5]">
          <div className="mx-auto max-w-7xl px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-display italic text-4xl sm:text-5xl leading-[1.15] text-[#20261d]">
                Where creativity meets learning&mdash; expert tutoring in art and beyond
              </h1>

              <ul className="mt-8 space-y-2 text-[#333] list-disc list-inside">
                <li>Step-by-step coaching for drawing, painting, and school subjects</li>
                <li>Nurture imagination, critical thinking, and study skills</li>
                <li>Live online and onsite lessons tailored to your child's unique pace</li>
              </ul>

              <PillButton href="/tutors" variant="solid" className="mt-8 px-10 py-3 text-base">
                Find a Tutor
              </PillButton>

              <div className="mt-12 flex items-center gap-8">
                <Stat value="4.7" label="Average rating" />
                <Divider />
                <Stat value="5+" label="Tutors" />
                <Divider />
                <Stat value="12+" label="Subjects" />
              </div>
            </div>

            <div className="relative flex justify-center">
              <PhotoPlaceholder
                label="child painting photo"
                className="w-[380px] h-[320px] rounded-[45%_55%_60%_40%/50%_45%_55%_50%] shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* ---------- ARTS & CREATIVE SERVICES ---------- */}
        <section id="services" className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-[48px] bg-[#A9D9D9] px-8 py-12 md:px-16 md:py-14 shadow-sm">
            <h3 className="text-center font-display font-semibold text-xl mb-10">Arts &amp; Creative Services</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ART_SERVICES.map((service) => (
                <div
                  key={service}
                  className="bg-white border border-black/70 rounded-2xl px-6 py-8 text-center font-medium shadow-[0_3px_0_rgba(0,0,0,0.15)]"
                >
                  {service}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- ACADEMIC TUTORIAL SERVICES ---------- */}
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="rounded-[48px] bg-[#E4EDCE] px-8 py-12 md:px-16 md:py-14 shadow-sm">
            <h3 className="text-center font-display font-semibold text-xl mb-10">
              Academic Tutorial Services (Pre-Kindergarten to High School)
            </h3>
            <div className="grid sm:grid-cols-3 gap-6">
              {ACADEMIC_SERVICES.map((service) => (
                <div
                  key={service}
                  className="bg-white border border-black/70 rounded-2xl px-6 py-8 text-center font-medium shadow-[0_3px_0_rgba(0,0,0,0.15)]"
                >
                  {service}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- HOW IT WORKS ---------- */}
        <section id="how-it-works" className="bg-[#E4EDCE] py-20">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading subtitle="A simple, three-step path from first hello to visible progress.">
              How it works
            </SectionHeading>

            <div className="relative grid md:grid-cols-3 gap-14">
              {/* dotted connector, desktop only */}
              <svg
                className="hidden md:block absolute top-16 left-0 w-full h-10 -z-0"
                viewBox="0 0 900 40"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M120 30 Q 300 -10 450 30 T 780 20"
                  fill="none"
                  stroke="#20261d"
                  strokeWidth="2"
                  strokeDasharray="2 8"
                  strokeLinecap="round"
                />
              </svg>

              {STEPS.map((step) => (
                <div key={step.number} className="relative z-10 flex flex-col items-center text-center">
                  <StepIcon number={step.number} />
                  <div className="mt-5 w-9 h-9 rounded-full border border-black/70 bg-white flex items-center justify-center text-sm font-semibold">
                    {step.number}
                  </div>
                  <h4 className="mt-4 text-lg font-semibold">{step.title}</h4>
                  <p className="mt-2 text-[#444] text-sm max-w-xs">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- ABOUT US ---------- */}
        <section id="about" className="py-20">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="font-display italic text-4xl text-[#20261d] mb-6">About Us</h2>
            <p className="text-[#333] leading-relaxed">
              Finding the right tutor can make learning easier, more comfortable, and more effective.
              Happy Kid Arts and Tutorials (HKAT) is a tutor-finding platform created to connect students
              with tutors based on their academic needs, preferred subjects, availability, and learning
              preferences. Our platform provides students with an organized way to discover tutors,
              explore their profiles, and view their qualifications.
            </p>
          </div>

          <div className="mx-auto max-w-6xl px-6 mt-12 grid md:grid-cols-2 gap-8">
            <AboutCard title="Our Mission">
              Our mission is to make finding academic support simple, convenient, and accessible for
              students. We aim to provide a platform where students can easily discover suitable tutors
              without having to rely solely on personal recommendations or search through multiple
              sources. By bringing students and tutors together in one platform, we hope to create a
              more organized and supportive learning community.
            </AboutCard>
            <AboutCard title="Our Vision">
              Our vision is to build a connected learning community where students can easily access the
              academic support they need and tutors can share their knowledge with learners who need it.
              We envision a platform where finding a tutor is not difficult or time-consuming, allowing
              students to focus more on learning and achieving their academic goals.
            </AboutCard>
          </div>
        </section>

        {/* ---------- WHY CHOOSE US ---------- */}
        <section id="why-us" className="relative bg-[#E4EDCE]">
          <svg className="block w-full -mb-px" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,60 C480,-20 960,60 1440,0 L1440,60 L0,60 Z" fill="#E4EDCE" />
          </svg>

          <div className="mx-auto max-w-6xl px-6 pt-6 pb-24">
            <h2 className="text-center font-display font-semibold text-2xl mb-16">Why choose us?</h2>

            <div className="relative grid md:grid-cols-2 gap-x-20 gap-y-16 items-center">
              <WhyBlock {...WHY_US[0]} align="right" />
              <WhyBlock {...WHY_US[1]} align="left" />
              <WhyBlock {...WHY_US[2]} align="right" />
              <WhyBlock {...WHY_US[3]} align="left" />

              <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
                <Logo className="h-40 w-40 drop-shadow-md" />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="py-20 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="relative bg-[#A9D9D9] rounded-[50%/40%] md:rounded-[60%/45%] px-10 py-16 md:px-24 md:py-20 text-center overflow-visible">
              <h2 className="font-display font-semibold text-2xl md:text-3xl">Start Your Learning Journey</h2>
              <p className="mt-5 max-w-2xl mx-auto text-[#333]">
                Whether you need help understanding a difficult topic, preparing for an upcoming
                assessment, or simply want to improve your skills, the right tutor can make a difference.
              </p>
              <p className="mt-3 max-w-2xl mx-auto text-[#333]">
                Explore available tutors and find someone who matches your academic needs and preferences.
              </p>
              <PillButton href="/tutors" variant="white" className="mt-8 px-10 py-3 text-base">
                Find your tutor now
              </PillButton>

              <PhotoPlaceholder
                label="tutor photo"
                className="hidden md:flex absolute -right-6 bottom-0 w-56 h-64 rounded-t-full"
              />
            </div>
          </div>
        </section>

        {/* ---------- FOOTER ---------- */}
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
              links={['Find a Tutor', 'Become a Tutor', 'Services', 'How It Works', 'About Us', 'Why Choose Us']}
            />
            <FooterColumn
              title="Support"
              links={['Help Center', 'FAQs', 'Report A Problem', 'Privacy Policy', 'Terms Of Service']}
            />
          </div>

          <div className="mt-14 bg-[#A9D9D9] py-4">
            <p className="text-center text-sm text-[#1c1c1c]">
              &copy; {new Date().getFullYear()} Happy Kid Arts and Services &mdash; All rights reserved.
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

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="font-display font-semibold text-xl">{value}</div>
      <div className="text-xs text-[#555] mt-1">{label}</div>
    </div>
  );
}

function Divider() {
  return <div className="h-8 w-px bg-black/20" />;
}

function AboutCard({ title, children }) {
  return (
    <div className="bg-[#A9D9D9] border border-black/40 rounded-[32px] px-8 py-9 shadow-sm">
      <span className="inline-block bg-white border border-black/70 rounded-full px-4 py-1 text-sm font-semibold">
        {title}
      </span>
      <p className="mt-5 text-[#2b2b2b] leading-relaxed text-[15px]">{children}</p>
    </div>
  );
}

function WhyBlock({ title, desc, align }) {
  return (
    <div className={`max-w-sm ${align === 'right' ? 'md:ml-auto md:text-right' : ''}`}>
      <h4 className="font-semibold text-lg">{title}</h4>
      <p className="mt-2 text-sm text-[#444]">{desc}</p>
    </div>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h5 className="font-display font-semibold mb-4">{title}</h5>
      <ul className="space-y-2 text-sm text-[#333]">
        {links.map((link) => (
          <li key={link}>
            <a
              href={
                link === 'Terms Of Service'
                  ? '/terms-of-service'
                  : link === 'Find a Tutor'
                    ? '/tutors'
                    : link === 'Become a Tutor'
                      ? '/tutor/apply'
                      : '#'
              }
              className="hover:underline"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepIcon({ number }) {
  // Simple, distinct line-icon per step
  if (number === '01') {
    return (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
        <circle cx="36" cy="36" r="34" stroke="#20261d" strokeWidth="1.5" />
        <path d="M24 30h24M24 38h16M24 46h20" stroke="#20261d" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (number === '02') {
    return (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
        <rect x="14" y="20" width="44" height="28" rx="3" stroke="#20261d" strokeWidth="1.5" />
        <path d="M28 54h16M36 48v6" stroke="#20261d" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="30" cy="34" r="4" stroke="#20261d" strokeWidth="1.5" />
        <circle cx="42" cy="34" r="4" stroke="#20261d" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <path d="M36 12c8 6 12 16 10 30-6 0-14-2-18-8-6-8-4-18 8-22Z" stroke="#20261d" strokeWidth="1.5" />
      <circle cx="38" cy="24" r="3" stroke="#20261d" strokeWidth="1.5" />
      <path d="M24 54l6-6M18 60l10-10" stroke="#20261d" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
