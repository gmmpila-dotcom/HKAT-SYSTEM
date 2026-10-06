<?php

namespace App\Http\Controllers;

use App\Models\TutoringSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class TutorProfileController extends Controller
{
    /**
     * Display the logged-in tutor's dashboard with upcoming sessions.
     */
    public function dashboard(Request $request): Response
    {
        $user = $request->user();

        if ($user->role !== 'tutor') {
            abort(403, 'Unauthorized action.');
        }

        $sessions = TutoringSession::where('tutor_id', $user->id)
            ->with('studentProfile')
            ->orderBy('session_date')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('Tutor/Dashboard', [
            'sessions' => $sessions,
        ]);
    }

    /**
     * Display the logged-in tutor's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        if ($user->role !== 'tutor') {
            abort(403, 'Unauthorized action.');
        }

        // Get the tutor profile, or create a default empty one if it doesn't exist.
        $profile = $user->tutorProfile ?: $user->tutorProfile()->create([
            'bio' => '',
            'specializations' => [],
            'years_experience' => '',
        ]);

        return Inertia::render('Tutor/EditProfile', [
            'profile' => $profile,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the logged-in tutor's profile.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->role !== 'tutor') {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'bio' => ['nullable', 'string'],
            'specializations' => ['nullable', 'array'],
            'specializations.*' => ['string'],
            'years_experience' => ['nullable', 'string', 'max:255'],
        ]);

        $profile = $user->tutorProfile ?: $user->tutorProfile()->create();

        // Save fields
        $profile->update([
            'bio' => $validated['bio'] ?? '',
            'specializations' => $validated['specializations'] ?? [],
            'years_experience' => $validated['years_experience'] ?? '',
        ]);

        return Redirect::route('tutor.profile.edit')->with('status', 'profile-updated');
    }
}
