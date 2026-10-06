<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProgressController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        $students = StudentProfile::where('parent_id', $user->id)
            ->with([
                'progressNotes' => function ($query) {
                    $query->with('tutor:id,name')->orderBy('created_at', 'desc');
                },
                'sessions' => function ($query) {
                    $query->with('tutor:id,name')->orderBy('session_date', 'desc');
                },
            ])
            ->get();

        return Inertia::render('Parent/Progress/Index', [
            'students' => $students,
        ]);
    }
}
