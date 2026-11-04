<?php

namespace App\Http\Controllers\Tutor;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentDirectoryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->role !== 'tutor') {
            abort(403);
        }

        $students = StudentProfile::whereHas('sessions', fn ($query) => $query->where('tutor_id', $user->id))
            ->with([
                'parent:id,name,phone',
                'progressNotes' => fn ($query) => $query->with('tutor:id,name')->orderByDesc('created_at'),
                'sessions' => fn ($query) => $query->where('tutor_id', $user->id)->where('status', '!=', 'cancelled'),
            ])
            ->orderBy('student_name')
            ->get()
            ->map(function (StudentProfile $student) use ($user): array {
                $notes = $student->progressNotes
                    ->filter(fn ($note) => (int) ($note->tutor?->id) === (int) $user->id)
                    ->values();

                return [
                    'id' => $student->id,
                    'student_name' => $student->student_name,
                    'grade_level' => $student->grade_level,
                    'subjects' => $student->sessions->pluck('subject')->unique()->values()->all(),
                    'parent_name' => $student->parent?->name,
                    'parent_phone' => $student->parent?->phone,
                    'progress_notes' => $notes->map(fn ($note) => [
                        'id' => $note->id,
                        'note' => $note->note,
                        'created_at' => $note->created_at?->toIso8601String(),
                    ])->all(),
                ];
            })
            ->values();

        return Inertia::render('Tutor/Students/Index', ['students' => $students]);
    }
}