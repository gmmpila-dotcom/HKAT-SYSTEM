<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TutorProfile;
use App\Models\TutoringSession;
use App\Models\User;
use App\Support\RateCalculator;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TutorDirectoryController extends Controller
{
    private const CATEGORIES = ['academic', 'arts', 'special'];

    // Weekly teaching hours that decide the availability label on each card.
    private const LIMITED_FROM_HOURS = 12;

    private const FULL_FROM_HOURS = 20;

    public function index(Request $request): Response
    {
        $this->ensureAdmin($request);

        $weekStart = now()->startOfWeek(Carbon::SUNDAY)->toDateString();
        $weekEnd = now()->endOfWeek(Carbon::SATURDAY)->toDateString();

        $ratings = DB::table('reviews')
            ->join('tutoring_sessions', 'reviews.session_id', '=', 'tutoring_sessions.id')
            ->select('tutoring_sessions.tutor_id', DB::raw('AVG(reviews.rating) as average'), DB::raw('COUNT(*) as total'))
            ->groupBy('tutoring_sessions.tutor_id')
            ->get()
            ->keyBy('tutor_id');

        $students = DB::table('tutoring_sessions')
            ->where('status', '!=', 'cancelled')
            ->select('tutor_id', DB::raw('COUNT(DISTINCT student_profile_id) as total'))
            ->groupBy('tutor_id')
            ->get()
            ->keyBy('tutor_id');

        $weekHours = TutoringSession::where('status', '!=', 'cancelled')
            ->whereDate('session_date', '>=', $weekStart)
            ->whereDate('session_date', '<=', $weekEnd)
            ->get(['tutor_id', 'start_time', 'end_time'])
            ->groupBy('tutor_id')
            ->map(fn ($group) => round($group->sum(fn ($s) => RateCalculator::hours(
                substr((string) $s->start_time, 0, 5),
                substr((string) $s->end_time, 0, 5),
            )), 1));

        $tutors = TutorProfile::with('user:id,name,email')
            ->get()
            ->filter(fn (TutorProfile $p) => $p->user !== null)
            ->map(function (TutorProfile $p) use ($ratings, $students, $weekHours): array {
                $rating = $ratings->get($p->user_id);
                $hours = (float) $weekHours->get($p->user_id, 0);

                return [
                    'id' => $p->id,
                    'name' => $p->user->name,
                    'email' => $p->user->email,
                    'photo' => $p->photo_path,
                    'credential' => $p->credential,
                    'specializations' => $p->specializations ?? [],
                    'categories' => $p->categories ?? [],
                    'years_experience' => $p->years_experience,
                    'verified' => (bool) $p->is_verified,
                    'rating' => $rating ? round((float) $rating->average, 1) : null,
                    'review_count' => $rating ? (int) $rating->total : 0,
                    'students' => (int) ($students->get($p->user_id)?->total ?? 0),
                    'hours' => $hours,
                    'availability' => $hours >= self::FULL_FROM_HOURS
                        ? 'full'
                        : ($hours >= self::LIMITED_FROM_HOURS ? 'limited' : 'open'),
                ];
            })
            ->sortBy('name')
            ->values();

        return Inertia::render('Admin/Tutors/Index', [
            'tutors' => $tutors,
            'counts' => [
                'total' => $tutors->count(),
                'awaiting' => $tutors->where('verified', false)->count(),
            ],
            'notice' => [
                'status' => session('status'),
                'tempPassword' => session('tempPassword'),
                'tutorEmail' => session('tutorEmail'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'category' => ['required', Rule::in(self::CATEGORIES)],
            'specialization' => ['nullable', 'string', 'max:255'],
        ]);

        $temporaryPassword = Str::random(12);

        DB::transaction(function () use ($validated, $temporaryPassword) {
            $user = new User([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($temporaryPassword),
                'role' => 'tutor',
            ]);
            $user->email_verified_at = now();
            $user->save();

            TutorProfile::create([
                'user_id' => $user->id,
                'categories' => [$validated['category']],
                'specializations' => $this->splitList($validated['specialization'] ?? ''),
                'is_verified' => true,
                'rating' => null,
            ]);
        });

        return redirect()->route('admin.tutors.index')
            ->with('status', 'tutor-added')
            ->with('tempPassword', $temporaryPassword)
            ->with('tutorEmail', $validated['email']);
    }

    public function update(Request $request, TutorProfile $tutorProfile): RedirectResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate([
            'categories' => ['required', 'array', 'min:1'],
            'categories.*' => ['required', Rule::in(self::CATEGORIES)],
            'specializations' => ['nullable', 'string', 'max:500'],
            'credential' => ['nullable', 'string', 'max:255'],
            'years_experience' => ['nullable', 'string', 'max:50'],
        ]);

        $tutorProfile->update([
            'categories' => array_values(array_unique($validated['categories'])),
            'specializations' => $this->splitList($validated['specializations'] ?? ''),
            'credential' => $validated['credential'] ?? null,
            'years_experience' => $validated['years_experience'] ?? null,
        ]);

        return redirect()->route('admin.tutors.index')->with('status', 'tutor-updated');
    }

    public function destroy(Request $request, TutorProfile $tutorProfile): RedirectResponse
    {
        $this->ensureAdmin($request);

        if (TutoringSession::where('tutor_id', $tutorProfile->user_id)->exists()) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'tutor' => 'This tutor has sessions on record, so they cannot be deleted. Use Remove verification to hide them from booking.',
            ]);
        }

        try {
            DB::transaction(function () use ($tutorProfile) {
                $user = $tutorProfile->user;
                $tutorProfile->delete();
                $user?->delete();
            });
        } catch (\Illuminate\Database\QueryException) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'tutor' => 'This tutor is linked to other records and cannot be deleted. Use Remove verification instead.',
            ]);
        }

        return redirect()->route('admin.tutors.index')->with('status', 'tutor-removed');
    }

    private function ensureAdmin(Request $request): void
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }
    }

    private function splitList(?string $value): array
    {
        return collect(explode(',', (string) $value))
            ->map(fn ($item) => trim($item))
            ->filter()
            ->values()
            ->all();
    }
}