<?php

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
    Route::get('/admin/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/admin/schedule', [\App\Http\Controllers\Admin\ScheduleController::class, 'index'])->name('admin.schedule.index');
    Route::get('/admin/students', [\App\Http\Controllers\Admin\StudentController::class, 'index'])->name('admin.students.index');
    Route::get('/admin/payments', [\App\Http\Controllers\Admin\PaymentController::class, 'index'])->name('admin.payments.index');
    Route::get('/admin/auto-assign/pending', [\App\Http\Controllers\Admin\AutoAssignController::class, 'pending'])->name('admin.autoassign.pending');
    Route::get('/admin/sessions/{session}/suggestions', [\App\Http\Controllers\Admin\AutoAssignController::class, 'suggest'])->name('admin.sessions.suggestions');
    Route::patch('/admin/sessions/{session}/assign', [\App\Http\Controllers\Admin\AutoAssignController::class, 'assign'])->name('admin.sessions.assign');
    Route::get('/admin/reports/overview', [\App\Http\Controllers\Admin\ReportOverviewController::class, 'index'])->name('admin.reports.overview');
    Route::patch('/admin/tutors/{tutorProfile}', [\App\Http\Controllers\Admin\TutorDirectoryController::class, 'update'])->name('admin.tutors.update');
    Route::put('/admin/tutor-rates/{user}', [\App\Http\Controllers\Admin\TutorRateController::class, 'update'])->name('admin.tutor-rates.update');
    Route::delete('/admin/tutor-rates/{user}', [\App\Http\Controllers\Admin\TutorRateController::class, 'destroy'])->name('admin.tutor-rates.destroy');
    Route::patch('/admin/payments/{payment}/mark-cash', [\App\Http\Controllers\Admin\CashPaymentController::class, 'store'])->name('admin.payments.cash');
    Route::delete('/admin/tutors/{tutorProfile}', [\App\Http\Controllers\Admin\TutorDirectoryController::class, 'destroy'])->name('admin.tutors.destroy');

    Route::get('/admin/tutors', [\App\Http\Controllers\Admin\TutorDirectoryController::class, 'index'])->name('admin.tutors.index');
    Route::get('/admin/tutors/create', [TutorController::class, 'create'])->name('admin.tutors.create');
    Route::post('/admin/tutors', [\App\Http\Controllers\Admin\TutorDirectoryController::class, 'store'])->name('admin.tutors.store');
    Route::patch('/admin/tutors/{tutorProfile}/toggle-verified', [TutorController::class, 'toggleVerified'])->name('admin.tutors.toggle-verified');

    Route::get('/admin/sessions', [SessionController::class, 'index'])->name('admin.sessions.index');
    Route::get('/admin/reports', [ReportController::class, 'index'])->name('admin.reports.index');
    Route::patch('/admin/payments/{payment}/mark-paid', [SessionController::class, 'markAsPaid'])->name('admin.payments.mark-paid');
    Route::patch('/admin/sessions/{session}/confirm', [SessionController::class, 'confirm'])->name('admin.sessions.confirm');
    Route::patch('/admin/sessions/{session}/complete', [SessionController::class, 'complete'])->name('admin.sessions.complete');
    Route::patch('/admin/sessions/{session}/cancel', [SessionController::class, 'cancel'])->name('admin.sessions.cancel');

    Route::get('/tutor/dashboard', [TutorProfileController::class, 'dashboard'])->name('tutor.dashboard');
    Route::get('/tutor/schedule', [\App\Http\Controllers\Tutor\ScheduleController::class, 'index'])->name('tutor.schedule.index');
    Route::patch('/tutor/availability', [\App\Http\Controllers\Tutor\MyProfileController::class, 'updateAvailability'])->name('tutor.availability.update');
    Route::post('/tutor/portfolio', [\App\Http\Controllers\Tutor\MyProfileController::class, 'storePortfolio'])->name('tutor.portfolio.store');
    Route::delete('/tutor/portfolio/{index}', [\App\Http\Controllers\Tutor\MyProfileController::class, 'destroyPortfolio'])->whereNumber('index')->name('tutor.portfolio.destroy');

    Route::get('/tutor/students', [\App\Http\Controllers\Tutor\StudentDirectoryController::class, 'index'])->name('tutor.students.index');
    Route::post('/tutor/students/{studentProfile}/notes', [StudentController::class, 'storeNote'])->name('tutor.students.notes.store');

    Route::get('/tutor/profile', [\App\Http\Controllers\Tutor\MyProfileController::class, 'show'])->name('tutor.profile.edit');
    Route::patch('/tutor/profile', [TutorProfileController::class, 'update'])->name('tutor.profile.update');

    Route::get('/parent/dashboard', [DashboardController::class, 'index'])->name('parent.dashboard');

    Route::get('/parent/book', [BookingController::class, 'create'])->name('parent.booking.create');
    Route::post('/parent/book', [BookingController::class, 'store'])->name('parent.booking.store');
    Route::get('/parent/book/rate', [BookingController::class, 'calculateRate'])->name('parent.booking.rate');
    Route::get('/parent/book/availability', [BookingController::class, 'availability'])->name('parent.booking.availability');
    Route::get('/parent/book/match', [BookingController::class, 'match'])->name('parent.booking.match');

    Route::get('/parent/progress', [ProgressController::class, 'index'])->name('parent.progress.index');

    Route::get('/parent/billing', [BillingController::class, 'index'])->name('parent.billing.index');
    Route::get('/parent/receipts/{payment}', [\App\Http\Controllers\Parent\ReceiptController::class, 'show'])->name('parent.receipts.show');
    Route::get('/parent/gallery', [\App\Http\Controllers\Parent\GalleryController::class, 'index'])->name('parent.gallery.index');
    Route::get('/online/{session}', [\App\Http\Controllers\OnlineSessionController::class, 'show'])->name('online.show');
    Route::post('/online/{session}/end', [\App\Http\Controllers\OnlineSessionController::class, 'end'])->name('online.end');
    Route::post('/parent/payments/{payment}/tip', [\App\Http\Controllers\Parent\PaymentFlowController::class, 'tip'])->name('parent.payments.tip');
    Route::post('/parent/payments/{payment}/demo-pay', [\App\Http\Controllers\Parent\PaymentFlowController::class, 'demoPay'])->name('parent.payments.demo');
    Route::patch('/parent/payment-method', [\App\Http\Controllers\Parent\PaymentFlowController::class, 'method'])->name('parent.payment-method.update');
    Route::post('/parent/payments/{payment}/cash-request', [\App\Http\Controllers\Parent\PaymentFlowController::class, 'cashRequest'])->name('parent.payments.cash-request');
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


Route::get('/tutors', [PublicTutorController::class, 'index'])->name('tutors.index');

Route::get('/tutors/{tutorProfile}', [PublicTutorController::class, 'show'])->name('tutors.show');

require __DIR__.'/auth.php';

Route::post('/webhooks/paymongo', PayMongoWebhookController::class)->name('webhooks.paymongo');
