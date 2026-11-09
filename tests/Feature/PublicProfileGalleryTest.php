<?php

use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;

test('the public tutor profile shows availability, portfolio and review count', function () {
    $tutor = User::factory()->create(['role' => 'tutor']);
    $profile = TutorProfile::create(['user_id' => $tutor->id, 'is_verified' => true, 'bio' => 'Hi']);
    DB::table('tutor_profiles')->where('id', $profile->id)->update([
        'availability' => json_encode(['mon' => ['09:00']]),
        'portfolio' => json_encode([['path' => '/images/portfolio/x.jpg', 'title' => 'Mural', 'tag' => 'Art']]),
    ]);

    $this->actingAs(User::factory()->create(['role' => 'parent']))->get(route('tutors.show', $profile))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('TutorProfile')
            ->where('tutor.availability.mon', ['09:00'])
            ->has('tutor.portfolio', 1)
            ->where('tutor.review_count', 0));
});

test('an unverified tutor profile is not public', function () {
    $tutor = User::factory()->create(['role' => 'tutor']);
    $profile = TutorProfile::create(['user_id' => $tutor->id, 'is_verified' => false]);

    $this->actingAs(User::factory()->create(['role' => 'parent']))->get(route('tutors.show', $profile))->assertNotFound();
});

test('a parent sees artwork from their child tutors only', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $student = StudentProfile::create(['parent_id' => $parent->id, 'student_name' => 'Art Kid', 'grade_level' => 'Grade 3']);
    $mine = User::factory()->create(['role' => 'tutor']);
    $other = User::factory()->create(['role' => 'tutor']);
    $p1 = TutorProfile::create(['user_id' => $mine->id, 'is_verified' => true]);
    $p2 = TutorProfile::create(['user_id' => $other->id, 'is_verified' => true]);
    DB::table('tutor_profiles')->where('id', $p1->id)->update(['portfolio' => json_encode([['path' => '/images/portfolio/a.jpg', 'title' => 'Mine']])]);
    DB::table('tutor_profiles')->where('id', $p2->id)->update(['portfolio' => json_encode([['path' => '/images/portfolio/b.jpg', 'title' => 'Other']])]);
    TutoringSession::create([
        'student_profile_id' => $student->id, 'tutor_id' => $mine->id, 'subject' => 'Drawing',
        'session_type' => '1on1', 'location_type' => 'onsite', 'session_date' => now()->toDateString(),
        'start_time' => '09:00', 'end_time' => '11:00', 'rate_applied' => 1200, 'status' => 'pending',
    ]);

    $this->actingAs($parent)
        ->get(route('parent.gallery.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Parent/Gallery')->has('items', 1)->where('items.0.title', 'Mine'));
});

test('only parents can open the gallery', function () {
    $tutor = User::factory()->create(['role' => 'tutor']);

    $this->actingAs($tutor)->get(route('parent.gallery.index'))->assertForbidden();
});