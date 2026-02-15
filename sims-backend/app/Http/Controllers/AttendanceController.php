<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index()
    {
        $attendances = Attendance::with(['student','course','instructor'])->get();
        return response()->json([
            'attendances' => $attendances,
            'message' => 'Attendance records retrieved successfully'
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'course_id' => 'required|exists:courses,id',
            'instructor_id' => 'required|exists:instructors,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,late'
        ]);

        $attendance = Attendance::create($request->all());
        return response()->json([
            'attendance' => $attendance,
            'message' => 'Attendance record created successfully'
        ]);
    }

    public function update(Request $request, $id)
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->update($request->all());
        return response()->json([
            'attendance' => $attendance->load(['student','course','instructor']),
            'message' => 'Attendance record updated successfully'
        ]);
    }

    public function destroy($id)
    {
        Attendance::destroy($id);
        return ['message' => 'Attendance record deleted'];
    }

    // Instructor: Get attendance for a specific course
    public function courseAttendance($courseId)
    {
        $instructor = auth()->user()->instructor;
        
        // Verify instructor teaches this course
        if (!$instructor->courses()->where('courses.id', $courseId)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $attendance = Attendance::with(['student.user', 'course'])
            ->where('course_id', $courseId)
            ->where('instructor_id', $instructor->id)
            ->orderBy('date', 'desc')
            ->get();

        return response()->json($attendance);
    }

    // Instructor: Bulk record attendance for a course session
    public function bulkStore(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'date' => 'required|date',
            'records' => 'required|array',
            'records.*.student_id' => 'required|exists:students,id',
            'records.*.status' => 'required|in:present,absent,late'
        ]);

        $instructor = auth()->user()->instructor;
        
        // Verify instructor teaches this course
        if (!$instructor->courses()->where('courses.id', $request->course_id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $attendanceRecords = [];
        foreach ($request->records as $record) {
            $attendanceRecords[] = Attendance::updateOrCreate(
                [
                    'student_id' => $record['student_id'],
                    'course_id' => $request->course_id,
                    'instructor_id' => $instructor->id,
                    'date' => $request->date
                ],
                [
                    'status' => $record['status']
                ]
            );
        }

        return response()->json([
            'message' => 'Attendance recorded successfully',
            'records' => $attendanceRecords
        ]);
    }

    // Student: View own attendance
    public function studentAttendance()
    {
        $student = auth()->user()->student;
        
        $attendance = Attendance::with(['course', 'instructor.user'])
            ->where('student_id', $student->id)
            ->orderBy('date', 'desc')
            ->get();

        // Calculate statistics
        $stats = [
            'total' => $attendance->count(),
            'present' => $attendance->where('status', 'present')->count(),
            'absent' => $attendance->where('status', 'absent')->count(),
            'late' => $attendance->where('status', 'late')->count(),
        ];

        return response()->json([
            'attendance' => $attendance,
            'statistics' => $stats
        ]);
    }

    // Department: View attendance statistics
    public function departmentStats()
    {
        $department = auth()->user()->department;
        
        $attendance = Attendance::with(['student', 'course'])
            ->whereHas('course', function($query) use ($department) {
                $query->where('department_id', $department->id);
            })
            ->get();

        $stats = [
            'total_records' => $attendance->count(),
            'present' => $attendance->where('status', 'present')->count(),
            'absent' => $attendance->where('status', 'absent')->count(),
            'late' => $attendance->where('status', 'late')->count(),
            'attendance_rate' => $attendance->count() > 0 
                ? round(($attendance->where('status', 'present')->count() / $attendance->count()) * 100, 2)
                : 0
        ];

        return response()->json($stats);
    }
}
