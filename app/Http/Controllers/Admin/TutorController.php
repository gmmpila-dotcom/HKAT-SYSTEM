<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TutorController extends Controller
{
    public function index(): Response
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        return Inertia::render('Admin/Tutors/Index', [
            'tutors' => TutorProfile::with('user:id,name,email')->get(),
            'status' => session('status'),
            'temporaryPassword' => session('temporary_password'),
        ]);
    }

    public function create(): Response
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        return Inertia::render('Admin/Tutors/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')],
            'bio' => ['nullable', 'string'],
            'specializations' => ['nullable', 'string'],
            'years_experience' => ['nullable', 'string', 'max:50'],
        ]);

        $tempPassword = Str::random(10);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $tempPassword,
            'role' => 'tutor',
            'email_verified_at' => now(),
        ]);

        $specs = $validated['specializations']
            ? array_map('trim', explode(',', $validated['specializations']))
            : [];

        TutorProfile::create([
            'user_id' => $user->id,
            'bio' => $validated['bio'],
            'specializations' => $specs,
            'years_experience' => $validated['years_experience'],
            'is_verified' => true,
            'rating' => null,
        ]);

        return redirect()
            ->route('admin.tutors.index')
            ->with('status', 'tutor-added')
            ->with('temporary_password', $tempPassword);
    }

    public function toggleVerified(TutorProfile $tutorProfile): RedirectResponse
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        $tutorProfile->is_verified = ! $tutorProfile->is_verified;
        $tutorProfile->save();

        return redirect()->back();
    }
}
