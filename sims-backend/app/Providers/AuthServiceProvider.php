<?php

namespace App\Providers;

use App\Models\Student;
use App\Models\Instructor;
use App\Models\Course;
use App\Models\Department;
use App\Models\Grade;
use App\Models\Attendance;
use App\Policies\StudentPolicy;
use App\Policies\InstructorPolicy;
use App\Policies\CoursePolicy;
use App\Policies\DepartmentPolicy;
use App\Policies\GradePolicy;
use App\Policies\AttendancePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Student::class => StudentPolicy::class,
        Instructor::class => InstructorPolicy::class,
        Course::class => CoursePolicy::class,
        Department::class => DepartmentPolicy::class,
        Grade::class => GradePolicy::class,
        Attendance::class => AttendancePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Define additional gates if needed
        Gate::define('manage-system', function ($user) {
            return $user->role === 'admin';
        });

        Gate::define('manage-department', function ($user) {
            return in_array($user->role, ['admin', 'department']);
        });

        Gate::define('teach-courses', function ($user) {
            return in_array($user->role, ['admin', 'instructor']);
        });

        Gate::define('enroll-courses', function ($user) {
            return in_array($user->role, ['admin', 'student']);
        });

        Gate::define('view-reports', function ($user) {
            return in_array($user->role, ['admin', 'department', 'instructor']);
        });
    }
}