<?php

use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\User;

function cashReqPayment(User $parent): Payment
{
    $tutor = User::factory()->create(['role' => 'tutor']);
    $student = StudentProfile::create(['parent_id' => $parent->id, 'student_name' => 'Cash Kid', 'grade_level' => 'Grade 3']);
    $session = TutoringSession::create([
        'student_profile_id' => $student->id, 'tutor_id' => $tutor->id, 'subject' => 'Math',
        'session_type' => '1on1', 'location_type' => 'onsite', 'session_date' => now()->addDay()->toDateString(),
        'start_time' => '16:00', 'end_time' => '17:00', 'rate_applied' => 250, 'status' => 'pending',
    ]);

    return Payment::create(['session_id' => $session->id, 'amount' => 250, 'status' => 'pending']);
}

test('cash can be saved as a payment method without a number', function () {
    $parent = User::factory()->create(['role' => 'parent']);

    $this->actingAs($parent)->patch(route('parent.payment-method.update'), ['type' => 'cash'])->assertSessionHasNoErrors();

    expect($parent->refresh()->pay_type)->toBe('cash');
    expect($parent->pay_last4)->toBeNull();
});

test('requesting cash keeps the payment pending and notifies the admin', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $parent = User::factory()->create(['role' => 'parent']);
    $payment = cashReqPayment($parent);

    $this->actingAs($parent)->post(route('parent.payments.cash-request', $payment))->assertSessionHasNoErrors();

    $payment->refresh();
    expect($payment->status)->toBe('pending');
    expect($payment->method_label)->toBe('Cash (waiting for admin)');
    expect($admin->refresh()->notifications()->count())->toBe(1);
});

test('demo pay is refused when the saved method is cash', function () {
    config(['services.paymongo.secret_key' => null]);
    $parent = User::factory()->create(['role' => 'parent']);
    $payment = cashReqPayment($parent);
    $this->actingAs($parent)->patch(route('parent.payment-method.update'), ['type' => 'cash']);

    $this->actingAs($parent->refresh())->post(route('parent.payments.demo', $payment))->assertSessionHasErrors('payment');
    expect($payment->refresh()->status)->toBe('pending');
});

test('a parent cannot request cash for another parent payment', function () {
    $owner = User::factory()->create(['role' => 'parent']);
    $other = User::factory()->create(['role' => 'parent']);
    $payment = cashReqPayment($owner);

    $this->actingAs($other)->post(route('parent.payments.cash-request', $payment))->assertForbidden();
});