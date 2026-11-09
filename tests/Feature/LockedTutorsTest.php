<?php

use App\Models\TutorProfile;
use App\Models\User;

function lockedProfile(): TutorProfile
{
    $tutor = User::factory()->create(['role' => 'tutor']);

    return TutorProfile::create(['user_id' => $tutor->id, 'is_verified' => true, 'credential' => 'BS Psychology', 'bio' => 'Hello']);
}

test('guests are sent to login instead of seeing tutors', function () {
    $profile = lockedProfile();

    $this->get('/tutors')->assertRedirect(route('login'));
    $this->get(route('tutors.show', $profile))->assertRedirect(route('login'));
});

test('a parent who opens find a tutor lands on the booking page', function () {
    $parent = User::factory()->create(['role' => 'parent']);

    $this->actingAs($parent)->get('/tutors')->assertRedirect('/parent/book');
});

test('a parent profile view hides the credential text', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $profile = lockedProfile();

    $this->actingAs($parent)
        ->get(route('tutors.show', $profile))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('TutorProfile')->missing('tutor.credential')->missing('tutor.experience'));
});

test('tutors cannot browse other tutor profiles', function () {
    $other = User::factory()->create(['role' => 'tutor']);
    $profile = lockedProfile();

    $this->actingAs($other)->get(route('tutors.show', $profile))->assertForbidden();
});

test('an admin can still open a tutor profile', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $profile = lockedProfile();

    $this->actingAs($admin)->get(route('tutors.show', $profile))->assertOk();
});