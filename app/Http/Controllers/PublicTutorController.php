<?php

namespace App\Http\Controllers;

use App\Models\TutorProfile;
use Inertia\Inertia;
use Inertia\Response;

class PublicTutorController extends Controller
{
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
                'reviews' => $reviews,
                'average_rating' => round((float) $reviews->avg('rating'), 2),
            ],
        ]);
    }
}
