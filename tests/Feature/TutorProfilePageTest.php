<?php

use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Http\UploadedFile;

function profileTestTutor(): User
{
    $tutor = User::factory()->create(['role' => 'tutor']);
    TutorProfile::create([
        'user_id' => $tutor->id,
        'is_verified' => true,
        'bio' => 'Hello there',
        'specializations' => ['Drawing'],
    ]);

    return $tutor;
}

test('the tutor profile page returns the profile, availability and reviews', function () {
    $tutor = profileTestTutor();

    $this->actingAs($tutor)
        ->get(route('tutor.profile.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Tutor/EditProfile')
            ->where('profile.name', $tutor->name)
            ->where('profile.bio', 'Hello there')
            ->has('profile.availability.sun', 0)
            ->has('reviews', 0));
});

test('a tutor can save weekly availability', function () {
    $tutor = profileTestTutor();

    $this->actingAs($tutor)
        ->patch(route('tutor.availability.update'), [
            'availability' => ['sun' => ['10:00'], 'mon' => ['10:00', '09:00']],
        ])
        ->assertSessionHasNoErrors();

    $saved = json_decode(TutorProfile::where('user_id', $tutor->id)->value('availability'), true);
    expect($saved['sun'])->toBe(['10:00']);
    expect($saved['mon'])->toBe(['09:00', '10:00']);
    expect($saved['wed'])->toBe([]);
});

test('availability rejects an invalid time', function () {
    $tutor = profileTestTutor();

    $this->actingAs($tutor)
        ->patch(route('tutor.availability.update'), ['availability' => ['mon' => ['25:99']]])
        ->assertSessionHasErrors('availability.mon.0');
});

test('a tutor can upload and remove a portfolio image', function () {
    $tutor = profileTestTutor();
    $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    $file = UploadedFile::fake()->createWithContent('mural.png', $png);

    $this->actingAs($tutor)
        ->post(route('tutor.portfolio.store'), ['image' => $file, 'title' => 'School mural', 'tag' => 'Mural'])
        ->assertSessionHasNoErrors();

    $items = json_decode(TutorProfile::where('user_id', $tutor->id)->value('portfolio'), true);
    expect($items)->toHaveCount(1);
    $full = public_path(ltrim($items[0]['path'], '/'));
    expect(file_exists($full))->toBeTrue();

    $this->actingAs($tutor)->delete(route('tutor.portfolio.destroy', ['index' => 0]))->assertSessionHasNoErrors();

    expect(file_exists($full))->toBeFalse();
    expect(json_decode(TutorProfile::where('user_id', $tutor->id)->value('portfolio'), true))->toBe([]);
});

test('only tutors can open the tutor profile page', function () {
    $parent = User::factory()->create(['role' => 'parent']);

    $this->actingAs($parent)->get(route('tutor.profile.edit'))->assertForbidden();
});