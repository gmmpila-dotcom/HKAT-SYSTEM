import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        email: '',
        bio: '',
        specializations: '',
        years_experience: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.tutors.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-bold leading-tight text-gray-800">
                        Add Tutor
                    </h2>
                    <Link
                        href={route('admin.dashboard')}
                        className="text-sm font-semibold text-[#77b2a6] hover:text-[#5c8e84] underline rounded-full"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            }
        >
            <Head title="Add Tutor" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 border border-gray-800 rounded-3xl shadow-sm">
                        <section className="max-w-xl">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Full Name" />
                                    <TextInput
                                        id="name"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={errors.name} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={errors.email} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="specializations" value="Specializations (comma separated)" />
                                    <TextInput
                                        id="specializations"
                                        placeholder="Math, Algebra, Science"
                                        className="mt-1 block w-full"
                                        value={data.specializations}
                                        onChange={(e) => setData('specializations', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={errors.specializations} />
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
                                    <InputLabel htmlFor="bio" value="Bio" />
                                    <textarea
                                        id="bio"
                                        className="mt-1 block w-full rounded-md border border-gray-800 shadow-sm focus:border-icyAqua focus:ring-icyAqua focus:ring-2 p-3 text-sm text-gray-900 bg-transparent min-h-[120px]"
                                        value={data.bio}
                                        onChange={(e) => setData('bio', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={errors.bio} />
                                </div>

                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={processing} className="rounded-full">
                                        {processing ? 'Adding...' : 'Add Tutor'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}