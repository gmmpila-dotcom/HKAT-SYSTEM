<?php

use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;

function seedAdminPageData(): void
{
    $parent = User::factory()->create(['role' => 'parent']);
    $tutor = User::factory()->create(['role' => 'tutor']);
    TutorProfile::create(['user_id' => $tutor->id, 'is_verified' => true]);
    $student = StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => 'Page Student',
        'grade_level' => 'Grade 3',
    ]);
    $session = TutoringSession::create([
        'student_profile_id' => $student->id,
        'tutor_id' => $tutor->id,
        'subject' => 'Math',
        'session_type' => '1on1',
        'location_type' => 'onsite',
        'session_date' => now()->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
        'rate_applied' => 250,
        'status' => 'pending',
    ]);
    Payment::create(['session_id' => $session->id, 'amount' => 250, 'status' => 'pending']);
}

test('the admin schedule lists this week sessions and tutors', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    seedAdminPageData();

    $this->actingAs($admin)
        ->get(route('admin.schedule.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Schedule/Index')
            ->has('sessions', 1)
            ->has('tutors', 1));
});

test('the admin students directory lists enrolled students', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    seedAdminPageData();

    $this->actingAs($admin)
        ->get(route('admin.students.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Students/Index')
            ->has('students', 1));
});

test('the admin payments page returns invoices, charts and the rate card', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    seedAdminPageData();

    $this->actingAs($admin)
        ->get(route('admin.payments.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Payments/Index')
            ->has('payments', 1)
            ->has('charts.week.labels', 5)
            ->has('rates'));
});

test('non-admins cannot open the admin schedule, students or payments pages', function () {
    $parent = User::factory()->create(['role' => 'parent']);

    foreach (['admin.schedule.index', 'admin.students.index', 'admin.payments.index'] as $name) {
        $this->actingAs($parent)->get(route($name))->assertForbidden();
    }
});