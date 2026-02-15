<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Course;
use App\Models\Instructor;
use App\Models\Student;
use App\Models\Grade;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    // Student Enrollment per Department
    public function studentEnrollment()
    {
        $report = Department::withCount('students')->get();
        return response()->json($report);
    }
    
    // Courses with Instructor Assignments
    public function courseAssignments()
    {
        $report = Course::with(['instructors','students'])->get();
        return response()->json($report);
    }
    
    // Department Summary
    public function departmentSummary()
    {
        $report = Department::withCount(['students','instructors','courses'])->get();
        return response()->json($report);
    }

    // Student Transcript
    public function studentTranscript($studentId)
    {
        $student = Student::with(['user', 'department'])->findOrFail($studentId);
        
        $grades = Grade::with(['course', 'instructor.user'])
            ->where('student_id', $studentId)
            ->where('status', 'finalized')
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate GPA
        $gradePoints = [
            'A+' => 4.0, 'A' => 4.0, 'A-' => 3.7,
            'B+' => 3.3, 'B' => 3.0, 'B-' => 2.7,
            'C+' => 2.3, 'C' => 2.0, 'C-' => 1.7,
            'D+' => 1.3, 'D' => 1.0, 'F' => 0.0
        ];

        $totalPoints = 0;
        $totalCourses = 0;
        
        foreach ($grades as $grade) {
            if (isset($gradePoints[$grade->grade])) {
                $totalPoints += $gradePoints[$grade->grade];
                $totalCourses++;
            }
        }

        $gpa = $totalCourses > 0 ? round($totalPoints / $totalCourses, 2) : 0;

        return response()->json([
            'student' => $student,
            'grades' => $grades,
            'gpa' => $gpa,
            'total_courses' => $totalCourses
        ]);
    }

    // Course Performance Report
    public function coursePerformance($courseId)
    {
        $course = Course::with(['department', 'instructors.user'])->findOrFail($courseId);
        
        $grades = Grade::where('course_id', $courseId)
            ->where('status', 'finalized')
            ->get();

        $gradeDistribution = $grades->groupBy('grade')->map->count();
        
        $attendance = Attendance::where('course_id', $courseId)->get();
        $attendanceStats = [
            'total' => $attendance->count(),
            'present' => $attendance->where('status', 'present')->count(),
            'absent' => $attendance->where('status', 'absent')->count(),
            'late' => $attendance->where('status', 'late')->count(),
            'rate' => $attendance->count() > 0 
                ? round(($attendance->where('status', 'present')->count() / $attendance->count()) * 100, 2)
                : 0
        ];

        return response()->json([
            'course' => $course,
            'total_students' => $course->students()->count(),
            'grade_distribution' => $gradeDistribution,
            'attendance_statistics' => $attendanceStats
        ]);
    }

    // Department Performance Report
    public function departmentPerformance($departmentId)
    {
        $department = Department::with(['head.user'])->findOrFail($departmentId);
        
        $students = $department->students;
        $courses = $department->courses;
        $instructors = $department->instructors;

        // Grade statistics
        $grades = Grade::whereHas('course', function($query) use ($departmentId) {
            $query->where('department_id', $departmentId);
        })->where('status', 'finalized')->get();

        $gradeDistribution = $grades->groupBy('grade')->map->count();

        // Attendance statistics
        $attendance = Attendance::whereHas('course', function($query) use ($departmentId) {
            $query->where('department_id', $departmentId);
        })->get();

        $attendanceRate = $attendance->count() > 0 
            ? round(($attendance->where('status', 'present')->count() / $attendance->count()) * 100, 2)
            : 0;

        return response()->json([
            'department' => $department,
            'statistics' => [
                'total_students' => $students->count(),
                'total_courses' => $courses->count(),
                'total_instructors' => $instructors->count(),
                'total_grades' => $grades->count(),
                'attendance_rate' => $attendanceRate
            ],
            'grade_distribution' => $gradeDistribution
        ]);
    }

    // System-wide Analytics (Admin)
    public function systemAnalytics()
    {
        $stats = [
            'departments' => Department::count(),
            'students' => Student::count(),
            'instructors' => Instructor::count(),
            'courses' => Course::count(),
            'active_enrollments' => DB::table('course_student')
                ->where('status', 'approved')
                ->count(),
            'pending_enrollments' => DB::table('course_student')
                ->where('status', 'pending')
                ->count(),
            'total_grades' => Grade::count(),
            'finalized_grades' => Grade::where('status', 'finalized')->count(),
            'pending_grades' => Grade::where('status', 'submitted')->count(),
            'attendance_records' => Attendance::count()
        ];

        // Grade distribution across system
        $gradeDistribution = Grade::where('status', 'finalized')
            ->select('grade', DB::raw('count(*) as count'))
            ->groupBy('grade')
            ->get();

        // Department performance comparison
        $departmentStats = Department::withCount(['students', 'courses', 'instructors'])->get();

        return response()->json([
            'system_statistics' => $stats,
            'grade_distribution' => $gradeDistribution,
            'department_comparison' => $departmentStats
        ]);
    }

    // Instructor Performance Report
    public function instructorPerformance($instructorId)
    {
        $instructor = Instructor::with(['user', 'department'])->findOrFail($instructorId);
        
        $courses = $instructor->courses;
        
        $grades = Grade::where('instructor_id', $instructorId)
            ->where('status', 'finalized')
            ->get();

        $gradeDistribution = $grades->groupBy('grade')->map->count();

        $attendance = Attendance::where('instructor_id', $instructorId)->get();
        $attendanceRate = $attendance->count() > 0 
            ? round(($attendance->where('status', 'present')->count() / $attendance->count()) * 100, 2)
            : 0;

        return response()->json([
            'instructor' => $instructor,
            'statistics' => [
                'total_courses' => $courses->count(),
                'total_students' => $courses->sum(function($course) {
                    return $course->students()->count();
                }),
                'total_grades' => $grades->count(),
                'attendance_rate' => $attendanceRate
            ],
            'grade_distribution' => $gradeDistribution,
            'courses' => $courses
        ]);
    }
}
