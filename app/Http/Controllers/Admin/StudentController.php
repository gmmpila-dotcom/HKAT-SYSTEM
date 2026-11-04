<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $students = StudentProfile::with([
            'parent:id,name,phone',
            'sessions' => fn ($query) => $query->with('tutor:id,name')->orderByDesc('session_date'),
        ])
            ->orderBy('student_name')
            ->get()
            ->map(function (StudentProfile $student): array {
                $sessions = $student->sessions->where('status', '!=', 'cancelled');
                $latest = $sessions->first();

                return [
                    'id' => $student->id,
                    'name' => $student->student_name,
                    'grade' => $student->grade_level,
                    'subjects' => $sessions->pluck('subject')->unique()->values()->all(),
                    'tutor' => $latest?->tutor?->name,
                    'completed' => $sessions->where('status', 'completed')->count(),
                    'total' => $sessions->count(),
                    'parent' => $student->parent?->name,
                    'phone' => $student->parent?->phone,
                ];
            })
            ->values();

        return Inertia::render('Admin/Students/Index', ['students' => $students]);
    }
}