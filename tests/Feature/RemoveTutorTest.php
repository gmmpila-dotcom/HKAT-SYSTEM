<?php

use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;

function removableTutor(): TutorProfile
{
    $user = User::factory()->create(['role' => 'tutor']);

    return TutorProfile::create(['user_id' => $user->id, 'is_verified' => true]);
}

test('an admin can remove a tutor who has no sessions', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $profile = removableTutor();
    $userId = $profile->user_id;

    $this->actingAs($admin)->delete(route('admin.tutors.destroy', $profile))->assertSessionHasNoErrors();

    expect(TutorProfile::find($profile->id))->toBeNull();
    expect(User::find($userId))->toBeNull();
});

test('a tutor with sessions on record cannot be removed', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $profile = removableTutor();
    $parent = User::factory()->create(['role' => 'parent']);
    $student = StudentProfile::create(['parent_id' => $parent->id, 'student_name' => 'Kid', 'grade_level' => 'Grade 3']);
    TutoringSession::create([
        'student_profile_id' => $student->id, 'tutor_id' => $profile->user_id, 'subject' => 'Math',
        'session_type' => '1on1', 'location_type' => 'onsite', 'session_date' => now()->toDateString(),
        'start_time' => '09:00', 'end_time' => '10:00', 'rate_applied' => 250, 'status' => 'completed',
    ]);

    $this->actingAs($admin)->delete(route('admin.tutors.destroy', $profile))->assertSessionHasErrors('tutor');

    expect(TutorProfile::find($profile->id))->not->toBeNull();
});

test('only admins can remove a tutor', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $profile = removableTutor();

    $this->actingAs($parent)->delete(route('admin.tutors.destroy', $profile))->assertForbidden();
});