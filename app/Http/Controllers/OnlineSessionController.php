<?php

namespace App\Http\Controllers;

use App\Models\TutoringSession;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OnlineSessionController extends Controller
{
    private const TZ = 'Asia/Manila';

    public function show(Request $request, TutoringSession $session): Response|RedirectResponse
    {
        $user = $request->user();
        $session->load('studentProfile', 'tutor:id,name');
        $this->authorizeUser($user, $session);

        if ($session->location_type !== 'online' || empty($session->room_code)) {
            abort(404);
        }

        if ($session->status !== 'confirmed') {
            return back()->withErrors(['session' => 'This class opens once the payment is confirmed.']);
        }

        [$start, $end] = $this->window($session);
        $now = Carbon::now(self::TZ);

        if ($session->ended_at) {
            return back()->withErrors(['session' => 'This class has ended.']);
        }

        if ($now->lt($start->copy()->subMinutes(15))) {
            return back()->withErrors(['session' => 'The class room opens 15 minutes before the start time.']);
        }

        if ($now->gt($end->copy()->addMinutes(30))) {
            return back()->withErrors(['session' => 'The time for this class has passed.']);
        }

        if (! $session->started_at) {
            DB::table('tutoring_sessions')->where('id', $session->id)->update(['started_at' => now(), 'updated_at' => now()]);
            $session->refresh();
        }

        $isStaff = in_array($user->role, ['tutor', 'admin'], true);

        return Inertia::render('Online/Room', [
            'room' => [
                'id' => $session->id,
                'code' => $session->room_code,
                'subject' => $session->subject,
                'student' => $session->studentProfile?->student_name,
                'tutor' => $session->tutor?->name,
                'date' => substr((string) $session->session_date, 0, 10),
                'start' => substr((string) $session->start_time, 0, 5),
                'end' => substr((string) $session->end_time, 0, 5),
                'started_at' => $session->started_at?->toIso8601String(),
                'ended_at' => null,
                'can_end' => $isStaff,
                'me' => $user->name,
            ],
        ]);
    }

    public function end(Request $request, TutoringSession $session): RedirectResponse
    {
        $user = $request->user();
        $session->load('studentProfile');
        $this->authorizeUser($user, $session);

        if (! in_array($user->role, ['tutor', 'admin'], true)) {
            abort(403);
        }

        if ($session->location_type !== 'online') {
            abort(404);
        }

        if (! $session->ended_at) {
            DB::table('tutoring_sessions')->where('id', $session->id)->update(['ended_at' => now(), 'updated_at' => now()]);
        }

        $home = match ($user->role) {
            'admin' => url('/admin/dashboard'),
            default => route('tutor.dashboard'),
        };

        return redirect($home)->with('status', 'Online class ended.');
    }

    private function authorizeUser($user, TutoringSession $session): void
    {
        $allowed = match ($user->role) {
            'admin' => true,
            'tutor' => (int) $session->tutor_id === (int) $user->id,
            'parent' => (int) $session->studentProfile?->parent_id === (int) $user->id,
            default => false,
        };

        if (! $allowed) {
            abort(403);
        }
    }

    private function window(TutoringSession $session): array
    {
        $date = substr((string) $session->session_date, 0, 10);
        $start = Carbon::parse($date.' '.substr((string) $session->start_time, 0, 5), self::TZ);
        $end = Carbon::parse($date.' '.substr((string) $session->end_time, 0, 5), self::TZ);

        if ($end->lte($start)) {
            $end->addDay();
        }

        return [$start, $end];
    }
}