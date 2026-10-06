<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        $payments = Payment::whereHas('session.studentProfile', function ($query) use ($user) {
            $query->where('parent_id', $user->id);
        })
            ->with(['session' => function ($query) {
                $query->with(['studentProfile:id,student_name', 'tutor:id,name']);
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        $totalDue = $payments->where('status', 'pending')->sum('amount');
        $totalPaid = $payments->where('status', 'paid')->sum('amount');

        return Inertia::render('Parent/Billing/Index', [
            'payments' => $payments,
            'totalDue' => $totalDue,
            'totalPaid' => $totalPaid,
            'flashStatus' => session('status'),
        ]);
    }
}
