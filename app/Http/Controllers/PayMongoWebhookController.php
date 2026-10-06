<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayMongoWebhookController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $signature = $request->header('Paymongo-Signature');
        $secret = config('services.paymongo.webhook_secret');
        $rawBody = $request->getContent();

        if (! $secret || ! $signature || ! hash_equals(hash_hmac('sha256', $rawBody, $secret), $signature)) {
            abort(401);
        }

        $event = $request->json()->all();
        $eventType = data_get($event, 'data.type');
        $checkoutId = data_get($event, 'data.data.id');

        if (! $checkoutId) {
            return response()->json(['received' => true]);
        }

        $payment = Payment::where('transaction_reference', $checkoutId)->first();

        if (! $payment) {
            return response()->json(['received' => true]);
        }

        if ($eventType === 'checkout_session.payment.paid') {
            $paymentMethod = data_get($event, 'data.data.attributes.payment_method_types.0');
            $paymentMethod = $paymentMethod === 'paymaya' ? 'maya' : $paymentMethod;

            $payment->update([
                'status' => 'paid',
                'paid_at' => now(),
                'payment_method' => in_array($paymentMethod, ['gcash', 'maya', 'card'], true)
                    ? $paymentMethod
                    : null,
            ]);
        } elseif ($eventType === 'checkout_session.payment.failed') {
            $payment->update(['status' => 'failed']);
        }

        return response()->json(['received' => true]);
    }
}
