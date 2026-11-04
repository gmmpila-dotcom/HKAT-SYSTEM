<?php

use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;

test('a tutor sees only their own students with parent contact and subjects', function () {
    $tutor = User::factory()->create(['role' => 'tutor']);
    TutorProfile::create(['user_id' => $tutor->id, 'is_verified' => true]);
    $parent = User::factory()->create(['role' => 'parent', 'phone' => '+63 917 402 1188']);
    $mine = StudentProfile::create(['parent_id' => $parent->id, 'student_name' => 'My Student', 'grade_level' => 'Grade 3']);
    StudentProfile::create(['parent_id' => $parent->id, 'student_name' => 'Other Student', 'grade_level' => 'Grade 5']);

    TutoringSession::create([
        'student_profile_id' => $mine->id,
        'tutor_id' => $tutor->id,
        'subject' => 'Math',
        'session_type' => '1on1',
        'location_type' => 'onsite',
        'session_date' => now()->addDay()->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
        'rate_applied' => 250,
        'status' => 'pending',
    ]);

    $this->actingAs($tutor)
        ->get(route('tutor.students.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Tutor/Students/Index')
            ->has('students', 1)
            ->where('students.0.student_name', 'My Student')
            ->where('students.0.parent_phone', '+63 917 402 1188')
            ->where('students.0.subjects', ['Math']));
});

test('only tutors can open the students directory', function () {
    $parent = User::factory()->create(['role' => 'parent']);

    $this->actingAs($parent)->get(route('tutor.students.index'))->assertForbidden();
});