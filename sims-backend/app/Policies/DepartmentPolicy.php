<?php

namespace App\Policies;

use App\Models\Department;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DepartmentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view departments
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Department $department): bool
    {
        // All authenticated users can view department details
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admin can create departments
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Department $department): bool
    {
        // Admin can update any department
        if ($user->role === 'admin') {
            return true;
        }
        
        // Department users can update their own department (limited fields)
        if ($user->role === 'department') {
            return $user->department_id === $department->id;
        }
        
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Department $department): bool
    {
        // Only admin can delete departments
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Department $department): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Department $department): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can manage department courses.
     */
    public function manageCourses(User $user, Department $department): bool
    {
        // Admin can manage courses for any department
        if ($user->role === 'admin') {
            return true;
        }
        
        // Department users can manage their own department's courses
        if ($user->role === 'department') {
            return $user->department_id === $department->id;
        }
        
        return false;
    }

    /**
     * Determine whether the user can manage department instructors.
     */
    public function manageInstructors(User $user, Department $department): bool
    {
        // Admin can manage instructors for any department
        if ($user->role === 'admin') {
            return true;
        }
        
        // Department users can manage their own department's instructors
        if ($user->role === 'department') {
            return $user->department_id === $department->id;
        }
        
        return false;
    }

    /**
     * Determine whether the user can manage department students.
     */
    public function manageStudents(User $user, Department $department): bool
    {
        // Admin can manage students for any department
        if ($user->role === 'admin') {
            return true;
        }
        
        // Department users can manage their own department's students
        if ($user->role === 'department') {
            return $user->department_id === $department->id;
        }
        
        return false;
    }

    /**
     * Determine whether the user can approve enrollments.
     */
    public function approveEnrollments(User $user, Department $department): bool
    {
        // Admin can approve enrollments for any department
        if ($user->role === 'admin') {
            return true;
        }
        
        // Department users can approve enrollments for their department
        if ($user->role === 'department') {
            return $user->department_id === $department->id;
        }
        
        return false;
    }

    /**
     * Determine whether the user can view department reports.
     */
    public function viewReports(User $user, Department $department): bool
    {
        // Admin can view reports for any department
        if ($user->role === 'admin') {
            return true;
        }
        
        // Department users can view their own department's reports
        if ($user->role === 'department') {
            return $user->department_id === $department->id;
        }
        
        return false;
    }
}