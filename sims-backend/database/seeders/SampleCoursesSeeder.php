<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Department;

class SampleCoursesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all departments
        $departments = Department::all();
        
        if ($departments->isEmpty()) {
            $this->command->error('No departments found! Please run department seeder first.');
            return;
        }

        // Sample courses for each department
        $coursesByDepartment = [
            'Computer Science' => [
                ['code' => 'CS102', 'title' => 'Data Structures and Algorithms', 'description' => 'Fundamental data structures and algorithmic techniques'],
                ['code' => 'CS201', 'title' => 'Object-Oriented Programming', 'description' => 'Advanced programming using OOP principles'],
                ['code' => 'CS301', 'title' => 'Database Systems', 'description' => 'Database design, implementation, and management'],
                ['code' => 'CS401', 'title' => 'Software Engineering', 'description' => 'Software development methodologies and project management'],
            ],
            'Information Technology' => [
                ['code' => 'IT101', 'title' => 'Introduction to IT', 'description' => 'Overview of information technology concepts'],
                ['code' => 'IT201', 'title' => 'Network Administration', 'description' => 'Computer network setup and management'],
                ['code' => 'IT301', 'title' => 'System Administration', 'description' => 'Server and system management techniques'],
                ['code' => 'IT401', 'title' => 'IT Project Management', 'description' => 'Managing IT projects and resources'],
            ],
            'Information System' => [
                ['code' => 'IS101', 'title' => 'Information Systems Fundamentals', 'description' => 'Basic concepts of information systems'],
                ['code' => 'IS201', 'title' => 'Business Process Analysis', 'description' => 'Analyzing and improving business processes'],
                ['code' => 'IS301', 'title' => 'Enterprise Resource Planning', 'description' => 'ERP systems and implementation'],
                ['code' => 'IS401', 'title' => 'Information Systems Strategy', 'description' => 'Strategic planning for information systems'],
            ],
            'Information Science' => [
                ['code' => 'INS101', 'title' => 'Information Theory', 'description' => 'Mathematical foundations of information'],
                ['code' => 'INS201', 'title' => 'Data Mining', 'description' => 'Extracting knowledge from large datasets'],
                ['code' => 'INS301', 'title' => 'Information Retrieval', 'description' => 'Systems for storing and retrieving information'],
                ['code' => 'INS401', 'title' => 'Knowledge Management', 'description' => 'Managing organizational knowledge assets'],
            ],
        ];

        foreach ($departments as $department) {
            if (isset($coursesByDepartment[$department->name])) {
                $courses = $coursesByDepartment[$department->name];
                
                foreach ($courses as $courseData) {
                    // Check if course already exists
                    if (!Course::where('code', $courseData['code'])->exists()) {
                        Course::create([
                            'code' => $courseData['code'],
                            'title' => $courseData['title'],
                            'description' => $courseData['description'],
                            'department_id' => $department->id,
                        ]);
                        
                        $this->command->info("Created course: {$courseData['code']} - {$courseData['title']}");
                    }
                }
            }
        }

        $this->command->info('Sample courses seeded successfully!');
        $this->command->info('Total courses: ' . Course::count());
    }
}
