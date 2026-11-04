<?php

use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\User;

function receiptPayment(User $parent, string $status): Payment
{
    $tutor = User::factory()->create(['role' => 'tutor']);
    $student = StudentProfile::create(['parent_id' => $parent->id, 'student_name' => 'Receipt Kid', 'grade_level' => 'Grade 3']);
    $session = TutoringSession::create([
        'student_profile_id' => $student->id,
        'tutor_id' => $tutor->id,
        'subject' => 'Math',
        'session_type' => '1on1',
        'location_type' => 'onsite',
        'session_date' => now()->toDateString(),
        'start_time' => '16:00',
        'end_time' => '17:00',
        'rate_applied' => 250,
        'status' => 'pending',
    ]);

    return Payment::create([
        'session_id' => $session->id,
        'amount' => 250,
        'status' => $status,
        'paid_at' => $status === 'paid' ? now() : null,
    ]);
}

test('a parent can view the receipt of their paid payment', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $payment = receiptPayment($parent, 'paid');

    $this->actingAs($parent)
        ->get(route('parent.receipts.show', $payment))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Parent/Receipt')
            ->where('receipt.amount', fn ($v) => (float) $v === 250.0)
            ->where('receipt.hourly', fn ($v) => (float) $v === 250.0));
});

test('a receipt is not available for an unpaid payment', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $payment = receiptPayment($parent, 'pending');

    $this->actingAs($parent)->get(route('parent.receipts.show', $payment))->assertNotFound();
});

test('a parent cannot view another parent receipt', function () {
    $owner = User::factory()->create(['role' => 'parent']);
    $other = User::factory()->create(['role' => 'parent']);
    $payment = receiptPayment($owner, 'paid');

    $this->actingAs($other)->get(route('parent.receipts.show', $payment))->assertForbidden();
});