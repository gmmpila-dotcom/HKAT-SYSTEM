<?php

use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;

test('the admin dashboard shows pending requests and stats to admins', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $parent = User::factory()->create(['role' => 'parent']);
    $tutor = User::factory()->create(['role' => 'tutor']);
    TutorProfile::create(['user_id' => $tutor->id, 'is_verified' => true]);
    $student = StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => 'Test Student',
        'grade_level' => 'Grade 4',
    ]);
    $session = TutoringSession::create([
        'student_profile_id' => $student->id,
        'tutor_id' => $tutor->id,
        'subject' => 'Math',
        'session_type' => '1on1',
        'location_type' => 'onsite',
        'session_date' => now()->addDays(3)->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
        'rate_applied' => 300,
        'status' => 'pending',
    ]);
    Payment::create(['session_id' => $session->id, 'amount' => 300, 'status' => 'pending']);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->has('stats')
            ->has('pendingRequests', 1)
            ->has('todaySessions', 0));
});

test('only admins can open the admin dashboard', function () {
    $parent = User::factory()->create(['role' => 'parent']);

    $this->actingAs($parent)->get(route('admin.dashboard'))->assertForbidden();
});