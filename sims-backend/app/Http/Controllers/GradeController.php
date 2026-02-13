<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use App\Models\Course;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GradeController extends Controller
{
    // INSTRUCTOR METHODS - Enter and Submit Grades
    
    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'course_id' => 'required|exists:courses,id',
            'grade' => 'required|string|max:5'
        ]);

        $user = auth()->user();
        
        // Verify instructor teaches this course
        $course = Course::findOrFail($request->course_id);
        if (!$course->instructors()->where('instructors.user_id', $user->id)->exists()) {
            return response()->json(['error' => 'You are not assigned to teach this course'], 403);
        }

        $grade = Grade::create([
            'student_id' => $request->student_id,
            'course_id' => $request->course_id,
            'instructor_id' => $user->instructor->id,
            'grade' => $request->grade,
            'status' => Grade::STATUS_DRAFT
        ]);

        return response()->json([
            'grade' => $grade->load(['student', 'course']),
            'message' => 'Grade entered successfully (draft status)'
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'grade' => 'required|string|max:5'
        ]);

        $grade = Grade::findOrFail($id);
        $user = auth()->user();

        // Only instructor who created the grade can update it
        if ($grade->instructor_id !== $user->instructor->id) {
            return response()->json(['error' => 'You can only update your own grades'], 403);
        }

        // Can only update draft grades
        if (!$grade->isDraft()) {
            return response()->json(['error' => 'Cannot update submitted grades'], 403);
        }

        $grade->update(['grade' => $request->grade]);

        return response()->json([
            'grade' => $grade->load(['student', 'course']),
            'message' => 'Grade updated successfully'
        ]);
    }

    public function submitGrade($id)
    {
        $grade = Grade::findOrFail($id);
        $user = auth()->user();

        // Only instructor who created the grade can submit it
        if ($grade->instructor_id !== $user->instructor->id) {
            return response()->json(['error' => 'You can only submit your own grades'], 403);
        }

        // Can only submit draft grades
        if (!$grade->isDraft()) {
            return response()->json(['error' => 'Grade is already submitted'], 403);
        }

        $grade->submit();

        return response()->json([
            'grade' => $grade->load(['student', 'course']),
            'message' => 'Grade submitted for department approval'
        ]);
    }

    public function courseGrades($courseId)
    {
        $user = auth()->user();
        $course = Course::findOrFail($courseId);

        // Verify instructor teaches this course
        if (!$course->instructors()->where('instructors.user_id', $user->id)->exists()) {
            return response()->json(['error' => 'You are not assigned to teach this course'], 403);
        }

        $grades = Grade::where('course_id', $courseId)
                      ->where('instructor_id', $user->instructor->id)
                      ->with(['student', 'course'])
                      ->get();

        return response()->json([
            'course' => $course,
            'grades' => $grades,
            'message' => 'Course grades retrieved successfully'
        ]);
    }

    // DEPARTMENT METHODS - Approve Grades

    public function departmentPendingGrades()
    {
        $user = auth()->user();
        $userDepartment = $this->getUserDepartment($user);

        if (!$userDepartment) {
            return response()->json(['error' => 'No department assigned'], 403);
        }

        $pendingGrades = Grade::submitted()
                             ->whereHas('course', function($query) use ($userDepartment) {
                                 $query->where('department_id', $userDepartment->id);
                             })
                             ->with(['student', 'course', 'instructor'])
                             ->get();

        return response()->json([
            'pending_grades' => $pendingGrades,
            'department' => $userDepartment,
            'message' => 'Pending grades retrieved successfully'
        ]);
    }

    public function departmentApprove($id)
    {
        $grade = Grade::findOrFail($id);
        $user = auth()->user();
        $userDepartment = $this->getUserDepartment($user);

        if (!$userDepartment) {
            return response()->json(['error' => 'No department assigned'], 403);
        }

        // Verify grade belongs to user's department
        if ($grade->course->department_id !== $userDepartment->id) {
            return response()->json(['error' => 'Grade does not belong to your department'], 403);
        }

        // Can only approve submitted grades
        if (!$grade->isSubmitted()) {
            return response()->json(['error' => 'Grade must be submitted before approval'], 403);
        }

        $grade->departmentApprove($user);

        return response()->json([
            'grade' => $grade->load(['student', 'course', 'departmentApprovedBy']),
            'message' => 'Grade approved by department. Awaiting admin finalization.'
        ]);
    }

    // ADMIN METHODS - Finalize Grades

    public function adminPendingGrades()
    {
        $pendingGrades = Grade::departmentApproved()
                             ->with(['student', 'course', 'instructor', 'departmentApprovedBy'])
                             ->get();

        return response()->json([
            'pending_grades' => $pendingGrades,
            'message' => 'Grades pending admin finalization retrieved successfully'
        ]);
    }

    public function adminFinalize($id)
    {
        $grade = Grade::findOrFail($id);
        $user = auth()->user();

        // Can only finalize department-approved grades
        if (!$grade->isDepartmentApproved()) {
            return response()->json(['error' => 'Grade must be department-approved before finalization'], 403);
        }

        $grade->finalize($user);

        return response()->json([
            'grade' => $grade->load(['student', 'course', 'departmentApprovedBy', 'finalizedBy']),
            'message' => 'Grade finalized successfully. Students can now view this grade.'
        ]);
    }

    // STUDENT METHODS - View Final Grades

    public function studentGrades()
    {
        $user = auth()->user();
        
        if (!$user->student) {
            return response()->json(['error' => 'Student profile not found'], 404);
        }

        $grades = Grade::where('student_id', $user->student->id)
                      ->finalized() // Only show finalized grades
                      ->with(['course', 'instructor', 'finalizedBy'])
                      ->get();

        return response()->json([
            'grades' => $grades,
            'student' => $user->student,
            'message' => 'Final grades retrieved successfully'
        ]);
    }

    // HELPER METHODS

    private function getUserDepartment($user)
    {
        if ($user->role === 'department') {
            if ($user->department_id) {
                return \App\Models\Department::find($user->department_id);
            } elseif ($user->instructor) {
                return \App\Models\Department::where('head_instructor_id', $user->instructor->id)->first();
            }
        }
        return null;
    }

    public function destroy($id)
    {
        $grade = Grade::findOrFail($id);
        $user = auth()->user();

        // Only instructor can delete their own draft grades
        if ($user->role === 'instructor' && $grade->instructor_id === $user->instructor->id && $grade->isDraft()) {
            $grade->delete();
            return response()->json(['message' => 'Draft grade deleted successfully']);
        }

        // Admin can delete any grade
        if ($user->role === 'admin') {
            $grade->delete();
            return response()->json(['message' => 'Grade deleted successfully']);
        }

        return response()->json(['error' => 'Cannot delete this grade'], 403);
    }
}
