<?php

use App\Support\RateCalculator;

test('painting is a flat 1500 per session for any grade, length or session type', function () {
    expect(RateCalculator::total('Grade 3', 'Watercolor Painting', 'onsite', 2))->toBe(1500.0);
    expect(RateCalculator::total('Grade 8', 'Painting', 'onsite', 1))->toBe(1500.0);
});

test('drawing is a flat 1200 per session for any grade or length', function () {
    expect(RateCalculator::total('Grade 3', 'Drawing', 'onsite', 2))->toBe(1200.0);
    expect(RateCalculator::total('Grade 9', 'Drawing', 'home', 3))->toBe(1200.0);
});

test('painting and drawing have separate prices', function () {
    expect(RateCalculator::artsPrice('Painting'))->not->toBe(RateCalculator::artsPrice('Drawing'));
    expect(RateCalculator::artsPrice('Mural Work'))->toBeNull();
});

test('other art subjects still use the grade band hourly rate', function () {
    expect(RateCalculator::total('Grade 3', 'Mural Work', 'onsite', 2))->toBe(400.0);
});