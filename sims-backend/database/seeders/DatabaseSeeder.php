<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     * 
     * Only creates the system admin user.
     * All other data (departments, instructors, students, courses) 
     * should be created through the admin interface.
     */
    public function run(): void
    {
        // Create only the system admin user
        $this->call([
            AdminUserSeeder::class,
        ]);

        $this->command->info('✅ System admin created successfully!');
        $this->command->info('🔑 Login: admin@mwu.edu.et / password');
        $this->command->info('📝 Use admin interface to create departments, instructors, students, and courses.');
    }
}
