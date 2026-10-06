<?php

use App\Http\Controllers\Admin\ApplicationController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SessionController;
use App\Http\Controllers\Admin\TutorController;
use App\Http\Controllers\PublicTutorController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Parent\BillingController;
use App\Http\Controllers\Parent\BookingController;
use App\Http\Controllers\Parent\DashboardController;
use App\Http\Controllers\Parent\PaymentController;
use App\Http\Controllers\Parent\ProgressController;
use App\Http\Controllers\Parent\ReviewController;
use App\Http\Controllers\PayMongoWebhookController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentProfileController;
use App\Http\Controllers\Tutor\StudentController;
use App\Http\Controllers\TutorApplicationController;
use App\Http\Controllers\TutorProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Landing');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/admin/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');

    Route::get('/admin/tutors', [TutorController::class, 'index'])->name('admin.tutors.index');
    Route::get('/admin/tutors/create', [TutorController::class, 'create'])->name('admin.tutors.create');
    Route::post('/admin/tutors', [TutorController::class, 'store'])->name('admin.tutors.store');
    Route::patch('/admin/tutors/{tutorProfile}/toggle-verified', [TutorController::class, 'toggleVerified'])->name('admin.tutors.toggle-verified');

    Route::get('/admin/sessions', [SessionController::class, 'index'])->name('admin.sessions.index');
    Route::get('/admin/reports', [ReportController::class, 'index'])->name('admin.reports.index');
    Route::get('/admin/applications', [ApplicationController::class, 'index'])->name('admin.applications.index');
    Route::patch('/admin/applications/{application}/approve', [ApplicationController::class, 'approve'])->name('admin.applications.approve');
    Route::patch('/admin/applications/{application}/reject', [ApplicationController::class, 'reject'])->name('admin.applications.reject');
    Route::patch('/admin/payments/{payment}/mark-paid', [SessionController::class, 'markAsPaid'])->name('admin.payments.mark-paid');
    Route::patch('/admin/sessions/{session}/confirm', [SessionController::class, 'confirm'])->name('admin.sessions.confirm');
    Route::patch('/admin/sessions/{session}/complete', [SessionController::class, 'complete'])->name('admin.sessions.complete');
    Route::patch('/admin/sessions/{session}/cancel', [SessionController::class, 'cancel'])->name('admin.sessions.cancel');

    Route::get('/tutor/dashboard', [TutorProfileController::class, 'dashboard'])->name('tutor.dashboard');

    Route::get('/tutor/students', [StudentController::class, 'index'])->name('tutor.students.index');
    Route::post('/tutor/students/{studentProfile}/notes', [StudentController::class, 'storeNote'])->name('tutor.students.notes.store');

    Route::get('/tutor/profile', [TutorProfileController::class, 'edit'])->name('tutor.profile.edit');
    Route::patch('/tutor/profile', [TutorProfileController::class, 'update'])->name('tutor.profile.update');

    Route::get('/parent/dashboard', [DashboardController::class, 'index'])->name('parent.dashboard');

    Route::get('/parent/book', [BookingController::class, 'create'])->name('parent.booking.create');
    Route::post('/parent/book', [BookingController::class, 'store'])->name('parent.booking.store');
    Route::get('/parent/book/rate', [BookingController::class, 'calculateRate'])->name('parent.booking.rate');
    Route::get('/parent/book/match', [BookingController::class, 'match'])->name('parent.booking.match');

    Route::get('/parent/progress', [ProgressController::class, 'index'])->name('parent.progress.index');

    Route::get('/parent/billing', [BillingController::class, 'index'])->name('parent.billing.index');
    Route::post('/parent/payments/{payment}/checkout', [PaymentController::class, 'checkout'])->name('parent.payments.checkout');
    Route::get('/parent/payments/{payment}/success', [PaymentController::class, 'success'])->name('parent.payments.success');
    Route::get('/parent/payments/{payment}/cancel', [PaymentController::class, 'cancel'])->name('parent.payments.cancel');

    Route::get('/parent/profile', [StudentProfileController::class, 'edit'])->name('parent.profile.edit');
    Route::patch('/parent/profile', [StudentProfileController::class, 'update'])->name('parent.profile.update');
    Route::post('/parent/sessions/{session}/review', [ReviewController::class, 'store'])->name('parent.sessions.review');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
    Route::post('/messages', [MessageController::class, 'store'])->name('messages.store');
    Route::get('/messages/{conversation}', [MessageController::class, 'show'])->name('messages.show');
    Route::post('/messages/{conversation}', [MessageController::class, 'send'])->name('messages.send');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/terms-of-service', function () {
    return Inertia::render('TermsOfService');
})->name('terms.show');

Route::get('/tutor/apply', [TutorApplicationController::class, 'create'])->name('tutor.apply');
Route::post('/tutor/apply', [TutorApplicationController::class, 'store'])->name('tutor.apply.store');

Route::get('/tutors', [PublicTutorController::class, 'index'])->name('tutors.index');

Route::get('/tutors/{tutorProfile}', [PublicTutorController::class, 'show'])->name('tutors.show');

require __DIR__.'/auth.php';

Route::post('/webhooks/paymongo', PayMongoWebhookController::class)->name('webhooks.paymongo');
