<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TutorApplicationController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('TutorApply');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'specializations' => ['nullable', 'string', 'max:1000'],
            'years_experience' => ['nullable', 'string', 'max:50'],
            'cover_letter' => ['nullable', 'string', 'max:5000'],
        ]);

        Application::create([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'specializations' => $validated['specializations']
                ? array_map('trim', explode(',', $validated['specializations']))
                : [],
            'years_experience' => $validated['years_experience'] ?? null,
            'cover_letter' => $validated['cover_letter'] ?? null,
            'status' => 'new',
        ]);

        return redirect()->route('tutor.apply')->with('status', 'application-submitted');
    }
}
