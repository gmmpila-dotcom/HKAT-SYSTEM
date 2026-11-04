import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const DOT = ' \u00B7 ';
const AVATARS = ['#0E7C86', '#8A3FFC', '#2F5D3A', '#3C5BC4', '#B3472E', '#5C6BA8'];

function initials(name) {
    return (name || '?').split(' ').map((part) => part.charAt(0)).slice(0, 2).join('').toUpperCase();
}

function shortDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StudentCard({ student }) {
    const [editing, setEditing] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({ note: '' });
    const notes = student.progress_notes || [];
    const latest = notes[0];
    const earlier = notes.slice(1);
    const subjects = (student.subjects || []).join(', ');

    const open = () => {
        setData('note', latest ? latest.note : '');
        setEditing(true);
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('tutor.students.notes.store', student.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setEditing(false);
            },
        });
    };

    return (
        <section className="rounded-3xl border-[1.5px] border-black bg-[#B3DFDF] p-6">
            <div className="flex items-start gap-4">
                <span
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl text-2xl font-bold text-white"
                    style={{ backgroundColor: AVATARS[student.id % AVATARS.length] }}
                >
                    {initials(student.student_name)}
                </span>
                <div className="min-w-0">
                    <h3 className="text-2xl font-bold" style={FONT_HEAD}>{student.student_name}</h3>
                    <p className="text-xl">{student.grade_level}{subjects ? DOT + subjects : ''}</p>
                    <p className="text-lg text-gray-700">
                        Parent: {student.parent_name || '-'}{DOT}{student.parent_phone || 'No phone on file'}
                    </p>
                </div>
            </div>

            <div className="mt-5 rounded-2xl border-[1.5px] border-black bg-[#EAF1D1] p-4">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-lg uppercase tracking-wide text-gray-700">Latest progress note</span>
                    {editing ? (
                        <button type="submit" form={'note-form-' + student.id} disabled={processing} className="rounded-xl bg-[#B3DFDF] px-4 py-1 hover:opacity-80 disabled:opacity-50">
                            {processing ? 'Saving...' : 'Save note'}
                        </button>
                    ) : (
                        <button type="button" onClick={open} className="rounded-xl bg-[#B3DFDF] px-4 py-1 hover:opacity-80">
                            {latest ? 'Update' : 'Add note'}
                        </button>
                    )}
                </div>

                {editing ? (
                    <form id={'note-form-' + student.id} onSubmit={submit} className="mt-3">
                        <textarea
                            autoFocus
                            value={data.note}
                            onChange={(event) => setData('note', event.target.value)}
                            placeholder="Write a progress note..."
                            className="block min-h-[90px] w-full rounded-2xl border border-black bg-white p-3 text-lg focus:border-black focus:ring-0"
                        />
                        {errors.note && <p className="mt-1 text-sm text-red-700">{errors.note}</p>}
                        <button type="button" onClick={() => setEditing(false)} className="mt-2 text-sm underline">Cancel</button>
                        <p className="mt-1 text-sm text-gray-600">Saving adds a new note. Earlier notes stay in the history below.</p>
                    </form>
                ) : (
                    <p className="mt-2 text-xl">
                        {latest ? latest.note : 'No notes yet. Add one after your next session.'}
                    </p>
                )}

                {latest && !editing && (
                    <p className="mt-1 text-sm text-gray-600">{shortDate(latest.created_at)}</p>
                )}
            </div>

            {earlier.length > 0 && (
                <div className="mt-3">
                    <button type="button" onClick={() => setShowAll((v) => !v)} className="text-lg underline">
                        {showAll ? 'Hide earlier notes' : 'Show ' + earlier.length + ' earlier ' + (earlier.length === 1 ? 'note' : 'notes')}
                    </button>
                    {showAll && (
                        <div className="mt-2 space-y-2">
                            {earlier.map((note) => (
                                <div key={note.id} className="rounded-2xl border border-black/40 bg-white/70 p-3">
                                    <p>{note.note}</p>
                                    <p className="text-sm text-gray-600">{shortDate(note.created_at)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

export default function Index({ students = [] }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-3xl font-bold text-gray-900" style={FONT_HEAD}>My students</h1>
                    <p className="text-lg text-gray-800">{students.length} assigned {students.length === 1 ? 'learner' : 'learners'}</p>
                </div>
            }
        >
            <Head title="My Students" />

            <div className="space-y-6 px-6 pb-12 pt-6 sm:px-8">
                {students.length === 0 && (
                    <div className="rounded-3xl border-[1.5px] border-black bg-[#EAF1D1] p-6">
                        You have no students yet. Once a parent books a session with you, they appear here.
                    </div>
                )}
                {students.map((student) => (
                    <StudentCard key={student.id} student={student} />
                ))}
            </div>
        </AuthenticatedLayout>
    );
}