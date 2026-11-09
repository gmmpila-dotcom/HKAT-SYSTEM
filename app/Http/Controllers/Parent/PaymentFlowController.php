<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use App\Notifications\SessionStatusNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentFlowController extends Controller
{
    public function tip(Request $request, Payment $payment): RedirectResponse
    {
        $this->ownPending($request, $payment);

        $validated = $request->validate(['tip' => ['required', 'numeric', 'min:0', 'max:5000']]);

        $oldTip = (float) $payment->tip_amount;
        $base = (float) $payment->amount - $oldTip;
        $tip = round((float) $validated['tip'], 2);

        DB::table('payments')->where('id', $payment->id)->update([
            'tip_amount' => $tip,
            'amount' => $base + $tip,
            'updated_at' => now(),
        ]);

        return back()->with('status', $tip > 0 ? 'Tip added to your payment.' : 'Tip removed.');
    }

    public function demoPay(Request $request, Payment $payment): RedirectResponse
    {
        $user = $this->ownPending($request, $payment);

        if (! empty(config('services.paymongo.secret_key'))) {
            throw ValidationException::withMessages([
                'payment' => 'Online payments are enabled. Use the secure checkout instead.',
            ]);
        }

        if ($user->pay_type === 'cash') {
            throw ValidationException::withMessages([
                'payment' => 'Cash payments are confirmed by the admin once the cash is received. Use Request cash payment.',
            ]);
        }

        if (! $user->pay_type || ! $user->pay_last4) {
            throw ValidationException::withMessages(['payment' => 'Save a payment method first.']);
        }

        $label = ($user->pay_type === 'bpi' ? 'BPI Bank Transfer' : 'GCash').' '."\u{2022}\u{2022}\u{2022}\u{2022} ".$user->pay_last4;

        DB::table('payments')->where('id', $payment->id)->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payment_method' => $user->pay_type === 'bpi' ? 'card' : 'gcash',
            'method_label' => $label,
            'transaction_reference' => 'TXN'.now()->format('Ymd').str_pad((string) $payment->id, 4, '0', STR_PAD_LEFT),
            'updated_at' => now(),
        ]);

        return back()->with('paidPayment', $payment->id);
    }

    public function cashRequest(Request $request, Payment $payment): RedirectResponse
    {
        $user = $this->ownPending($request, $payment);

        DB::table('payments')->where('id', $payment->id)->update([
            'method_label' => 'Cash (waiting for admin)',
            'updated_at' => now(),
        ]);

        foreach (User::where('role', 'admin')->get() as $admin) {
            $admin->notify(new SessionStatusNotification(
                'Cash payment requested',
                $user->name.' will pay PHP '.number_format((float) $payment->amount, 2).' in cash. Mark it received once you have it.',
                route('admin.payments.index'),
            ));
        }

        return back()->with('status', 'Cash payment requested. The admin will confirm once the cash is received.');
    }

    public function method(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        $validated = $request->validate([
            'type' => ['required', 'in:gcash,bpi,cash'],
            'number' => ['required_unless:type,cash', 'nullable', 'string', 'max:30'],
            'name' => ['required_unless:type,cash', 'nullable', 'string', 'max:100'],
        ]);

        if ($validated['type'] === 'cash') {
            DB::table('users')->where('id', $user->id)->update([
                'pay_type' => 'cash',
                'pay_last4' => null,
                'pay_name' => $validated['name'] ?? $user->name,
            ]);

            return back()->with('status', 'Payment method updated.');
        }

        $digits = preg_replace('/\D+/', '', (string) $validated['number']);

        if ($validated['type'] === 'gcash' && ! preg_match('/^09\d{9}$/', $digits)) {
            throw ValidationException::withMessages(['number' => 'Enter an 11-digit GCash number starting with 09.']);
        }

        if ($validated['type'] === 'bpi' && (strlen($digits) < 8 || strlen($digits) > 16)) {
            throw ValidationException::withMessages(['number' => 'Enter your BPI account number (8 to 16 digits).']);
        }

        DB::table('users')->where('id', $user->id)->update([
            'pay_type' => $validated['type'],
            'pay_last4' => substr($digits, -4),
            'pay_name' => $validated['name'],
        ]);

        return back()->with('status', 'Payment method updated.');
    }

    private function ownPending(Request $request, Payment $payment)
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        $payment->load('session.studentProfile');

        if ((int) $payment->session?->studentProfile?->parent_id !== (int) $user->id) {
            abort(403);
        }

        if ($payment->status !== 'pending') {
            throw ValidationException::withMessages(['payment' => 'This payment is no longer awaiting payment.']);
        }

        return $user;
    }
}