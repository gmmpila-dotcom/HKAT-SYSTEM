<?php

use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function createTutorDashboardSession(User $tutor, string $studentName): TutoringSession
{
    $parent = User::factory()->create(['role' => 'parent']);
    $student = StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => $studentName,
        'grade_level' => 'Grade 4',
    ]);

    return TutoringSession::create([
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
}

test('tutor dashboard only shows sessions assigned to the authenticated tutor', function () {
    $tutor = User::factory()->create(['role' => 'tutor']);
    $otherTutor = User::factory()->create(['role' => 'tutor']);
    $ownSession = createTutorDashboardSession($tutor, 'Own Student');
    createTutorDashboardSession($otherTutor, 'Other Student');

    $response = $this->actingAs($tutor)->get(route('tutor.dashboard'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Tutor/Dashboard')
        ->has('sessions', 1)
        ->where('sessions.0.id', $ownSession->id));
});
