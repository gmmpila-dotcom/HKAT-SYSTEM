<?php

use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;

function createBookableTutor(): User
{
    $tutor = User::factory()->create(['role' => 'tutor']);

    TutorProfile::create([
        'user_id' => $tutor->id,
        'is_verified' => true,
    ]);

    return $tutor;
}

function createStudentForParent(User $parent): StudentProfile
{
    return StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => 'Test Student',
        'grade_level' => 'Grade 4',
    ]);
}

function validBookingData(StudentProfile $student, User $tutor): array
{
    return [
        'student_profile_id' => $student->id,
        'tutor_id' => $tutor->id,
        'subject' => 'Math',
        'session_type' => '1on1',
        'location_type' => 'onsite',
        'session_date' => now()->addDay()->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
        'rate_applied' => 1,
    ];
}

test('a parent booking recalculates and persists the server-side rate', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $student = createStudentForParent($parent);
    $tutor = createBookableTutor();

    $response = $this->actingAs($parent)->post(
        route('parent.booking.store'),
        validBookingData($student, $tutor),
    );

    $response->assertSessionHasNoErrors()->assertRedirect(route('parent.dashboard', absolute: false));
    $session = TutoringSession::firstOrFail();

    expect((float) $session->rate_applied)->toBe(350.0);
    expect((float) $session->payment->amount)->toBe(350.0);
    expect($session->payment->status)->toBe('pending');
});

test('parents cannot book unverified tutors', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $student = createStudentForParent($parent);
    $tutor = User::factory()->create(['role' => 'tutor']);

    TutorProfile::create([
        'user_id' => $tutor->id,
        'is_verified' => false,
    ]);

    $response = $this->actingAs($parent)->post(
        route('parent.booking.store'),
        validBookingData($student, $tutor),
    );

    $response->assertSessionHasErrors([
        'tutor_id' => 'The selected tutor is not available for booking.',
    ]);
    expect(TutoringSession::count())->toBe(0);
    expect(Payment::count())->toBe(0);
});

test('parents cannot book a user who is not a tutor', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $student = createStudentForParent($parent);
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($parent)->post(
        route('parent.booking.store'),
        validBookingData($student, $admin),
    );

    $response->assertSessionHasErrors([
        'tutor_id' => 'The selected tutor is not available for booking.',
    ]);
    expect(TutoringSession::count())->toBe(0);
    expect(Payment::count())->toBe(0);
});

test('parents cannot book another parent\'s student', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $otherParent = User::factory()->create(['role' => 'parent']);
    $student = createStudentForParent($otherParent);
    $tutor = createBookableTutor();

    $response = $this->actingAs($parent)->post(
        route('parent.booking.store'),
        validBookingData($student, $tutor),
    );

    $response->assertForbidden();
    expect(TutoringSession::count())->toBe(0);
    expect(Payment::count())->toBe(0);
});

test('booking rejects dates before today and end times before start times', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $student = createStudentForParent($parent);
    $tutor = createBookableTutor();
    $booking = validBookingData($student, $tutor);
    $booking['session_date'] = now()->subDay()->toDateString();
    $booking['start_time'] = '10:00';
    $booking['end_time'] = '09:00';

    $response = $this->actingAs($parent)->post(route('parent.booking.store'), $booking);

    $response->assertSessionHasErrors(['session_date', 'end_time']);
    expect(TutoringSession::count())->toBe(0);
});
