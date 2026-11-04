<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\StudentProfile;
use App\Models\TutorProfile;
use App\Models\TutoringSession;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $now = now();
        $weekStart = $now->copy()->startOfWeek(Carbon::SUNDAY)->toDateString();
        $weekEnd = $now->copy()->endOfWeek(Carbon::SATURDAY)->toDateString();

        $with = [
            'studentProfile:id,parent_id,student_name,grade_level',
            'studentProfile.parent:id,name',
            'tutor:id,name',
            'tutor.tutorProfile:id,user_id,photo_path',
            'payment:id,session_id,amount,status',
        ];

        $todaySessions = TutoringSession::with($with)
            ->whereDate('session_date', $now->toDateString())
            ->where('status', '!=', 'cancelled')
            ->orderBy('start_time')
            ->get();

        $pendingRequests = TutoringSession::with($with)
            ->where('status', 'pending')
            ->orderBy('session_date')
            ->orderBy('start_time')
            ->get();

        $weekSessions = TutoringSession::where('status', '!=', 'cancelled')
            ->whereDate('session_date', '>=', $weekStart)
            ->whereDate('session_date', '<=', $weekEnd);

        $stats = [
            'revenueMonth' => (float) Payment::where('status', 'paid')
                ->whereBetween('paid_at', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])
                ->sum('amount'),
            'pendingAmount' => (float) Payment::where('status', 'pending')->sum('amount'),
            'activeStudents' => StudentProfile::count(),
            'newStudents' => StudentProfile::where('created_at', '>=', $now->copy()->startOfMonth())->count(),
            'activeTutors' => TutorProfile::where('is_verified', true)->count(),
            'awaitingTutors' => TutorProfile::where('is_verified', false)->count(),
            'sessionsThisWeek' => (clone $weekSessions)->count(),
            'weekPending' => (clone $weekSessions)->where('status', 'pending')->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'todaySessions' => $todaySessions,
            'pendingRequests' => $pendingRequests,
            'stats' => $stats,
        ]);
    }
}