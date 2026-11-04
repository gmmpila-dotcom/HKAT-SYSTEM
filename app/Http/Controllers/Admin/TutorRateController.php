<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TutorRateController extends Controller
{
    public function update(Request $request, User $user): RedirectResponse
    {
        $this->guard($request, $user);

        $request->validate([
            'bands' => ['nullable', 'array'],
            'bands.*.regular' => ['nullable', 'numeric', 'min:0', 'max:100000'],
            'bands.*.core' => ['nullable', 'numeric', 'min:0', 'max:100000'],
            'special' => ['nullable', 'numeric', 'min:0', 'max:100000'],
            'home' => ['nullable', 'numeric', 'min:0', 'max:100000'],
        ]);

        $rates = ['bands' => []];

        foreach (config('rates.bands') as $band) {
            foreach (['regular', 'core'] as $key) {
                $value = $request->input('bands.'.$band['min'].'.'.$key);

                if ($value !== null && $value !== '') {
                    $rates['bands'][$band['min']][$key] = round((float) $value, 2);
                }
            }
        }

        foreach (['special', 'home'] as $key) {
            $value = $request->input($key);

            if ($value !== null && $value !== '') {
                $rates[$key] = round((float) $value, 2);
            }
        }

        if ($rates['bands'] === []) {
            unset($rates['bands']);
        }

        if ($rates === []) {
            DB::table('tutor_rate_cards')->where('user_id', $user->id)->delete();

            return back()->with('status', 'rates-reset');
        }

        DB::table('tutor_rate_cards')->updateOrInsert(
            ['user_id' => $user->id],
            ['rates' => json_encode($rates), 'updated_at' => now(), 'created_at' => now()],
        );

        return back()->with('status', 'rates-saved');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->guard($request, $user);

        DB::table('tutor_rate_cards')->where('user_id', $user->id)->delete();

        return back()->with('status', 'rates-reset');
    }

    private function guard(Request $request, User $user): void
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        if ($user->role !== 'tutor') {
            abort(404);
        }
    }
}