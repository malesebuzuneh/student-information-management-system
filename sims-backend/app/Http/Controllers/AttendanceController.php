<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index()
    {
        return Attendance::with(['student','course','instructor'])->get();
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

        return Attendance::create($request->all());
    }

    public function update(Request $request, $id)
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->update($request->all());
        return $attendance->load(['student','course','instructor']);
    }

    public function destroy($id)
    {
        Attendance::destroy($id);
        return ['message' => 'Attendance record deleted'];
    }
}
