<?php

use App\Models\Application;
use App\Models\TutorProfile;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('a visitor can submit a tutor application', function () {
    $response = $this->post(route('tutor.apply.store'), [
        'full_name' => 'Future Tutor',
        'email' => 'future.tutor@example.com',
        'phone' => '09171234567',
        'specializations' => 'Math, English',
        'years_experience' => '4',
        'cover_letter' => 'I enjoy helping students learn.',
    ]);

    $response->assertRedirect(route('tutor.apply'));
    $response->assertSessionHas('status', 'application-submitted');
    $this->assertDatabaseHas('applications', [
        'email' => 'future.tutor@example.com',
        'status' => 'new',
    ]);

    expect(Application::firstOrFail()->specializations)->toBe(['Math', 'English']);
});

test('an admin can approve an application and create a tutor account', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $application = Application::create([
        'full_name' => 'Approved Tutor',
        'email' => 'approved.tutor@example.com',
        'specializations' => ['Science'],
        'years_experience' => '3',
        'cover_letter' => 'Science teacher.',
        'status' => 'new',
    ]);

    $response = $this->actingAs($admin)->patch(
        route('admin.applications.approve', $application),
    );

    $response->assertRedirect();
    $response->assertSessionHas('status', 'application-approved');
    $response->assertSessionHas('temporary_password');
    expect($application->refresh()->status)->toBe('approved');

    $user = User::where('email', 'approved.tutor@example.com')->firstOrFail();
    expect($user->role)->toBe('tutor');
    expect(TutorProfile::where('user_id', $user->id)->exists())->toBeTrue();
});

test('an admin can reject an application', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $application = Application::create([
        'full_name' => 'Rejected Tutor',
        'email' => 'rejected.tutor@example.com',
        'status' => 'new',
    ]);

    $response = $this->actingAs($admin)->patch(
        route('admin.applications.reject', $application),
    );

    $response->assertRedirect();
    expect($application->refresh()->status)->toBe('rejected');
    expect(User::where('email', 'rejected.tutor@example.com')->exists())->toBeFalse();
});

test('non-admin users cannot review tutor applications', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $application = Application::create([
        'full_name' => 'Protected Applicant',
        'email' => 'protected.applicant@example.com',
        'status' => 'new',
    ]);

    $response = $this->actingAs($parent)->patch(
        route('admin.applications.approve', $application),
    );

    $response->assertForbidden();
    expect($application->refresh()->status)->toBe('new');
});

test('admin applications page is protected and renders application data', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    Application::create([
        'full_name' => 'Listed Applicant',
        'email' => 'listed.applicant@example.com',
        'status' => 'new',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.applications.index'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Applications/Index')
        ->has('applications', 1));
});
