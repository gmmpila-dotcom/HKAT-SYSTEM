<?php

use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function createReportSession(User $parent, User $tutor, string $status, string $paymentStatus, float $amount): TutoringSession
{
    $student = StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => fake()->name(),
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
        'rate_applied' => $amount,
        'status' => 'pending',
    ]);

    Payment::create([
        'session_id' => $session->id,
        'amount' => $amount,
        'status' => $paymentStatus,
        'paid_at' => $paymentStatus === 'paid' ? now() : null,
    ]);

    if ($status !== 'pending') {
        $session->update(['status' => $status]);
    }

    return $session;
}

test('admin reports aggregate session and payment data', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $parent = User::factory()->create(['role' => 'parent']);
    $tutor = User::factory()->create(['role' => 'tutor']);
    createReportSession($parent, $tutor, 'pending', 'pending', 350);
    createReportSession($parent, $tutor, 'confirmed', 'paid', 500);

    $response = $this->actingAs($admin)->get(route('admin.reports.index'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Reports/Index')
        ->where('totalSessions', 2)
        ->where('confirmedSessions', 1)
        ->where('pendingRevenue', fn ($value) => (float) $value === 350.0)
        ->where('paidRevenue', fn ($value) => (float) $value === 500.0));
});

test('non-admin users cannot access admin reports', function () {
    $parent = User::factory()->create(['role' => 'parent']);

    $response = $this->actingAs($parent)->get(route('admin.reports.index'));

    $response->assertForbidden();
});
