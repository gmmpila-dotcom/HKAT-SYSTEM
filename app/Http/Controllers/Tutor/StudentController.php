<?php

namespace App\Http\Controllers\Tutor;

use App\Http\Controllers\Controller;
use App\Models\ProgressNote;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->role !== 'tutor') {
            abort(403);
        }

        $studentIds = TutoringSession::where('tutor_id', $user->id)
            ->distinct()
            ->pluck('student_profile_id');

        $students = StudentProfile::whereIn('id', $studentIds)
            ->with(['progressNotes' => function ($query) use ($user) {
                $query->where('tutor_id', $user->id)->orderBy('created_at', 'desc');
            }])
            ->get();

        return Inertia::render('Tutor/Students/Index', [
            'students' => $students,
        ]);
    }

    public function storeNote(Request $request, StudentProfile $studentProfile): RedirectResponse
    {
        $user = $request->user();

        if ($user->role !== 'tutor') {
            abort(403);
        }

        $hasTaught = TutoringSession::where('tutor_id', $user->id)
            ->where('student_profile_id', $studentProfile->id)
            ->exists();

        if (! $hasTaught) {
            abort(403);
        }

        $validated = $request->validate([
            'note' => ['required', 'string', 'max:2000'],
        ]);

        ProgressNote::create([
            'student_profile_id' => $studentProfile->id,
            'tutor_id' => $user->id,
            'note' => $validated['note'],
        ]);

        return redirect()->back()->with('status', 'note-added');
    }
}
