<?php

use App\Models\Conversation;
use App\Models\Message;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\User;

function createMessagingSession(): array
{
    $parent = User::factory()->create(['role' => 'parent']);
    $tutor = User::factory()->create(['role' => 'tutor']);
    $student = StudentProfile::create([
        'parent_id' => $parent->id,
        'student_name' => 'Messaging Student',
        'grade_level' => 'Grade 4',
    ]);
    $session = TutoringSession::create([
        'student_profile_id' => $student->id,
        'tutor_id' => $tutor->id,
        'subject' => 'Math',
        'session_type' => '1on1',
        'location_type' => 'onsite',
        'session_date' => now()->addDay()->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
        'rate_applied' => 350,
        'status' => 'pending',
    ]);

    return [$parent, $tutor, $session];
}

test('a parent can start one conversation for their tutoring session', function () {
    [$parent, $tutor, $session] = createMessagingSession();

    $response = $this->actingAs($parent)->post(route('messages.store'), [
        'session_id' => $session->id,
    ]);

    $conversation = Conversation::firstOrFail();
    $response->assertRedirect(route('messages.show', $conversation));
    expect($conversation->parent_id)->toBe($parent->id);
    expect($conversation->tutor_id)->toBe($tutor->id);
});

test('only conversation participants can read and send messages', function () {
    [$parent, $tutor, $session] = createMessagingSession();
    $conversation = Conversation::create([
        'parent_id' => $parent->id,
        'tutor_id' => $tutor->id,
        'session_id' => $session->id,
    ]);
    $outsider = User::factory()->create(['role' => 'parent']);

    $response = $this->actingAs($outsider)->get(route('messages.show', $conversation));
    $response->assertForbidden();

    $response = $this->actingAs($parent)->post(route('messages.send', $conversation), [
        'body' => 'Can we discuss the lesson time?',
    ]);

    $response->assertRedirect();
    expect(Message::firstOrFail()->sender_id)->toBe($parent->id);
});

test('the tutor can reply in a parent-created conversation', function () {
    [$parent, $tutor, $session] = createMessagingSession();
    $conversation = Conversation::create([
        'parent_id' => $parent->id,
        'tutor_id' => $tutor->id,
        'session_id' => $session->id,
    ]);

    $response = $this->actingAs($tutor)->post(route('messages.send', $conversation), [
        'body' => 'Yes, that time works for me.',
    ]);

    $response->assertRedirect();
    expect(Message::firstOrFail()->sender_id)->toBe($tutor->id);
});
