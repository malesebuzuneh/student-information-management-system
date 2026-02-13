<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Department;
use App\Models\Student;
use App\Models\Instructor;
use App\Models\Course;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create departments
        $csDept = Department::firstOrCreate(
            ['name' => 'Computer Science'],
            [
                'code' => 'CS',
                'description' => 'Department of Computer Science and Engineering'
            ]
        );

        $mathDept = Department::firstOrCreate(
            ['name' => 'Mathematics'],
            [
                'code' => 'MATH',
                'description' => 'Department of Mathematics'
            ]
        );

        // Create admin user
        User::firstOrCreate(
            ['email' => 'admin@sims.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin'
            ]
        );

        // Create instructor user and instructor record
        $instructorUser = User::firstOrCreate(
            ['email' => 'instructor@sims.com'],
            [
                'name' => 'John Instructor',
                'password' => Hash::make('password'),
                'role' => 'instructor'
            ]
        );

        $instructor = Instructor::firstOrCreate(
            ['email' => 'instructor@sims.com'],
            [
                'name' => 'John Instructor',
                'instructor_id' => Instructor::generateInstructorId('CS', date('y')),
                'department_id' => $csDept->id,
                'user_id' => $instructorUser->id  // Link to the user account
            ]
        );

        // Create department user
        $departmentUser = User::firstOrCreate(
            ['email' => 'department@sims.com'],
            [
                'name' => 'Department Head',
                'password' => Hash::make('password'),
                'role' => 'department'
            ]
        );

        // Create student user and student record
        $studentUser = User::firstOrCreate(
            ['email' => 'student@sims.com'],
            [
                'name' => 'Jane Student',
                'password' => Hash::make('password'),
                'role' => 'student'
            ]
        );

        $student = Student::firstOrCreate(
            ['email' => 'student@sims.com'],
            [
                'name' => 'Jane Student',
                'student_id' => Student::generateStudentId('CS', date('y')),
                'department_id' => $csDept->id,
                'user_id' => $studentUser->id  // Link to the user account
            ]
        );

        // Create courses
        $course1 = Course::firstOrCreate(
            ['code' => 'CS101'],
            [
                'title' => 'Introduction to Programming',
                'description' => 'Basic programming concepts and fundamentals',
                'department_id' => $csDept->id
            ]
        );

        $course2 = Course::firstOrCreate(
            ['code' => 'CS201'],
            [
                'title' => 'Data Structures',
                'description' => 'Advanced data structures and algorithms',
                'department_id' => $csDept->id
            ]
        );

        // Assign instructor to courses (if not already assigned)
        if (!$instructor->courses->contains($course1->id)) {
            $instructor->courses()->attach($course1->id);
        }
        if (!$instructor->courses->contains($course2->id)) {
            $instructor->courses()->attach($course2->id);
        }

        // Enroll student in courses (if not already enrolled)
        if (!$student->courses->contains($course1->id)) {
            $student->courses()->attach($course1->id);
        }
        if (!$student->courses->contains($course2->id)) {
            $student->courses()->attach($course2->id);
        }
    }
}