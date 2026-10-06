<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class StudentProfileController extends Controller
{
    /**
     * Display the logged-in parent's student profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403, 'Unauthorized action.');
        }

        // Get the student profile, or create a default empty one if it doesn't exist.
        $profile = $user->studentProfile ?: $user->studentProfile()->create([
            'student_name' => '',
            'grade_level' => '',
            'birthdate' => null,
            'notes' => '',
        ]);

        return Inertia::render('Parent/EditProfile', [
            'profile' => $profile,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the logged-in parent's student profile.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'student_name' => ['required', 'string', 'max:255'],
            'grade_level' => ['required', 'string', 'max:255'],
            'birthdate' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $profile = $user->studentProfile ?: $user->studentProfile()->create();

        // Save fields
        $profile->update([
            'student_name' => $validated['student_name'] ?? '',
            'grade_level' => $validated['grade_level'] ?? '',
            'birthdate' => $validated['birthdate'] ?? null,
            'notes' => $validated['notes'] ?? '',
        ]);

        return Redirect::route('parent.profile.edit')->with('status', 'profile-updated');
    }
}
