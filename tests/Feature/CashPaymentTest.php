<?php

use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\User;

function cashPayment(): Payment
{
    $parent = User::factory()->create(['role' => 'parent']);
    $tutor = User::factory()->create(['role' => 'tutor']);
    $student = StudentProfile::create(['parent_id' => $parent->id, 'student_name' => 'Cash Kid', 'grade_level' => 'Grade 3']);
    $session = TutoringSession::create([
        'student_profile_id' => $student->id, 'tutor_id' => $tutor->id, 'subject' => 'Math',
        'session_type' => '1on1', 'location_type' => 'onsite', 'session_date' => now()->addDay()->toDateString(),
        'start_time' => '09:00', 'end_time' => '10:00', 'rate_applied' => 250, 'status' => 'pending',
    ]);

    return Payment::create(['session_id' => $session->id, 'amount' => 250, 'status' => 'pending']);
}

test('an admin can record a cash payment received by the owner', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $payment = cashPayment();

    $this->actingAs($admin)->patch(route('admin.payments.cash', $payment), ['received_by' => 'owner'])->assertSessionHasNoErrors();

    $payment->refresh();
    expect($payment->status)->toBe('paid');
    expect($payment->method_label)->toBe('Cash (paid to the owner)');
    expect($payment->paid_at)->not->toBeNull();
});

test('a cash payment must say who received it', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $payment = cashPayment();

    $this->actingAs($admin)->patch(route('admin.payments.cash', $payment), ['received_by' => 'someone'])->assertSessionHasErrors('received_by');
    expect($payment->refresh()->status)->toBe('pending');
});

test('only admins can record a cash payment', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $payment = cashPayment();

    $this->actingAs($parent)->patch(route('admin.payments.cash', $payment), ['received_by' => 'owner'])->assertForbidden();
});