<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Department;

class SampleCoursesSeeder extends Seeder
{
    /**
     * This seeder is intentionally disabled.
     * 
     * Courses should ONLY be created by the admin through the web interface.
     * 
     * To create courses:
     * 1. Login as admin (melese74 / 0dfd27mb)
     * 2. Go to Admin Dashboard → Courses
     * 3. Click "Add Course"
     * 4. Fill in course details
     * 5. Assign to a department
     */
    public function run(): void
    {
        $this->command->info('⚠️  SampleCoursesSeeder is disabled.');
        $this->command->info('📝 Courses should be created by admin through the web interface.');
        $this->command->info('🔑 Login as admin: melese74 / 0dfd27mb');
        $this->command->info('📍 Go to: Admin Dashboard → Courses → Add Course');
    }
}
