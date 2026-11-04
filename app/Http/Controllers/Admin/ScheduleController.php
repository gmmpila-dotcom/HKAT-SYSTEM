<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TutorProfile;
use App\Models\TutoringSession;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $offset = max(-52, min(52, (int) $request->query('week', 0)));
        $start = now()->startOfWeek(Carbon::SUNDAY)->addWeeks($offset);
        $end = $start->copy()->endOfWeek(Carbon::SATURDAY);

        $sessions = TutoringSession::with(['studentProfile:id,student_name', 'tutor:id,name'])
            ->whereDate('session_date', '>=', $start->toDateString())
            ->whereDate('session_date', '<=', $end->toDateString())
            ->where('status', '!=', 'cancelled')
            ->orderBy('session_date')
            ->orderBy('start_time')
            ->get()
            ->map(fn (TutoringSession $s) => [
                'id' => $s->id,
                'date' => substr((string) $s->session_date, 0, 10),
                'start' => substr((string) $s->start_time, 0, 5),
                'end' => substr((string) $s->end_time, 0, 5),
                'subject' => $s->subject,
                'status' => $s->status,
                'student' => $s->studentProfile?->student_name,
                'tutor_id' => $s->tutor_id,
                'tutor' => $s->tutor?->name,
            ])
            ->values();

        $tutors = TutorProfile::with('user:id,name')
            ->where('is_verified', true)
            ->get()
            ->map(fn (TutorProfile $p) => ['id' => $p->user_id, 'name' => $p->user?->name])
            ->filter(fn (array $t) => $t['name'])
            ->sortBy('id')
            ->values();

        return Inertia::render('Admin/Schedule/Index', [
            'sessions' => $sessions,
            'tutors' => $tutors,
            'week' => [
                'offset' => $offset,
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
        ]);
    }
}