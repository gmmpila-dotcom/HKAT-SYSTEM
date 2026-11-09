<?php

use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;
use App\Notifications\SessionStatusNotification;

test('a booking notifies the parent and tutor', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $tutor = User::factory()->create(['role' => 'tutor']);
    $student = StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => 'Notification Student',
        'grade_level' => 'Grade 4',
    ]);

    TutorProfile::create([
        'specializations' => ['Math', 'Reading', 'English', 'Science', 'Special Teaching'],
        'user_id' => $tutor->id,
        'is_verified' => true,
    ]);

    $response = $this->actingAs($parent)->post(route('parent.booking.store'), [
        'student_profile_id' => $student->id,
        'tutor_id' => $tutor->id,
        'subject' => 'Math',
        'session_type' => '1on1',
        'location_type' => 'onsite',
        'session_date' => now()->addDay()->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
    ]);

    $response->assertRedirect();
    expect($parent->notifications()->count())->toBe(1);
    expect($tutor->notifications()->count())->toBe(1);
});

test('admin payment updates notify the parent and tutor', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $parent = User::factory()->create(['role' => 'parent']);
    $tutor = User::factory()->create(['role' => 'tutor']);
    $student = StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => 'Payment Student',
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
    $payment = Payment::create([
        'session_id' => $session->id,
        'amount' => 350,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->patch(route('admin.payments.mark-paid', $payment));

    $response->assertRedirect();
    expect($parent->notifications()->count())->toBe(1);
    expect($tutor->notifications()->count())->toBe(1);
});

test('users can only mark their own notifications as read', function () {
    $owner = User::factory()->create(['role' => 'parent']);
    $otherUser = User::factory()->create(['role' => 'parent']);
    $owner->notify(new SessionStatusNotification('Test', 'Test notification', route('parent.dashboard')));
    $notification = $owner->notifications()->firstOrFail();

    $response = $this->actingAs($otherUser)->patch(route('notifications.read', $notification));

    $response->assertForbidden();
    expect($notification->refresh()->read_at)->toBeNull();
});
