<?php

use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\User;

function flowPayment(User $parent, float $amount = 250): Payment
{
    $tutor = User::factory()->create(['role' => 'tutor']);
    $student = StudentProfile::create(['parent_id' => $parent->id, 'student_name' => 'Flow Kid', 'grade_level' => 'Grade 3']);
    $session = TutoringSession::create([
        'student_profile_id' => $student->id,
        'tutor_id' => $tutor->id,
        'subject' => 'Math',
        'session_type' => '1on1',
        'location_type' => 'onsite',
        'session_date' => now()->addDay()->toDateString(),
        'start_time' => '16:00',
        'end_time' => '17:00',
        'rate_applied' => $amount,
        'status' => 'pending',
    ]);

    return Payment::create(['session_id' => $session->id, 'amount' => $amount, 'status' => 'pending']);
}

test('a parent can add and change a tip on a pending payment', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $payment = flowPayment($parent);

    $this->actingAs($parent)->post(route('parent.payments.tip', $payment), ['tip' => 50])->assertSessionHasNoErrors();
    expect((float) $payment->refresh()->amount)->toBe(300.0);
    expect((float) $payment->tip_amount)->toBe(50.0);

    $this->actingAs($parent)->post(route('parent.payments.tip', $payment), ['tip' => 100])->assertSessionHasNoErrors();
    expect((float) $payment->refresh()->amount)->toBe(350.0);

    $this->actingAs($parent)->post(route('parent.payments.tip', $payment), ['tip' => 0])->assertSessionHasNoErrors();
    expect((float) $payment->refresh()->amount)->toBe(250.0);
});

test('a tip must be a sensible amount', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $payment = flowPayment($parent);

    $this->actingAs($parent)->post(route('parent.payments.tip', $payment), ['tip' => -5])->assertSessionHasErrors('tip');
    $this->actingAs($parent)->post(route('parent.payments.tip', $payment), ['tip' => 999999])->assertSessionHasErrors('tip');
});

test('saving a payment method stores only the last four digits', function () {
    $parent = User::factory()->create(['role' => 'parent']);

    $this->actingAs($parent)
        ->patch(route('parent.payment-method.update'), ['type' => 'gcash', 'number' => '0917 555 4471', 'name' => 'Maria Bautista'])
        ->assertSessionHasNoErrors();

    $parent->refresh();
    expect($parent->pay_type)->toBe('gcash');
    expect($parent->pay_last4)->toBe('4471');
    expect(json_encode($parent->getAttributes()))->not->toContain('09175554471');
});

test('a gcash number must look like a mobile number', function () {
    $parent = User::factory()->create(['role' => 'parent']);

    $this->actingAs($parent)
        ->patch(route('parent.payment-method.update'), ['type' => 'gcash', 'number' => '12345', 'name' => 'Maria'])
        ->assertSessionHasErrors('number');
});

test('demo pay needs a saved method and then marks the payment paid', function () {
    config(['services.paymongo.secret_key' => null]);
    $parent = User::factory()->create(['role' => 'parent']);
    $payment = flowPayment($parent);

    $this->actingAs($parent)->post(route('parent.payments.demo', $payment))->assertSessionHasErrors('payment');
    expect($payment->refresh()->status)->toBe('pending');

    $this->actingAs($parent)->patch(route('parent.payment-method.update'), ['type' => 'bpi', 'number' => '1234567890', 'name' => 'Maria']); $parent->refresh();
    $this->actingAs($parent)->post(route('parent.payments.demo', $payment))->assertSessionHasNoErrors();

    $payment->refresh();
    expect($payment->status)->toBe('paid');
    expect($payment->method_label)->toContain('BPI');
    expect($payment->transaction_reference)->toStartWith('TXN');
});

test('demo pay is refused when online payments are enabled', function () {
    config(['services.paymongo.secret_key' => 'sk_test_example']);
    $parent = User::factory()->create(['role' => 'parent']);
    $payment = flowPayment($parent);
    $this->actingAs($parent)->patch(route('parent.payment-method.update'), ['type' => 'gcash', 'number' => '09175554471', 'name' => 'Maria']);

    $this->actingAs($parent)->post(route('parent.payments.demo', $payment))->assertSessionHasErrors('payment');
    expect($payment->refresh()->status)->toBe('pending');
});

test('a parent cannot tip or pay another parent payment', function () {
    $owner = User::factory()->create(['role' => 'parent']);
    $other = User::factory()->create(['role' => 'parent']);
    $payment = flowPayment($owner);

    $this->actingAs($other)->post(route('parent.payments.tip', $payment), ['tip' => 50])->assertForbidden();
    $this->actingAs($other)->post(route('parent.payments.demo', $payment))->assertForbidden();
});