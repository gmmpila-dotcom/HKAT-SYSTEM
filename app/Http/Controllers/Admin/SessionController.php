<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\TutoringSession;
use App\Notifications\SessionStatusNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SessionController extends Controller
{
    public function index(): Response
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        $sessions = TutoringSession::with(['studentProfile', 'tutor:id,name', 'payment'])
            ->orderBy('session_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get();

        return Inertia::render('Admin/Sessions/Index', [
            'sessions' => $sessions,
            'flashStatus' => session('status'),
        ]);
    }

    public function markAsPaid(Payment $payment): RedirectResponse
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        $payment->load('session.studentProfile.parent', 'session.tutor');
        $payment->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $this->notifyParticipants(
            $payment->session,
            'Payment marked as paid',
            'Your session payment has been marked as paid. It is ready for confirmation.',
            route('parent.billing.index'),
            route('tutor.dashboard'),
        );

        return redirect()->back()->with('status', 'payment-marked-paid');
    }

    public function confirm(TutoringSession $session): RedirectResponse
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        $session->loadMissing('payment');

        if ($session->payment?->status !== 'paid') {
            throw ValidationException::withMessages([
                'session' => 'A session can only be confirmed after its payment is marked as paid.',
            ]);
        }

        $session->update(['status' => 'confirmed']);

        $this->notifyParticipants(
            $session,
            'Session confirmed',
            'Your tutoring session has been confirmed.',
            route('parent.dashboard'),
            route('tutor.dashboard'),
        );

        return redirect()->back()->with('status', 'session-confirmed');
    }

    public function complete(TutoringSession $session): RedirectResponse
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        if ($session->status !== 'confirmed') {
            throw ValidationException::withMessages([
                'session' => 'Only confirmed sessions can be marked as completed.',
            ]);
        }

        $session->update(['status' => 'completed']);

        $this->notifyParticipants(
            $session,
            'Session completed',
            'Your tutoring session has been marked as completed.',
            route('parent.progress.index'),
            route('tutor.dashboard'),
        );

        return redirect()->back()->with('status', 'session-completed');
    }

    public function cancel(TutoringSession $session): RedirectResponse
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        if (in_array($session->status, ['completed', 'cancelled'], true)) {
            throw ValidationException::withMessages([
                'session' => 'This session can no longer be cancelled.',
            ]);
        }

        $session->update(['status' => 'cancelled']);

        $this->notifyParticipants(
            $session,
            'Session cancelled',
            'Your tutoring session has been cancelled by an administrator.',
            route('parent.dashboard'),
            route('tutor.dashboard'),
        );

        return redirect()->back()->with('status', 'session-cancelled');
    }

    private function notifyParticipants(
        TutoringSession $session,
        string $title,
        string $message,
        string $parentUrl,
        string $tutorUrl,
    ): void {
        $session->loadMissing('studentProfile.parent', 'tutor');

        $session->studentProfile?->parent?->notify(new SessionStatusNotification($title, $message, $parentUrl));
        $session->tutor?->notify(new SessionStatusNotification($title, $message, $tutorUrl));
    }
}
