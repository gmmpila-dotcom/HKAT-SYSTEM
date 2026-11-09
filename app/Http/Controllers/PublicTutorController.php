<?php

namespace App\Http\Controllers;

use App\Models\TutorProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicTutorController extends Controller
{
    private const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    public function index(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->guest(route('login'));
        }

        if ($user->role === 'admin') {
            return redirect()->route('admin.tutors.index');
        }

        if ($user->role === 'tutor') {
            return redirect()->route('tutor.dashboard');
        }

        return redirect('/parent/book');
    }

    public function show(Request $request, TutorProfile $tutorProfile): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->guest(route('login'));
        }

        if (! in_array($user->role, ['parent', 'admin'], true)) {
            abort(403);
        }

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
                'bio' => $tutorProfile->bio,
                'subjects' => $tutorProfile->specializations ?? [],
                'categories' => $tutorProfile->categories ?? [],
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