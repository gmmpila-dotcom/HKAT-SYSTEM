<?php

use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;

function subjectBook($test, string $subject)
{
    $parent = User::factory()->create(['role' => 'parent']);
    $student = StudentProfile::create(['parent_id' => $parent->id, 'student_name' => 'Kid', 'grade_level' => 'Grade 3']);
    $tutor = User::factory()->create(['role' => 'tutor']);
    TutorProfile::create(['user_id' => $tutor->id, 'is_verified' => true, 'specializations' => ['Math']]);

    return $test->actingAs($parent)->post(route('parent.booking.store'), [
        'student_profile_id' => $student->id, 'tutor_id' => $tutor->id, 'subject' => $subject,
        'session_type' => '1on1', 'location_type' => 'onsite',
        'session_date' => now()->addDays(2)->toDateString(), 'start_time' => '09:00', 'end_time' => '10:00',
    ]);
}

test('a tutor cannot be booked for a subject they do not teach', function () {
    subjectBook($this, 'Mandarin Chinese')->assertSessionHasErrors('tutor_id');
    expect(TutoringSession::count())->toBe(0);
});

test('a tutor can be booked for a subject they teach, ignoring capitals', function () {
    subjectBook($this, 'math')->assertSessionHasNoErrors();
    expect(TutoringSession::count())->toBe(1);
});