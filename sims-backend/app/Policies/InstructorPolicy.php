<?php

namespace App\Policies;

use App\Models\Instructor;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class InstructorPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin and department can view all instructors
        return in_array($user->role, ['admin', 'department']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Instructor $instructor): bool
    {
        // Admin can view any instructor
        if ($user->role === 'admin') {
            return true;
        }
        
        // Instructors can view their own profile
        if ($user->role === 'instructor') {
            return $user->id === $instructor->user_id;
        }
        
        // Department can view instructors in their department
        if ($user->role === 'department') {
            return $instructor->department_id === $user->department_id;
        }
        
        // Students can view their instructors
        if ($user->role === 'student') {
            $student = $user->student;
            if ($student) {
                return $student->instructors()->where('instructors.id', $instructor->id)->exists();
            }
        }
        
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admin can create instructors
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Instructor $instructor): bool
    {
        // Admin can update any instructor
        if ($user->role === 'admin') {
            return true;
        }
        
        // Instructors can update their own profile (limited fields)
        if ($user->role === 'instructor') {
            return $user->id === $instructor->user_id;
        }
        
        // Department can update instructors in their department
        if ($user->role === 'department') {
            return $instructor->department_id === $user->department_id;
        }
        
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Instructor $instructor): bool
    {
        // Only admin can delete instructors
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Instructor $instructor): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Instructor $instructor): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can assign courses.
     */
    public function assignCourse(User $user, Instructor $instructor): bool
    {
        // Admin can assign courses to any instructor
        if ($user->role === 'admin') {
            return true;
        }
        
        // Department can assign courses to instructors in their department
        if ($user->role === 'department') {
            return $instructor->department_id === $user->department_id;
        }
        
        return false;
    }

    /**
     * Determine whether the user can manage grades.
     */
    public function manageGrades(User $user, Instructor $instructor): bool
    {
        // Admin can manage any instructor's grades
        if ($user->role === 'admin') {
            return true;
        }
        
        // Instructors can manage their own grades
        if ($user->role === 'instructor') {
            return $user->id === $instructor->user_id;
        }
        
        return false;
    }
}