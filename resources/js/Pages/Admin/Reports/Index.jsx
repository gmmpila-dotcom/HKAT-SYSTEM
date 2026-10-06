import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const sessionStatusStyles = {
    pending: 'bg-gray-200 text-gray-700',
    confirmed: 'bg-[#DCE7C3] text-gray-800',
    completed: 'bg-[#B8F2E6] text-gray-800',
    cancelled: 'bg-red-100 text-red-700',
};

const paymentStatusStyles = {
    pending: 'bg-gray-200 text-gray-700',
    paid: 'bg-[#B8F2E6] text-gray-800',
    failed: 'bg-red-100 text-red-700',
};

function peso(value) {
    return `PHP ${Number(value || 0).toFixed(2)}`;
}

export default function Index({
    totalSessions = 0,
    confirmedSessions = 0,
    completedSessions = 0,
    sessionStatusCounts = {},
    paidRevenue = 0,
    pendingRevenue = 0,
    paymentTotals = {},
}) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl font-semibold leading-tight text-gray-800">
                        Reports
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
            <Head title="Reports" />

            <div className="bg-eggshell py-12">
                <div className="mx-auto max-w-7xl space-y-6 px-6 lg:px-8">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Metric label="Total Sessions" value={totalSessions} />
                        <Metric label="Confirmed Sessions" value={confirmedSessions} />
                        <Metric label="Completed Sessions" value={completedSessions} />
                        <Metric label="Paid Revenue" value={peso(paidRevenue)} />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <StatusPanel
                            title="Session Status"
                            values={sessionStatusCounts}
                            styles={sessionStatusStyles}
                        />
                        <StatusPanel
                            title="Payment Totals"
                            values={paymentTotals}
                            styles={paymentStatusStyles}
                            formatValue={peso}
                        />
                    </div>

                    <div className="rounded-3xl border border-gray-800 bg-white p-6 shadow-sm">
                        <h3 className="font-serif text-xl font-bold text-gray-800">Revenue Overview</h3>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl bg-[#B8F2E6] p-5">
                                <p className="text-sm text-gray-700">Paid</p>
                                <p className="mt-1 text-2xl font-serif font-bold text-gray-800">
                                    {peso(paidRevenue)}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-[#FFF4CC] p-5">
                                <p className="text-sm text-gray-700">Pending</p>
                                <p className="mt-1 text-2xl font-serif font-bold text-gray-800">
                                    {peso(pendingRevenue)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Metric({ label, value }) {
    return (
        <div className="rounded-3xl border border-gray-800 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-600">{label}</p>
            <p className="mt-2 text-3xl font-serif font-bold text-gray-800">{value}</p>
        </div>
    );
}

function StatusPanel({ title, values, styles, formatValue = (value) => value }) {
    const entries = Object.entries(values || {});

    return (
        <div className="rounded-3xl border border-gray-800 bg-white p-6 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-gray-800">{title}</h3>
            {entries.length === 0 ? (
                <p className="mt-4 text-sm text-gray-600">No data yet.</p>
            ) : (
                <div className="mt-4 space-y-3">
                    {entries.map(([status, value]) => (
                        <div key={status} className="flex items-center justify-between gap-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles[status] || 'bg-gray-200 text-gray-700'}`}>
                                {status}
                            </span>
                            <span className="font-medium text-gray-800">{formatValue(value)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
