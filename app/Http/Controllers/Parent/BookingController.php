<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;
use App\Notifications\SessionStatusNotification;
use App\Support\RateCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    private ?int $pricingTutor = null;

    public function create(Request $request): Response
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        $ratings = DB::table('reviews')
            ->join('tutoring_sessions', 'reviews.session_id', '=', 'tutoring_sessions.id')
            ->select('tutoring_sessions.tutor_id', DB::raw('AVG(reviews.rating) as average'), DB::raw('COUNT(*) as total'))
            ->groupBy('tutoring_sessions.tutor_id')
            ->get()
            ->keyBy('tutor_id');

        $tutors = TutorProfile::with('user:id,name')
            ->where('is_verified', true)
            ->whereHas('user', function ($query) {
                $query->where('role', 'tutor');
            })
            ->get()
            ->map(function (TutorProfile $profile) use ($ratings): array {
                $rating = $ratings->get($profile->user_id);

                return [
                    'id' => $profile->user_id,
                    'profile_id' => $profile->id,
                    'name' => $profile->user->name,
                    'photo' => $profile->photo_path,
                    'subjects' => $profile->specializations ?? [],
                    'categories' => $profile->categories ?? [],
                    'rating' => $rating ? round((float) $rating->average, 1) : null,
                    'review_count' => $rating ? (int) $rating->total : 0,
                    'rates' => RateCalculator::overrides($profile->user_id),
                ];
            })
            ->values();

        return Inertia::render('Parent/Book', [
            'tutors' => $tutors,
            'students' => StudentProfile::where('parent_id', $user->id)
                ->get(['id', 'student_name', 'grade_level']),
            'onlinePaymentsEnabled' => ! empty(config('services.paymongo.secret_key')),
            'standardRates' => config('rates'),
        ]);
    }

    public function calculateRate(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        $validated = $request->validate([
            'student_profile_id' => ['required', 'exists:student_profiles,id'],
            'subject' => ['required', 'string', 'max:255'],
            'location_type' => ['required', 'in:onsite,home,online'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        $this->pricingTutor = $request->integer('tutor_id') ?: null;
        $student = StudentProfile::where('id', $validated['student_profile_id'])
            ->where('parent_id', $user->id)
            ->first();

        if (! $student) {
            abort(403);
        }

        return response()->json([
            'rate' => $this->priceFor(
                $student,
                $validated['subject'],
                $validated['location_type'],
                $validated['start_time'],
                $validated['end_time'],
            ),
            'kind' => RateCalculator::kind($validated['subject']),
        ]);
    }

    public function availability(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        $validated = $request->validate([
            'session_date' => ['required', 'date_format:Y-m-d'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        return response()->json([
            'unavailable' => $this->busyTutorIds($validated['session_date'], $validated['start_time'], $validated['end_time']),
        ]);
    }

    private function busyTutorIds(string $date, string $start, string $end): array
    {
        return array_values(array_unique(array_merge(
            $this->sessionBusyTutorIds($date, $start, $end),
            $this->offScheduleTutorIds($date, $start, $end),
        )));
    }

    /** Tutors who saved weekly availability but are not free for every hour of this request. */
    private function offScheduleTutorIds(string $date, string $start, string $end): array
    {
        $days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        $day = $days[(int) date('w', strtotime($date))];

        [$sh, $sm] = array_map('intval', explode(':', $start));
        [$eh, $em] = array_map('intval', explode(':', $end));
        $needed = [];
        for ($hour = $sh; $hour * 60 < $eh * 60 + $em; $hour++) {
            $needed[] = sprintf('%02d:00', $hour);
        }

        $off = [];

        foreach (DB::table('tutor_profiles')->whereNotNull('availability')->get(['user_id', 'availability']) as $row) {
            $week = json_decode((string) $row->availability, true);

            if (! is_array($week)) {
                continue;
            }

            $hasAny = collect($week)->contains(fn ($slots) => is_array($slots) && count($slots) > 0);

            if (! $hasAny) {
                continue;
            }

            $slots = is_array($week[$day] ?? null) ? $week[$day] : [];

            if (count(array_diff($needed, $slots)) > 0) {
                $off[] = (int) $row->user_id;
            }
        }

        return $off;
    }

    private function sessionBusyTutorIds(string $date, string $start, string $end): array
    {
        return TutoringSession::whereDate('session_date', $date)
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereRaw('substr(start_time, 1, 5) < ?', [$end])
            ->whereRaw('substr(end_time, 1, 5) > ?', [$start])
            ->pluck('tutor_id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    private function priceFor(StudentProfile $student, string $subject, string $location, string $start, string $end): float
    {
        try {
            return RateCalculator::total(
                $student->grade_level,
                $subject,
                $location,
                RateCalculator::hours($start, $end), $this->pricingTutor,
            );
        } catch (InvalidArgumentException) {
            throw ValidationException::withMessages([
                'student_profile_id' => "Please update your child's grade level in the student profile.",
            ]);
        }
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
            'location_type' => ['required', 'in:onsite,home,online'],
            'session_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        $this->pricingTutor = $request->integer('tutor_id') ?: null;
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

        if (in_array((int) $validated['tutor_id'], $this->busyTutorIds($validated['session_date'], $validated['start_time'], $validated['end_time']), true)) {
            throw ValidationException::withMessages([
                'tutor_id' => 'This tutor is not available at that time. Please choose another time or tutor.',
            ]);
        }

        $rateApplied = $this->priceFor(
            $student,
            $validated['subject'],
            $validated['location_type'],
            $validated['start_time'],
            $validated['end_time'],
        );

        $tutorRates = \App\Support\RateCalculator::overrides((int) $validated['tutor_id']);
        if (! empty($tutorRates['online_only']) && $validated['location_type'] !== 'online') {
            throw \Illuminate\Validation\ValidationException::withMessages(['location_type' => 'This tutor teaches online only.']);
        }

        $taught = array_map(fn ($s) => strtolower(trim((string) $s)), \App\Models\TutorProfile::where('user_id', $validated['tutor_id'])->value('specializations') ?? []);
        if (! in_array(strtolower(trim($validated['subject'])), $taught, true)) {
            throw \Illuminate\Validation\ValidationException::withMessages(['tutor_id' => 'This tutor does not teach that subject.']);
        }

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

        return redirect()->route('parent.billing.index')->with('status', 'session-booked');
    }
}
