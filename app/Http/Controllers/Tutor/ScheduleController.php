<?php

namespace App\Http\Controllers\Tutor;

use App\Http\Controllers\Controller;
use App\Models\TutoringSession;
use App\Support\RateCalculator;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->role !== 'tutor') {
            abort(403);
        }

        $offset = max(-52, min(52, (int) $request->query('week', 0)));
        $start = now()->startOfWeek(Carbon::SUNDAY)->addWeeks($offset);
        $end = $start->copy()->endOfWeek(Carbon::SATURDAY);

        $shape = fn (TutoringSession $s) => [
            'id' => $s->id,
            'date' => substr((string) $s->session_date, 0, 10),
            'start' => substr((string) $s->start_time, 0, 5),
            'end' => substr((string) $s->end_time, 0, 5),
            'subject' => $s->subject,
            'status' => $s->status,
            'student' => $s->studentProfile?->student_name,
            'location' => $s->location_type,
        ];

        $sessions = TutoringSession::with('studentProfile:id,student_name')
            ->where('tutor_id', $user->id)
            ->where('status', '!=', 'cancelled')
            ->whereDate('session_date', '>=', $start->toDateString())
            ->whereDate('session_date', '<=', $end->toDateString())
            ->orderBy('session_date')
            ->orderBy('start_time')
            ->get()
            ->map($shape)
            ->values();

        $upNext = TutoringSession::with('studentProfile:id,student_name')
            ->where('tutor_id', $user->id)
            ->where('status', 'confirmed')
            ->whereDate('session_date', '>=', now()->toDateString())
            ->orderBy('session_date')
            ->orderBy('start_time')
            ->limit(5)
            ->get()
            ->map($shape)
            ->values();

        return Inertia::render('Tutor/Schedule/Index', [
            'sessions' => $sessions,
            'upNext' => $upNext,
            'week' => [
                'offset' => $offset,
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
            'summary' => [
                'count' => $sessions->count(),
                'hours' => round((float) $sessions->sum(fn ($s) => RateCalculator::hours($s['start'], $s['end'])), 1),
            ],
        ]);
    }
}