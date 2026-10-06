import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ tutors }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl font-semibold leading-tight text-gray-800">
                        Tutor Directory
                    </h2>

                    <Link
                        href={route('admin.dashboard')}
                        className="rounded-full bg-[#B8F2E6] px-5 py-2 text-sm font-medium text-gray-800 transition hover:opacity-80"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            }
        >
            <Head title="Tutor Directory" />

            <div className="bg-eggshell py-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="overflow-hidden rounded-3xl border border-gray-800 bg-white">
                        <div className="p-6">
                            <div className="mb-6">
                                <h1 className="font-serif text-3xl font-semibold text-gray-800">
                                    All Tutors
                                </h1>

                                <p className="mt-2 text-gray-600">
                                    Review tutor profiles and manage verification status.
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[720px]">
                                    <thead className="border-b border-gray-800 text-left text-sm text-gray-600">
                                        <tr>
                                            <th className="px-4 py-4 font-medium">Tutor</th>
                                            <th className="px-4 py-4 font-medium">Experience</th>
                                            <th className="px-4 py-4 font-medium">Rating</th>
                                            <th className="px-4 py-4 font-medium">Status</th>
                                            <th className="px-4 py-4 text-right font-medium">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200">
                                        {tutors.map((tutor) => (
                                            <TutorRow key={tutor.id} tutor={tutor} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function TutorRow({ tutor }) {
    const { patch, processing } = useForm();

    const toggleVerification = () => {
        patch(route('admin.tutors.toggle-verified', tutor.id));
    };

    return (
        <tr>
            <td className="px-4 py-5">
                <div className="font-medium text-gray-800">
                    {tutor.user?.name}
                </div>

                <div className="mt-1 text-sm text-gray-600">
                    {tutor.user?.email}
                </div>
            </td>

            <td className="px-4 py-5 text-gray-700">
                {tutor.years_experience || '-'}
            </td>

            <td className="px-4 py-5 text-gray-700">
                {tutor.rating ?? '-'}
            </td>

            <td className="px-4 py-5">
                <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        tutor.is_verified
                            ? 'bg-[#B8F2E6] text-gray-800'
                            : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    {tutor.is_verified ? 'Verified' : 'Unverified'}
                </span>
            </td>

            <td className="px-4 py-5 text-right">
                <button
                    type="button"
                    onClick={toggleVerification}
                    disabled={processing}
                    className="rounded-full border border-gray-800 bg-[#B8F2E6] px-4 py-2 text-sm font-medium text-gray-800 transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing
                        ? 'Updating...'
                        : tutor.is_verified
                          ? 'Unverify'
                          : 'Verify'}
                </button>
            </td>
        </tr>
    );
}
