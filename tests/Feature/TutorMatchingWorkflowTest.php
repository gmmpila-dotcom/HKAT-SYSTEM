<?php

use App\Models\StudentProfile;
use App\Models\TutorProfile;
use App\Models\User;

test('parent matching ranks exact specialization matches first', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $student = StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => 'Matching Student',
        'grade_level' => 'Grade 4',
    ]);
    $mathTutor = User::factory()->create(['role' => 'tutor']);
    $englishTutor = User::factory()->create(['role' => 'tutor']);

    TutorProfile::create([
        'user_id' => $mathTutor->id,
        'specializations' => ['Math'],
        'is_verified' => true,
    ]);
    TutorProfile::create([
        'user_id' => $englishTutor->id,
        'specializations' => ['English'],
        'is_verified' => true,
    ]);

    $response = $this->actingAs($parent)->getJson(route('parent.booking.match', [
        'student_profile_id' => $student->id,
        'subject' => 'Math',
    ]));

    $response->assertOk()->assertJsonPath('tutors.0.id', $mathTutor->id);
    $response->assertJsonPath('tutors.0.reason', 'Specialization match');
});

test('matching excludes unverified tutors', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $student = StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => 'Matching Student',
        'grade_level' => 'Grade 4',
    ]);
    $tutor = User::factory()->create(['role' => 'tutor']);
    TutorProfile::create([
        'user_id' => $tutor->id,
        'specializations' => ['Math'],
        'is_verified' => false,
    ]);

    $response = $this->actingAs($parent)->getJson(route('parent.booking.match', [
        'student_profile_id' => $student->id,
        'subject' => 'Math',
    ]));

    $response->assertOk()->assertJsonCount(0, 'tutors');
});

test('parent matching cannot use another parent\'s student', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $otherParent = User::factory()->create(['role' => 'parent']);
    $student = StudentProfile::create([
        'parent_id' => $otherParent->id,
        'student_name' => 'Private Student',
        'grade_level' => 'Grade 4',
    ]);

    $response = $this->actingAs($parent)->getJson(route('parent.booking.match', [
        'student_profile_id' => $student->id,
        'subject' => 'Math',
    ]));

    $response->assertForbidden();
});
