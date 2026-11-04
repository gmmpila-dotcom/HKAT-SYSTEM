<?php

use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;

function autoTutor(array $specs): User
{
    $tutor = User::factory()->create(['role' => 'tutor']);
    TutorProfile::create(['user_id' => $tutor->id, 'is_verified' => true, 'specializations' => $specs]);

    return $tutor;
}

function autoSession(StudentProfile $student, User $tutor, string $status = 'pending'): TutoringSession
{
    return TutoringSession::create([
        'student_profile_id' => $student->id,
        'tutor_id' => $tutor->id,
        'subject' => 'Math',
        'session_type' => '1on1',
        'location_type' => 'onsite',
        'session_date' => now()->addDays(3)->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
        'rate_applied' => 250,
        'status' => $status,
    ]);
}

function autoStudent(): StudentProfile
{
    $parent = User::factory()->create(['role' => 'parent']);

    return StudentProfile::create(['parent_id' => $parent->id, 'student_name' => 'Auto Kid', 'grade_level' => 'Grade 3']);
}

test('auto-assign ranks the tutor who teaches the subject first', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $student = autoStudent();
    $current = autoTutor([]);
    $match = autoTutor(['Math']);
    autoTutor(['Drawing']);
    $session = autoSession($student, $current);

    $this->actingAs($admin)
        ->getJson(route('admin.sessions.suggestions', $session))
        ->assertOk()
        ->assertJsonPath('candidates.0.id', $match->id)
        ->assertJsonPath('candidates.0.subject.score', 100);
});

test('auto-assign leaves out tutors who are busy at that time', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $student = autoStudent();
    $current = autoTutor([]);
    $busy = autoTutor(['Math']);
    $session = autoSession($student, $current);
    autoSession($student, $busy);

    $response = $this->actingAs($admin)->getJson(route('admin.sessions.suggestions', $session))->assertOk();

    expect(collect($response->json('candidates'))->pluck('id'))->not->toContain($busy->id);
    expect($response->json('excluded'))->toBe(1);
});

test('an admin can assign a pending session to another tutor', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $student = autoStudent();
    $current = autoTutor([]);
    $match = autoTutor(['Math']);
    $session = autoSession($student, $current);

    $this->actingAs($admin)
        ->patch(route('admin.sessions.assign', $session), ['tutor_id' => $match->id])
        ->assertSessionHasNoErrors();

    expect($session->refresh()->tutor_id)->toBe($match->id);
});

test('assigning a tutor who is busy is rejected', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $student = autoStudent();
    $current = autoTutor([]);
    $busy = autoTutor(['Math']);
    $session = autoSession($student, $current);
    autoSession($student, $busy);

    $this->actingAs($admin)
        ->patch(route('admin.sessions.assign', $session), ['tutor_id' => $busy->id])
        ->assertSessionHasErrors('tutor_id');

    expect($session->refresh()->tutor_id)->toBe($current->id);
});

test('only admins can use auto-assign', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $student = autoStudent();
    $session = autoSession($student, autoTutor([]));

    $this->actingAs($parent)->getJson(route('admin.autoassign.pending'))->assertForbidden();
    $this->actingAs($parent)->getJson(route('admin.sessions.suggestions', $session))->assertForbidden();
    $this->actingAs($parent)->patch(route('admin.sessions.assign', $session), ['tutor_id' => 1])->assertForbidden();
});