<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class PayMongoCheckoutService
{
    /**
     * @return array{id: string, checkout_url: string}
     */
    public function create(Payment $payment, string $successUrl, string $cancelUrl): array
    {
        $secretKey = config('services.paymongo.secret_key');

        if (! $secretKey) {
            throw new RuntimeException('PayMongo is not configured.');
        }

        $payment->loadMissing('session');

        $response = Http::acceptJson()
            ->withBasicAuth($secretKey, '')
            ->withHeaders([
                'Idempotency-Key' => 'smarttutor-payment-'.$payment->id,
            ])
            ->post(config('services.paymongo.base_url').'/v2/checkout_sessions', [
                'data' => [
                    'attributes' => [
                        'line_items' => [[
                            'name' => 'Tutoring session: '.$payment->session->subject,
                            'amount' => (int) round((float) $payment->amount * 100),
                            'currency' => 'PHP',
                            'quantity' => 1,
                        ]],
                        'payment_method_types' => config('services.paymongo.payment_method_types'),
                        'success_url' => $successUrl,
                        'cancel_url' => $cancelUrl,
                        'reference_number' => 'SMARTTUTOR-PAYMENT-'.$payment->id,
                        'description' => 'Happy Kid Arts and Tutorials tutoring session',
                    ],
                ],
            ]);

        if ($response->failed()) {
            throw new RuntimeException('PayMongo checkout could not be created.');
        }

        $checkout = $response->json('data');
        $checkoutUrl = $checkout['attributes']['checkout_url'] ?? null;

        if (! $checkoutUrl || ! isset($checkout['id'])) {
            throw new RuntimeException('PayMongo returned an invalid checkout response.');
        }

        return [
            'id' => $checkout['id'],
            'checkout_url' => $checkoutUrl,
        ];
    }
}
