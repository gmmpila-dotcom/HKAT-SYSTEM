<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\TutoringSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        if ($request->user()->role !== 'admin') {
            abort(403);
        }

        $sessionStatusCounts = TutoringSession::query()
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $paymentTotals = Payment::query()
            ->select('status', DB::raw('sum(amount) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('Admin/Reports/Index', [
            'totalSessions' => TutoringSession::count(),
            'confirmedSessions' => $sessionStatusCounts->get('confirmed', 0),
            'completedSessions' => $sessionStatusCounts->get('completed', 0),
            'sessionStatusCounts' => $sessionStatusCounts,
            'paidRevenue' => $paymentTotals->get('paid', 0),
            'pendingRevenue' => $paymentTotals->get('pending', 0),
            'paymentTotals' => $paymentTotals,
        ]);
    }
}
