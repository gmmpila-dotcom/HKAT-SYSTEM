import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function TutorApply({ status }) {
    const { data, setData, post, errors, processing } = useForm({
        full_name: '',
        email: '',
        phone: '',
        specializations: '',
        years_experience: '',
        cover_letter: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('tutor.apply.store'));
    };

    return (
        <>
            <Head title="Apply as a Tutor" />
            <div className="min-h-screen bg-[#FBF4DC] px-6 py-10 text-[#232323]">
                <div className="mx-auto max-w-2xl">
                    <Link href="/" className="font-serif text-lg font-semibold">
                        Happy Kid Arts and Tutorials
                    </Link>

                    <div className="mt-8 rounded-3xl border border-black/70 bg-white p-6 shadow-sm md:p-8">
                        <h1 className="font-serif text-3xl font-bold">Apply as a Tutor</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Submit your details for admin review. Approved applicants receive a tutor account.
                        </p>

                        {status === 'application-submitted' && (
                            <div className="mt-6 rounded-2xl border border-gray-800 bg-[#DCE7C3] p-4 text-sm">
                                Your application was submitted. We will review your details before creating an account.
                            </div>
                        )}

                        <form onSubmit={submit} className="mt-8 space-y-5">
                            <Field label="Full Name" id="full_name" value={data.full_name} error={errors.full_name} onChange={(value) => setData('full_name', value)} />
                            <Field label="Email" id="email" type="email" value={data.email} error={errors.email} onChange={(value) => setData('email', value)} />
                            <Field label="Phone" id="phone" value={data.phone} error={errors.phone} onChange={(value) => setData('phone', value)} />
                            <Field label="Specializations" id="specializations" placeholder="Math, English, Drawing" value={data.specializations} error={errors.specializations} onChange={(value) => setData('specializations', value)} />
                            <Field label="Years of Experience" id="years_experience" value={data.years_experience} error={errors.years_experience} onChange={(value) => setData('years_experience', value)} />

                            <div>
                                <InputLabel htmlFor="cover_letter" value="About your teaching experience" />
                                <textarea
                                    id="cover_letter"
                                    value={data.cover_letter}
                                    onChange={(event) => setData('cover_letter', event.target.value)}
                                    className="mt-1 block min-h-32 w-full rounded-md border border-gray-800 bg-transparent p-3 text-sm text-gray-900 shadow-sm focus:border-[#77b2a6] focus:ring-[#77b2a6]"
                                />
                                <InputError className="mt-2" message={errors.cover_letter} />
                            </div>

                            <PrimaryButton disabled={processing} className="rounded-full">
                                {processing ? 'Submitting...' : 'Submit Application'}
                            </PrimaryButton>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

function Field({ label, id, type = 'text', placeholder, value, error, onChange }) {
    return (
        <div>
            <InputLabel htmlFor={id} value={label} />
            <TextInput
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-1 block w-full"
            />
            <InputError className="mt-2" message={error} />
        </div>
    );
}
