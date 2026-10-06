import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function EditProfile({ profile, status }) {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
    };

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        student_name: profile.student_name || '',
        grade_level: profile.grade_level || '',
        birthdate: formatDate(profile.birthdate),
        notes: profile.notes || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('parent.profile.update'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-bold leading-tight text-gray-800">
                        Edit Student Profile
                    </h2>
                    <Link
                        href={route('parent.dashboard')}
                        className="text-sm font-semibold text-[#77b2a6] hover:text-[#5c8e84] underline focus:outline-none focus:ring-2 focus:ring-[#B8F2E6] focus:ring-offset-2 rounded-full"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            }
        >
            <Head title="Edit Student Profile" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 border border-gray-800 rounded-3xl shadow-sm">
                        <section className="max-w-xl">
                            <form onSubmit={submit} className="mt-6 space-y-6">
                                <div>
                                    <InputLabel htmlFor="student_name" value="Student Name" />
                                    <TextInput
                                        id="student_name"
                                        className="mt-1 block w-full"
                                        value={data.student_name}
                                        onChange={(e) => setData('student_name', e.target.value)}
                                        required
                                    />
                                    <InputError className="mt-2" message={errors.student_name} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="grade_level" value="Grade Level" />
                                    <TextInput
                                        id="grade_level"
                                        className="mt-1 block w-full"
                                        value={data.grade_level}
                                        onChange={(e) => setData('grade_level', e.target.value)}
                                        required
                                    />
                                    <InputError className="mt-2" message={errors.grade_level} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="birthdate" value="Birthdate" />
                                    <TextInput
                                        id="birthdate"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.birthdate}
                                        onChange={(e) => setData('birthdate', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={errors.birthdate} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="notes" value="Notes" />
                                    <textarea
                                        id="notes"
                                        className="mt-1 block w-full rounded-md border border-gray-800 shadow-sm focus:border-icyAqua focus:ring-icyAqua focus:ring-2 p-3 text-sm text-gray-900 bg-transparent min-h-[120px]"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={errors.notes} />
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
