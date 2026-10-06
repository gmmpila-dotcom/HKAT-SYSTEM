<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;
use App\Notifications\SessionStatusNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function create(Request $request): Response
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        return Inertia::render('Parent/Book', [
            'tutors' => TutorProfile::with('user:id,name')
                ->where('is_verified', true)
                ->whereHas('user', function ($query) {
                    $query->where('role', 'tutor');
                })
                ->get(),
            'students' => StudentProfile::where('parent_id', $user->id)
                ->get(['id', 'student_name', 'grade_level']),
        ]);
    }

    public function calculateRate(Request $request): JsonResponse
    {
        $gradeLevel = $request->query('grade_level', '');
        $sessionType = $request->query('session_type', '1on1');

        $rate = self::rateFor($gradeLevel, $sessionType);

        return response()->json(['rate' => $rate]);
    }

    public function match(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        $validated = $request->validate([
            'student_profile_id' => ['required', 'exists:student_profiles,id'],
            'subject' => ['required', 'string', 'min:2', 'max:255'],
        ]);

        $studentBelongsToParent = StudentProfile::whereKey($validated['student_profile_id'])
            ->where('parent_id', $user->id)
            ->exists();

        if (! $studentBelongsToParent) {
            abort(403);
        }

        $subject = strtolower(trim($validated['subject']));
        $tutors = TutorProfile::with('user:id,name')
            ->where('is_verified', true)
            ->whereHas('user', function ($query) {
                $query->where('role', 'tutor');
            })
            ->get()
            ->map(function (TutorProfile $profile) use ($subject): array {
                $score = 0;

                foreach ($profile->specializations ?? [] as $specialization) {
                    $normalized = strtolower($specialization);

                    if ($normalized === $subject) {
                        $score = max($score, 100);
                    } elseif (str_contains($normalized, $subject) || str_contains($subject, $normalized)) {
                        $score = max($score, 50);
                    }
                }

                return [
                    'id' => $profile->user_id,
                    'name' => $profile->user->name,
                    'specializations' => $profile->specializations ?? [],
                    'score' => $score,
                    'reason' => $score > 0 ? 'Specialization match' : 'Verified tutor',
                ];
            })
            ->sortByDesc('score')
            ->take(5)
            ->values();

        return response()->json(['tutors' => $tutors]);
    }

    public static function rateFor(string $gradeLevel, string $sessionType): float
    {
        $gradeLevel = strtolower($gradeLevel);

        $base = 300;

        if (str_contains($gradeLevel, 'high') || str_contains($gradeLevel, 'senior')) {
            $base = 500;
        } elseif (str_contains($gradeLevel, 'college') || str_contains($gradeLevel, 'university')) {
            $base = 700;
        } elseif (str_contains($gradeLevel, 'grade')) {
            $base = 350;
        }

        if ($sessionType === 'class') {
            $base = $base * 0.7;
        }

        return round($base, 2);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        $validated = $request->validate([
            'student_profile_id' => ['required', 'exists:student_profiles,id'],
            'tutor_id' => ['required', 'exists:users,id'],
            'subject' => ['required', 'string', 'max:255'],
            'session_type' => ['required', 'in:1on1,class'],
            'location_type' => ['required', 'in:onsite,home'],
            'session_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        $student = StudentProfile::where('id', $validated['student_profile_id'])
            ->where('parent_id', $user->id)
            ->first();

        if (! $student) {
            abort(403);
        }

        $tutorIsBookable = User::whereKey($validated['tutor_id'])
            ->where('role', 'tutor')
            ->whereHas('tutorProfile', function ($query) {
                $query->where('is_verified', true);
            })
            ->exists();

        if (! $tutorIsBookable) {
            throw ValidationException::withMessages([
                'tutor_id' => 'The selected tutor is not available for booking.',
            ]);
        }

        $rateApplied = self::rateFor($student->grade_level, $validated['session_type']);

        DB::transaction(function () use ($student, $validated, $rateApplied) {
            $session = TutoringSession::create([
                'student_profile_id' => $student->id,
                'tutor_id' => $validated['tutor_id'],
                'subject' => $validated['subject'],
                'session_type' => $validated['session_type'],
                'location_type' => $validated['location_type'],
                'session_date' => $validated['session_date'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'rate_applied' => $rateApplied,
                'status' => 'pending',
            ]);

            Payment::create([
                'session_id' => $session->id,
                'amount' => $rateApplied,
                'status' => 'pending',
            ]);
        });

        $tutor = User::findOrFail($validated['tutor_id']);
        $user->notify(new SessionStatusNotification(
            'Booking submitted',
            'Your session booking request is waiting for admin review.',
            route('parent.dashboard'),
        ));
        $tutor->notify(new SessionStatusNotification(
            'New session request',
            'A parent submitted a new tutoring session request for your review.',
            route('tutor.dashboard'),
        ));

        return redirect()->route('parent.dashboard')->with('status', 'session-booked');
    }
}
