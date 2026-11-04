<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TutorProfile;
use App\Models\TutoringSession;
use App\Models\User;
use App\Notifications\SessionStatusNotification;
use App\Support\RateCalculator;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AutoAssignController extends Controller
{
    // Weekly teaching hours a tutor should stay under. Not stored anywhere yet.
    private const WEEKLY_CAP = 25;

    private const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    public function pending(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $rows = TutoringSession::with(['studentProfile:id,student_name,grade_level', 'tutor:id,name'])
            ->where('status', 'pending')
            ->orderBy('session_date')
            ->orderBy('start_time')
            ->get()
            ->map(fn (TutoringSession $s) => [
                'id' => $s->id,
                'student' => $s->studentProfile?->student_name,
                'grade' => $s->studentProfile?->grade_level,
                'subject' => $s->subject,
                'date' => substr((string) $s->session_date, 0, 10),
                'start' => substr((string) $s->start_time, 0, 5),
                'end' => substr((string) $s->end_time, 0, 5),
                'tutor' => $s->tutor?->name,
            ])
            ->values();

        return response()->json(['sessions' => $rows]);
    }

    public function suggest(Request $request, TutoringSession $session): JsonResponse
    {
        $this->ensureAdmin($request);

        if ($session->status !== 'pending') {
            abort(422, 'Only pending sessions can be reassigned.');
        }

        $date = substr((string) $session->session_date, 0, 10);
        $start = substr((string) $session->start_time, 0, 5);
        $end = substr((string) $session->end_time, 0, 5);
        $hours = RateCalculator::hours($start, $end);
        $kind = RateCalculator::kind((string) $session->subject);
        $subject = strtolower(trim((string) $session->subject));
        $day = self::DAYS[(int) date('w', strtotime($date))];

        $weekStart = Carbon::parse($date)->startOfWeek(Carbon::SUNDAY)->toDateString();
        $weekEnd = Carbon::parse($date)->endOfWeek(Carbon::SATURDAY)->toDateString();

        $needed = [];
        [$sh] = array_map('intval', explode(':', $start));
        [$eh, $em] = array_map('intval', explode(':', $end));
        for ($hour = $sh; $hour * 60 < $eh * 60 + $em; $hour++) {
            $needed[] = sprintf('%02d:00', $hour);
        }

        $busy = $this->busyIds($session->id, $date, $start, $end);

        $weekHours = TutoringSession::where('status', '!=', 'cancelled')
            ->where('id', '!=', $session->id)
            ->whereDate('session_date', '>=', $weekStart)
            ->whereDate('session_date', '<=', $weekEnd)
            ->get(['tutor_id', 'start_time', 'end_time'])
            ->groupBy('tutor_id')
            ->map(fn ($group) => $group->sum(fn ($s) => RateCalculator::hours(
                substr((string) $s->start_time, 0, 5),
                substr((string) $s->end_time, 0, 5),
            )));

        $history = TutoringSession::where('student_profile_id', $session->student_profile_id)
            ->where('status', 'completed')
            ->get(['tutor_id'])
            ->groupBy('tutor_id')
            ->map->count();

        $profiles = TutorProfile::with('user:id,name')
            ->where('is_verified', true)
            ->whereHas('user', fn ($query) => $query->where('role', 'tutor'))
            ->get();

        $categoryFor = ['academic' => 'academic', 'arts' => 'arts', 'special' => 'special'][$kind] ?? 'academic';
        $candidates = [];
        $excluded = 0;

        foreach ($profiles as $profile) {
            $id = (int) $profile->user_id;

            if (in_array($id, $busy, true)) {
                $excluded++;

                continue;
            }

            $raw = $profile->availability;
            $week = is_array($raw) ? $raw : json_decode((string) $raw, true);
            $hasSchedule = is_array($week) && collect($week)->contains(fn ($slots) => is_array($slots) && count($slots) > 0);

            if ($hasSchedule) {
                $slots = is_array($week[$day] ?? null) ? $week[$day] : [];

                if (count(array_diff($needed, $slots)) > 0) {
                    $excluded++;

                    continue;
                }

                $availability = ['score' => 100, 'label' => 'Exact fit', 'note' => 'The requested time is inside their saved availability.'];
            } else {
                $availability = ['score' => 70, 'label' => 'Open', 'note' => 'No weekly schedule saved, so any free time works.'];
            }

            $subjectScore = 0;
            $subjectNote = 'No matching subject listed.';

            foreach ($profile->specializations ?? [] as $specialization) {
                $normalized = strtolower(trim((string) $specialization));

                if ($normalized === $subject) {
                    $subjectScore = 100;
                    $subjectNote = 'Teaches '.$session->subject.'.';
                    break;
                }

                if ($normalized !== '' && (str_contains($normalized, $subject) || str_contains($subject, $normalized))) {
                    $subjectScore = max($subjectScore, 60);
                    $subjectNote = 'Related subject: '.$specialization.'.';
                }
            }

            if ($subjectScore === 0 && in_array($categoryFor, $profile->categories ?? [], true)) {
                $subjectScore = 40;
                $subjectNote = 'Teaches this kind of lesson.';
            }

            $total = (float) $weekHours->get($id, 0) + $hours;
            $workloadScore = (int) max(0, round(100 - ($total / self::WEEKLY_CAP) * 100));
            $count = (int) $history->get($id, 0);
            $historyScore = min(100, $count * 50);

            $candidates[] = [
                'id' => $id,
                'name' => $profile->user->name,
                'photo' => $profile->photo_path,
                'credential' => $profile->credential,
                'score' => (int) round($subjectScore * 0.40 + $availability['score'] * 0.25 + $workloadScore * 0.20 + $historyScore * 0.15),
                'subject' => ['score' => $subjectScore, 'note' => $subjectNote],
                'availability' => $availability,
                'workload' => [
                    'hours' => round($total, 1),
                    'cap' => self::WEEKLY_CAP,
                    'note' => 'Adding '.$hours.' hrs puts them at '.round($total, 1).' of '.self::WEEKLY_CAP.' hrs that week.',
                ],
                'history' => [
                    'count' => $count,
                    'note' => $count > 0
                        ? 'Already completed '.$count.' session'.($count === 1 ? '' : 's').' with this child.'
                        : 'No earlier sessions with this child.',
                ],
            ];
        }

        usort($candidates, fn ($a, $b) => $b['score'] <=> $a['score']);

        return response()->json([
            'session' => [
                'id' => $session->id,
                'subject' => $session->subject,
                'date' => $date,
                'start' => $start,
                'end' => $end,
                'hours' => $hours,
                'location' => $session->location_type,
                'current_tutor_id' => (int) $session->tutor_id,
            ],
            'candidates' => array_slice($candidates, 0, 5),
            'compared' => $profiles->count(),
            'excluded' => $excluded,
        ]);
    }

    public function assign(Request $request, TutoringSession $session): RedirectResponse
    {
        $this->ensureAdmin($request);

        $validated = $request->validate(['tutor_id' => ['required', 'exists:users,id']]);

        if ($session->status !== 'pending') {
            throw ValidationException::withMessages(['session' => 'Only pending sessions can be reassigned.']);
        }

        $bookable = User::whereKey($validated['tutor_id'])
            ->where('role', 'tutor')
            ->whereHas('tutorProfile', fn ($query) => $query->where('is_verified', true))
            ->exists();

        if (! $bookable) {
            throw ValidationException::withMessages(['tutor_id' => 'That tutor cannot be assigned.']);
        }

        $date = substr((string) $session->session_date, 0, 10);
        $start = substr((string) $session->start_time, 0, 5);
        $end = substr((string) $session->end_time, 0, 5);

        if (in_array((int) $validated['tutor_id'], $this->busyIds($session->id, $date, $start, $end), true)) {
            throw ValidationException::withMessages(['tutor_id' => 'That tutor already has a session at this time.']);
        }

        $previous = (int) $session->tutor_id;
        $session->tutor_id = (int) $validated['tutor_id'];
        $session->save();

        $session->load('studentProfile.parent');
        $tutor = User::find($validated['tutor_id']);

        $tutor?->notify(new SessionStatusNotification(
            'New session assigned',
            'The studio assigned you a '.$session->subject.' session.',
            route('tutor.dashboard'),
        ));

        $session->studentProfile?->parent?->notify(new SessionStatusNotification(
            'Tutor assigned',
            $tutor?->name.' will teach your '.$session->subject.' session.',
            route('parent.dashboard'),
        ));

        if ($previous !== (int) $validated['tutor_id']) {
            User::find($previous)?->notify(new SessionStatusNotification(
                'Session reassigned',
                'A '.$session->subject.' session was moved to another tutor.',
                route('tutor.dashboard'),
            ));
        }

        return back()->with('status', 'session-reassigned');
    }

    private function busyIds(int $exceptId, string $date, string $start, string $end): array
    {
        return TutoringSession::whereDate('session_date', $date)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('id', '!=', $exceptId)
            ->whereRaw('substr(start_time, 1, 5) < ?', [$end])
            ->whereRaw('substr(end_time, 1, 5) > ?', [$start])
            ->pluck('tutor_id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();
    }

    private function ensureAdmin(Request $request): void
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }
    }
}