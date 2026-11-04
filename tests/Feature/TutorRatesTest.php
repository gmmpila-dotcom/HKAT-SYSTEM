<?php

use App\Models\User;
use App\Support\RateCalculator;
use Illuminate\Support\Facades\DB;

function rateTutor(): User
{
    return User::factory()->create(['role' => 'tutor']);
}

function putRates(User $actor, User $tutor, array $payload)
{
    return test()->actingAs($actor)->put(route('admin.tutor-rates.update', $tutor), $payload);
}

test('an admin can save custom rates for one tutor', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $tutor = rateTutor();

    putRates($admin, $tutor, ['bands' => [1 => ['regular' => 220, 'core' => 300], 4 => ['regular' => '', 'core' => '']], 'special' => 600, 'home' => ''])
        ->assertSessionHasNoErrors();

    $saved = json_decode(DB::table('tutor_rate_cards')->where('user_id', $tutor->id)->value('rates'), true);
    expect($saved['bands'][1]['core'])->toEqual(300);
    expect($saved['special'])->toEqual(600);
    expect(isset($saved['bands'][4]))->toBeFalse();
});

test('custom rates change the price only for that tutor', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $custom = rateTutor();
    $other = rateTutor();
    putRates($admin, $custom, ['bands' => [1 => ['core' => 300]], 'special' => 600]);

    expect(RateCalculator::total('Grade 3', 'Math', 'onsite', 1.0, $custom->id))->toBe(300.0);
    expect(RateCalculator::total('Grade 3', 'Math', 'onsite', 1.0, $other->id))->toBe(250.0);
    expect(RateCalculator::total('Grade 3', 'Reading', 'onsite', 1.0, $custom->id))->toBe(200.0);
    expect(RateCalculator::total('Grade 3', 'Special Teaching', 'onsite', 1.0, $custom->id))->toBe(600.0);
    expect(RateCalculator::total('Grade 3', 'Special Teaching', 'onsite', 1.0, $other->id))->toBe(500.0);
});

test('the home based minimum can be changed per tutor', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $tutor = rateTutor();
    putRates($admin, $tutor, ['home' => 500]);

    expect(RateCalculator::total('Grade 1', 'Reading', 'home', 1.0, $tutor->id))->toBe(500.0);
    expect(RateCalculator::total('Grade 1', 'Reading', 'home', 1.0))->toBe(350.0);
});

test('using standard rates removes the custom rates', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $tutor = rateTutor();
    putRates($admin, $tutor, ['special' => 600]);

    $this->actingAs($admin)->delete(route('admin.tutor-rates.destroy', $tutor))->assertSessionHasNoErrors();

    expect(DB::table('tutor_rate_cards')->where('user_id', $tutor->id)->exists())->toBeFalse();
    expect(RateCalculator::total('Grade 3', 'Special Teaching', 'onsite', 1.0, $tutor->id))->toBe(500.0);
});

test('a tutor cannot edit their own rates or anyone elses', function () {
    $tutor = rateTutor();
    $other = rateTutor();

    putRates($tutor, $tutor, ['special' => 9999])->assertForbidden();
    putRates($tutor, $other, ['special' => 1])->assertForbidden();
    $this->actingAs($tutor)->delete(route('admin.tutor-rates.destroy', $tutor))->assertForbidden();

    expect(DB::table('tutor_rate_cards')->count())->toBe(0);
});

test('a parent cannot edit rates and only tutors can have rates', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $admin = User::factory()->create(['role' => 'admin']);
    $tutor = rateTutor();

    putRates($parent, $tutor, ['special' => 1])->assertForbidden();
    putRates($admin, $parent, ['special' => 1])->assertNotFound();
});

test('rates must be sensible numbers', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $tutor = rateTutor();

    putRates($admin, $tutor, ['special' => -5])->assertSessionHasErrors('special');
    putRates($admin, $tutor, ['bands' => [1 => ['core' => 'abc']]])->assertSessionHasErrors('bands.1.core');
});