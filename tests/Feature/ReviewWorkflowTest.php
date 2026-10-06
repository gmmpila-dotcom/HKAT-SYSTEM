<?php

use App\Models\Payment;
use App\Models\Review;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\User;

function createReviewSession(User $parent, User $tutor, string $status = 'completed'): TutoringSession
{
    $student = StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => 'Review Student',
        'grade_level' => 'Grade 4',
    ]);

    $session = TutoringSession::create([
        'student_profile_id' => $student->id,
        'tutor_id' => $tutor->id,
        'subject' => 'Math',
        'session_type' => '1on1',
        'location_type' => 'onsite',
        'session_date' => now()->subDay()->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
        'rate_applied' => 350,
        'status' => 'pending',
    ]);

    if ($status !== 'pending') {
        Payment::create([
            'session_id' => $session->id,
            'amount' => 350,
            'status' => 'paid',
            'paid_at' => now(),
        ]);
        $session->update(['status' => $status]);
    }

    return $session;
}

test('parent can review their completed session once', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $tutor = User::factory()->create(['role' => 'tutor']);
    $session = createReviewSession($parent, $tutor);

    $response = $this->actingAs($parent)->post(route('parent.sessions.review', $session), [
        'rating' => 5,
        'comment' => 'Excellent session.',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('reviews', [
        'session_id' => $session->id,
        'parent_id' => $parent->id,
        'tutor_id' => $tutor->id,
        'rating' => 5,
    ]);
});

test('parents cannot review an incomplete session', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $tutor = User::factory()->create(['role' => 'tutor']);
    $session = createReviewSession($parent, $tutor, 'confirmed');

    $response = $this->actingAs($parent)->post(route('parent.sessions.review', $session), [
        'rating' => 4,
    ]);

    $response->assertForbidden();
    expect(Review::count())->toBe(0);
});

test('parents cannot review another parent\'s session', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $otherParent = User::factory()->create(['role' => 'parent']);
    $tutor = User::factory()->create(['role' => 'tutor']);
    $session = createReviewSession($otherParent, $tutor);

    $response = $this->actingAs($parent)->post(route('parent.sessions.review', $session), [
        'rating' => 4,
    ]);

    $response->assertForbidden();
    expect(Review::count())->toBe(0);
});

test('a completed session cannot be reviewed twice', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $tutor = User::factory()->create(['role' => 'tutor']);
    $session = createReviewSession($parent, $tutor);
    Review::create([
        'session_id' => $session->id,
        'parent_id' => $parent->id,
        'tutor_id' => $tutor->id,
        'rating' => 4,
    ]);

    $response = $this->actingAs($parent)->post(route('parent.sessions.review', $session), [
        'rating' => 5,
    ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors('review');
    expect(Review::count())->toBe(1);
});
