<?php

use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;

function seedReportOverviewData(): void
{
    $parent = User::factory()->create(['role' => 'parent']);
    $tutor = User::factory()->create(['role' => 'tutor']);
    TutorProfile::create(['user_id' => $tutor->id, 'is_verified' => true]);
    $student = StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => 'Report Student',
        'grade_level' => 'Grade 3',
    ]);

    $make = fn (string $status) => TutoringSession::create([
        'student_profile_id' => $student->id,
        'tutor_id' => $tutor->id,
        'subject' => 'Math',
        'session_type' => '1on1',
        'location_type' => 'onsite',
        'session_date' => now()->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
        'rate_applied' => 250,
        'status' => $status,
    ]);

    $done = $make('completed');
    $make('cancelled');

    Payment::create(['session_id' => $done->id, 'amount' => 250, 'status' => 'paid', 'paid_at' => now()]);
}

test('the admin report overview aggregates revenue, attendance and subjects', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    seedReportOverviewData();

    $this->actingAs($admin)
        ->get(route('admin.reports.overview'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reports/Overview')
            ->has('months', 6)
            ->has('revenue.series', 6)
            ->where('revenue.series.5', fn ($value) => (float) $value === 250.0)
            ->has('attendance.weeks', 5)
            ->where('attendance.rate', 50)
            ->has('progress.subjects', 1));
});

test('non-admins cannot open the report overview', function () {
    $parent = User::factory()->create(['role' => 'parent']);

    $this->actingAs($parent)->get(route('admin.reports.overview'))->assertForbidden();
});