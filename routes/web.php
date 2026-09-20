<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CourseProfileController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\ClassRegistrationController;
use App\Http\Controllers\BatchController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FacilitatorStatusController;
use App\Http\Controllers\CommitteeInviteController;
use App\Http\Controllers\GraduationItemController;
use App\Http\Controllers\ClassEnrollmentController;
use App\Http\Controllers\ReminderController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/dashboard');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

    Route::middleware('auth')->group(function () {
    
        Route::post('/whitelist', [CommitteeInviteController::class, 'store'])->name('committee_invite.store');
        Route::patch('/whitelist/{invite}', [CommitteeInviteController::class, 'update'])->name('committee_invite.update');
        Route::get('/whitelist/{invite}/reveal-password', [CommitteeInviteController::class, 'revealPassword'])
            ->name('committee_invite.reveal_password');
            
        Route::get('/course-profile', [CourseProfileController::class, 'index'])
            ->name('course_profile');
        Route::post('/course-profile', [CourseProfileController::class, 'store'])
            ->name('course_profile.store');
        Route::put('/course-profile/{courseProfile}', [CourseProfileController::class, 'update'])
            ->name('course_profile.update');
        Route::delete('/course-profile/{courseProfile}', [CourseProfileController::class, 'destroy'])
            ->name('course_profile.destroy');
        Route::get('/course-profile/{courseProfile}/facilitators', [CourseProfileController::class, 'facilitators'])
            ->name('course_profile.facilitators');

        Route::post('/student', [UserController::class, 'storeStudent'])->name('student.store');

        Route::get('/class', [ClassController::class, 'index'])->name('class');
        Route::post('/class', [ClassController::class, 'store'])->name('class.store');
        Route::put('/class/{class}', [ClassController::class, 'update'])->name('class.update');
        Route::delete('/class/{class}', [ClassController::class, 'destroy'])->name('class.destroy');
        Route::get('/class/{class}', [ClassController::class, 'show'])->name('class.show');


        Route::post('/class/{class}/attendance-record', [ClassController::class, 'uploadAttendanceRecord'])->name('class.upload_attendance_record');

        Route::patch('/class/{class}/graduation-date', [GraduationItemController::class, 'updateClassDate'])->name('graduation_item.update_date');
        Route::post('/class/{class}/graduation-items', [GraduationItemController::class, 'store'])->name('graduation_item.store');
        Route::delete('/graduation-items/{graduationItem}', [GraduationItemController::class, 'destroy'])->name('graduation_item.destroy');

        Route::patch('/class-enrollments/{enrollment}/status', [ClassEnrollmentController::class, 'updateStatus'])->name('class_enrollment.update_status');
        Route::post('/class-enrollments/{enrollment}/receipt', [ClassEnrollmentController::class, 'uploadReceipt'])->name('class_enrollment.upload_receipt');

        Route::patch('/class-enrollments/{enrollment}/testimonial', [ClassEnrollmentController::class, 'updateTestimonial'])
            ->name('class_enrollment.update_testimonial');

        Route::get('/batch', [BatchController::class, 'index'])->name('batch');
        Route::post('/batch', [BatchController::class, 'store'])->name('batch.store');
        Route::put('/batch/{batch}', [BatchController::class, 'update'])->name('batch.update');
        Route::get('/batch/{batch}', [BatchController::class, 'show'])->name('batch.show');
        Route::delete('/batch/{batch}', [BatchController::class, 'destroy'])
            ->name('batch.destroy');

        Route::post('/class-registration/import', [ClassRegistrationController::class, 'import'])
            ->name('class_registration.import')
            ->withoutMiddleware([VerifyCsrfToken::class]);
        Route::get('/class-registration', [ClassRegistrationController::class, 'index'])
            ->name('class_registration.index');
        Route::post('/batch/{batch}/registrations', [ClassRegistrationController::class, 'storeManual'])
            ->name('class_registration.store_manual');
        Route::post('/batch/{batch}/registrations/bulk-approve', [ClassRegistrationController::class, 'bulkApprove'])
            ->name('class_registration.bulk_approve');
        Route::patch('/class-registration/{registration}/reject', [ClassRegistrationController::class, 'reject'])
            ->name('class_registration.reject');
        Route::post('/batch/{batch}/registrations/bulk-reject', [ClassRegistrationController::class, 'bulkReject'])
            ->name('class_registration.bulk_reject');
        Route::post('/batch/{batch}/registrations/import-excel', [ClassRegistrationController::class, 'importExcel'])
            ->name('class_registration.import_excel');

        Route::post('/user/{student}/facilitator-status', [FacilitatorStatusController::class, 'markForStudent'])
            ->name('facilitator_status.mark_for_student');
        Route::post('/course-profile/{courseProfile}/facilitator-status', [FacilitatorStatusController::class, 'markForCourse'])
            ->name('facilitator_status.mark_for_course');
        Route::patch('/facilitator-status/{facilitatorStatus}', [FacilitatorStatusController::class, 'update'])
            ->name('facilitator_status.update');
        Route::delete('/facilitator-status/{facilitatorStatus}', [FacilitatorStatusController::class, 'destroy'])
            ->name('facilitator_status.destroy');
        Route::get('/facilitator-status/potential', [FacilitatorStatusController::class, 'potential'])
            ->name('facilitator_status.potential');
        Route::get('/facilitator-status/potential/export', [FacilitatorStatusController::class, 'exportPotential'])
            ->name('facilitator_status.potential_export');

        Route::get('/user/search', [UserController::class, 'search'])->name('user.search');
        Route::get('/user', [UserController::class, 'index'])->name('user');
        Route::get('/user/{user}', [UserController::class, 'show'])->name('user.show');
        Route::delete('/user/{user}', [UserController::class, 'destroy'])->name('user.destroy');

        Route::get('/reminder', [ReminderController::class, 'index'])->name('reminder');
        Route::post('/reminder', [ReminderController::class, 'store'])->name('reminder.store');
        Route::put('/reminder/{reminder}', [ReminderController::class, 'update'])->name('reminder.update');
        Route::delete('/reminder/{reminder}', [ReminderController::class, 'destroy'])->name('reminder.destroy');
        Route::get('/reminder-next-due', [ReminderController::class, 'nextDue'])->name('reminder.next_due');
        Route::get('/reminder-notifications', [ReminderController::class, 'notifications'])->name('reminder.notifications');

        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    }
);

require __DIR__.'/auth.php';
