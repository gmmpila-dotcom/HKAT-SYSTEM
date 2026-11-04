<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        $sessions = TutoringSession::whereHas('studentProfile', function ($query) use ($user) {
            $query->where('parent_id', $user->id);
        })
            ->with([
                'studentProfile:id,parent_id,student_name',
                'tutor:id,name',
                'tutor.tutorProfile:id,user_id,photo_path',
                'payment:id,session_id,status,paid_at',
                'review:id,session_id,rating,comment',
            ])
            ->orderByDesc('session_date')
            ->orderBy('start_time')
            ->get();

        $students = StudentProfile::where('parent_id', $user->id)
            ->with(['progressNotes' => fn ($q) => $q->with('tutor:id,name')->latest()])
            ->get(['id', 'student_name', 'grade_level']);

        return Inertia::render('Parent/Dashboard', [
            'sessions' => $sessions,
            'students' => $students,
            'flashStatus' => session('status'),
        ]);
    }
}