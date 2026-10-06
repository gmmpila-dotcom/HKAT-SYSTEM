<?php

use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\User;
use Illuminate\Support\Facades\Http;

function createPayMongoPayment(User $parent): Payment
{
    $tutor = User::factory()->create(['role' => 'tutor']);
    $student = StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => 'PayMongo Student',
        'grade_level' => 'Grade 4',
    ]);
    $session = TutoringSession::create([
        'student_profile_id' => $student->id,
        'tutor_id' => $tutor->id,
        'subject' => 'Math',
        'session_type' => '1on1',
        'location_type' => 'onsite',
        'session_date' => now()->addDay()->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
        'rate_applied' => 350,
        'status' => 'pending',
    ]);

    return Payment::create([
        'session_id' => $session->id,
        'amount' => 350,
        'status' => 'pending',
    ]);
}

test('parent checkout creates a PayMongo hosted checkout and stores its reference', function () {
    config([
        'services.paymongo.secret_key' => 'sk_test_example',
        'services.paymongo.base_url' => 'https://api.paymongo.com',
        'services.paymongo.payment_method_types' => ['card', 'gcash'],
    ]);
    Http::fake([
        'https://api.paymongo.com/v2/checkout_sessions' => Http::response([
            'data' => [
                'id' => 'cs_test_123',
                'attributes' => ['checkout_url' => 'https://checkout.paymongo.com/test'],
            ],
        ], 200),
    ]);
    $parent = User::factory()->create(['role' => 'parent']);
    $payment = createPayMongoPayment($parent);

    $response = $this->actingAs($parent)->post(route('parent.payments.checkout', $payment));

    $response->assertRedirect('https://checkout.paymongo.com/test');
    expect($payment->refresh()->transaction_reference)->toBe('cs_test_123');
    Http::assertSent(fn ($request) => $request->hasHeader('Idempotency-Key', 'smarttutor-payment-'.$payment->id));
});

test('paymongo webhook marks the matching payment as paid', function () {
    $secret = 'webhook_test_secret';
    config(['services.paymongo.webhook_secret' => $secret]);
    $parent = User::factory()->create(['role' => 'parent']);
    $payment = createPayMongoPayment($parent);
    $payment->update(['transaction_reference' => 'cs_test_paid']);
    $payload = [
        'data' => [
            'type' => 'checkout_session.payment.paid',
            'data' => [
                'id' => 'cs_test_paid',
                'attributes' => ['payment_method_types' => ['gcash']],
            ],
        ],
    ];
    $rawBody = json_encode($payload);

    $response = $this->call('POST', route('webhooks.paymongo'), [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_PAYMONGO_SIGNATURE' => hash_hmac('sha256', $rawBody, $secret),
    ], $rawBody);

    $response->assertOk();
    expect($payment->refresh()->status)->toBe('paid');
    expect($payment->paid_at)->not->toBeNull();
    expect($payment->payment_method)->toBe('gcash');
});

test('a parent cannot start checkout for another parent payment', function () {
    config(['services.paymongo.secret_key' => 'sk_test_example']);
    $parent = User::factory()->create(['role' => 'parent']);
    $otherParent = User::factory()->create(['role' => 'parent']);
    $payment = createPayMongoPayment($otherParent);

    $response = $this->actingAs($parent)->post(route('parent.payments.checkout', $payment));

    $response->assertForbidden();
    Http::assertNothingSent();
});
