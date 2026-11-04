<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Notifications\SessionStatusNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CashPaymentController extends Controller
{
    public function store(Request $request, Payment $payment): RedirectResponse
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $validated = $request->validate(['received_by' => ['required', 'in:owner,tutor']]);

        if ($payment->status !== 'pending') {
            throw ValidationException::withMessages(['payment' => 'This payment is no longer pending.']);
        }

        DB::table('payments')->where('id', $payment->id)->update([
            'status' => 'paid',
            'paid_at' => now(),
            'method_label' => 'Cash (paid to the '.$validated['received_by'].')',
            'transaction_reference' => 'CASH'.now()->format('Ymd').str_pad((string) $payment->id, 4, '0', STR_PAD_LEFT),
            'updated_at' => now(),
        ]);

        $payment->load('session.studentProfile.parent');
        $payment->session?->studentProfile?->parent?->notify(new SessionStatusNotification(
            'Cash payment recorded',
            'The studio recorded your cash payment received by the '.$validated['received_by'].'.',
            route('parent.billing.index'),
        ));

        return back()->with('status', 'cash-recorded');
    }
}