<?php

use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;
use Carbon\Carbon;

function onlineSetup(): array
{
    $parent = User::factory()->create(['role' => 'parent']);
    $student = StudentProfile::create(['parent_id' => $parent->id, 'student_name' => 'Online Kid', 'grade_level' => 'Grade 8']);
    $tutor = User::factory()->create(['role' => 'tutor']);
    TutorProfile::create(['user_id' => $tutor->id, 'is_verified' => true, 'specializations' => ['Math', 'Drawing']]);

    return [$parent, $student, $tutor];
}

function bookOnline($test, User $parent, StudentProfile $student, User $tutor, string $subject)
{
    return $test->actingAs($parent)->post(route('parent.booking.store'), [
        'student_profile_id' => $student->id,
        'tutor_id' => $tutor->id,
        'subject' => $subject,
        'session_type' => '1on1',
        'location_type' => 'online',
        'session_date' => now()->addDays(2)->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
    ]);
}

function confirmedOnline(StudentProfile $student, User $tutor, Carbon $start, int $days = 0): TutoringSession
{
    $start = $start->copy()->addDays($days);
    $session = TutoringSession::create([
        'student_profile_id' => $student->id, 'tutor_id' => $tutor->id, 'subject' => 'Math',
        'session_type' => '1on1', 'location_type' => 'online',
        'session_date' => $start->toDateString(), 'start_time' => $start->format('H:i'),
        'end_time' => $start->copy()->addHour()->format('H:i'), 'rate_applied' => 150, 'status' => 'pending',
    ]);
    Payment::create(['session_id' => $session->id, 'amount' => 150, 'status' => 'paid', 'paid_at' => now()]);
    $session->update(['status' => 'confirmed']);

    return $session;
}

test('an online booking costs 150 per hour for any grade and gets a room', function () {
    [$parent, $student, $tutor] = onlineSetup();

    bookOnline($this, $parent, $student, $tutor, 'Math')->assertSessionHasNoErrors();

    $session = TutoringSession::first();
    expect((float) $session->rate_applied)->toBe(150.0);
    expect($session->room_code)->toStartWith('hkat-');
    expect((float) Payment::first()->amount)->toBe(150.0);
});

test('online is not allowed for art lessons', function () {
    [$parent, $student, $tutor] = onlineSetup();

    bookOnline($this, $parent, $student, $tutor, 'Drawing');

    expect(TutoringSession::count())->toBe(0);
});

test('the parent can join inside the window and the start time is recorded', function () {
    [$parent, $student, $tutor] = onlineSetup();
    $session = confirmedOnline($student, $tutor, Carbon::now('Asia/Manila')->addMinutes(5));

    $this->actingAs($parent)
        ->get(route('online.show', $session))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Online/Room')->where('room.can_end', false));

    expect($session->refresh()->started_at)->not->toBeNull();
});

test('the room is closed too early and for unpaid sessions', function () {
    [$parent, $student, $tutor] = onlineSetup();
    $early = confirmedOnline($student, $tutor, Carbon::now('Asia/Manila'), 3);

    $this->actingAs($parent)->get(route('online.show', $early))->assertSessionHasErrors('session');

    $unpaid = TutoringSession::create([
        'student_profile_id' => $student->id, 'tutor_id' => $tutor->id, 'subject' => 'Math',
        'session_type' => '1on1', 'location_type' => 'online', 'session_date' => now()->toDateString(),
        'start_time' => '09:00', 'end_time' => '10:00', 'rate_applied' => 150, 'status' => 'pending',
    ]);
    $this->actingAs($parent)->get(route('online.show', $unpaid))->assertSessionHasErrors('session');
});

test('tutor and admin can join, strangers cannot', function () {
    [$parent, $student, $tutor] = onlineSetup();
    $session = confirmedOnline($student, $tutor, Carbon::now('Asia/Manila')->addMinutes(5));
    $admin = User::factory()->create(['role' => 'admin']);
    $stranger = User::factory()->create(['role' => 'parent']);
    $otherTutor = User::factory()->create(['role' => 'tutor']);

    $this->actingAs($tutor)->get(route('online.show', $session))->assertOk();
    $this->actingAs($admin)->get(route('online.show', $session))->assertOk();
    $this->actingAs($stranger)->get(route('online.show', $session))->assertForbidden();
    $this->actingAs($otherTutor)->get(route('online.show', $session))->assertForbidden();
});

test('only the tutor or admin can end the class', function () {
    [$parent, $student, $tutor] = onlineSetup();
    $session = confirmedOnline($student, $tutor, Carbon::now('Asia/Manila')->addMinutes(5));

    $this->actingAs($parent)->post(route('online.end', $session))->assertForbidden();
    expect($session->refresh()->ended_at)->toBeNull();

    $this->actingAs($tutor)->post(route('online.end', $session))->assertRedirect();
    expect($session->refresh()->ended_at)->not->toBeNull();

    $this->actingAs($parent)->get(route('online.show', $session))->assertSessionHasErrors('session');
});