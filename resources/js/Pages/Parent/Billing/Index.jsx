import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { formatDate } from '@/utils/formatDate';

const statusStyles = {
    pending: 'bg-gray-200 text-gray-700',
    paid: 'bg-[#B8F2E6] text-gray-800',
    failed: 'bg-red-100 text-red-700',
};

export default function Index({ payments = [], totalDue = 0, totalPaid = 0, flashStatus, onlinePaymentsEnabled = true }) {
    const { post, processing } = useForm();

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-bold leading-tight text-gray-800">
                        Billing
                    </h2>
                    <Link
                        href={route('parent.dashboard')}
                        className="text-sm font-semibold text-[#77b2a6] hover:text-[#5c8e84] underline rounded-full"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            }
        >
            <Head title="Billing" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-6 border border-gray-800 rounded-3xl shadow-sm">
                            <div className="text-sm text-gray-600">Total Due</div>
                            <div className="text-3xl font-serif font-bold text-gray-800">
                                &#8369;{Number(totalDue).toFixed(2)}
                            </div>
                        </div>
                        <div className="bg-white p-6 border border-gray-800 rounded-3xl shadow-sm">
                            <div className="text-sm text-gray-600">Total Paid</div>
                            <div className="text-3xl font-serif font-bold text-gray-800">
                                &#8369;{Number(totalPaid).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 border border-gray-800 rounded-3xl shadow-sm">
                        <h3 className="mb-4 text-xl font-serif font-bold text-gray-800">Payment History</h3>

                        {flashStatus && (
                            <p className="mb-4 rounded-2xl bg-[#FFF4CC] p-3 text-sm text-gray-800">
                                {flashStatus}
                            </p>
                        )}

                        {errors.payment && (
                            <p className="mb-4 rounded-2xl bg-red-100 p-3 text-sm text-red-700">
                                {errors.payment}
                            </p>
                        )}

                        {payments.length === 0 && (
                            <p className="text-sm text-gray-600">No payments yet.</p>
                        )}

                        {payments.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px]">
                                    <thead className="border-b border-gray-800 text-left text-sm text-gray-600">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Student</th>
                                            <th className="px-4 py-3 font-medium">Tutor / Subject</th>
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 font-medium">Amount</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {payments.map((payment) => (
                                            <tr key={payment.id}>
                                                <td className="px-4 py-4 text-gray-700">
                                                    {payment.session?.student_profile?.student_name || '-'}
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    {payment.session?.tutor?.name || '-'} &middot; {payment.session?.subject}
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    {formatDate(payment.session?.session_date)}
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    &#8369;{Number(payment.amount).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                                            statusStyles[payment.status] || 'bg-gray-200 text-gray-700'
                                                        }`}
                                                    >
                                                        {payment.status}
                                                    </span>
                                                    {payment.status === 'pending' && (
                                                        onlinePaymentsEnabled ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => post(route('parent.payments.checkout', payment.id))}
                                                                disabled={processing}
                                                                className="mt-2 block rounded-full border border-gray-800 bg-[#B8F2E6] px-3 py-1 text-xs font-medium text-gray-800 disabled:opacity-50"
                                                            >
                                                                {processing ? 'Opening...' : 'Pay Now'}
                                                            </button>
                                                        ) : (
                                                            <p className="mt-2 text-xs text-gray-500">Awaiting payment confirmation.</p>
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}