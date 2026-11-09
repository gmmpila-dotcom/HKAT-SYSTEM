<?php

namespace Tests\Feature;

use App\Support\RateCalculator;
use InvalidArgumentException;
use Tests\TestCase;

class RateCalculatorTest extends TestCase
{
    public function test_each_grade_band_follows_the_price_list(): void
    {
        $this->assertSame(200.0, RateCalculator::hourly('Grade 1', 'Reading'));
        $this->assertSame(250.0, RateCalculator::hourly('Grade 3', 'Math'));
        $this->assertSame(250.0, RateCalculator::hourly('Grade 4', 'Filipino'));
        $this->assertSame(300.0, RateCalculator::hourly('Grade 6', 'Science'));
        $this->assertSame(350.0, RateCalculator::hourly('Grade 7', 'Writing'));
        $this->assertSame(400.0, RateCalculator::hourly('Grade 10', 'English'));
    }

    public function test_home_based_sessions_have_a_350_minimum(): void
    {
        $this->assertSame(350.0, RateCalculator::hourly('Grade 3', 'Reading', 'home'));
        $this->assertSame(400.0, RateCalculator::hourly('Grade 10', 'Math', 'home'));
        $this->assertSame(150.0, RateCalculator::hourly('Grade 3', 'Math', 'online'));
    }

    public function test_total_multiplies_the_hourly_rate_by_hours(): void
    {
        $this->assertSame(375.0, RateCalculator::total('Grade 3', 'Math', 'onsite', 1.5));
        $this->assertSame(500.0, RateCalculator::total('Grade 5', 'Reading', 'onsite', 2.0));
    }

    public function test_special_teaching_is_a_flat_price_per_session(): void
    {
        $this->assertSame(500.0, RateCalculator::total('Grade 2', 'Special Teaching', 'onsite', 1.0));
        $this->assertSame(500.0, RateCalculator::total('Grade 2', 'Special Teaching', 'onsite', 2.0));
    }

    public function test_subject_kind_is_inferred(): void
    {
        $this->assertSame('arts', RateCalculator::kind('Mural Painting'));
        $this->assertSame('special', RateCalculator::kind('Special Teaching'));
        $this->assertSame('academic', RateCalculator::kind('Math'));
        $this->assertSame('academic', RateCalculator::kind('Earth Science'));
    }

    public function test_grade_levels_outside_the_bands_and_bad_input(): void
    {
        $this->assertSame(350.0, RateCalculator::hourly('Grade 11', 'Reading'));
        $this->assertSame(200.0, RateCalculator::hourly('Kinder', 'Reading'));

        $this->expectException(InvalidArgumentException::class);
        RateCalculator::hourly('abc', 'Math');
    }

    public function test_hours_between_two_times(): void
    {
        $this->assertSame(1.5, RateCalculator::hours('15:00', '16:30'));
        $this->assertSame(0.0, RateCalculator::hours('16:00', '15:00'));
    }
}
