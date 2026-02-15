<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Department;
use Illuminate\Support\Facades\Hash;

class CreateDepartmentHeadsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = Department::all();
        
        foreach ($departments as $department) {
            $username = strtolower($department->code) . 'head';
            $email = $username . '@university.edu';
            $password = 'password123';
            
            // Check if user already exists
            $existingUser = User::where('username', $username)->first();
            
            if (!$existingUser) {
                User::create([
                    'name' => "Head of {$department->name}",
                    'username' => $username,
                    'email' => $email,
                    'password' => Hash::make($password),
                    'role' => 'department',
                    'status' => 'active',
                    'is_first_login' => false,
                    'department_id' => $department->id,
                ]);
                
                $this->command->info("Created department head: {$username} (password: {$password})");
            } else {
                $this->command->info("Department head already exists: {$username}");
            }
        }
        
        $this->command->info('Department heads creation completed!');
    }
}