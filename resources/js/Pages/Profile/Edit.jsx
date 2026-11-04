import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const INPUT = 'mt-1 block w-full rounded-2xl border border-gray-300 bg-white px-5 py-3 text-lg text-gray-900 placeholder-gray-400 focus:border-[#2AA9A9] focus:ring-[#B3DFDF]';
const BUTTON = 'rounded-2xl bg-[#B3DFDF] px-6 py-3 text-lg text-gray-900 shadow hover:opacity-80 disabled:opacity-50';
const STRENGTH_COLORS = ['#E5E5E5', '#E57373', '#F2B84B', '#9BCB6B', '#3C9D5B'];
const STRENGTH_LABELS = ['Strength', 'Weak', 'Fair', 'Good', 'Strong'];

function Card({ title, description, action, children }) {
    return (
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-8 py-5">
                <div>
                    <h3 className="text-2xl font-semibold text-gray-900" style={FONT_HEAD}>{title}</h3>
                    {description && <p className="text-gray-500">{description}</p>}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

function FieldError({ message }) {
    return message ? <p className="mt-1 text-sm text-red-700">{message}</p> : null;
}

function EyeIcon({ open }) {
    return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            {!open && <path d="M4 4l16 16" />}
        </svg>
    );
}

function PasswordField({ id, label, value, onChange, placeholder, error, autoComplete }) {
    const [shown, setShown] = useState(false);

    return (
        <div>
            <label htmlFor={id} className="block text-lg text-gray-800">{label}</label>
            <div className="relative">
                <input
                    id={id}
                    type={shown ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className={INPUT + ' pr-14'}
                />
                <button
                    type="button"
                    onClick={() => setShown((current) => !current)}
                    aria-label={shown ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-800"
                >
                    <EyeIcon open={shown} />
                </button>
            </div>
            <FieldError message={error} />
        </div>
    );
}

function Strength({ password }) {
    const checks = [
        { label: 'At least 8 characters', ok: password.length >= 8 },
        { label: 'Upper and lowercase letters', ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
        { label: 'A number or symbol', ok: /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password) },
    ];
    const passed = checks.filter((check) => check.ok).length;
    const score = password.length === 0 ? 0 : Math.min(4, passed + (password.length >= 12 && passed === 3 ? 1 : 0));

    return (
        <div>
            <div className="flex items-center gap-3">
                <div className="grid flex-1 grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((segment) => (
                        <span
                            key={segment}
                            className="h-2 rounded-full"
                            style={{ backgroundColor: segment <= score ? STRENGTH_COLORS[score] : STRENGTH_COLORS[0] }}
                        />
                    ))}
                </div>
                <span className="w-20 text-right text-gray-500">{STRENGTH_LABELS[score]}</span>
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-10 gap-y-2 text-lg text-gray-600">
                {checks.map((check) => (
                    <li key={check.label} className="flex items-center gap-2">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" fill={check.ok ? '#CDEBC8' : '#E5E5E5'} />
                            <path d="M7.5 12.5l3 3 6-6.5" stroke={check.ok ? '#2E7D32' : '#9A9A9A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {check.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}
function ProfileCard({ mustVerifyEmail, status, childName }) {
    const user = usePage().props.auth.user;
    const isParent = user.role === 'parent';
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        child_name: childName || '',
    });

    const submit = (event) => {
        event.preventDefault();
        patch(route('profile.update'), { preserveScroll: true });
    };

    return (
        <Card
            title="Profile info"
            action={
                <span className="flex items-center gap-4">
                    {recentlySuccessful && <span className="text-gray-600">Saved.</span>}
                    <button type="submit" form="profile-form" disabled={processing} className={BUTTON}>
                        {processing ? 'Saving...' : 'Save changes'}
                    </button>
                </span>
            }
        >
            <form id="profile-form" onSubmit={submit} className="grid gap-6 px-8 py-6 md:grid-cols-2">
                <div>
                    <label htmlFor="name" className="block text-lg text-gray-800">Full name</label>
                    <input id="name" type="text" required autoComplete="name" className={INPUT} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    <FieldError message={errors.name} />
                </div>
                <div>
                    <label htmlFor="email" className="block text-lg text-gray-800">Email address</label>
                    <input id="email" type="email" required autoComplete="username" className={INPUT} value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    <FieldError message={errors.email} />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-lg text-gray-800">Mobile number</label>
                    <input id="phone" type="tel" autoComplete="tel" placeholder="+63 917 000 0000" className={INPUT} value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                    <FieldError message={errors.phone} />
                </div>
                {isParent && (
                    <div>
                        <label htmlFor="child_name" className="block text-lg text-gray-800">Child&rsquo;s name</label>
                        {childName ? (
                            <input id="child_name" type="text" className={INPUT} value={data.child_name} onChange={(e) => setData('child_name', e.target.value)} />
                        ) : (
                            <p className="mt-2 text-gray-600">
                                No child on your account yet.{' '}
                                <Link href={route('parent.profile.edit')} className="font-semibold underline">Add a student profile</Link>
                            </p>
                        )}
                        <FieldError message={errors.child_name} />
                    </div>
                )}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="md:col-span-2">
                        <p className="text-gray-800">
                            Your email address is unverified.{' '}
                            <Link href={route('verification.send')} method="post" as="button" className="underline">
                                Click here to re-send the verification email.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <p className="mt-2 text-green-700">A new verification link has been sent to your email address.</p>
                        )}
                    </div>
                )}
            </form>
        </Card>
    );
}

function PasswordCard() {
    const { data, setData, put, errors, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (formErrors) => {
                if (formErrors.password) reset('password', 'password_confirmation');
                if (formErrors.current_password) reset('current_password');
            },
        });
    };

    return (
        <Card title="Change password" description="Same form used by the emailed reset link, with your current password added.">
            <form onSubmit={submit} className="space-y-6 px-8 py-6">
                <PasswordField
                    id="current_password"
                    label="Current password"
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                    value={data.current_password}
                    onChange={(e) => setData('current_password', e.target.value)}
                    error={errors.current_password}
                />
                <PasswordField
                    id="password"
                    label="New password"
                    placeholder="Create a new password"
                    autoComplete="new-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />
                <Strength password={data.password} />
                <PasswordField
                    id="password_confirmation"
                    label="Confirm new password"
                    placeholder="Re-enter the new password"
                    autoComplete="new-password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    error={errors.password_confirmation}
                />
                <div className="flex items-center gap-4">
                    <button type="submit" disabled={processing} className={BUTTON}>
                        {processing ? 'Saving...' : 'Save new password'}
                    </button>
                    {recentlySuccessful && <span className="text-gray-600">Password updated.</span>}
                </div>
            </form>
        </Card>
    );
}

export default function Edit({ mustVerifyEmail, status, childName }) {
    return (
        <AuthenticatedLayout
            header={<h1 className="text-3xl font-bold text-gray-900" style={FONT_HEAD}>Settings</h1>}
        >
            <Head title="Settings" />

            <div className="mx-auto max-w-5xl space-y-6 px-6 pb-12 pt-6 sm:px-8">
                <ProfileCard mustVerifyEmail={mustVerifyEmail} status={status} childName={childName} />
                <PasswordCard />
                <Card title="Delete account">
                    <div className="px-8 py-6">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}