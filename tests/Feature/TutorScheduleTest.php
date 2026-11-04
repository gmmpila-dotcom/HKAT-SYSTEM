<?php

use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;

function seedTutorScheduleSession(User $tutor, StudentProfile $student): TutoringSession
{
    return TutoringSession::create([
        'student_profile_id' => $student->id,
        'tutor_id' => $tutor->id,
        'subject' => 'Math',
        'session_type' => '1on1',
        'location_type' => 'onsite',
        'session_date' => now()->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
        'rate_applied' => 250,
        'status' => 'pending',
    ]);
}

test('a tutor sees only their own sessions on the schedule', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $student = StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => 'Schedule Student',
        'grade_level' => 'Grade 3',
    ]);
    $tutor = User::factory()->create(['role' => 'tutor']);
    $other = User::factory()->create(['role' => 'tutor']);
    TutorProfile::create(['user_id' => $tutor->id, 'is_verified' => true]);
    TutorProfile::create(['user_id' => $other->id, 'is_verified' => true]);
    seedTutorScheduleSession($tutor, $student);
    seedTutorScheduleSession($other, $student);

    $this->actingAs($tutor)
        ->get(route('tutor.schedule.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Tutor/Schedule/Index')
            ->has('sessions', 1)
            ->where('summary.count', 1)
            ->where('summary.hours', fn ($value) => (float) $value === 1.0));
});

test('only tutors can open the tutor schedule', function () {
    $parent = User::factory()->create(['role' => 'parent']);

    $this->actingAs($parent)->get(route('tutor.schedule.index'))->assertForbidden();
});