<?php

use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\User;

function createSessionForWorkflow(string $paymentStatus = 'pending'): TutoringSession
{
    $parent = User::factory()->create(['role' => 'parent']);
    $tutor = User::factory()->create(['role' => 'tutor']);
    $student = StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => 'Test Student',
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

    Payment::create([
        'session_id' => $session->id,
        'amount' => 350,
        'status' => $paymentStatus,
        'paid_at' => $paymentStatus === 'paid' ? now() : null,
    ]);

    return $session;
}

test('an admin can confirm a session after its payment is paid', function () {
    $session = createSessionForWorkflow('paid');
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->patch(route('admin.sessions.confirm', $session));

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();
    expect($session->refresh()->status)->toBe('confirmed');
});

test('an admin cannot confirm a session before its payment is paid', function () {
    $session = createSessionForWorkflow();
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->patch(route('admin.sessions.confirm', $session));

    $response->assertRedirect();
    $response->assertSessionHasErrors([
        'session' => 'A session can only be confirmed after its payment is marked as paid.',
    ]);
    expect($session->refresh()->status)->toBe('pending');
});

test('non-admin users cannot confirm sessions', function () {
    $session = createSessionForWorkflow('paid');
    $parent = User::where('role', 'parent')->firstOrFail();

    $response = $this->actingAs($parent)->patch(route('admin.sessions.confirm', $session));

    $response->assertForbidden();
    expect($session->refresh()->status)->toBe('pending');
});

test('non-admin users cannot mark payments as paid', function () {
    $session = createSessionForWorkflow();
    $parent = User::where('role', 'parent')->firstOrFail();

    $response = $this->actingAs($parent)->patch(
        route('admin.payments.mark-paid', $session->payment),
    );

    $response->assertForbidden();
    expect($session->payment->refresh()->status)->toBe('pending');
    expect($session->payment->paid_at)->toBeNull();
});

test('an admin can mark a payment as paid', function () {
    $session = createSessionForWorkflow();
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->patch(
        route('admin.payments.mark-paid', $session->payment),
    );

    $response->assertRedirect();
    expect($session->payment->refresh()->status)->toBe('paid');
    expect($session->payment->paid_at)->not->toBeNull();
});

test('an admin can complete a confirmed session', function () {
    $session = createSessionForWorkflow('paid');
    $session->update(['status' => 'confirmed']);
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->patch(route('admin.sessions.complete', $session));

    $response->assertRedirect();
    expect($session->refresh()->status)->toBe('completed');
});

test('an admin cannot complete a session before it is confirmed', function () {
    $session = createSessionForWorkflow('paid');
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->patch(route('admin.sessions.complete', $session));

    $response->assertRedirect();
    $response->assertSessionHasErrors([
        'session' => 'Only confirmed sessions can be marked as completed.',
    ]);
    expect($session->refresh()->status)->toBe('pending');
});

test('an admin can cancel a pending session', function () {
    $session = createSessionForWorkflow();
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->patch(route('admin.sessions.cancel', $session));

    $response->assertRedirect();
    expect($session->refresh()->status)->toBe('cancelled');
});

test('an admin cannot cancel a completed session', function () {
    $session = createSessionForWorkflow('paid');
    $session->update(['status' => 'confirmed']);
    $session->update(['status' => 'completed']);
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->patch(route('admin.sessions.cancel', $session));

    $response->assertRedirect();
    $response->assertSessionHasErrors([
        'session' => 'This session can no longer be cancelled.',
    ]);
    expect($session->refresh()->status)->toBe('completed');
});
