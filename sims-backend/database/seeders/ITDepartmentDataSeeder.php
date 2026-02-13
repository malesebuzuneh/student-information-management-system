<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Course;
use App\Models\Student;
use App\Models\Instructor;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ITDepartmentDataSeeder extends Seeder
{
    public function run(): void
    {
        // Get IT Department
        $itDept = Department::where('code', 'IT')->first();
        
        if (!$itDept) {
            $this->command->error('IT Department not found. Please run ITDepartmentHeadSeeder first.');
            return;
        }

        // Create IT Courses
        $courses = [
            [
                'code' => 'IT101',
                'title' => 'Introduction to Information Technology',
                'description' => 'Basic concepts of IT and computer systems'
            ],
            [
                'code' => 'IT201',
                'title' => 'Database Management Systems',
                'description' => 'Design and implementation of database systems'
            ],
            [
                'code' => 'IT301',
                'title' => 'Network Administration',
                'description' => 'Network setup, configuration, and management'
            ],
            [
                'code' => 'IT401',
                'title' => 'Cybersecurity Fundamentals',
                'description' => 'Information security principles and practices'
            ],
            [
                'code' => 'IT501',
                'title' => 'System Administration',
                'description' => 'Server and system administration techniques'
            ]
        ];

        foreach ($courses as $courseData) {
            Course::firstOrCreate(
                ['code' => $courseData['code']],
                array_merge($courseData, ['department_id' => $itDept->id])
            );
        }

        // Create additional IT instructors
        $instructors = [
            [
                'name' => 'Dr. Bekele Tadesse',
                'email' => 'bekele.tadesse@mwu.edu.et',
                'username' => 'bekele',
                'qualification' => 'PhD in Computer Science'
            ],
            [
                'name' => 'Ms. Hanan Ahmed',
                'email' => 'hanan.ahmed@mwu.edu.et',
                'username' => 'hanan',
                'qualification' => 'MSc in Information Systems'
            ]
        ];

        foreach ($instructors as $instructorData) {
            // Create user account
            $user = User::firstOrCreate(
                ['email' => $instructorData['email']],
                [
                    'name' => $instructorData['name'],
                    'username' => $instructorData['username'],
                    'password' => Hash::make('password'),
                    'role' => 'instructor',
                    'status' => 'active'
                ]
            );

            // Create instructor record
            Instructor::firstOrCreate(
                ['email' => $instructorData['email']],
                [
                    'name' => $instructorData['name'],
                    'instructor_id' => Instructor::generateInstructorId('IT', date('y')),
                    'department_id' => $itDept->id,
                    'user_id' => $user->id,
                    'qualification' => $instructorData['qualification'],
                    'status' => 'active'
                ]
            );
        }

        // Create IT students
        $students = [
            [
                'name' => 'Dawit Mekonnen',
                'email' => 'dawit.mekonnen@student.mwu.edu.et',
                'username' => 'dawit.m'
            ],
            [
                'name' => 'Sara Getachew',
                'email' => 'sara.getachew@student.mwu.edu.et',
                'username' => 'sara.g'
            ],
            [
                'name' => 'Yohannes Kebede',
                'email' => 'yohannes.kebede@student.mwu.edu.et',
                'username' => 'yohannes.k'
            ],
            [
                'name' => 'Meron Tesfaye',
                'email' => 'meron.tesfaye@student.mwu.edu.et',
                'username' => 'meron.t'
            ]
        ];

        foreach ($students as $studentData) {
            // Create user account
            $user = User::firstOrCreate(
                ['email' => $studentData['email']],
                [
                    'name' => $studentData['name'],
                    'username' => $studentData['username'],
                    'password' => Hash::make('password'),
                    'role' => 'student',
                    'status' => 'active'
                ]
            );

            // Create student record
            Student::firstOrCreate(
                ['email' => $studentData['email']],
                [
                    'name' => $studentData['name'],
                    'student_id' => Student::generateStudentId('IT', date('y')),
                    'department_id' => $itDept->id,
                    'user_id' => $user->id,
                    'status' => 'active',
                    'year' => rand(1, 4),
                    'semester' => rand(1, 2),
                    'program' => 'Bachelor of Information Technology'
                ]
            );
        }

        $this->command->info('IT Department sample data created successfully!');
        $this->command->info('Created:');
        $this->command->info('- 5 IT courses');
        $this->command->info('- 2 additional IT instructors');
        $this->command->info('- 4 IT students');
    }
}