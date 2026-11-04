<?php

namespace App\Http\Controllers\Tutor;

use App\Http\Controllers\Controller;
use App\Models\TutorProfile;
use App\Models\TutoringSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MyProfileController extends Controller
{
    private const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    private const MAX_PORTFOLIO = 12;

    public function show(Request $request): Response
    {
        $user = $this->tutor($request);
        $profile = TutorProfile::firstOrCreate(['user_id' => $user->id]);

        $reviews = TutoringSession::with(['review', 'studentProfile.parent:id,name'])
            ->where('tutor_id', $user->id)
            ->whereHas('review')
            ->get()
            ->map(fn ($session) => [
                'id' => $session->review->id,
                'name' => $session->studentProfile?->parent?->name ?? 'Parent',
                'rating' => (int) $session->review->rating,
                'comment' => $session->review->comment,
                'date' => $session->review->created_at?->toDateString(),
            ])
            ->sortByDesc('date')
            ->values();

        return Inertia::render('Tutor/EditProfile', [
            'profile' => [
                'id' => $profile->id,
                'name' => $user->name,
                'email' => $user->email,
                'photo' => $profile->photo_path,
                'credential' => $profile->credential,
                'bio' => $profile->bio,
                'years_experience' => $profile->years_experience,
                'specializations' => $profile->specializations ?? [],
                'categories' => $profile->categories ?? [],
                'experience' => $profile->experience ?? [],
                'verified' => (bool) $profile->is_verified,
                'availability' => $this->week($profile->availability),
                'portfolio' => $this->readJson($profile->portfolio),
            ],
            'reviews' => $reviews,
            'rating' => [
                'average' => $reviews->count() > 0 ? round((float) $reviews->avg('rating'), 1) : null,
                'count' => $reviews->count(),
            ],
            'status' => session('status'),
        ]);
    }

    public function updateAvailability(Request $request): RedirectResponse
    {
        $user = $this->tutor($request);

        $validated = $request->validate([
            'availability' => ['required', 'array'],
            'availability.*' => ['nullable', 'array', 'max:8'],
            'availability.*.*' => ['required', 'date_format:H:i'],
        ]);

        $clean = [];
        foreach (self::DAYS as $day) {
            $clean[$day] = collect($validated['availability'][$day] ?? [])->unique()->sort()->values()->all();
        }

        $this->save($user->id, ['availability' => json_encode($clean)]);

        return redirect()->route('tutor.profile.edit')->with('status', 'availability-updated');
    }

    public function storePortfolio(Request $request): RedirectResponse
    {
        $user = $this->tutor($request);

        $validated = $request->validate([
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'title' => ['nullable', 'string', 'max:80'],
            'tag' => ['nullable', 'string', 'max:40'],
        ]);

        $profile = TutorProfile::firstOrCreate(['user_id' => $user->id]);
        $items = $this->readJson($profile->portfolio);

        if (count($items) >= self::MAX_PORTFOLIO) {
            throw ValidationException::withMessages([
                'image' => 'You can keep up to '.self::MAX_PORTFOLIO.' portfolio images. Remove one first.',
            ]);
        }

        $directory = public_path('images/portfolio');
        if (! is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        $file = $request->file('image');
        $name = $user->id.'-'.Str::random(12).'.'.strtolower($file->getClientOriginalExtension());
        $file->move($directory, $name);

        $items[] = [
            'path' => '/images/portfolio/'.$name,
            'title' => $validated['title'] ?? null,
            'tag' => $validated['tag'] ?? null,
        ];

        $this->save($user->id, ['portfolio' => json_encode(array_values($items))]);

        return redirect()->route('tutor.profile.edit')->with('status', 'portfolio-updated');
    }

    public function destroyPortfolio(Request $request, int $index): RedirectResponse
    {
        $user = $this->tutor($request);
        $profile = TutorProfile::firstOrCreate(['user_id' => $user->id]);
        $items = $this->readJson($profile->portfolio);

        if (! isset($items[$index])) {
            abort(404);
        }

        $path = $items[$index]['path'] ?? '';
        if (is_string($path) && str_starts_with($path, '/images/portfolio/')) {
            $full = public_path(ltrim($path, '/'));
            if (is_file($full)) {
                @unlink($full);
            }
        }

        array_splice($items, $index, 1);
        $this->save($user->id, ['portfolio' => json_encode(array_values($items))]);

        return redirect()->route('tutor.profile.edit')->with('status', 'portfolio-updated');
    }

    private function tutor(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'tutor') {
            abort(403);
        }

        return $user;
    }

    private function save(int $userId, array $values): void
    {
        DB::table('tutor_profiles')->where('user_id', $userId)->update($values + ['updated_at' => now()]);
    }

    private function readJson($value): array
    {
        if (is_array($value)) {
            return $value;
        }

        $decoded = json_decode((string) $value, true);

        return is_array($decoded) ? $decoded : [];
    }

    private function week($raw): array
    {
        $data = $this->readJson($raw);
        $week = [];

        foreach (self::DAYS as $day) {
            $week[$day] = array_values(array_filter((array) ($data[$day] ?? []), 'is_string'));
        }

        return $week;
    }
}