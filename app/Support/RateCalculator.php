<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class RateCalculator
{
    /** Custom rates the admin saved for one tutor (empty when none). */
    public static function overrides(?int $tutorId): array
    {
        if (! $tutorId) {
            return [];
        }

        $raw = DB::table('tutor_rate_cards')->where('user_id', $tutorId)->value('rates');
        $data = $raw ? json_decode((string) $raw, true) : null;

        return is_array($data) ? $data : [];
    }

    /** Grade band for a stored grade level such as "Grade 3". */
    public static function band(string $gradeLevel): array
    {
        $bands = config('rates.bands');

        if (preg_match('/\d+/', $gradeLevel, $match)) {
            $grade = (int) $match[0];
        } elseif (preg_match('/kinder|nursery|pre/i', $gradeLevel)) {
            $grade = 1;
        } else {
            throw new InvalidArgumentException('Unrecognised grade level: '.$gradeLevel);
        }

        foreach ($bands as $band) {
            if ($grade >= $band['min'] && $grade <= $band['max']) {
                return $band;
            }
        }

        // Below the first band uses the first; above the last (Grades 11-12) uses the last.
        return $grade < $bands[0]['min'] ? $bands[0] : $bands[array_key_last($bands)];
    }

    /** academic, arts or special, inferred from the subject text. */
    public static function kind(string $subject): string
    {
        if (preg_match('/special/i', $subject)) {
            return 'special';
        }

        if (preg_match('/draw|paint|mural|\bart/i', $subject)) {
            return 'arts';
        }

        return 'academic';
    }

    /** Flat per-session price for Painting or Drawing, or null for other art subjects. */
    public static function artsPrice(string $subject): ?float
    {
        if (preg_match('/paint/i', $subject)) {
            return (float) config('rates.arts.painting');
        }

        if (preg_match('/draw/i', $subject)) {
            return (float) config('rates.arts.drawing');
        }

        return null;
    }

    public static function isCoreSubject(string $subject): bool
    {
        $subject = strtolower(trim($subject));

        foreach (config('rates.core_subjects') as $core) {
            if (str_starts_with($subject, $core)) {
                return true;
            }
        }

        return false;
    }

    /** Hourly rate for an academic session, using the tutor's custom rates when the admin set them. */
    public static function hourly(string $gradeLevel, string $subject, string $location = 'onsite', ?int $tutorId = null): float
    {
        $band = self::band($gradeLevel);
        $key = self::isCoreSubject($subject) ? 'core' : 'regular';

        if ($location === 'online') {
            return (float) config('rates.online_per_hour', 150);
        }
        $custom = self::overrides($tutorId);

        $own = $custom['bands'][$band['min']][$key] ?? null;
        $rate = $own !== null ? (float) $own : (float) $band[$key];

        if ($location === 'home') {
            $floor = isset($custom['home']) ? (float) $custom['home'] : (float) config('rates.home_minimum_per_hour');
            $rate = max($rate, $floor);
        }

        return $rate;
    }

    /** Total price of one session. There is no class discount and no service fee. */
    public static function total(string $gradeLevel, string $subject, string $location, float $hours, ?int $tutorId = null): float
    {
        foreach ((self::overrides($tutorId)['program'] ?? []) as $programName => $program) {
            if (strtolower(trim((string) $programName)) === strtolower(trim($subject))) {
                return (float) $program['price'];
            }
        }
        if ($location === 'online' && self::kind($subject) !== 'academic') {
            throw new InvalidArgumentException('Online sessions are for academic subjects only.');
        }

        $kind = self::kind($subject);

        if ($kind === 'special') {
            $custom = self::overrides($tutorId);

            return (float) ($custom['special'] ?? config('rates.special_teaching_per_session'));
        }

        if ($kind === 'arts') {
            $price = self::artsPrice($subject);

            if ($price !== null) {
                return $price;
            }
        }

        return round(self::hourly($gradeLevel, $subject, $location, $tutorId) * max($hours, 0.0), 2);
    }

    /** Length in hours between two "H:i" times. */
    public static function hours(string $start, string $end): float
    {
        [$sh, $sm] = array_map('intval', explode(':', $start));
        [$eh, $em] = array_map('intval', explode(':', $end));

        return max((($eh * 60 + $em) - ($sh * 60 + $sm)) / 60, 0.0);
    }
}