<?php

use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;

function customRateSetup(): array
{
    $parent = User::factory()->create(['role' => 'parent']);
    $student = StudentProfile::create(['parent_id' => $parent->id, 'student_name' => 'Rate Kid', 'grade_level' => 'Grade 3']);
    $tutor = User::factory()->create(['role' => 'tutor']);
    TutorProfile::create(['user_id' => $tutor->id, 'is_verified' => true, 'specializations' => ['Math']]);
    DB::table('tutor_rate_cards')->insert([
        'user_id' => $tutor->id,
        'rates' => json_encode(['bands' => [1 => ['regular' => 300, 'core' => 450]]]),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return [$parent, $student, $tutor];
}

test('booking uses the chosen tutor custom rate', function () {
    [$parent, $student, $tutor] = customRateSetup();

    $this->actingAs($parent)->post(route('parent.booking.store'), [
        'student_profile_id' => $student->id,
        'tutor_id' => $tutor->id,
        'subject' => 'Math',
        'session_type' => '1on1',
        'location_type' => 'onsite',
        'session_date' => now()->addDays(2)->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
    ])->assertSessionHasNoErrors();

    expect((float) TutoringSession::first()->rate_applied)->toBe(450.0);
    expect((float) Payment::first()->amount)->toBe(450.0);
});

test('the fee preview uses the chosen tutor custom rate', function () {
    [$parent, $student, $tutor] = customRateSetup();

    $this->actingAs($parent)
        ->getJson(route('parent.booking.rate', [
            'student_profile_id' => $student->id,
            'subject' => 'Math',
            'location_type' => 'onsite',
            'start_time' => '09:00',
            'end_time' => '10:00',
            'tutor_id' => $tutor->id,
        ]))
        ->assertOk()
        ->assertJsonPath('rate', 450);
});