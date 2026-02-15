<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\InstructorController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\AttendanceController;

// Auth Routes (Public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    // Profile
    Route::get('/profile', function () {
        return request()->user()->load(['student.department', 'instructor.department']);
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Admin-only routes (Course creation, user management, system-wide access)
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
        
        // Student management - ADMIN ONLY  
        Route::apiResource('students', StudentController::class);
        Route::post('/students/{id}/reset-password', [StudentController::class, 'resetPassword']);
        Route::post('/students/change-first-login-password', [StudentController::class, 'changeFirstLoginPassword']);
        
        // Instructor management - ADMIN ONLY
        Route::apiResource('instructors', InstructorController::class);
        Route::post('/instructors/{id}/reset-password', [InstructorController::class, 'resetPassword']);
        Route::put('/instructors/{id}/toggle-status', [InstructorController::class, 'toggleStatus']);
        Route::post('/instructors/{id}/assign-courses', [InstructorController::class, 'assignCourses']);
        Route::get('/instructors/{id}/assigned-courses', [InstructorController::class, 'getAssignedCourses']);
        Route::put('/instructors/{id}/archive', [InstructorController::class, 'archive']);
        Route::get('/instructors/stats/overview', [InstructorController::class, 'getInstructorStats']);
        
        // Department management - ADMIN ONLY
        Route::apiResource('departments', DepartmentController::class);
        Route::put('/departments/{id}/toggle-status', [DepartmentController::class, 'toggleStatus']);
        Route::get('/departments/stats/overview', [DepartmentController::class, 'getDepartmentStats']);
        Route::post('/departments/{id}/assign-head', [DepartmentController::class, 'assignHead']);
        Route::get('/departments/{id}/performance', [DepartmentController::class, 'getPerformanceMetrics']);
        
        // Reports - ADMIN ONLY
        Route::get('/reports/student-enrollment', [ReportController::class, 'studentEnrollment']);
        Route::get('/reports/course-assignments', [ReportController::class, 'courseAssignments']);
        Route::get('/reports/department-summary', [ReportController::class, 'departmentSummary']);
        Route::get('/reports/system-analytics', [ReportController::class, 'systemAnalytics']);
        Route::get('/reports/student/{studentId}/transcript', [ReportController::class, 'studentTranscript']);
        Route::get('/reports/course/{courseId}/performance', [ReportController::class, 'coursePerformance']);
        Route::get('/reports/department/{departmentId}/performance', [ReportController::class, 'departmentPerformance']);
        Route::get('/reports/instructor/{instructorId}/performance', [ReportController::class, 'instructorPerformance']);
        
        // Grade finalization - ADMIN FINALIZES GRADES (Step 7)
        Route::get('/admin/pending-grades', [GradeController::class, 'adminPendingGrades']);
        Route::put('/admin/grades/{gradeId}/finalize', [GradeController::class, 'adminFinalize']);
    });

    // Course Management Routes - Admin and Department can create/manage
    Route::middleware('role:admin,department')->group(function () {
        Route::apiResource('courses', CourseController::class);
        Route::post('/courses/{id}/assign-instructor', [CourseController::class, 'assignInstructor']);
        Route::delete('/courses/{courseId}/instructors/{instructorId}', [CourseController::class, 'removeInstructor']);
        Route::post('/courses/{id}/enroll-student', [CourseController::class, 'enrollStudent']);
    });
    
    // Course Viewing - All authenticated users
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{id}', [CourseController::class, 'show']);

    // Department Routes (Department Head access)
    Route::middleware('role:department')->group(function () {
        Route::get('/department/dashboard', [DepartmentController::class, 'dashboard']);
        Route::get('/department/pending-enrollments', [DepartmentController::class, 'allPendingEnrollments']);
        Route::get('/department/courses', [DepartmentController::class, 'courses']);
        // Department heads can create courses for their department
        Route::post('/department/courses', [DepartmentController::class, 'addCourse']);
        Route::get('/department/instructors', [DepartmentController::class, 'getDepartmentInstructors']);
        Route::get('/department/students', [DepartmentController::class, 'getDepartmentStudents']);
        
        // Enrollment management
        Route::put('/courses/{courseId}/students/{studentId}/approve',
            [DepartmentController::class, 'approveEnrollment']
        );
        Route::put('/courses/{courseId}/students/{studentId}/reject',
            [DepartmentController::class, 'rejectEnrollment']
        );
        Route::get('/courses/{courseId}/pending-enrollments',
            [DepartmentController::class, 'pendingEnrollments']
        );
        
        // Instructor assignment - REMOVED DUPLICATE ROUTE
        // Use the general /courses/{id}/assign-instructor endpoint instead
        Route::delete('/courses/{courseId}/instructors/{instructorId}',
            [DepartmentController::class, 'removeInstructor']
        );
        
        // Grade approval - Department heads approve grades (Step 6)
        Route::get('/department/pending-grades', [GradeController::class, 'departmentPendingGrades']);
        Route::put('/department/grades/{gradeId}/approve', [GradeController::class, 'departmentApprove']);
        
        // Attendance statistics
        Route::get('/department/attendance/stats', [AttendanceController::class, 'departmentStats']);
    });

    // Student Routes
    Route::middleware('role:student')->group(function () {
        Route::get('/student/dashboard', [StudentController::class, 'dashboard']);
        
        // Profile management
        Route::get('/student/profile', [StudentController::class, 'myProfile']);
        Route::put('/student/profile', [StudentController::class, 'updateMyProfile']);
        
        // Course registration (Step 3)
        Route::get('/student/available-courses', [CourseController::class, 'availableCourses']);
        Route::post('/student/enroll/{courseId}', [StudentController::class, 'requestEnrollment']);
        Route::get('/student/enrolled-courses', [StudentController::class, 'enrolledCourses']);
        
        // View final grades (Step 8)
        Route::get('/student/grades', [GradeController::class, 'studentGrades']);
        
        // View attendance
        Route::get('/student/attendance', [AttendanceController::class, 'studentAttendance']);
        
        Route::get('/students/{id}/profile', [StudentController::class, 'viewProfile']);
        Route::get('/students/{id}/grades', [StudentController::class, 'viewGrades']);
    });

    // Instructor Routes (Teaching and grade entry only)
    Route::middleware('role:instructor')->group(function () {
        Route::get('/instructor/dashboard', [InstructorController::class, 'dashboard']);
        
        // Course teaching (Step 4)
        Route::get('/instructor/courses', [InstructorController::class, 'myCourses']);
        Route::get('/instructor/courses/{courseId}/students', [InstructorController::class, 'courseStudents']);
        Route::get('/instructors/{id}/courses', [InstructorController::class, 'assignedCourses']);
        
        // Grade entry and submission (Step 5)
        Route::post('/instructor/grades', [GradeController::class, 'store']);
        Route::put('/instructor/grades/{gradeId}', [GradeController::class, 'update']);
        Route::put('/instructor/grades/{gradeId}/submit', [GradeController::class, 'submitGrade']);
        Route::get('/instructor/courses/{courseId}/grades', [GradeController::class, 'courseGrades']);
        
        // Attendance management
        Route::post('/instructor/attendance', [AttendanceController::class, 'store']);
        Route::post('/instructor/attendance/bulk', [AttendanceController::class, 'bulkStore']);
        Route::put('/instructor/attendance/{attendanceId}', [AttendanceController::class, 'update']);
        Route::get('/instructor/courses/{courseId}/attendance', [AttendanceController::class, 'courseAttendance']);
    });
});
