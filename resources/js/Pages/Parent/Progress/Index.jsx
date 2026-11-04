import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const DOT = ' \u00B7 ';

function shortDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function monthYear(value) {
    if (!value) return '';
    const [y, m] = String(value).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function buildCourses(sessions, notes) {
    const map = new Map();

    sessions
        .filter((s) => s.status !== 'cancelled')
        .forEach((s) => {
            const key = s.subject + '|' + s.tutor_id;
            if (!map.has(key)) {
                map.set(key, { key, subject: s.subject, tutor: s.tutor, tutorId: s.tutor_id, total: 0, completed: 0 });
            }
            const course = map.get(key);
            course.total += 1;
            if (s.status === 'completed') course.completed += 1;
        });

    return Array.from(map.values()).map((course) => ({
        ...course,
        percent: Math.round((course.completed / course.total) * 100),
        notes: notes.filter((n) => n.tutor && n.tutor.id === course.tutorId).slice(0, 3),
    }));
}

function Segments({ total, completed }) {
    if (total > 20) {
        return (
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/70">
                <div className="h-2.5 rounded-full bg-[#EAF1D1]" style={{ width: Math.round((completed / total) * 100) + '%' }} />
            </div>
        );
    }

    return (
        <div className="flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
                <span key={i} className={'h-2.5 flex-1 rounded-full border border-black/10 ' + (i < completed ? 'bg-[#EAF1D1]' : 'bg-white/70')} />
            ))}
        </div>
    );
}

function CheckIcon() {
    return (
        <svg className="h-8 w-8 shrink-0 text-[#006B6B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="#B3DFDF" />
            <path d="M7.5 12.5l3 3 6-6.5" />
        </svg>
    );
}

function CourseCard({ course }) {
    const state = course.completed >= course.total ? 'Completed' : course.completed === 0 ? 'Not started' : 'In progress';
    const tutorName = course.tutor ? course.tutor.name : 'your tutor';

    return (
        <section className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-[#B3DFDF]">
            <div className="flex items-start justify-between gap-3 border-b border-black/30 px-6 py-4">
                <div>
                    <h3 className="text-2xl" style={FONT_HEAD}>{course.subject}</h3>
                    <p className="text-gray-700">with {tutorName}</p>
                </div>
                <span className="rounded-2xl bg-[#EAF1D1] px-5 py-2 text-lg">{state}</span>
            </div>

            <div className="px-6 py-4">
                <div className="flex items-center justify-between text-lg">
                    <span>{course.completed} of {course.total} {course.total === 1 ? 'session' : 'sessions'} completed</span>
                    <span className="text-gray-700">{course.percent}%</span>
                </div>
                <div className="mt-2">
                    <Segments total={course.total} completed={course.completed} />
                </div>
            </div>

            <div className="space-y-3 px-6 pb-5">
                {course.notes.length === 0 && (
                    <p className="text-sm text-gray-800">No feedback from {tutorName} yet.</p>
                )}
                {course.notes.map((note) => (
                    <div key={note.id} className="rounded-2xl bg-[#EAF1D1] p-4">
                        <p className="text-gray-900">{note.note}</p>
                        <p className="mt-1 text-sm text-gray-700">&mdash; {note.tutor ? note.tutor.name : 'Tutor'}, {shortDate(note.created_at)}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function Milestones({ done }) {
    return (
        <section className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-[#B3DFDF]">
            <div className="border-b border-black/30 px-6 py-4">
                <h3 className="text-2xl" style={FONT_HEAD}>Milestones</h3>
            </div>
            {done.length === 0 && (
                <p className="px-6 py-5 text-sm text-gray-800">Milestones appear here as sessions are completed.</p>
            )}
            {done.map((s) => (
                <div key={s.id} className="flex items-center gap-3 border-b border-black/30 px-6 py-4 last:border-b-0">
                    <CheckIcon />
                    <div>
                        <div className="text-lg">Completed {s.subject}{s.tutor ? ' with ' + s.tutor.name : ''}</div>
                        <div className="text-gray-700">{monthYear(s.session_date)}</div>
                    </div>
                </div>
            ))}
        </section>
    );
}

function StudentProgress({ student }) {
    const sessions = student.sessions || [];
    const notes = student.progress_notes || [];
    const courses = buildCourses(sessions, notes);
    const done = sessions
        .filter((s) => s.status === 'completed')
        .sort((a, b) => String(b.session_date).localeCompare(String(a.session_date)))
        .slice(0, 5);
    const subjects = Array.from(new Set(courses.map((c) => c.subject))).join(', ');

    return (
        <div>
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900" style={FONT_HEAD}>{student.student_name}&rsquo;s progress</h2>
                <p className="text-lg text-gray-800">
                    {student.grade_level}{subjects ? DOT + subjects : ''}{DOT}updated after every session.
                </p>
            </div>

            {courses.length === 0 ? (
                <div className="rounded-3xl border-[1.5px] border-black bg-[#EAF1D1] p-6 text-sm">
                    No sessions booked yet.{' '}
                    <Link href={route('parent.booking.create')} className="font-semibold underline">Book a session</Link>
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {courses.map((course) => (
                            <CourseCard key={course.key} course={course} />
                        ))}
                    </div>
                    <div>
                        <Milestones done={done} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Index({ students = [] }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-gray-900" style={FONT_HEAD}>My Progress</h1>
                    <p className="text-lg text-gray-800">Tutor feedback and completed sessions for your child.</p>
                </div>
            }
        >
            <Head title="My Progress" />

            <div className="space-y-10 px-6 pb-12 pt-6 sm:px-8">
                {students.length === 0 && (
                    <div className="rounded-3xl border-[1.5px] border-black bg-[#EAF1D1] p-6 text-sm">
                        You have no children on your account yet.{' '}
                        <Link href={route('parent.profile.edit')} className="font-semibold underline">
                            Add a student profile first.
                        </Link>
                    </div>
                )}

                {students.map((student) => (
                    <StudentProgress key={student.id} student={student} />
                ))}
            </div>
        </AuthenticatedLayout>
    );
}