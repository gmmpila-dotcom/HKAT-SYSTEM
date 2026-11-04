<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Support\RateCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class ReceiptController extends Controller
{
    public function show(Request $request, Payment $payment): Response
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        $payment->load(['session.studentProfile', 'session.tutor:id,name']);
        $session = $payment->session;
        $student = $session?->studentProfile;

        if (! $session || ! $student || (int) $student->parent_id !== (int) $user->id) {
            abort(403);
        }

        if ($payment->status !== 'paid') {
            abort(404);
        }

        $start = substr((string) $session->start_time, 0, 5);
        $end = substr((string) $session->end_time, 0, 5);
        $kind = RateCalculator::kind((string) $session->subject);
        $band = null;
        $hourly = null;

        if ($kind === 'academic') {
            try {
                $band = RateCalculator::band((string) $student->grade_level);
                $hourly = RateCalculator::hourly((string) $student->grade_level, (string) $session->subject, (string) $session->location_type, (int) $session->tutor_id);
            } catch (InvalidArgumentException) {
                $band = null;
            }
        }

        return Inertia::render('Parent/Receipt', [
            'receipt' => [
                'invoice' => 'INV-'.$payment->created_at->format('Y').'-'.str_pad((string) $payment->id, 4, '0', STR_PAD_LEFT),
                'issued' => ($payment->paid_at ?? $payment->created_at)->toDateString(),
                'amount' => (float) $payment->amount,
                'method' => $payment->payment_method,
                'method_label' => $payment->method_label,
                'tip' => (float) $payment->tip_amount,
                'reference' => $payment->transaction_reference,
                'student' => $student->student_name,
                'grade' => $student->grade_level,
                'tutor' => $session->tutor?->name,
                'subject' => $session->subject,
                'session_type' => $session->session_type,
                'location' => $session->location_type,
                'date' => substr((string) $session->session_date, 0, 10),
                'start' => $start,
                'end' => $end,
                'hours' => RateCalculator::hours($start, $end),
                'kind' => $kind,
                'core' => RateCalculator::isCoreSubject((string) $session->subject),
                'band_min' => $band['min'] ?? null,
                'band_max' => $band['max'] ?? null,
                'hourly' => $hourly,
            ],
        ]);
    }
}