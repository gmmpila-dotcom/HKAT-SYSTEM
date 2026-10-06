<?php

use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function createDashboardSession(User $parent, User $tutor, string $studentName): TutoringSession
{
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

test('parent dashboard only shows sessions belonging to the authenticated parent', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $otherParent = User::factory()->create(['role' => 'parent']);
    $tutor = User::factory()->create(['role' => 'tutor']);
    $ownSession = createDashboardSession($parent, $tutor, 'Own Student');
    createDashboardSession($otherParent, $tutor, 'Other Student');

    $response = $this->actingAs($parent)->get(route('parent.dashboard'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Parent/Dashboard')
        ->has('sessions', 1)
        ->where('sessions.0.id', $ownSession->id));
});

test('non-parent users cannot access the parent dashboard', function () {
    $tutor = User::factory()->create(['role' => 'tutor']);

    $response = $this->actingAs($tutor)->get(route('parent.dashboard'));

    $response->assertForbidden();
});
