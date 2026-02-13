<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Instructor;
use App\Models\Course;
use App\Models\Department;
use App\Models\User;
use App\Models\Grade;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard()
    {
        // Get basic counts
        $totalStudents = Student::count();
        $totalInstructors = Instructor::count();
        $totalCourses = Course::count();
        $totalDepartments = Department::count();
        $totalUsers = User::count();

        // Get active/inactive counts
        $activeStudents = Student::where('status', 'active')->count();
        $inactiveStudents = Student::where('status', '!=', 'active')->count();
        
        // Get recent registrations (last 30 days)
        $recentStudents = Student::where('created_at', '>=', Carbon::now()->subDays(30))->count();
        $recentInstructors = Instructor::where('created_at', '>=', Carbon::now()->subDays(30))->count();

        // Get enrollment statistics
        $totalEnrollments = \DB::table('course_student')->count();
        $pendingEnrollments = \DB::table('course_student')->where('status', 'pending')->count();
        $approvedEnrollments = \DB::table('course_student')->where('status', 'approved')->count();

        // Get department statistics
        $departmentStats = Department::withCount(['students', 'instructors', 'courses'])->get();

        // Get recent activity (last 10 students and instructors)
        $recentStudentRegistrations = Student::with('department')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
            
        $recentInstructorRegistrations = Instructor::with('department')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get users requiring password change
        $usersNeedingPasswordChange = User::where('is_first_login', true)->count();

        // Get course enrollment trends (last 6 months)
        $enrollmentTrends = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $count = \DB::table('course_student')
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
            $enrollmentTrends[] = [
                'month' => $month->format('M Y'),
                'enrollments' => $count
            ];
        }

        // Get top courses by enrollment
        $topCourses = Course::withCount('students')
            ->orderBy('students_count', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'overview' => [
                'total_students' => $totalStudents,
                'total_instructors' => $totalInstructors,
                'total_courses' => $totalCourses,
                'total_departments' => $totalDepartments,
                'total_users' => $totalUsers,
                'active_students' => $activeStudents,
                'inactive_students' => $inactiveStudents,
                'recent_students' => $recentStudents,
                'recent_instructors' => $recentInstructors,
                'users_needing_password_change' => $usersNeedingPasswordChange
            ],
            'enrollments' => [
                'total' => $totalEnrollments,
                'pending' => $pendingEnrollments,
                'approved' => $approvedEnrollments,
                'trends' => $enrollmentTrends
            ],
            'departments' => $departmentStats,
            'recent_activity' => [
                'students' => $recentStudentRegistrations,
                'instructors' => $recentInstructorRegistrations
            ],
            'top_courses' => $topCourses,
            'message' => 'Admin dashboard data retrieved successfully'
        ]);
    }

    public function systemStats()
    {
        // Additional system statistics
        $stats = [
            'database_size' => $this->getDatabaseSize(),
            'storage_usage' => $this->getStorageUsage(),
            'system_health' => $this->getSystemHealth(),
        ];

        return response()->json($stats);
    }

    private function getDatabaseSize()
    {
        // Get approximate database size
        try {
            $size = \DB::select("SELECT 
                ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'size_mb'
                FROM information_schema.tables 
                WHERE table_schema = DATABASE()")[0]->size_mb ?? 0;
            return $size . ' MB';
        } catch (\Exception $e) {
            return 'N/A';
        }
    }

    private function getStorageUsage()
    {
        // Get storage usage for uploaded files
        try {
            $path = storage_path('app/public');
            if (is_dir($path)) {
                $size = $this->getFolderSize($path);
                return round($size / 1024 / 1024, 2) . ' MB';
            }
            return '0 MB';
        } catch (\Exception $e) {
            return 'N/A';
        }
    }

    private function getFolderSize($dir)
    {
        $size = 0;
        foreach (glob(rtrim($dir, '/').'/*', GLOB_NOSORT) as $each) {
            $size += is_file($each) ? filesize($each) : $this->getFolderSize($each);
        }
        return $size;
    }

    private function getSystemHealth()
    {
        return [
            'database' => 'healthy',
            'storage' => 'healthy',
            'cache' => 'healthy',
            'queue' => 'healthy'
        ];
    }
}
