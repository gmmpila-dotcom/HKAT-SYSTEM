import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const statusStyles = {
    new: 'bg-gray-200 text-gray-700',
    under_review: 'bg-[#FFF4CC] text-gray-800',
    interview: 'bg-[#DCE7C3] text-gray-800',
    approved: 'bg-[#B8F2E6] text-gray-800',
    rejected: 'bg-red-100 text-red-700',
};

export default function Index({ applications = [], status, temporaryPassword }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl font-semibold leading-tight text-gray-800">
                        Tutor Applications
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
            <Head title="Tutor Applications" />

            <div className="bg-eggshell py-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="overflow-hidden rounded-3xl border border-gray-800 bg-white">
                        <div className="p-6">
                            {status === 'application-approved' && temporaryPassword && (
                                <div className="mb-6 rounded-2xl border border-gray-800 bg-[#FFF4CC] p-4 text-sm text-gray-800">
                                    <p className="font-semibold">Application approved and tutor account created.</p>
                                    <p className="mt-1">Send this temporary password to the tutor. It will only be shown once:</p>
                                    <code className="mt-2 inline-block rounded bg-white px-3 py-1 font-mono text-base">
                                        {temporaryPassword}
                                    </code>
                                </div>
                            )}

                            {applications.length === 0 ? (
                                <p className="text-sm text-gray-600">No tutor applications yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[900px] text-left">
                                        <thead className="border-b border-gray-800 text-sm text-gray-600">
                                            <tr>
                                                <th className="px-4 py-4 font-medium">Applicant</th>
                                                <th className="px-4 py-4 font-medium">Specializations</th>
                                                <th className="px-4 py-4 font-medium">Experience</th>
                                                <th className="px-4 py-4 font-medium">Status</th>
                                                <th className="px-4 py-4 text-right font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {applications.map((application) => (
                                                <ApplicationRow key={application.id} application={application} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function ApplicationRow({ application }) {
    const { patch, processing } = useForm();
    const isClosed = ['approved', 'rejected'].includes(application.status);

    return (
        <tr>
            <td className="px-4 py-5">
                <div className="font-medium text-gray-800">{application.full_name}</div>
                <div className="mt-1 text-sm text-gray-600">{application.email}</div>
                {application.phone && <div className="text-sm text-gray-600">{application.phone}</div>}
            </td>
            <td className="px-4 py-5 text-gray-700">
                {(application.specializations || []).join(', ') || '-'}
            </td>
            <td className="px-4 py-5 text-gray-700">{application.years_experience || '-'}</td>
            <td className="px-4 py-5">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[application.status] || statusStyles.new}`}>
                    {application.status}
                </span>
            </td>
            <td className="px-4 py-5 text-right">
                {!isClosed && (
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => patch(route('admin.applications.approve', application.id))}
                            disabled={processing}
                            className="rounded-full border border-gray-800 bg-[#B8F2E6] px-3 py-2 text-xs font-medium text-gray-800 disabled:opacity-50"
                        >
                            Approve
                        </button>
                        <button
                            type="button"
                            onClick={() => patch(route('admin.applications.reject', application.id))}
                            disabled={processing}
                            className="rounded-full border border-red-700 bg-red-100 px-3 py-2 text-xs font-medium text-red-800 disabled:opacity-50"
                        >
                            Reject
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
}
