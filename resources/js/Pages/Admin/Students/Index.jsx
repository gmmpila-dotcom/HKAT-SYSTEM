import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };
const AVATARS = ['#5E7272', '#3B4A4A', '#3B1F7A', '#6B7A1F', '#006B6B', '#3C5BC4', '#5C6BA8', '#8A5AA8'];

function initials(name) {
    return (name || '?').split(' ').map((part) => part.charAt(0)).slice(0, 2).join('').toUpperCase();
}

function Search({ value, onChange }) {
    return (
        <div className="relative w-full max-w-md">
            <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Search name, grade, or subject"
                className="w-full rounded-2xl border-[1.5px] border-black bg-[#D9D9D9] py-3 pl-12 pr-4 focus:border-black focus:ring-0"
            />
        </div>
    );
}

export default function Index({ students = [] }) {
    const [query, setQuery] = useState('');
    const needle = query.trim().toLowerCase();

    const rows = students.filter((s) =>
        [s.name, s.grade, s.tutor, s.parent, (s.subjects || []).join(' ')].join(' ').toLowerCase().includes(needle));

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-3xl font-bold text-gray-900" style={FONT_HEAD}>Students</h1>
                    <p className="text-lg text-gray-800">{students.length} enrolled {students.length === 1 ? 'learner' : 'learners'}</p>
                </div>
            }
        >
            <Head title="Students" />

            <div className="space-y-5 px-6 pb-12 pt-6 sm:px-8">
                <Search value={query} onChange={setQuery} />

                <div className="overflow-x-auto rounded-3xl border-[1.5px] border-black bg-white">
                    <table className="w-full min-w-[900px] text-left">
                        <thead className="bg-[#B3DFDF] text-sm uppercase tracking-wide">
                            <tr>
                                <th className="px-6 py-4 font-normal">Student</th>
                                <th className="px-3 py-4 font-normal">Grade</th>
                                <th className="px-3 py-4 font-normal">Subject(s)</th>
                                <th className="px-3 py-4 font-normal">Assigned tutor</th>
                                <th className="px-3 py-4 font-normal">Progress</th>
                                <th className="px-6 py-4 font-normal">Parent contact</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-6 text-gray-700">
                                        {students.length === 0 ? 'No students are enrolled yet.' : 'No students match your search.'}
                                    </td>
                                </tr>
                            )}
                            {rows.map((s) => (
                                <tr key={s.id} className="border-t border-black">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white" style={{ backgroundColor: AVATARS[s.id % AVATARS.length] }}>
                                                {initials(s.name)}
                                            </span>
                                            <span className="text-lg">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 text-lg">{s.grade}</td>
                                    <td className="px-3 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {(s.subjects || []).length === 0 && <span className="text-gray-600">-</span>}
                                            {(s.subjects || []).map((subject) => (
                                                <span key={subject} className="rounded-full bg-[#EAF1D1] px-3 py-1 text-sm">{subject}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 text-lg">{s.tutor || '-'}</td>
                                    <td className="px-3 py-4">
                                        {s.total > 0 ? (
                                            <span className="rounded-full bg-[#BFEBC4] px-3 py-1 text-sm">{s.completed} of {s.total} completed</span>
                                        ) : (
                                            <span className="rounded-full bg-gray-200 px-3 py-1 text-sm">No sessions yet</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-lg">{s.parent || '-'}</div>
                                        <div className="text-sm text-gray-600">{s.phone || 'No phone on file'}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}