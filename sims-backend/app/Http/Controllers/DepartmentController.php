<?php

namespace App\Http\Controllers;
use App\Models\Instructor;
use App\Models\Department;
use App\Models\Student;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DepartmentController extends Controller
{
    // Assign instructor(s) to a course
    public function assignInstructor(Request $request, $courseId)
    {
        $request->validate([
            'instructor_ids' => 'required|array',
            'instructor_ids.*' => 'exists:instructors,id'
        ]);

        $course = Course::findOrFail($courseId);
        
        // Check if user can access this course's department
        if (!$this->canAccessDepartment($course->department_id)) {
            return response()->json(['error' => 'Access denied to this department'], 403);
        }

        // Attach multiple instructors to the course
        $course->instructors()->syncWithoutDetaching($request->instructor_ids);

        return response()->json([
            'course' => $course->load('instructors'),
            'message' => 'Instructors assigned successfully'
        ]);
    }

    // Remove an instructor from a course
    public function removeInstructor($courseId, $instructorId)
    {
        $course = Course::findOrFail($courseId);
        
        // Check if user can access this course's department
        if (!$this->canAccessDepartment($course->department_id)) {
            return response()->json(['error' => 'Access denied to this department'], 403);
        }
        
        $course->instructors()->detach($instructorId);

        return response()->json([
            'course' => $course->load('instructors'),
            'message' => 'Instructor removed successfully'
        ]);
    }

    // Approve student enrollment
    public function approveEnrollment($courseId, $studentId)
    {
        $course = Course::findOrFail($courseId);
        
        // Check if user can access this course's department
        if (!$this->canAccessDepartment($course->department_id)) {
            return response()->json(['error' => 'Access denied to this department'], 403);
        }
        
        $student = \App\Models\Student::findOrFail($studentId);

        // Update enrollment status
        $course->students()->updateExistingPivot($studentId, [
            'status' => 'approved',
            'updated_at' => now()
        ]);

        return response()->json([
            'message' => 'Enrollment approved successfully',
            'student' => $student->name,
            'course' => $course->title
        ]);
    }

    // Reject student enrollment
    public function rejectEnrollment($courseId, $studentId)
    {
        $course = Course::findOrFail($courseId);
        
        // Check if user can access this course's department
        if (!$this->canAccessDepartment($course->department_id)) {
            return response()->json(['error' => 'Access denied to this department'], 403);
        }
        
        $student = \App\Models\Student::findOrFail($studentId);

        // Update enrollment status
        $course->students()->updateExistingPivot($studentId, [
            'status' => 'rejected',
            'updated_at' => now()
        ]);

        return response()->json([
            'message' => 'Enrollment rejected',
            'student' => $student->name,
            'course' => $course->title
        ]);
    }

    // Get pending enrollments for a course
    public function pendingEnrollments($courseId)
    {
        $course = Course::findOrFail($courseId);
        
        $pendingEnrollments = $course->students()
            ->wherePivot('status', 'pending')
            ->withPivot('created_at', 'status')
            ->with(['department'])
            ->get();

        return response()->json([
            'course' => $course,
            'pending_enrollments' => $pendingEnrollments,
            'message' => 'Pending enrollments retrieved successfully'
        ]);
    }

    // Get all pending enrollments across all courses (filtered by user's department)
    public function allPendingEnrollments()
    {
        $user = auth()->user();
        $query = \DB::table('course_student')
            ->join('students', 'course_student.student_id', '=', 'students.id')
            ->join('courses', 'course_student.course_id', '=', 'courses.id')
            ->join('departments', 'courses.department_id', '=', 'departments.id')
            ->where('course_student.status', 'pending');
            
        // Filter by user's department if not admin
        if ($user->role === 'department') {
            $userDepartment = $this->getUserDepartment();
            if (!$userDepartment) {
                return response()->json(['error' => 'No department assigned'], 403);
            }
            $query->where('courses.department_id', $userDepartment->id);
        }
        
        $pendingEnrollments = $query->select(
                'course_student.*',
                'students.name as student_name',
                'students.student_id',
                'students.email as student_email',
                'courses.title as course_title',
                'courses.code as course_code',
                'departments.name as department_name'
            )
            ->orderBy('course_student.created_at', 'desc')
            ->get();

        return response()->json([
            'pending_enrollments' => $pendingEnrollments,
            'count' => $pendingEnrollments->count(),
            'message' => 'Pending enrollments retrieved successfully'
        ]);
    }


    // Helper method to check if user can access a department
    private function canAccessDepartment($departmentId)
    {
        $user = auth()->user();
        
        // Admin can access all departments
        if ($user->role === 'admin') {
            return true;
        }
        
        // Department users can only access their own department
        if ($user->role === 'department') {
            // Check if user is linked to this department
            if ($user->department_id == $departmentId) {
                return true;
            }
            
            // Check if user is instructor head of this department
            if ($user->instructor) {
                $department = Department::where('head_instructor_id', $user->instructor->id)->first();
                if ($department && $department->id == $departmentId) {
                    return true;
                }
            }
        }
        
        return false;
    }

    // Get user's accessible department
    private function getUserDepartment()
    {
        $user = auth()->user();
        
        if ($user->role === 'department') {
            // Get department from user's department_id or from instructor relationship
            if ($user->department_id) {
                return Department::find($user->department_id);
            } elseif ($user->instructor) {
                return Department::where('head_instructor_id', $user->instructor->id)->first();
            }
        }
        
        return null;
    }

    // ADMIN DEPARTMENT MANAGEMENT METHODS

    public function index() 
    { 
        $departments = Department::withCount(['students', 'instructors', 'courses'])
                        ->with(['students', 'instructors', 'courses'])
                        ->get();
                        
        return response()->json([
            'data' => $departments,
            'message' => 'Departments retrieved successfully'
        ]);
    }

    public function store(Request $request) 
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:departments',
            'code' => 'required|string|max:10|unique:departments',
            'description' => 'nullable|string',
            'head_name' => 'nullable|string|max:255',
            'head_email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
            'established_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'status' => 'nullable|in:active,inactive'
        ]);

        $department = Department::create([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'head_name' => $request->head_name,
            'head_email' => $request->head_email,
            'phone' => $request->phone,
            'location' => $request->location,
            'established_year' => $request->established_year,
            'status' => $request->status ?? 'active'
        ]);

        // No automatic department head account creation
        // Admin will assign department heads manually from existing instructors

        return response()->json([
            'department' => $department->loadCount(['students', 'instructors', 'courses']),
            'message' => 'Department created successfully. You can now assign a department head from existing instructors.'
        ]);
    }

    public function show($id) 
    { 
        $department = Department::withCount(['students', 'instructors', 'courses'])
                                ->with(['students', 'instructors', 'courses'])
                                ->findOrFail($id);
        
        return response()->json([
            'department' => $department,
            'message' => 'Department details retrieved successfully'
        ]);
    }

    public function update(Request $request, $id) 
    {
        $department = Department::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,' . $id,
            'code' => 'required|string|max:10|unique:departments,code,' . $id,
            'description' => 'nullable|string',
            'head_name' => 'nullable|string|max:255',
            'head_email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
            'established_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'status' => 'nullable|in:active,inactive'
        ]);

        $department->update([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'head_name' => $request->head_name,
            'head_email' => $request->head_email,
            'phone' => $request->phone,
            'location' => $request->location,
            'established_year' => $request->established_year,
            'status' => $request->status ?? $department->status
        ]);

        return response()->json([
            'department' => $department->loadCount(['students', 'instructors', 'courses']),
            'message' => 'Department updated successfully'
        ]);
    }

    public function destroy($id) 
    {
        $department = Department::findOrFail($id);
        
        // Check if department has students, instructors, or courses
        $studentsCount = $department->students()->count();
        $instructorsCount = $department->instructors()->count();
        $coursesCount = $department->courses()->count();
        
        if ($studentsCount > 0 || $instructorsCount > 0 || $coursesCount > 0) {
            return response()->json([
                'error' => 'Cannot delete department with existing students, instructors, or courses',
                'details' => [
                    'students' => $studentsCount,
                    'instructors' => $instructorsCount,
                    'courses' => $coursesCount
                ]
            ], 422);
        }
        
        $department->delete();
        
        return response()->json([
            'message' => 'Department deleted successfully'
        ]);
    }

    // Toggle department status
    public function toggleStatus(Request $request, $id)
    {
        $department = Department::findOrFail($id);
        $newStatus = $request->status; // 'active' or 'inactive'
        
        $department->update(['status' => $newStatus]);
        
        return response()->json([
            'message' => "Department {$newStatus} successfully",
            'department' => $department->loadCount(['students', 'instructors', 'courses'])
        ]);
    }

    // Get department statistics
    public function getDepartmentStats()
    {
        try {
            $totalDepartments = Department::count();
            $activeDepartments = Department::where('status', 'active')->count();
            $inactiveDepartments = Department::where('status', 'inactive')->count();
            
            $stats = [
                'total_departments' => $totalDepartments,
                'active_departments' => $activeDepartments,
                'inactive_departments' => $inactiveDepartments,
                'departments_with_students' => Department::whereHas('students')->count(),
                'departments_with_instructors' => Department::whereHas('instructors')->count(),
                'departments_with_courses' => Department::whereHas('courses')->count(),
                'total_students_across_departments' => Student::count(),
                'total_instructors_across_departments' => Instructor::count(),
                'total_courses_across_departments' => Course::count(),
            ];

            // Department breakdown
            $departmentBreakdown = Department::withCount(['students', 'instructors', 'courses'])
                                            ->get()
                                            ->map(function ($dept) {
                                                return [
                                                    'name' => $dept->name,
                                                    'code' => $dept->code,
                                                    'students' => $dept->students_count,
                                                    'instructors' => $dept->instructors_count,
                                                    'courses' => $dept->courses_count,
                                                    'status' => $dept->status
                                                ];
                                            });

            return response()->json([
                'stats' => $stats,
                'department_breakdown' => $departmentBreakdown,
                'message' => 'Department statistics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve department statistics',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Assign head of department
    public function assignHead(Request $request, $id)
    {
        $request->validate([
            'instructor_id' => 'required|exists:instructors,id'
        ]);

        $department = Department::findOrFail($id);
        $instructor = Instructor::findOrFail($request->instructor_id);

        // Check if instructor has a linked user account
        if (!$instructor->user) {
            return response()->json([
                'error' => 'Instructor must have a user account to be assigned as department head',
                'message' => 'Please create a user account for this instructor first'
            ], 422);
        }

        // Remove department role from previous head if exists
        if ($department->head_instructor_id) {
            $previousHead = Instructor::find($department->head_instructor_id);
            if ($previousHead && $previousHead->user) {
                // Only remove department role if they're not head of another department
                $isHeadElsewhere = Department::where('head_instructor_id', $previousHead->id)
                                           ->where('id', '!=', $id)
                                           ->exists();
                
                if (!$isHeadElsewhere) {
                    $previousHead->user->update(['role' => 'instructor']);
                }
            }
        }

        // Update department with head information
        $department->update([
            'head_name' => $instructor->name,
            'head_email' => $instructor->email,
            'head_instructor_id' => $instructor->id
        ]);

        // Grant department access to the instructor's user account
        $instructor->user->update([
            'role' => 'department',
            'department_id' => $department->id // Add department_id to user if column exists
        ]);

        return response()->json([
            'message' => 'Department head assigned successfully. User now has department access.',
            'department' => $department->loadCount(['students', 'instructors', 'courses']),
            'head' => $instructor->load('user')
        ]);
    }

    // Get department performance metrics
    public function getPerformanceMetrics($id)
    {
        $department = Department::findOrFail($id);
        
        // Student performance in department courses
        $studentPerformance = DB::table('grades')
            ->join('courses', 'grades.course_id', '=', 'courses.id')
            ->where('courses.department_id', $id)
            ->selectRaw('
                COUNT(*) as total_grades,
                AVG(CASE 
                    WHEN grade IN ("A+", "A") THEN 4.0
                    WHEN grade = "A-" THEN 3.7
                    WHEN grade = "B+" THEN 3.3
                    WHEN grade = "B" THEN 3.0
                    WHEN grade = "B-" THEN 2.7
                    WHEN grade = "C+" THEN 2.3
                    WHEN grade = "C" THEN 2.0
                    WHEN grade = "C-" THEN 1.7
                    WHEN grade = "D+" THEN 1.3
                    WHEN grade = "D" THEN 1.0
                    ELSE 0.0
                END) as average_gpa,
                SUM(CASE WHEN grade IN ("A+", "A", "A-") THEN 1 ELSE 0 END) as excellent_grades,
                SUM(CASE WHEN grade IN ("B+", "B", "B-") THEN 1 ELSE 0 END) as good_grades,
                SUM(CASE WHEN grade IN ("C+", "C", "C-") THEN 1 ELSE 0 END) as average_grades,
                SUM(CASE WHEN grade IN ("D+", "D", "F") THEN 1 ELSE 0 END) as below_average_grades
            ')
            ->first();

        // Course enrollment statistics
        $courseStats = DB::table('course_student')
            ->join('courses', 'course_student.course_id', '=', 'courses.id')
            ->where('courses.department_id', $id)
            ->selectRaw('
                COUNT(*) as total_enrollments,
                COUNT(CASE WHEN status = "approved" THEN 1 END) as approved_enrollments,
                COUNT(CASE WHEN status = "pending" THEN 1 END) as pending_enrollments,
                COUNT(CASE WHEN status = "rejected" THEN 1 END) as rejected_enrollments
            ')
            ->first();

        // Instructor workload
        $instructorWorkload = Instructor::where('department_id', $id)
            ->withCount(['courses', 'students'])
            ->get();

        return response()->json([
            'department' => $department,
            'student_performance' => $studentPerformance,
            'course_statistics' => $courseStats,
            'instructor_workload' => $instructorWorkload,
            'message' => 'Department performance metrics retrieved successfully'
        ]);
    }

    // Department Dashboard
    public function dashboard()
    {
        $user = auth()->user();
        
        // Get the department this user heads
        $userDepartment = null;
        if ($user->role === 'department') {
            // Get department from user's department_id or from instructor relationship
            if ($user->department_id) {
                $userDepartment = Department::find($user->department_id);
            } elseif ($user->instructor) {
                $userDepartment = Department::where('head_instructor_id', $user->instructor->id)->first();
            }
        }
        
        if (!$userDepartment) {
            return response()->json([
                'error' => 'No department assigned to this user',
                'message' => 'Please contact administrator to assign you to a department'
            ], 403);
        }
        
        // Get ONLY the user's department data
        $department = Department::withCount(['students', 'instructors', 'courses'])
                                ->find($userDepartment->id);
        
        // Get total counts for THIS DEPARTMENT ONLY
        $totalStudents = \App\Models\Student::where('department_id', $userDepartment->id)->count();
        $totalInstructors = \App\Models\Instructor::where('department_id', $userDepartment->id)->count();
        $totalCourses = \App\Models\Course::where('department_id', $userDepartment->id)->count();
        
        // Get enrollment statistics for THIS DEPARTMENT ONLY
        $pendingEnrollments = \DB::table('course_student')
            ->join('courses', 'course_student.course_id', '=', 'courses.id')
            ->where('courses.department_id', $userDepartment->id)
            ->where('course_student.status', 'pending')
            ->count();
            
        $approvedEnrollments = \DB::table('course_student')
            ->join('courses', 'course_student.course_id', '=', 'courses.id')
            ->where('courses.department_id', $userDepartment->id)
            ->where('course_student.status', 'approved')
            ->count();
            
        $rejectedEnrollments = \DB::table('course_student')
            ->join('courses', 'course_student.course_id', '=', 'courses.id')
            ->where('courses.department_id', $userDepartment->id)
            ->where('course_student.status', 'rejected')
            ->count();
        
        // Get recent enrollments for THIS DEPARTMENT ONLY
        $recentEnrollments = \DB::table('course_student')
            ->join('students', 'course_student.student_id', '=', 'students.id')
            ->join('courses', 'course_student.course_id', '=', 'courses.id')
            ->where('courses.department_id', $userDepartment->id)
            ->select('students.name as student_name', 'students.student_id', 'courses.title as course_title', 'courses.code as course_code', 'course_student.status', 'course_student.created_at')
            ->orderBy('course_student.created_at', 'desc')
            ->limit(10)
            ->get();

        // Get course utilization for THIS DEPARTMENT ONLY
        $courseUtilization = \App\Models\Course::where('department_id', $userDepartment->id)
            ->withCount('students')
            ->orderBy('students_count', 'desc')
            ->limit(10)
            ->get();

        // Get instructor workload for THIS DEPARTMENT ONLY
        $instructorWorkload = \App\Models\Instructor::where('department_id', $userDepartment->id)
            ->withCount(['courses', 'courses as total_students' => function($query) {
                $query->join('course_student', 'courses.id', '=', 'course_student.course_id');
            }])
            ->with('department')
            ->orderBy('courses_count', 'desc')
            ->limit(10)
            ->get();

        // Get student progress summary for THIS DEPARTMENT ONLY
        $studentProgress = [
            'excellent' => \App\Models\Grade::whereHas('student', function($query) use ($userDepartment) {
                $query->where('department_id', $userDepartment->id);
            })->whereIn('grade', ['A+', 'A', 'A-'])->distinct('student_id')->count(),
            
            'good' => \App\Models\Grade::whereHas('student', function($query) use ($userDepartment) {
                $query->where('department_id', $userDepartment->id);
            })->whereIn('grade', ['B+', 'B', 'B-'])->distinct('student_id')->count(),
            
            'average' => \App\Models\Grade::whereHas('student', function($query) use ($userDepartment) {
                $query->where('department_id', $userDepartment->id);
            })->whereIn('grade', ['C+', 'C', 'C-'])->distinct('student_id')->count(),
            
            'below_average' => \App\Models\Grade::whereHas('student', function($query) use ($userDepartment) {
                $query->where('department_id', $userDepartment->id);
            })->whereIn('grade', ['D+', 'D', 'F'])->distinct('student_id')->count(),
        ];

        // Get enrollment trends for THIS DEPARTMENT ONLY (last 6 months)
        $enrollmentTrends = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = \Carbon\Carbon::now()->subMonths($i);
            $count = \DB::table('course_student')
                ->join('courses', 'course_student.course_id', '=', 'courses.id')
                ->where('courses.department_id', $userDepartment->id)
                ->whereYear('course_student.created_at', $month->year)
                ->whereMonth('course_student.created_at', $month->month)
                ->count();
            $enrollmentTrends[] = [
                'month' => $month->format('M Y'),
                'enrollments' => $count
            ];
        }

        return response()->json([
            'overview' => [
                'total_students' => $totalStudents,
                'total_instructors' => $totalInstructors,
                'total_courses' => $totalCourses,
                'department_name' => $department->name,
                'department_code' => $department->code,
                'pending_enrollments' => $pendingEnrollments,
                'approved_enrollments' => $approvedEnrollments,
                'rejected_enrollments' => $rejectedEnrollments
            ],
            'department' => $department,
            'recent_enrollments' => $recentEnrollments,
            'course_utilization' => $courseUtilization,
            'instructor_workload' => $instructorWorkload,
            'student_progress' => $studentProgress,
            'enrollment_trends' => $enrollmentTrends,
            'message' => 'Department dashboard data retrieved successfully for ' . $department->name
        ]);
    }

    // List all courses in a department
    public function courses($id = null)
    {
        $user = auth()->user();
        
        // If no ID provided and user is department head, get their department
        if (!$id && $user->role === 'department') {
            $userDepartment = $this->getUserDepartment();
            if (!$userDepartment) {
                return response()->json(['error' => 'No department assigned'], 403);
            }
            $id = $userDepartment->id;
        }
        
        // Check access permission
        if (!$this->canAccessDepartment($id)) {
            return response()->json(['error' => 'Access denied to this department'], 403);
        }
        
        $department = Department::with('courses')->findOrFail($id);
        return response()->json([
            'department' => $department,
            'courses' => $department->courses,
            'message' => 'Courses retrieved successfully for ' . $department->name
        ]);
    }
    // Add a new course to a department
    public function addCourse(Request $request, $id = null)
    {
        $user = auth()->user();
        
        // If no ID provided and user is department head, get their department
        if (!$id && $user->role === 'department') {
            $userDepartment = $this->getUserDepartment();
            if (!$userDepartment) {
                return response()->json(['error' => 'No department assigned'], 403);
            }
            $id = $userDepartment->id;
        }
        
        // Check access permission
        if (!$this->canAccessDepartment($id)) {
            return response()->json(['error' => 'Access denied to this department'], 403);
        }

        $request->validate([
            'code' => 'required|unique:courses',
            'title' => 'required',
            'description' => 'nullable'
        ]);

        $department = Department::findOrFail($id);

        $course = $department->courses()->create([
            'code' => $request->code,
            'title' => $request->title,
            'description' => $request->description
        ]);

        return response()->json([
            'course' => $course,
            'message' => 'Course added successfully to ' . $department->name
        ]);
    }

    // Get instructors for user's department
    public function getDepartmentInstructors()
    {
        $user = auth()->user();
        $userDepartment = $this->getUserDepartment();
        
        if (!$userDepartment) {
            return response()->json(['error' => 'No department assigned'], 403);
        }
        
        $instructors = \App\Models\Instructor::where('department_id', $userDepartment->id)
            ->with('user')
            ->get();
            
        return response()->json([
            'instructors' => $instructors,
            'department' => $userDepartment,
            'message' => 'Department instructors retrieved successfully'
        ]);
    }

    // Get students for user's department
    public function getDepartmentStudents()
    {
        $user = auth()->user();
        $userDepartment = $this->getUserDepartment();
        
        if (!$userDepartment) {
            return response()->json(['error' => 'No department assigned'], 403);
        }
        
        $students = \App\Models\Student::where('department_id', $userDepartment->id)
            ->with('user')
            ->get();
            
        return response()->json([
            'students' => $students,
            'department' => $userDepartment,
            'message' => 'Department students retrieved successfully'
        ]);
    }

    // Update a course in a department
    public function updateCourse(Request $request, $deptId, $courseId)
    {
        $course = Course::where('department_id', $deptId)->findOrFail($courseId);
        $course->update($request->all());
        return response()->json([
            'course' => $course,
            'message' => 'Course updated successfully'
        ]);
    }
}


