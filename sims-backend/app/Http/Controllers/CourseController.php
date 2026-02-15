<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Instructor;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CourseController extends Controller
{
    /**
     * Display a listing of courses based on user role
     * - Admin: All courses
     * - Department: Their department's courses
     * - Instructor: Assigned courses
     * - Student: Available and enrolled courses
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Course::with(['department', 'instructors', 'students']);
        
        switch ($user->role) {
            case 'admin':
                // Admin sees all courses
                break;
                
            case 'department':
                // Department sees only their department's courses
                $query->where('department_id', $user->department_id);
                break;
                
            case 'instructor':
                // Instructor sees only assigned courses
                if ($user->instructor) {
                    $query->whereHas('instructors', function($q) use ($user) {
                        $q->where('instructors.id', $user->instructor->id);
                    });
                }
                break;
                
            case 'student':
                // Student sees enrolled courses
                if ($user->student) {
                    $query->whereHas('students', function($q) use ($user) {
                        $q->where('students.id', $user->student->id);
                    });
                }
                break;
        }
        
        return response()->json([
            'courses' => $query->get(),
            'message' => 'Courses retrieved successfully'
        ]);
    }

    /**
     * Store a newly created course
     * - Admin: Can create for any department
     * - Department: Can create for their department
     */
    public function store(Request $request)
    {
        $this->authorize('create', Course::class);
        
        $validated = $request->validate([
            'code' => 'required|unique:courses',
            'title' => 'required',
            'department_id' => 'required|exists:departments,id',
            'description' => 'nullable',
            'credits' => 'nullable|integer|min:1',
            'semester' => 'nullable|string',
            'year' => 'nullable|integer'
        ]);
        
        $user = $request->user();
        
        // Department heads can only create courses for their department
        if ($user->role === 'department') {
            $validated['department_id'] = $user->department_id;
        }
        
        $course = Course::create($validated);
        
        return response()->json([
            'message' => 'Course created successfully',
            'course' => $course->load(['department', 'instructors', 'students'])
        ], 201);
    }

    /**
     * Display the specified course
     */
    public function show($id)
    {
        $course = Course::with(['department', 'instructors', 'students'])->findOrFail($id);
        $this->authorize('view', $course);
        
        return response()->json([
            'course' => $course,
            'message' => 'Course details retrieved successfully'
        ]);
    }

    /**
     * Update the specified course
     * - Admin: Can update any course
     * - Department: Can update their department's courses
     */
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        $this->authorize('update', $course);
        
        $validated = $request->validate([
            'code' => 'sometimes|unique:courses,code,' . $id,
            'title' => 'sometimes',
            'description' => 'nullable',
            'credits' => 'nullable|integer|min:1',
            'semester' => 'nullable|string',
            'year' => 'nullable|integer'
        ]);
        
        $course->update($validated);
        
        return response()->json([
            'message' => 'Course updated successfully',
            'course' => $course->load(['department', 'instructors', 'students'])
        ]);
    }

    /**
     * Remove the specified course
     * - Admin: Can delete any course
     * - Department: Can delete their department's courses
     */
    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $this->authorize('delete', $course);
        
        $course->delete();
        
        return response()->json(['message' => 'Course deleted successfully']);
    }

    /**
     * Assign instructor to course
     * - Admin: Can assign to any course
     * - Department: Can assign to their department's courses
     */
    public function assignInstructor(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        $this->authorize('assignInstructor', $course);
        
        $validated = $request->validate([
            'instructor_id' => 'required|exists:instructors,id'
        ]);
        
        $instructor = Instructor::findOrFail($validated['instructor_id']);
        
        // Check if instructor belongs to the same department
        if ($instructor->department_id !== $course->department_id) {
            return response()->json([
                'message' => 'Instructor must belong to the same department as the course'
            ], 422);
        }
        
        // Attach instructor if not already assigned
        if (!$course->instructors()->where('instructors.id', $instructor->id)->exists()) {
            $course->instructors()->attach($instructor->id);
        }
        
        return response()->json([
            'message' => 'Instructor assigned successfully',
            'course' => $course->load(['instructors', 'students'])
        ]);
    }

    /**
     * Remove instructor from course
     * - Admin: Can remove from any course
     * - Department: Can remove from their department's courses
     */
    public function removeInstructor($courseId, $instructorId)
    {
        $course = Course::findOrFail($courseId);
        $this->authorize('assignInstructor', $course);
        
        $course->instructors()->detach($instructorId);
        
        return response()->json([
            'message' => 'Instructor removed successfully',
            'course' => $course->load(['instructors', 'students'])
        ]);
    }

    /**
     * Enroll student in course
     * - Admin: Can enroll any student
     * - Department: Can enroll students in their department's courses
     * - Student: Can request enrollment (pending approval)
     */
    public function enrollStudent(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id'
        ]);
        
        $student = Student::findOrFail($validated['student_id']);
        $user = $request->user();
        
        // Check enrollment status
        $status = 'approved'; // Default for admin/department
        
        if ($user->role === 'student') {
            $status = 'pending'; // Students need approval
        }
        
        // Check if already enrolled
        if ($course->students()->where('students.id', $student->id)->exists()) {
            return response()->json([
                'message' => 'Student is already enrolled in this course'
            ], 422);
        }
        
        $course->students()->attach($student->id, [
            'enrollment_status' => $status,
            'enrolled_at' => now()
        ]);
        
        return response()->json([
            'message' => $status === 'pending' 
                ? 'Enrollment request submitted successfully' 
                : 'Student enrolled successfully',
            'status' => $status
        ]);
    }

    /**
     * Get available courses for student enrollment
     */
    public function availableCourses(Request $request)
    {
        $user = $request->user();
        
        if ($user->role !== 'student' || !$user->student) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $student = $user->student;
        
        // Get courses from student's department that they're not enrolled in
        $courses = Course::where('department_id', $student->department_id)
            ->whereDoesntHave('students', function($q) use ($student) {
                $q->where('students.id', $student->id);
            })
            ->with(['department', 'instructors'])
            ->get();
        
        return response()->json([
            'courses' => $courses,
            'message' => 'Available courses retrieved successfully'
        ]);
    }
}
