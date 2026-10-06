import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ students = [] }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-bold leading-tight text-gray-800">
                        My Students
                    </h2>
                    <Link
                        href={route('tutor.dashboard')}
                        className="text-sm font-semibold text-[#77b2a6] hover:text-[#5c8e84] underline rounded-full"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            }
        >
            <Head title="My Students" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {students.length === 0 && (
                        <div className="bg-white p-8 border border-gray-800 rounded-3xl shadow-sm text-sm text-gray-600">
                            You have no students yet. Once a parent books a session with you, they'll appear here.
                        </div>
                    )}

                    {students.map((student) => (
                        <StudentCard key={student.id} student={student} />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StudentCard({ student }) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, errors, processing, reset } = useForm({ note: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('tutor.students.notes.store', student.id), {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    return (
        <div className="bg-white p-6 border border-gray-800 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <div className="font-serif text-xl font-semibold text-gray-800">
                        {student.student_name}
                    </div>
                    <div className="text-sm text-gray-600">{student.grade_level}</div>
                </div>
                <PrimaryButton className="rounded-full" onClick={() => setShowForm((v) => !v)}>
                    {showForm ? 'Cancel' : 'Add Note'}
                </PrimaryButton>
            </div>

            {showForm && (
                <form onSubmit={submit} className="mt-4">
                    <textarea
                        className="block w-full rounded-md border border-gray-800 shadow-sm focus:border-icyAqua focus:ring-icyAqua focus:ring-2 p-3 text-sm text-gray-900 bg-transparent min-h-[100px]"
                        placeholder="Write a progress note..."
                        value={data.note}
                        onChange={(e) => setData('note', e.target.value)}
                    />
                    {errors.note && <div className="mt-1 text-sm text-red-600">{errors.note}</div>}
                    <div className="mt-3">
                        <PrimaryButton type="submit" disabled={processing} className="rounded-full">
                            {processing ? 'Saving...' : 'Save Note'}
                        </PrimaryButton>
                    </div>
                </form>
            )}

            <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Progress Notes</h4>
                {(!student.progress_notes || student.progress_notes.length === 0) && (
                    <p className="text-sm text-gray-500">No notes yet.</p>
                )}
                <div className="space-y-2">
                    {(student.progress_notes || []).map((note) => (
                        <div key={note.id} className="border border-gray-200 rounded-xl p-3">
                            <p className="text-sm text-gray-800">{note.note}</p>
                            <p className="mt-1 text-xs text-gray-500">
                                {new Date(note.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}