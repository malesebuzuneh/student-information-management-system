<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class StudentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin can view all students, department can view their students
        return in_array($user->role, ['admin', 'department']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Student $student): bool
    {
        // Admin can view any student
        if ($user->role === 'admin') {
            return true;
        }
        
        // Students can only view their own profile
        if ($user->role === 'student') {
            return $user->id === $student->user_id;
        }
        
        // Instructors can view students in their courses
        if ($user->role === 'instructor') {
            $instructor = $user->instructor;
            if ($instructor) {
                return $instructor->students()->where('students.id', $student->id)->exists();
            }
        }
        
        // Department can view students in their department
        if ($user->role === 'department') {
            return $student->department_id === $user->department_id;
        }
        
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admin can create students
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Student $student): bool
    {
        // Admin can update any student
        if ($user->role === 'admin') {
            return true;
        }
        
        // Students can update their own profile (limited fields)
        if ($user->role === 'student') {
            return $user->id === $student->user_id;
        }
        
        // Department can update students in their department
        if ($user->role === 'department') {
            return $student->department_id === $user->department_id;
        }
        
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Student $student): bool
    {
        // Only admin can delete students
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Student $student): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Student $student): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can enroll in courses.
     */
    public function enroll(User $user, Student $student): bool
    {
        // Students can only enroll themselves
        if ($user->role === 'student') {
            return $user->id === $student->user_id;
        }
        
        // Admin can enroll any student
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can view grades.
     */
    public function viewGrades(User $user, Student $student): bool
    {
        // Admin can view any student's grades
        if ($user->role === 'admin') {
            return true;
        }
        
        // Students can view their own grades
        if ($user->role === 'student') {
            return $user->id === $student->user_id;
        }
        
        // Instructors can view grades of students in their courses
        if ($user->role === 'instructor') {
            $instructor = $user->instructor;
            if ($instructor) {
                return $instructor->students()->where('students.id', $student->id)->exists();
            }
        }
        
        // Department can view grades of students in their department
        if ($user->role === 'department') {
            return $student->department_id === $user->department_id;
        }
        
        return false;
    }
}