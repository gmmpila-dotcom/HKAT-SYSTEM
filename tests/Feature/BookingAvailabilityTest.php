<?php

use App\Models\StudentProfile;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;

function availabilityTutor(?array $week): User
{
    $tutor = User::factory()->create(['role' => 'tutor']);
    TutorProfile::create(['user_id' => $tutor->id, 'is_verified' => true, 'specializations' => ['Math']]);

    if ($week !== null) {
        DB::table('tutor_profiles')->where('user_id', $tutor->id)->update(['availability' => json_encode($week)]);
    }

    return $tutor;
}

function availabilityPayload(User $tutor, StudentProfile $student, string $date, string $start, string $end): array
{
    return [
        'student_profile_id' => $student->id,
        'tutor_id' => $tutor->id,
        'subject' => 'Math',
        'session_type' => '1on1',
        'location_type' => 'onsite',
        'session_date' => $date,
        'start_time' => $start,
        'end_time' => $end,
    ];
}

function availabilityStudent(User $parent): StudentProfile
{
    return StudentProfile::create(['parent_id' => $parent->id, 'student_name' => 'Avail Kid', 'grade_level' => 'Grade 3']);
}

test('a tutor with saved availability can be booked inside it', function () {
    $date = now()->addDays(2)->toDateString();
    $day = strtolower(substr(date('D', strtotime($date)), 0, 3));
    $tutor = availabilityTutor([$day => ['09:00', '10:00']]);
    $parent = User::factory()->create(['role' => 'parent']);

    $this->actingAs($parent)
        ->post(route('parent.booking.store'), availabilityPayload($tutor, availabilityStudent($parent), $date, '09:00', '11:00'))
        ->assertSessionHasNoErrors();
});

test('a tutor with saved availability cannot be booked outside it', function () {
    $date = now()->addDays(2)->toDateString();
    $day = strtolower(substr(date('D', strtotime($date)), 0, 3));
    $tutor = availabilityTutor([$day => ['09:00']]);
    $parent = User::factory()->create(['role' => 'parent']);

    $this->actingAs($parent)
        ->post(route('parent.booking.store'), availabilityPayload($tutor, availabilityStudent($parent), $date, '09:00', '11:00'))
        ->assertSessionHasErrors('tutor_id');
});

test('a tutor with no saved availability stays bookable at any time', function () {
    $date = now()->addDays(2)->toDateString();
    $tutor = availabilityTutor(null);
    $parent = User::factory()->create(['role' => 'parent']);

    $this->actingAs($parent)
        ->post(route('parent.booking.store'), availabilityPayload($tutor, availabilityStudent($parent), $date, '15:00', '16:00'))
        ->assertSessionHasNoErrors();
});

test('the availability endpoint lists tutors who are off schedule', function () {
    $date = now()->addDays(2)->toDateString();
    $day = strtolower(substr(date('D', strtotime($date)), 0, 3));
    $off = availabilityTutor([$day => ['09:00']]);
    $free = availabilityTutor(null);
    $parent = User::factory()->create(['role' => 'parent']);

    $response = $this->actingAs($parent)
        ->getJson(route('parent.booking.availability', ['session_date' => $date, 'start_time' => '14:00', 'end_time' => '15:00']))
        ->assertOk();

    expect($response->json('unavailable'))->toContain($off->id);
    expect($response->json('unavailable'))->not->toContain($free->id);
});