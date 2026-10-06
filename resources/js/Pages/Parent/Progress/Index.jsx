import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ students = [] }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-bold leading-tight text-gray-800">
                        My Progress
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
            <Head title="My Progress" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {students.length === 0 && (
                        <div className="bg-white p-8 border border-gray-800 rounded-3xl shadow-sm text-sm text-gray-600">
                            You have no children on your account yet.{' '}
                            <Link href={route('parent.profile.edit')} className="font-semibold text-[#77b2a6] underline">
                                Add a student profile first.
                            </Link>
                        </div>
                    )}

                    {students.map((student) => (
                        <StudentProgressCard key={student.id} student={student} />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StudentProgressCard({ student }) {
    const sessions = student.sessions || [];
    const notes = student.progress_notes || [];
    const completedCount = sessions.filter((s) => s.status === 'completed').length;

    return (
        <div className="bg-white p-6 border border-gray-800 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <div className="font-serif text-xl font-semibold text-gray-800">
                        {student.student_name}
                    </div>
                    <div className="text-sm text-gray-600">{student.grade_level}</div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-600">Sessions completed</div>
                    <div className="text-2xl font-serif font-bold text-gray-800">{completedCount}</div>
                </div>
            </div>

            <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Tutor Feedback</h4>
                {notes.length === 0 && (
                    <p className="text-sm text-gray-500">No feedback from tutors yet.</p>
                )}
                <div className="space-y-2">
                    {notes.map((note) => (
                        <div key={note.id} className="border border-gray-200 rounded-xl p-3">
                            <p className="text-sm text-gray-800">{note.note}</p>
                            <p className="mt-1 text-xs text-gray-500">
                                {note.tutor ? note.tutor.name : 'Tutor'} &middot;{' '}
                                {new Date(note.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Session History</h4>
                {sessions.length === 0 && (
                    <p className="text-sm text-gray-500">No sessions booked yet.</p>
                )}
                <div className="space-y-2">
                    {sessions.map((s) => (
                        <div key={s.id} className="border border-gray-200 rounded-xl p-3 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-800">
                                    {s.subject} with {s.tutor ? s.tutor.name : 'Tutor'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {s.session_date} &middot; {s.start_time} to {s.end_time}
                                </p>
                            </div>
                            <span className="inline-flex rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
                                {s.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}