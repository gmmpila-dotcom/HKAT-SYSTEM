import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { useState } from 'react';

export default function EditProfile({ profile, status }) {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        bio: profile.bio || '',
        years_experience: profile.years_experience || '',
        specializations: profile.specializations || [],
    });

    const [specInput, setSpecInput] = useState((profile.specializations || []).join(', '));

    const handleSpecChange = (e) => {
        const val = e.target.value;
        setSpecInput(val);
        const arr = val.split(',').map(item => item.trim()).filter(Boolean);
        setData('specializations', arr);
    };

    const submit = (e) => {
        e.preventDefault();
        patch(route('tutor.profile.update'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-bold leading-tight text-gray-800">
                        Edit Profile
                    </h2>
                    <Link
                        href={route('tutor.dashboard')}
                        className="text-sm font-semibold text-[#77b2a6] hover:text-[#5c8e84] underline focus:outline-none focus:ring-2 focus:ring-[#B8F2E6] focus:ring-offset-2 rounded-full"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            }
        >
            <Head title="Edit Profile" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 border border-gray-800 rounded-3xl shadow-sm">
                        <section className="max-w-xl">
                            <form onSubmit={submit} className="mt-6 space-y-6">
                                <div>
                                    <InputLabel htmlFor="bio" value="Bio" />
                                    <textarea
                                        id="bio"
                                        className="mt-1 block w-full rounded-md border border-gray-800 shadow-sm focus:border-icyAqua focus:ring-icyAqua focus:ring-2 p-3 text-sm text-gray-900 bg-transparent min-h-[120px]"
                                        value={data.bio}
                                        onChange={(e) => setData('bio', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={errors.bio} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="years_experience" value="Years of Experience" />
                                    <TextInput
                                        id="years_experience"
                                        className="mt-1 block w-full"
                                        value={data.years_experience}
                                        onChange={(e) => setData('years_experience', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={errors.years_experience} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="specializations" value="Specializations" />
                                    <textarea
                                        id="specializations"
                                        className="mt-1 block w-full rounded-md border border-gray-800 shadow-sm focus:border-icyAqua focus:ring-icyAqua focus:ring-2 p-3 text-sm text-gray-900 bg-transparent min-h-[120px]"
                                        value={specInput}
                                        onChange={handleSpecChange}
                                        placeholder="e.g. Math, Physics, Chemistry"
                                    />
                                    <InputError className="mt-2" message={errors.specializations} />
                                </div>
                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={processing} className="rounded-full">
                                        Save Changes
                                    </PrimaryButton>
                                    <Transition
                                        show={recentlySuccessful || status === 'profile-updated'}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-gray-600">Saved.</p>
                                    </Transition>
                                </div>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

