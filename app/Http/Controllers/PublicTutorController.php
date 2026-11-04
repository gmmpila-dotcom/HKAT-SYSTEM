<?php

namespace App\Http\Controllers;

use App\Models\TutorProfile;
use Inertia\Inertia;
use Inertia\Response;

class PublicTutorController extends Controller
{
    private const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    public function index(): Response
    {
        $tutors = TutorProfile::with('user:id,name')
            ->where('is_verified', true)
            ->whereHas('user', function ($query) {
                $query->where('role', 'tutor');
            })
            ->get()
            ->map(function ($profile) {
                return [
                    'id' => $profile->id,
                    'name' => $profile->user->name,
                    'photo' => $profile->photo_path,
                    'credential' => $profile->credential,
                    'subjects' => $profile->specializations ?? [],
                    'categories' => $profile->categories ?? [],
                ];
            });

        return Inertia::render('Tutors', [
            'tutors' => $tutors,
        ]);
    }

    public function show(TutorProfile $tutorProfile): Response
    {
        $tutorProfile->load('user:id,name,role');

        if (! $tutorProfile->is_verified || $tutorProfile->user?->role !== 'tutor') {
            abort(404);
        }

        $reviews = $tutorProfile->reviews()
            ->with('parent:id,name')
            ->latest()
            ->get()
            ->map(fn ($review) => [
                'rating' => $review->rating,
                'comment' => $review->comment,
                'reviewer' => $review->parent?->name,
                'created_at' => $review->created_at,
            ]);

        return Inertia::render('TutorProfile', [
            'tutor' => [
                'id' => $tutorProfile->id,
                'name' => $tutorProfile->user->name,
                'photo' => $tutorProfile->photo_path,
                'credential' => $tutorProfile->credential,
                'bio' => $tutorProfile->bio,
                'subjects' => $tutorProfile->specializations ?? [],
                'categories' => $tutorProfile->categories ?? [],
                'experience' => $tutorProfile->experience ?? [],
                'years_experience' => $tutorProfile->years_experience,
                'availability' => $this->week($tutorProfile->availability),
                'portfolio' => $this->list($tutorProfile->portfolio),
                'reviews' => $reviews,
                'review_count' => $reviews->count(),
                'average_rating' => round((float) $reviews->avg('rating'), 2),
            ],
        ]);
    }

    private function list($raw): array
    {
        if (is_array($raw)) {
            return $raw;
        }

        $decoded = json_decode((string) $raw, true);

        return is_array($decoded) ? $decoded : [];
    }

    private function week($raw): array
    {
        $data = $this->list($raw);
        $week = [];

        foreach (self::DAYS as $day) {
            $week[$day] = array_values(array_filter((array) ($data[$day] ?? []), 'is_string'));
        }

        return $week;
    }
}