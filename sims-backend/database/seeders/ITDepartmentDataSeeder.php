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
    /**
     * This seeder is intentionally disabled.
     * 
     * All data (departments, instructors, students, courses) should be created
     * by the admin through the web interface for production use.
     * 
     * To create data:
     * 1. Login as admin (melese74 / 0dfd27mb)
     * 2. Use the admin dashboard to create:
     *    - Departments
     *    - Instructors
     *    - Courses
     *    - Students
     */
    public function run(): void
    {
        $this->command->info('⚠️  ITDepartmentDataSeeder is disabled.');
        $this->command->info('📝 All data should be created by admin through the web interface.');
        $this->command->info('🔑 Login as admin: melese74 / 0dfd27mb');
        $this->command->info('📍 Use Admin Dashboard to create departments, instructors, courses, and students.');
    }
}