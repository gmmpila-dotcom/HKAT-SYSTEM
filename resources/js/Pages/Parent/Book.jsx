import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const selectClass =
    'mt-1 block w-full rounded-md border border-gray-800 shadow-sm focus:border-icyAqua focus:ring-icyAqua focus:ring-2 p-2 text-sm text-gray-900 bg-transparent';

export default function Book({ tutors = [], students = [] }) {
    const { data, setData, post, errors, processing } = useForm({
        student_profile_id: '',
        tutor_id: '',
        subject: '',
        session_type: '1on1',
        location_type: 'onsite',
        session_date: '',
        start_time: '',
        end_time: '',
        rate_applied: '',
    });

    const [rateLoading, setRateLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [matchingLoading, setMatchingLoading] = useState(false);

    useEffect(() => {
        if (!data.student_profile_id) {
            return;
        }

        const student = students.find((s) => String(s.id) === String(data.student_profile_id));

        if (!student) {
            return;
        }

        setRateLoading(true);

        const params = new URLSearchParams({
            grade_level: student.grade_level || '',
            session_type: data.session_type,
        });

        fetch(route('parent.booking.rate') + '?' + params.toString())
            .then((res) => res.json())
            .then((json) => {
                setData('rate_applied', json.rate);
                setRateLoading(false);
            })
            .catch(() => {
                setRateLoading(false);
            });
    }, [data.student_profile_id, data.session_type]);

    useEffect(() => {
        if (!data.student_profile_id || data.subject.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        setMatchingLoading(true);

        const params = new URLSearchParams({
            student_profile_id: data.student_profile_id,
            subject: data.subject,
        });

        fetch(route('parent.booking.match') + '?' + params.toString())
            .then((res) => res.json())
            .then((json) => {
                setSuggestions(json.tutors || []);
                setMatchingLoading(false);
            })
            .catch(() => {
                setSuggestions([]);
                setMatchingLoading(false);
            });
    }, [data.student_profile_id, data.subject]);

    const submit = (e) => {
        e.preventDefault();
        post(route('parent.booking.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-bold leading-tight text-gray-800">
                        Book a Session
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
            <Head title="Book a Session" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 border border-gray-800 rounded-3xl shadow-sm">
                        <section className="max-w-xl">
                            {students.length === 0 && (
                                <p className="text-sm text-gray-700">
                                    You have no children on your account yet.{' '}
                                    <Link
                                        href={route('parent.profile.edit')}
                                        className="font-semibold text-[#77b2a6] underline"
                                    >
                                        Add a student profile first.
                                    </Link>
                                </p>
                            )}

                            <form onSubmit={submit} className="mt-6 space-y-6">
                                <div>
                                    <InputLabel htmlFor="student_profile_id" value="Child" />
                                    <select
                                        id="student_profile_id"
                                        className={selectClass}
                                        value={data.student_profile_id}
                                        onChange={(e) => setData('student_profile_id', e.target.value)}
                                    >
                                        <option value="">Select a child</option>
                                        {students.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.student_name} ({s.grade_level})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError className="mt-2" message={errors.student_profile_id} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="tutor_id" value="Tutor" />
                                    <select
                                        id="tutor_id"
                                        className={selectClass}
                                        value={data.tutor_id}
                                        onChange={(e) => setData('tutor_id', e.target.value)}
                                    >
                                        <option value="">Select a tutor</option>
                                        {tutors.map((tutor) => (
                                            <option key={tutor.id} value={tutor.user_id}>
                                                {tutor.user?.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError className="mt-2" message={errors.tutor_id} />
                                    {matchingLoading && (
                                        <p className="mt-2 text-xs text-gray-500">Finding subject matches...</p>
                                    )}
                                    {suggestions.length > 0 && (
                                        <div className="mt-3 rounded-2xl border border-gray-300 bg-[#FFF4CC] p-3">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                                                Suggested tutors
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {suggestions.map((suggestion) => (
                                                    <button
                                                        key={suggestion.id}
                                                        type="button"
                                                        onClick={() => setData('tutor_id', String(suggestion.id))}
                                                        className={`rounded-full border px-3 py-1 text-left text-xs ${String(data.tutor_id) === String(suggestion.id) ? 'border-gray-800 bg-[#DCE7C3]' : 'border-gray-500 bg-white'}`}
                                                    >
                                                        <span className="font-semibold">{suggestion.name}</span>
                                                        <span className="ml-1 text-gray-600">{suggestion.reason}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <InputLabel htmlFor="subject" value="Subject" />
                                    <TextInput
                                        id="subject"
                                        className="mt-1 block w-full"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={errors.subject} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="session_type" value="Session Type" />
                                        <select
                                            id="session_type"
                                            className={selectClass}
                                            value={data.session_type}
                                            onChange={(e) => setData('session_type', e.target.value)}
                                        >
                                            <option value="1on1">1-on-1</option>
                                            <option value="class">Class</option>
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="location_type" value="Location" />
                                        <select
                                            id="location_type"
                                            className={selectClass}
                                            value={data.location_type}
                                            onChange={(e) => setData('location_type', e.target.value)}
                                        >
                                            <option value="onsite">Onsite</option>
                                            <option value="home">Home</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="session_date" value="Date" />
                                    <TextInput
                                        id="session_date"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.session_date}
                                        onChange={(e) => setData('session_date', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={errors.session_date} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="start_time" value="Start Time" />
                                        <TextInput
                                            id="start_time"
                                            type="time"
                                            className="mt-1 block w-full"
                                            value={data.start_time}
                                            onChange={(e) => setData('start_time', e.target.value)}
                                        />
                                        <InputError className="mt-2" message={errors.start_time} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="end_time" value="End Time" />
                                        <TextInput
                                            id="end_time"
                                            type="time"
                                            className="mt-1 block w-full"
                                            value={data.end_time}
                                            onChange={(e) => setData('end_time', e.target.value)}
                                        />
                                        <InputError className="mt-2" message={errors.end_time} />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="rate_applied" value="Rate (auto-calculated)" />
                                    <TextInput
                                        id="rate_applied"
                                        type="number"
                                        step="0.01"
                                        className="mt-1 block w-full"
                                        value={data.rate_applied}
                                        onChange={(e) => setData('rate_applied', e.target.value)}
                                    />
                                    {rateLoading && (
                                        <p className="mt-1 text-xs text-gray-500">Calculating rate...</p>
                                    )}
                                    <InputError className="mt-2" message={errors.rate_applied} />
                                </div>

                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={processing} className="rounded-full">
                                        {processing ? 'Booking...' : 'Book Session'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}