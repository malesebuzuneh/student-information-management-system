<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Department;
use App\Models\Instructor;
use Illuminate\Support\Facades\Hash;

class DepartmentHeadSeeder extends Seeder
{
    public function run(): void
    {
        // Create Computer Science Department if it doesn't exist
        $csDept = Department::firstOrCreate(
            ['code' => 'CS'],
            [
                'name' => 'Computer Science',
                'description' => 'Department of Computer Science and Engineering',
                'status' => 'active'
            ]
        );

        // Create Mathematics Department if it doesn't exist
        $mathDept = Department::firstOrCreate(
            ['code' => 'MATH'],
            [
                'name' => 'Mathematics',
                'description' => 'Department of Mathematics',
                'status' => 'active'
            ]
        );

        // Create CS Department Head User
        $csHeadUser = User::firstOrCreate(
            ['email' => 'cs.head@mwu.edu.et'],
            [
                'name' => 'Dr. John Smith',
                'username' => 'cshead',
                'password' => Hash::make('password'),
                'role' => 'department',
                'status' => 'active',
                'department_id' => $csDept->id,
                'is_first_login' => false
            ]
        );

        // Create CS Department Head Instructor
        $csHeadInstructor = Instructor::firstOrCreate(
            ['email' => 'cs.head@mwu.edu.et'],
            [
                'name' => 'Dr. John Smith',
                'instructor_id' => Instructor::generateInstructorId('CS', date('y')),
                'department_id' => $csDept->id,
                'user_id' => $csHeadUser->id,
                'qualification' => 'PhD in Computer Science',
                'status' => 'active'
            ]
        );

        // Assign as department head
        $csDept->update([
            'head_name' => $csHeadInstructor->name,
            'head_email' => $csHeadInstructor->email,
            'head_instructor_id' => $csHeadInstructor->id
        ]);

        // Create Math Department Head User
        $mathHeadUser = User::firstOrCreate(
            ['email' => 'math.head@mwu.edu.et'],
            [
                'name' => 'Dr. Sarah Johnson',
                'username' => 'mathhead',
                'password' => Hash::make('password'),
                'role' => 'department',
                'status' => 'active',
                'department_id' => $mathDept->id,
                'is_first_login' => false
            ]
        );

        // Create Math Department Head Instructor
        $mathHeadInstructor = Instructor::firstOrCreate(
            ['email' => 'math.head@mwu.edu.et'],
            [
                'name' => 'Dr. Sarah Johnson',
                'instructor_id' => Instructor::generateInstructorId('MATH', date('y')),
                'department_id' => $mathDept->id,
                'user_id' => $mathHeadUser->id,
                'qualification' => 'PhD in Mathematics',
                'status' => 'active'
            ]
        );

        // Assign as department head
        $mathDept->update([
            'head_name' => $mathHeadInstructor->name,
            'head_email' => $mathHeadInstructor->email,
            'head_instructor_id' => $mathHeadInstructor->id
        ]);

        $this->command->info('Department heads created successfully!');
        $this->command->info('CS Head: cs.head@mwu.edu.et / password');
        $this->command->info('Math Head: math.head@mwu.edu.et / password');
    }
}