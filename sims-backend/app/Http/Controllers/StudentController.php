<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::with(['department', 'user'])->get();
        return response()->json([
            'students' => $students,
            'message' => 'Students retrieved successfully'
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:students|unique:users',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'address' => 'required|string',
            'phone' => 'required|string|max:20',
            'emergency_contact' => 'required|string|max:255',
            'emergency_phone' => 'required|string|max:20',
            'department_id' => 'required|exists:departments,id',
            'program' => 'required|string|max:255',
            'year' => 'required|integer|min:1|max:6',
            'semester' => 'required|integer|min:1|max:2',
            'admission_type' => 'required|in:regular,transfer,international,scholarship',
            'admission_date' => 'required|date',
        ]);

        // Generate a temporary password for the student
        $temporaryPassword = Str::random(8);

        // Generate unique student ID using UGR prefix
        $studentId = Student::generateStudentId();
        
        // Use student ID directly as username
        $username = $studentId;

        // Create user account for the student
        $user = User::create([
            'name' => $request->name,
            'username' => $username,
            'email' => $request->email,
            'password' => Hash::make($temporaryPassword),
            'role' => 'student',
            'is_first_login' => true,
        ]);

        // Create student record linked to the user
        $student = Student::create([
            'name' => $request->name,
            'email' => $request->email,
            'student_id' => $studentId,
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'address' => $request->address,
            'phone' => $request->phone,
            'emergency_contact' => $request->emergency_contact,
            'emergency_phone' => $request->emergency_phone,
            'department_id' => $request->department_id,
            'program' => $request->program,
            'year' => $request->year,
            'semester' => $request->semester,
            'admission_type' => $request->admission_type,
            'admission_date' => $request->admission_date,
            'status' => 'active',
            'user_id' => $user->id,
        ]);

        // Load relationships for response
        $student->load(['department', 'user']);

        // Return student data with temporary password (in real app, send via email)
        return response()->json([
            'student' => $student,
            'temporary_password' => $temporaryPassword,
            'student_id' => $studentId,
            'username' => $username,
            'message' => 'Student registered successfully. Login credentials created.'
        ]);
    }

    public function show($id)
    {
        $student = Student::with(['department', 'user'])->findOrFail($id);
        return response()->json([
            'student' => $student,
            'message' => 'Student details retrieved successfully'
        ]);
    }

    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:students,email,' . $id . '|unique:users,email,' . $student->user_id,
            'department_id' => 'required|exists:departments,id'
        ]);

        // Update both student and user records
        $student->update([
            'name' => $request->name,
            'email' => $request->email,
            'department_id' => $request->department_id
        ]);

        if ($student->user) {
            $student->user->update([
                'name' => $request->name,
                'email' => $request->email
            ]);
        }

        return response()->json([
            'student' => $student->load(['department', 'user']),
            'message' => 'Student updated successfully'
        ]);
    }

    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        
        // Delete associated user account
        if ($student->user) {
            $student->user->delete();
        }
        
        $student->delete();
        
        return ['message' => 'Student and associated user account deleted'];
    }

    // Student-specific methods
    public function myProfile()
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        return response()->json($student->load(['department', 'user']));
    }

    public function updateMyProfile(Request $request)
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'emergency_contact' => 'nullable|string|max:255',
            'emergency_phone' => 'nullable|string|max:20',
        ]);

        // Students can only update certain fields
        $allowedFields = ['name', 'phone', 'address', 'emergency_contact', 'emergency_phone'];
        $updateData = [];
        
        foreach ($allowedFields as $field) {
            if ($request->has($field)) {
                $updateData[$field] = $request->input($field);
            }
        }

        $student->update($updateData);

        // Also update user name if provided
        if ($request->has('name')) {
            $user->update(['name' => $request->name]);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'student' => $student->fresh()->load(['department', 'user'])
        ]);
    }

    public function viewProfile($id)
    {
        $student = Student::with(['department', 'user'])->findOrFail($id);
        return response()->json([
            'student' => $student,
            'message' => 'Student profile retrieved successfully'
        ]);
    }

    public function viewGrades($id)
    {
        $student = Student::with('grades.course')->findOrFail($id);
        return response()->json([
            'grades' => $student->grades,
            'student' => $student,
            'message' => 'Student grades retrieved successfully'
        ]);
    }

    // Student Dashboard
    public function dashboard()
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        // Get enrolled courses
        $enrolledCourses = $student->courses()->with(['instructors', 'department'])->get();
        
        // Get recent grades
        $recentGrades = $student->grades()->with('course')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Calculate GPA
        $allGrades = $student->grades;
        $totalPoints = 0;
        $totalCredits = 0;
        
        foreach ($allGrades as $grade) {
            $gradePoint = $this->convertGradeToPoint($grade->grade);
            $credits = $grade->course->credits ?? 3; // Default 3 credits if not set
            $totalPoints += $gradePoint * $credits;
            $totalCredits += $credits;
        }
        
        $gpa = $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0;

        // No mock data - return empty arrays if no real data exists
        $upcomingDeadlines = [];
        $announcements = [];

        return response()->json([
            'student' => $student->load(['department', 'user']),
            'academic_info' => [
                'gpa' => $gpa,
                'total_credits' => $totalCredits,
                'enrolled_courses' => $enrolledCourses->count(),
                'completed_courses' => $allGrades->count(),
                'current_semester' => $student->semester,
                'current_year' => $student->year
            ],
            'courses' => $enrolledCourses,
            'recent_grades' => $recentGrades,
            'upcoming_deadlines' => $upcomingDeadlines,
            'announcements' => $announcements,
            'message' => 'Student dashboard data retrieved successfully'
        ]);
    }

    private function convertGradeToPoint($grade)
    {
        // Convert letter grades to grade points (4.0 scale)
        $gradePoints = [
            'A+' => 4.0, 'A' => 4.0, 'A-' => 3.7,
            'B+' => 3.3, 'B' => 3.0, 'B-' => 2.7,
            'C+' => 2.3, 'C' => 2.0, 'C-' => 1.7,
            'D+' => 1.3, 'D' => 1.0, 'F' => 0.0
        ];

        return $gradePoints[$grade] ?? 0.0;
    }

    // Get available courses for student enrollment
    public function availableCourses()
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        // Get courses in the same department that student is not enrolled in
        $enrolledCourseIds = $student->courses()->pluck('courses.id');
        
        $availableCourses = \App\Models\Course::where('department_id', $student->department_id)
            ->whereNotIn('id', $enrolledCourseIds)
            ->with(['department', 'instructors'])
            ->withCount('students')
            ->get();

        return response()->json([
            'courses' => $availableCourses,
            'message' => 'Available courses retrieved successfully'
        ]);
    }

    // Get student's enrolled courses
    public function enrolledCourses()
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        $enrolledCourses = $student->courses()
            ->with(['department', 'instructors'])
            ->withPivot('status', 'created_at')
            ->get();

        return response()->json([
            'courses' => $enrolledCourses,
            'message' => 'Enrolled courses retrieved successfully'
        ]);
    }

    public function myGrades()
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        $grades = $student->grades()
            ->with(['course' => function($query) {
                $query->with('instructors');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate GPA
        $totalPoints = 0;
        $totalCredits = 0;
        
        foreach ($grades as $grade) {
            $gradePoint = $this->convertGradeToPoint($grade->grade);
            $credits = $grade->course->credits ?? 3;
            $totalPoints += $gradePoint * $credits;
            $totalCredits += $credits;
        }
        
        $gpa = $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0;

        return response()->json([
            'grades' => $grades,
            'gpa' => $gpa,
            'total_credits' => $totalCredits,
            'message' => 'Grades retrieved successfully'
        ]);
    }

    // Enhanced enrollment request
    public function requestEnrollment($courseId)
    {
        $user = auth()->user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        $course = \App\Models\Course::findOrFail($courseId);

        // Check if already enrolled
        if ($student->courses()->where('course_id', $courseId)->exists()) {
            return response()->json(['error' => 'Already enrolled in this course'], 400);
        }

        // Check if course is in same department
        if ($course->department_id !== $student->department_id) {
            return response()->json(['error' => 'Can only enroll in courses from your department'], 400);
        }

        // Enroll with pending status
        $student->courses()->attach($courseId, [
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json([
            'message' => 'Enrollment request submitted successfully',
            'course' => $course->load(['department', 'instructors'])
        ]);
    }

    // Reset student password
    public function resetPassword(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        
        if (!$student->user) {
            return response()->json(['error' => 'No user account found for this student'], 404);
        }

        $newPassword = Str::random(8);
        $student->user->update([
            'password' => Hash::make($newPassword),
            'is_first_login' => true, // Force password change on next login
        ]);

        $student->update(['is_first_login' => true]);

        return response()->json([
            'message' => 'Password reset successfully',
            'new_password' => $newPassword
        ]);
    }

    // Handle first login password change
    public function changeFirstLoginPassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = auth()->user();
        $student = $user->student;

        if (!$student || !$student->is_first_login) {
            return response()->json(['error' => 'Invalid request'], 400);
        }

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['error' => 'Current password is incorrect'], 400);
        }

        // Update password and mark first login as completed
        $user->update([
            'password' => Hash::make($request->new_password),
            'is_first_login' => false,
            'last_login' => now(),
        ]);

        $student->update([
            'is_first_login' => false,
            'last_login' => now(),
        ]);

        return response()->json([
            'message' => 'Password changed successfully',
            'user' => $user->fresh(),
        ]);
    }
}