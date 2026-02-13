<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index()
    {
        return Course::with(['department','instructors','students'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|unique:courses',
            'title' => 'required',
            'department_id' => 'required|exists:departments,id',
            'description' => 'nullable'
        ]);

        return Course::create($request->all());
    }

    public function show($id)
    {
        return Course::with(['department','instructors','students'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        $course->update($request->all());
        return $course->load(['department','instructors','students']);
    }

    public function destroy($id)
    {
        Course::destroy($id);
        return ['message' => 'Course deleted'];
    }
}
