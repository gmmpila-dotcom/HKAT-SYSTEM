<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PayMongoCheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PaymentController extends Controller
{
    public function checkout(Request $request, Payment $payment, PayMongoCheckoutService $checkout): RedirectResponse
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        $payment->load('session.studentProfile');

        if ($payment->session?->studentProfile?->parent_id !== $user->id) {
            abort(403);
        }

        if ($payment->status !== 'pending') {
            throw ValidationException::withMessages([
                'payment' => 'This payment is no longer awaiting payment.',
            ]);
        }

        try {
            $result = $checkout->create(
                $payment,
                route('parent.payments.success', $payment),
                route('parent.payments.cancel', $payment),
            );
        } catch (\RuntimeException $exception) {
            throw ValidationException::withMessages([
                'payment' => 'Online payments are not configured yet. Please contact the administrator.',
            ]);
        }

        $payment->update(['transaction_reference' => $result['id']]);

        return redirect()->away($result['checkout_url']);
    }

    public function success(Payment $payment): RedirectResponse
    {
        return redirect()->route('parent.billing.index')->with(
            'status',
            'Payment submitted. We are waiting for PayMongo confirmation.',
        );
    }

    public function cancel(Payment $payment): RedirectResponse
    {
        return redirect()->route('parent.billing.index')->with(
            'status',
            'Payment was cancelled. Your payment remains pending.',
        );
    }
}
