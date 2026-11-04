<?php

use App\Models\StudentProfile;
use App\Models\User;

test('settings saves the mobile number for any role', function () {
    $user = User::factory()->create(['role' => 'tutor']);

    $this->actingAs($user)
        ->patch('/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => '+63 917 555 0144',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    expect($user->refresh()->phone)->toBe('+63 917 555 0144');
});

test('settings rejects a mobile number with letters', function () {
    $user = User::factory()->create(['role' => 'tutor']);

    $this->actingAs($user)
        ->patch('/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => 'call me maybe',
        ])
        ->assertSessionHasErrors('phone');
});

test('a parent can rename their child from settings', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $student = StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => 'Old Name',
        'grade_level' => 'Grade 3',
    ]);

    $this->actingAs($parent)
        ->patch('/profile', [
            'name' => $parent->name,
            'email' => $parent->email,
            'child_name' => 'New Name',
        ])
        ->assertSessionHasNoErrors();

    expect($student->refresh()->student_name)->toBe('New Name');
});

test('the settings page gives a parent their child name', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => 'Settings Child',
        'grade_level' => 'Grade 3',
    ]);

    $this->actingAs($parent)
        ->get('/profile')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Profile/Edit')
            ->where('childName', 'Settings Child'));
});