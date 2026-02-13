<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Department;
use App\Models\Instructor;
use Illuminate\Support\Facades\Hash;

class ITDepartmentHeadSeeder extends Seeder
{
    public function run(): void
    {
        // Create Information Technology Department
        $itDept = Department::firstOrCreate(
            ['code' => 'IT'],
            [
                'name' => 'Information Technology',
                'description' => 'Department of Information Technology',
                'status' => 'active',
                'location' => 'IT Building, Floor 3',
                'established_year' => 2015
            ]
        );

        // Create IT Department Head User - Assmamaw
        $itHeadUser = User::firstOrCreate(
            ['email' => 'assmamaw@mwu.edu.et'],
            [
                'name' => 'Assmamaw',
                'username' => 'assmamaw',
                'password' => Hash::make('password'),
                'role' => 'department',
                'status' => 'active',
                'department_id' => $itDept->id,
                'is_first_login' => false
            ]
        );

        // Create IT Department Head Instructor
        $itHeadInstructor = Instructor::firstOrCreate(
            ['email' => 'assmamaw@mwu.edu.et'],
            [
                'name' => 'Assmamaw',
                'instructor_id' => Instructor::generateInstructorId('IT', date('y')),
                'department_id' => $itDept->id,
                'user_id' => $itHeadUser->id,
                'qualification' => 'MSc in Information Technology',
                'status' => 'active',
                'phone' => '+251-911-123456'
            ]
        );

        // Assign Assmamaw as IT department head
        $itDept->update([
            'head_name' => $itHeadInstructor->name,
            'head_email' => $itHeadInstructor->email,
            'head_instructor_id' => $itHeadInstructor->id
        ]);

        $this->command->info('IT Department Head created successfully!');
        $this->command->info('Department: Information Technology (IT)');
        $this->command->info('Head: Assmamaw');
        $this->command->info('Email: assmamaw@mwu.edu.et');
        $this->command->info('Username: assmamaw');
        $this->command->info('Password: password');
        $this->command->info('Dashboard URL: http://localhost:3000/department/dashboard');
    }
}