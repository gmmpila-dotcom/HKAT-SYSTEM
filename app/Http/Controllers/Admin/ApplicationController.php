<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);

        return Inertia::render('Admin/Applications/Index', [
            'applications' => Application::latest()->get(),
            'status' => session('status'),
            'temporaryPassword' => session('temporary_password'),
        ]);
    }

    public function approve(Request $request, Application $application): RedirectResponse
    {
        $this->authorizeAdmin($request);

        if (User::where('email', $application->email)->exists()) {
            throw ValidationException::withMessages([
                'application' => 'A user account already exists for this email address.',
            ]);
        }

        $temporaryPassword = Str::random(10);

        DB::transaction(function () use ($application, $temporaryPassword): void {
            $user = User::create([
                'name' => $application->full_name,
                'email' => $application->email,
                'password' => $temporaryPassword,
                'role' => 'tutor',
                'email_verified_at' => now(),
            ]);

            TutorProfile::create([
                'user_id' => $user->id,
                'bio' => $application->cover_letter,
                'specializations' => $application->specializations ?? [],
                'years_experience' => $application->years_experience,
                'is_verified' => true,
            ]);

            $application->update(['status' => 'approved']);
        });

        return redirect()
            ->back()
            ->with('status', 'application-approved')
            ->with('temporary_password', $temporaryPassword);
    }

    public function reject(Request $request, Application $application): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $application->update(['status' => 'rejected']);

        return redirect()->back()->with('status', 'application-rejected');
    }

    private function authorizeAdmin(Request $request): void
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }
    }
}
