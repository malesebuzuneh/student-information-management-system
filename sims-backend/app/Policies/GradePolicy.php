<?php

namespace App\Policies;

use App\Models\Grade;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class GradePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin, instructors, and department can view grades
        return in_array($user->role, ['admin', 'instructor', 'department']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Grade $grade): bool
    {
        // Admin can view any grade
        if ($user->role === 'admin') {
            return true;
        }
        
        // Students can view their own grades
        if ($user->role === 'student') {
            return $user->id === $grade->student->user_id;
        }
        
        // Instructors can view grades for courses they teach
        if ($user->role === 'instructor') {
            $instructor = $user->instructor;
            if ($instructor) {
                return $instructor->courses()->where('courses.id', $grade->course_id)->exists();
            }
        }
        
        // Department can view grades for students in their department
        if ($user->role === 'department') {
            return $grade->student->department_id === $user->department_id;
        }
        
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin and instructors can create grades
        return in_array($user->role, ['admin', 'instructor']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Grade $grade): bool
    {
        // Admin can update any grade
        if ($user->role === 'admin') {
            return true;
        }
        
        // Instructors can update grades for courses they teach
        if ($user->role === 'instructor') {
            $instructor = $user->instructor;
            if ($instructor) {
                return $instructor->courses()->where('courses.id', $grade->course_id)->exists();
            }
        }
        
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Grade $grade): bool
    {
        // Admin can delete any grade
        if ($user->role === 'admin') {
            return true;
        }
        
        // Instructors can delete grades for courses they teach (within time limit)
        if ($user->role === 'instructor') {
            $instructor = $user->instructor;
            if ($instructor) {
                $canManageCourse = $instructor->courses()->where('courses.id', $grade->course_id)->exists();
                // Allow deletion within 24 hours of creation
                $withinTimeLimit = $grade->created_at->diffInHours(now()) <= 24;
                return $canManageCourse && $withinTimeLimit;
            }
        }
        
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Grade $grade): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Grade $grade): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can bulk update grades.
     */
    public function bulkUpdate(User $user): bool
    {
        // Admin and instructors can bulk update grades
        return in_array($user->role, ['admin', 'instructor']);
    }

    /**
     * Determine whether the user can export grades.
     */
    public function export(User $user): bool
    {
        // Admin, instructors, and department can export grades
        return in_array($user->role, ['admin', 'instructor', 'department']);
    }
}