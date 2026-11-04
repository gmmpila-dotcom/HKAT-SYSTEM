<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Support\RateCalculator;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class PaymentController extends Controller
{
    private const CATEGORIES = ['academic', 'special', 'arts', 'home'];

    public function index(Request $request): Response
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $payments = Payment::with([
            'session.studentProfile:id,student_name,grade_level',
            'session.tutor:id,name',
        ])->latest()->get();

        $now = now();
        $paid = $payments->where('status', 'paid');
        $recent = $paid->filter(fn (Payment $p) => $p->paid_at && $p->paid_at->greaterThanOrEqualTo($now->copy()->subDays(30)));

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments->map(fn (Payment $p) => $this->row($p))->values(),
            'charts' => [
                'week' => $this->buckets($paid, 5, 'week', $now),
                'month' => $this->buckets($paid, 6, 'month', $now),
            ],
            'totals' => [
                'collected' => (float) $recent->sum('amount'),
                'pending' => (float) $payments->where('status', 'pending')->sum('amount'),
            ],
            'rates' => config('rates'),
            'tutors' => \App\Models\User::where('role', 'tutor')->orderBy('name')->get(['id', 'name']),
            'tutorRates' => \Illuminate\Support\Facades\DB::table('tutor_rate_cards')->get()->mapWithKeys(fn ($r) => [$r->user_id => json_decode($r->rates, true)]),
        ]);
    }

    private function category(Payment $payment): string
    {
        $session = $payment->session;

        if (! $session) {
            return 'academic';
        }

        if ($session->location_type === 'home') {
            return 'home';
        }

        return RateCalculator::kind((string) $session->subject);
    }

    private function row(Payment $payment): array
    {
        $session = $payment->session;
        $student = $session?->studentProfile;
        $category = $this->category($payment);
        $rate = null;

        if ($session && $student && in_array($category, ['academic', 'home'], true)) {
            try {
                $rate = RateCalculator::hourly($student->grade_level, (string) $session->subject, (string) $session->location_type, (int) $session->tutor_id);
            } catch (InvalidArgumentException) {
                $rate = null;
            }
        }

        $start = $session ? substr((string) $session->start_time, 0, 5) : null;
        $end = $session ? substr((string) $session->end_time, 0, 5) : null;

        return [
            'id' => $payment->id,
            'invoice' => 'INV-'.$payment->created_at->format('Y').'-'.str_pad((string) $payment->id, 4, '0', STR_PAD_LEFT),
            'amount' => (float) $payment->amount,
            'status' => $payment->status,
            'category' => $category,
            'date' => ($payment->paid_at ?? $payment->created_at)->toDateString(),
            'student' => $student?->student_name,
            'grade' => $student?->grade_level,
            'tutor' => $session?->tutor?->name,
            'subject' => $session?->subject,
            'session_type' => $session?->session_type,
            'location' => $session?->location_type,
            'session_date' => $session ? substr((string) $session->session_date, 0, 10) : null,
            'start_time' => $start,
            'end_time' => $end,
            'hours' => $session ? RateCalculator::hours($start, $end) : 0,
            'rate' => $rate,
        ];
    }

    private function buckets($paid, int $count, string $unit, Carbon $now): array
    {
        $labels = [];
        $series = array_fill_keys(self::CATEGORIES, []);

        for ($i = $count - 1; $i >= 0; $i--) {
            if ($unit === 'week') {
                $start = $now->copy()->startOfWeek(Carbon::SUNDAY)->subWeeks($i);
                $end = $start->copy()->endOfWeek(Carbon::SATURDAY);
                $labels[] = $start->format('M j');
            } else {
                $start = $now->copy()->startOfMonth()->subMonthsNoOverflow($i);
                $end = $start->copy()->endOfMonth();
                $labels[] = $start->format('M');
            }

            $inRange = $paid->filter(fn (Payment $p) => $p->paid_at && $p->paid_at->between($start, $end));

            foreach (self::CATEGORIES as $category) {
                $series[$category][] = (float) $inRange
                    ->filter(fn (Payment $p) => $this->category($p) === $category)
                    ->sum('amount');
            }
        }

        return ['labels' => $labels, 'series' => $series];
    }
}