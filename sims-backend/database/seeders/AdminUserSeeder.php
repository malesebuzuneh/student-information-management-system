<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * DEVELOPER NOTE: This creates a developer-controlled admin account.
     * These credentials can only be changed by the system developer.
     * End users cannot modify this account through the application interface.
     */
    public function run(): void
    {
        // Create or update the developer-controlled admin user
        User::updateOrCreate(
            ['username' => 'melese74'], // Find by username
            [
                'name' => 'Melese Admin',
                'username' => 'melese74',
                'email' => 'melese74@mwu.edu.et',
                'password' => Hash::make('0dfd27mb'),
                'role' => 'admin',
                'status' => 'active',
                'is_first_login' => false, // Developer-controlled account
                'is_developer_controlled' => true, // Mark as developer-controlled
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Developer-controlled admin user created/updated successfully!');
        $this->command->info('Username: melese74');
        $this->command->info('Password: 0dfd27mb');
        $this->command->info('Role: admin');
        $this->command->info('Note: This account can only be modified by the system developer.');
    }
}
