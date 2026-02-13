<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Course;
use App\Models\Instructor;
use App\Models\Student;

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
}
