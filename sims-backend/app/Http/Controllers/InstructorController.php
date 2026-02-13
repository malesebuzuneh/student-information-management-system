<?php

namespace App\Http\Controllers;

use App\Models\Instructor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class InstructorController extends Controller
{
    public function index()
    {
        return Instructor::with(['department', 'user'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:instructors|unique:users',
            'phone' => 'nullable|string|max:20',
            'department_id' => 'required|exists:departments,id',
            'qualification' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,archived'
        ]);

        // Generate a temporary password for the instructor
        $temporaryPassword = Str::random(8);

        // Generate unique instructor ID using department code
        $department = \App\Models\Department::find($request->department_id);
        $departmentCode = $department ? $department->code : 'INS';
        $instructorId = Instructor::generateInstructorId($departmentCode, date('y'));
        
        // Generate username from instructor ID (e.g., INS/10001/26 → ins10001)
        $baseUsername = strtolower(str_replace(['/', '-'], '', $instructorId));
        $username = $baseUsername;
        $counter = 1;
        
        // Ensure username is unique
        while (User::where('username', $username)->exists()) {
            $username = $baseUsername . $counter;
            $counter++;
        }

        // Create user account for the instructor
        $user = User::create([
            'name' => $request->name,
            'username' => $username,
            'email' => $request->email,
            'password' => Hash::make($temporaryPassword),
            'role' => 'instructor',
            'is_first_login' => true,
            'status' => $request->status ?? 'active',
        ]);

        // Create instructor record linked to the user
        $instructor = Instructor::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'instructor_id' => $instructorId,
            'department_id' => $request->department_id,
            'qualification' => $request->qualification,
            'status' => $request->status ?? 'active',
            'is_first_login' => true,
            'user_id' => $user->id
        ]);

        // Load relationships for response
        $instructor->load(['department', 'user']);

        // Return instructor data with temporary password
        return response()->json([
            'instructor' => $instructor,
            'temporary_password' => $temporaryPassword,
            'instructor_id' => $instructorId,
            'username' => $username,
            'message' => 'Instructor registered successfully. Login credentials created.'
        ]);
    }

    public function show($id)
    {
        return Instructor::with(['department', 'user'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $instructor = Instructor::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:instructors,email,' . $id . '|unique:users,email,' . $instructor->user_id,
            'phone' => 'nullable|string|max:20',
            'department_id' => 'required|exists:departments,id',
            'qualification' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,archived'
        ]);

        // Update instructor record
        $instructor->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'department_id' => $request->department_id,
            'qualification' => $request->qualification,
            'status' => $request->status ?? $instructor->status,
        ]);

        // Update associated user record
        if ($instructor->user) {
            $instructor->user->update([
                'name' => $request->name,
                'email' => $request->email,
                'status' => ($request->status === 'active') ? 'active' : 'inactive',
            ]);
        }

        return response()->json([
            'instructor' => $instructor->load(['department', 'user', 'courses']),
            'message' => 'Instructor updated successfully'
        ]);
    }

    public function destroy($id)
    {
        $instructor = Instructor::findOrFail($id);
        
        // Delete associated user account
        if ($instructor->user) {
            $instructor->user->delete();
        }
        
        $instructor->delete();
        
        return ['message' => 'Instructor and associated user account deleted'];
    }

    public function assignedCourses($id)
    {
        $instructor = Instructor::with('courses')->findOrFail($id);
        return $instructor->courses;
    }

    // Instructor Dashboard
    public function dashboard()
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }
        
        $instructor = $user->instructor;

        if (!$instructor) {
            return response()->json([
                'error' => 'Instructor profile not found',
                'debug' => [
                    'user_id' => $user->id,
                    'user_role' => $user->role,
                    'user_name' => $user->name,
                    'instructor_exists' => false
                ]
            ], 404);
        }

        try {
            // Get assigned courses with student counts
            $assignedCourses = $instructor->courses()->withCount('students')->with(['department', 'students'])->get();
            
            // Get total students across all courses
            $totalStudents = $assignedCourses->sum('students_count');
            
            // Get recent grades entered
            $recentGrades = \App\Models\Grade::whereIn('course_id', $assignedCourses->pluck('id'))
                ->with(['student', 'course'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            // Get attendance statistics
            $attendanceStats = [
                'total_sessions' => \App\Models\Attendance::whereIn('course_id', $assignedCourses->pluck('id'))
                    ->select('date', 'course_id')
                    ->distinct()
                    ->count(),
                'students_present_today' => \App\Models\Attendance::whereIn('course_id', $assignedCourses->pluck('id'))
                    ->where('date', now()->toDateString())
                    ->where('status', 'present')
                    ->count(),
                'average_attendance' => $this->calculateAverageAttendance($assignedCourses->pluck('id'))
            ];

            // Get upcoming classes (mock data for now)
            $upcomingClasses = [
                [
                    'course' => 'CS101 - Introduction to Programming',
                    'time' => '09:00 AM',
                    'room' => 'Room 205',
                    'date' => now()->addDays(1)->toDateString(),
                    'students_enrolled' => 25
                ],
                [
                    'course' => 'CS201 - Data Structures',
                    'time' => '02:00 PM', 
                    'room' => 'Room 301',
                    'date' => now()->addDays(1)->toDateString(),
                    'students_enrolled' => 30
                ]
            ];

            // Get pending tasks
            $pendingTasks = [
                [
                    'task' => 'Grade Assignment 2 submissions',
                    'course' => 'CS101',
                    'due_date' => now()->addDays(2)->toDateString(),
                    'priority' => 'high',
                    'count' => 25
                ],
                [
                    'task' => 'Update attendance for last week',
                    'course' => 'CS201',
                    'due_date' => now()->addDays(1)->toDateString(),
                    'priority' => 'medium',
                    'count' => 3
                ]
            ];

            // Get course performance summary
            $coursePerformance = [];
            foreach ($assignedCourses as $course) {
                $grades = \App\Models\Grade::where('course_id', $course->id)->get();
                $averageGrade = $grades->count() > 0 ? $this->calculateAverageGradePoint($grades) : 0;
                
                $coursePerformance[] = [
                    'course' => $course,
                    'average_grade' => round($averageGrade, 2),
                    'total_grades' => $grades->count(),
                    'students_enrolled' => $course->students_count
                ];
            }

            return response()->json([
                'instructor' => $instructor->load(['department', 'user']),
                'overview' => [
                    'total_courses' => $assignedCourses->count(),
                    'total_students' => $totalStudents,
                    'total_grades_entered' => $recentGrades->count(),
                    'attendance_sessions' => $attendanceStats['total_sessions']
                ],
                'assigned_courses' => $assignedCourses,
                'recent_grades' => $recentGrades,
                'attendance_stats' => $attendanceStats,
                'upcoming_classes' => $upcomingClasses,
                'pending_tasks' => $pendingTasks,
                'course_performance' => $coursePerformance,
                'message' => 'Instructor dashboard data retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to load dashboard data',
                'message' => $e->getMessage(),
                'debug' => [
                    'instructor_id' => $instructor->id,
                    'instructor_name' => $instructor->name,
                    'line' => $e->getLine(),
                    'file' => $e->getFile()
                ]
            ], 500);
        }
    }

    private function calculateAverageAttendance($courseIds)
    {
        if ($courseIds->isEmpty()) return 0;

        // Get total unique sessions (date + course_id combinations)
        $totalSessions = \App\Models\Attendance::whereIn('course_id', $courseIds)
            ->select('date', 'course_id')
            ->distinct()
            ->count();
            
        $presentSessions = \App\Models\Attendance::whereIn('course_id', $courseIds)
            ->where('status', 'present')
            ->count();

        return $totalSessions > 0 ? round(($presentSessions / $totalSessions) * 100, 1) : 0;
    }

    private function calculateAverageGradePoint($grades)
    {
        $totalPoints = 0;
        $count = 0;

        foreach ($grades as $grade) {
            $points = $this->convertGradeToPoint($grade->grade);
            $totalPoints += $points;
            $count++;
        }

        return $count > 0 ? $totalPoints / $count : 0;
    }

    private function convertGradeToPoint($grade)
    {
        $gradePoints = [
            'A+' => 4.0, 'A' => 4.0, 'A-' => 3.7,
            'B+' => 3.3, 'B' => 3.0, 'B-' => 2.7,
            'C+' => 2.3, 'C' => 2.0, 'C-' => 1.7,
            'D+' => 1.3, 'D' => 1.0, 'F' => 0.0
        ];

        return $gradePoints[$grade] ?? 0.0;
    }

    // Get instructor's assigned courses
    public function myCourses()
    {
        $user = auth()->user();
        $instructor = $user->instructor;

        if (!$instructor) {
            return response()->json(['error' => 'Instructor profile not found'], 404);
        }

        $courses = $instructor->courses()
            ->withCount('students')
            ->with(['department', 'students'])
            ->get();

        return response()->json([
            'courses' => $courses,
            'message' => 'Instructor courses retrieved successfully'
        ]);
    }

    // Get students in a specific course
    public function courseStudents($courseId)
    {
        $user = auth()->user();
        $instructor = $user->instructor;

        if (!$instructor) {
            return response()->json(['error' => 'Instructor profile not found'], 404);
        }

        // Verify instructor teaches this course
        $course = $instructor->courses()->findOrFail($courseId);
        
        $students = $course->students()
            ->with(['department', 'user'])
            ->withPivot('status', 'created_at')
            ->where('course_student.status', 'approved')
            ->get();

        return response()->json([
            'course' => $course,
            'students' => $students,
            'message' => 'Course students retrieved successfully'
        ]);
    }

    // Reset instructor password
    public function resetPassword(Request $request, $id)
    {
        $instructor = Instructor::findOrFail($id);
        
        if (!$instructor->user) {
            return response()->json(['error' => 'No user account found for this instructor'], 404);
        }

        $newPassword = Str::random(8);
        $instructor->user->update([
            'password' => Hash::make($newPassword),
            'is_first_login' => true, // Force password change on next login
        ]);

        $instructor->update(['is_first_login' => true]);

        return response()->json([
            'message' => 'Password reset successfully',
            'new_password' => $newPassword
        ]);
    }

    // Activate/Deactivate instructor
    public function toggleStatus(Request $request, $id)
    {
        $instructor = Instructor::findOrFail($id);
        
        $newStatus = $request->status; // 'active', 'inactive', 'archived'
        
        $instructor->update(['status' => $newStatus]);
        
        // Also update user status if exists
        if ($instructor->user) {
            $instructor->user->update([
                'status' => $newStatus === 'active' ? 'active' : 'inactive'
            ]);
        }

        return response()->json([
            'message' => "Instructor {$newStatus} successfully",
            'instructor' => $instructor->load(['department', 'user'])
        ]);
    }

    // Assign courses to instructor
    public function assignCourses(Request $request, $id)
    {
        $request->validate([
            'course_ids' => 'required|array',
            'course_ids.*' => 'exists:courses,id',
            'semester' => 'required|integer|min:1|max:2',
            'academic_year' => 'required|string'
        ]);

        $instructor = Instructor::findOrFail($id);
        
        // Detach existing courses for this semester/year combination
        $instructor->courses()->wherePivot('semester', $request->semester)
                            ->wherePivot('academic_year', $request->academic_year)
                            ->detach();
        
        // Attach new courses with semester and academic year
        $courseData = [];
        foreach ($request->course_ids as $courseId) {
            $courseData[$courseId] = [
                'semester' => $request->semester,
                'academic_year' => $request->academic_year,
                'created_at' => now(),
                'updated_at' => now()
            ];
        }
        
        $instructor->courses()->attach($courseData);

        return response()->json([
            'message' => 'Courses assigned successfully',
            'instructor' => $instructor->load(['courses', 'department', 'user']),
            'assigned_courses' => $instructor->courses()->wherePivot('semester', $request->semester)
                                                    ->wherePivot('academic_year', $request->academic_year)
                                                    ->get()
        ]);
    }

    // Get instructor's assigned courses
    public function getAssignedCourses($id)
    {
        $instructor = Instructor::with(['courses' => function($query) {
            $query->withPivot('semester', 'academic_year', 'created_at');
        }])->findOrFail($id);

        return response()->json([
            'instructor' => $instructor,
            'assigned_courses' => $instructor->courses,
            'message' => 'Assigned courses retrieved successfully'
        ]);
    }

    // Archive instructor (soft delete)
    public function archive($id)
    {
        $instructor = Instructor::findOrFail($id);
        
        $instructor->update([
            'status' => 'archived',
            'archived_at' => now()
        ]);
        
        // Deactivate user account but don't delete
        if ($instructor->user) {
            $instructor->user->update(['status' => 'inactive']);
        }

        return response()->json([
            'message' => 'Instructor archived successfully',
            'instructor' => $instructor->load(['department', 'user'])
        ]);
    }

    // Get instructor statistics for admin
    public function getInstructorStats()
    {
        $stats = [
            'total_instructors' => Instructor::count(),
            'active_instructors' => Instructor::where('status', 'active')->count(),
            'inactive_instructors' => Instructor::where('status', 'inactive')->count(),
            'archived_instructors' => Instructor::where('status', 'archived')->count(),
            'instructors_with_courses' => Instructor::whereHas('courses')->count(),
            'instructors_without_courses' => Instructor::whereDoesntHave('courses')->count(),
            'recent_registrations' => Instructor::where('created_at', '>=', now()->subDays(30))->count(),
        ];

        return response()->json([
            'stats' => $stats,
            'message' => 'Instructor statistics retrieved successfully'
        ]);
    }
}
