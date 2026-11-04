<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Models\TutoringSession;
use App\Models\TutorProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        $studentIds = StudentProfile::where('parent_id', $user->id)->pluck('id');

        $tutorIds = TutoringSession::whereIn('student_profile_id', $studentIds)
            ->where('status', '!=', 'cancelled')
            ->pluck('tutor_id')
            ->unique();

        $items = [];

        foreach (TutorProfile::with('user:id,name')->whereIn('user_id', $tutorIds)->get() as $profile) {
            $raw = $profile->portfolio;
            $list = is_array($raw) ? $raw : json_decode((string) $raw, true);

            foreach (is_array($list) ? $list : [] as $item) {
                if (empty($item['path'])) {
                    continue;
                }

                $items[] = [
                    'path' => $item['path'],
                    'title' => $item['title'] ?? null,
                    'tag' => $item['tag'] ?? null,
                    'tutor' => $profile->user?->name,
                ];
            }
        }

        return Inertia::render('Parent/Gallery', ['items' => $items]);
    }
}