<?php

use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function makePendingPaymentForParent(User $parent): Payment
{
    $tutor = User::factory()->create(['role' => 'tutor']);
    TutorProfile::create(['user_id' => $tutor->id, 'is_verified' => true]);
    $student = StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => 'Billing Student',
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

test('billing exposes onlinePaymentsEnabled=false when no PayMongo secret key is configured', function () {
    config(['services.paymongo.secret_key' => null]);
    $parent = User::factory()->create(['role' => 'parent']);
    makePendingPaymentForParent($parent);

    $response = $this->actingAs($parent)->get(route('parent.billing.index'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Parent/Billing/Index')
        ->where('onlinePaymentsEnabled', false));
});

test('billing exposes onlinePaymentsEnabled=true when a PayMongo secret key is configured', function () {
    config(['services.paymongo.secret_key' => 'sk_test_example']);
    $parent = User::factory()->create(['role' => 'parent']);
    makePendingPaymentForParent($parent);

    $response = $this->actingAs($parent)->get(route('parent.billing.index'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Parent/Billing/Index')
        ->where('onlinePaymentsEnabled', true));
});