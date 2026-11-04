<?php

use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

function makeDirectoryTutor(): TutorProfile
{
    $user = User::factory()->create(['role' => 'tutor']);

    return TutorProfile::create([
        'user_id' => $user->id,
        'is_verified' => true,
        'categories' => ['academic'],
        'specializations' => ['Math'],
    ]);
}

test('the admin tutor directory lists tutors with real stats', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $profile = makeDirectoryTutor();
    $parent = User::factory()->create(['role' => 'parent']);
    $student = StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => 'Directory Student',
        'grade_level' => 'Grade 3',
    ]);
    TutoringSession::create([
        'student_profile_id' => $student->id,
        'tutor_id' => $profile->user_id,
        'subject' => 'Math',
        'session_type' => '1on1',
        'location_type' => 'onsite',
        'session_date' => now()->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:30',
        'rate_applied' => 375,
        'status' => 'pending',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.tutors.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Tutors/Index')
            ->has('tutors', 1)
            ->where('tutors.0.students', 1)
            ->where('tutors.0.hours', 1.5)
            ->where('tutors.0.availability', 'open')
            ->where('counts.total', 1)
            ->where('counts.awaiting', 0));
});

test('an admin can add a tutor and the temporary password works', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->post(route('admin.tutors.store'), [
            'name' => 'New Tutor',
            'email' => 'new.tutor@example.test',
            'category' => 'arts',
            'specialization' => 'Drawing, Painting',
        ])
        ->assertSessionHasNoErrors()
        ->assertSessionHas('tempPassword');

    $user = User::where('email', 'new.tutor@example.test')->firstOrFail();
    expect($user->role)->toBe('tutor');
    expect(Hash::check(session('tempPassword'), $user->password))->toBeTrue();

    $profile = TutorProfile::where('user_id', $user->id)->firstOrFail();
    expect($profile->categories)->toBe(['arts']);
    expect($profile->specializations)->toBe(['Drawing', 'Painting']);
    expect($profile->is_verified)->toBeTrue();
});

test('adding a tutor with an existing email is rejected', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $existing = User::factory()->create(['role' => 'parent']);

    $this->actingAs($admin)
        ->post(route('admin.tutors.store'), [
            'name' => 'Duplicate',
            'email' => $existing->email,
            'category' => 'academic',
        ])
        ->assertSessionHasErrors('email');
});

test('an admin can update a tutor categories and details', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $profile = makeDirectoryTutor();

    $this->actingAs($admin)
        ->patch(route('admin.tutors.update', $profile), [
            'categories' => ['arts', 'special'],
            'specializations' => 'Drawing, Face Painting',
            'credential' => 'Licensed teacher',
            'years_experience' => '4',
        ])
        ->assertSessionHasNoErrors();

    $profile->refresh();
    expect($profile->categories)->toBe(['arts', 'special']);
    expect($profile->specializations)->toBe(['Drawing', 'Face Painting']);
    expect($profile->credential)->toBe('Licensed teacher');
});

test('non-admins cannot use the tutor directory', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $profile = makeDirectoryTutor();

    $this->actingAs($parent)->get(route('admin.tutors.index'))->assertForbidden();
    $this->actingAs($parent)->post(route('admin.tutors.store'), [])->assertForbidden();
    $this->actingAs($parent)->patch(route('admin.tutors.update', $profile), [])->assertForbidden();
});