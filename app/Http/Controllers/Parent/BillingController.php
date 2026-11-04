<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Support\RateCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class BillingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        $payments = Payment::whereHas('session.studentProfile', function ($query) use ($user) {
            $query->where('parent_id', $user->id);
        })
            ->with(['session' => function ($query) {
                $query->with(['studentProfile:id,student_name,grade_level', 'tutor:id,name']);
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        $totalDue = $payments->where('status', 'pending')->sum('amount');
        $totalPaid = $payments->where('status', 'paid')->sum('amount');

        $rows = $payments->map(function (Payment $payment): array {
            $row = $payment->toArray();
            $row['breakdown'] = $this->breakdown($payment);

            return $row;
        })->values();

        return Inertia::render('Parent/Billing/Index', [
            'payments' => $rows,
            'totalDue' => $totalDue,
            'totalPaid' => $totalPaid,
            'onlinePaymentsEnabled' => ! empty(config('services.paymongo.secret_key')),
            'flashStatus' => session('status'),
            'flashPaid' => session('paidPayment'),
            'paymentMethod' => $user->pay_type ? ['type' => $user->pay_type, 'last4' => $user->pay_last4, 'name' => $user->pay_name] : null,
        ]);
    }

    private function breakdown(Payment $payment): ?array
    {
        $session = $payment->session;
        $student = $session?->studentProfile;

        if (! $session || ! $student) {
            return null;
        }

        $kind = RateCalculator::kind($session->subject);

        try {
            $band = RateCalculator::band($student->grade_level);
            $hourly = $kind === 'special'
                ? null
                : RateCalculator::hourly($student->grade_level, $session->subject, $session->location_type, (int) $session->tutor_id);
        } catch (InvalidArgumentException) {
            return null;
        }

        return [
            'kind' => $kind,
            'band' => 'Grade '.$band['min'].' - '.$band['max'],
            'core' => RateCalculator::isCoreSubject($session->subject),
            'hourly' => $hourly,
            'hours' => RateCalculator::hours((string) $session->start_time, (string) $session->end_time),
            'location' => $session->location_type,
        ];
    }
}