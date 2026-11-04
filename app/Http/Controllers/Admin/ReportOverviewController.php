<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\TutoringSession;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportOverviewController extends Controller
{
    public function index(Request $request): Response
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $now = now();

        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $start = $now->copy()->startOfMonth()->subMonthsNoOverflow($i);
            $months[] = [
                'label' => $start->format('F'),
                'short' => $start->format('M'),
                'start' => $start,
                'end' => $start->copy()->endOfMonth(),
            ];
        }
        $rangeStart = $months[0]['start'];
        $rangeEnd = $months[5]['end'];

        $paid = Payment::where('status', 'paid')
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [$rangeStart, $rangeEnd])
            ->get(['id', 'amount', 'paid_at']);

        $revenue = [];
        foreach ($months as $m) {
            $revenue[] = (float) $paid
                ->filter(fn ($p) => $p->paid_at->between($m['start'], $m['end']))
                ->sum('amount');
        }

        $totalBooked = (float) Payment::where('status', '!=', 'failed')->sum('amount');

        $weeks = [];
        for ($i = 4; $i >= 0; $i--) {
            $start = $now->copy()->startOfWeek(Carbon::SUNDAY)->subWeeks($i);
            $weeks[] = [
                'label' => 'Week '.(5 - $i),
                'start' => $start->toDateString(),
                'end' => $start->copy()->endOfWeek(Carbon::SATURDAY)->toDateString(),
            ];
        }

        $weekSessions = TutoringSession::with('studentProfile:id,student_name')
            ->whereIn('status', ['completed', 'cancelled'])
            ->whereDate('session_date', '>=', $weeks[0]['start'])
            ->whereDate('session_date', '<=', $weeks[4]['end'])
            ->get(['id', 'student_profile_id', 'session_date', 'status']);

        $attendance = [];
        foreach ($weeks as $week) {
            $inWeek = $weekSessions->filter(function ($s) use ($week) {
                $date = substr((string) $s->session_date, 0, 10);

                return $date >= $week['start'] && $date <= $week['end'];
            });
            $attendance[] = [
                'label' => $week['label'],
                'attended' => $inWeek->where('status', 'completed')->count(),
                'missed' => $inWeek->where('status', 'cancelled')->count(),
            ];
        }

        $attended = array_sum(array_column($attendance, 'attended'));
        $missed = array_sum(array_column($attendance, 'missed'));
        $rate = ($attended + $missed) > 0 ? (int) round($attended / ($attended + $missed) * 100) : null;

        $topMissed = $weekSessions->where('status', 'cancelled')
            ->groupBy('student_profile_id')
            ->map(fn ($group) => [
                'name' => $group->first()->studentProfile?->student_name,
                'count' => $group->count(),
            ])
            ->sortByDesc('count')
            ->first();

        $completed = TutoringSession::where('status', 'completed')
            ->whereDate('session_date', '>=', $rangeStart->toDateString())
            ->whereDate('session_date', '<=', $rangeEnd->toDateString())
            ->get(['subject', 'session_date']);

        $groups = $completed->groupBy(fn ($s) => strtolower(trim((string) $s->subject)));
        $top = $groups->sortByDesc(fn ($group) => $group->count())->take(4);

        $subjects = [];
        foreach ($top as $group) {
            $series = [];
            foreach ($months as $m) {
                $from = $m['start']->toDateString();
                $to = $m['end']->toDateString();
                $series[] = $group->filter(function ($s) use ($from, $to) {
                    $date = substr((string) $s->session_date, 0, 10);

                    return $date >= $from && $date <= $to;
                })->count();
            }
            $subjects[] = [
                'name' => trim((string) $group->first()->subject),
                'series' => $series,
                'total' => $group->count(),
            ];
        }

        return Inertia::render('Admin/Reports/Overview', [
            'months' => array_map(fn ($m) => ['label' => $m['label'], 'short' => $m['short']], $months),
            'revenue' => ['series' => $revenue, 'totalBooked' => $totalBooked],
            'attendance' => ['weeks' => $attendance, 'rate' => $rate, 'topMissed' => $topMissed],
            'progress' => ['subjects' => $subjects],
            'range' => [
                'from' => $months[0]['label'],
                'to' => $months[5]['label'],
                'year' => $months[5]['end']->format('Y'),
            ],
        ]);
    }
}