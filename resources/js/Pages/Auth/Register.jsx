import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

/**
 * Happy Kid Arts and Tutorials — Register
 * Drop this in resources/js/Pages/Auth/Register.jsx (replaces Breeze's default)
 *
 * Assumes standard Breeze conventions: route('register'), and a
 * RegisteredUserController expecting name, email, password, password_confirmation.
 */

function Logo({ className = 'h-16 w-16' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="28" rx="16" ry="22" fill="#F4A6A6" transform="rotate(-20 50 50)" />
      <ellipse cx="72" cy="50" rx="16" ry="22" fill="#F2A878" transform="rotate(20 50 50)" />
      <ellipse cx="50" cy="72" rx="16" ry="22" fill="#A8D8B9" transform="rotate(-20 50 50)" />
      <ellipse cx="28" cy="50" rx="16" ry="22" fill="#8FD3D9" transform="rotate(20 50 50)" />
      <circle cx="50" cy="50" r="17" fill="#FFD95B" />
      <circle cx="44" cy="47" r="2" fill="#2b2b2b" />
      <circle cx="56" cy="47" r="2" fill="#2b2b2b" />
      <path d="M43 55 Q50 61 57 55" stroke="#2b2b2b" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c7 0 10.5 7 10.5 7a13.4 13.4 0 0 1-3.1 3.9M6.6 6.6C3.4 8.6 1.5 12 1.5 12s3.5 7 10.5 7a10.6 10.6 0 0 0 4.2-.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" strokeLinecap="round" />
    </svg>
  );
}

function PasswordField({ id, label, value, onChange, error, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block font-display font-semibold text-sm mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-black/70 px-4 py-2.5 pr-11 outline-none focus:border-[#7FCFCF] focus:ring-2 focus:ring-[#7FCFCF]/40 transition-colors"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#1c1c1c] transition-colors"
        >
          <EyeIcon open={visible} />
        </button>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('register'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <div className="min-h-screen bg-[#FBF4DC] flex flex-col items-center justify-center px-6 py-12 font-body">
      <Head title="Register" />

      <div className="flex items-center gap-3 mb-8">
        <Logo />
        <div className="font-display leading-tight">
          <p className="font-bold text-2xl">Happy Kid</p>
          <p className="text-base">Arts &amp; Tutorials</p>
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl border border-black/10 shadow-sm p-8">
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block font-display font-semibold text-sm mb-1.5">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              autoComplete="name"
              autoFocus
              className="w-full rounded-lg border border-black/70 px-4 py-2.5 outline-none focus:border-[#7FCFCF] focus:ring-2 focus:ring-[#7FCFCF]/40 transition-colors"
            />
            {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block font-display font-semibold text-sm mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              autoComplete="username"
              className="w-full rounded-lg border border-black/70 px-4 py-2.5 outline-none focus:border-[#7FCFCF] focus:ring-2 focus:ring-[#7FCFCF]/40 transition-colors"
            />
            {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
          </div>

          <PasswordField
            id="password"
            label="Password"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            error={errors.password}
            autoComplete="new-password"
          />

          <PasswordField
            id="password_confirmation"
            label="Confirm Password"
            value={data.password_confirmation}
            onChange={(e) => setData('password_confirmation', e.target.value)}
            error={errors.password_confirmation}
            autoComplete="new-password"
          />

          <div className="flex items-center justify-between pt-2">
            <Link href={route('login')} className="text-sm text-[#5fb3b3] hover:underline">
              Already registered?
            </Link>

            <button
              type="submit"
              disabled={processing}
              className="rounded-full bg-[#A9D9D9] hover:bg-[#93cbcb] disabled:opacity-60 border border-black/80 px-8 py-2.5 font-display font-bold tracking-wide text-sm transition-colors"
            >
              REGISTER
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-body { font-family: 'Lora', Georgia, serif; }
      `}</style>
    </div>
  );
}
