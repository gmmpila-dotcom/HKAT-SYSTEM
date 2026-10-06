<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\TutoringSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    public function store(Request $request, TutoringSession $session): RedirectResponse
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        if ($session->status !== 'completed' || ! $session->studentProfile()->where('parent_id', $user->id)->exists()) {
            abort(403);
        }

        if ($session->review()->exists()) {
            throw ValidationException::withMessages([
                'review' => 'This session already has a review.',
            ]);
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        Review::create([
            'session_id' => $session->id,
            'parent_id' => $user->id,
            'tutor_id' => $session->tutor_id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        return redirect()->back()->with('status', 'review-submitted');
    }
}
