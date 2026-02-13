<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CoursePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view courses
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Course $course): bool
    {
        // All authenticated users can view course details
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin and department can create courses
        return in_array($user->role, ['admin', 'department']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Course $course): bool
    {
        // Admin can update any course
        if ($user->role === 'admin') {
            return true;
        }
        
        // Department can update courses in their department
        if ($user->role === 'department') {
            return $course->department_id === $user->department_id;
        }
        
        // Instructors can update courses they teach (limited fields)
        if ($user->role === 'instructor') {
            $instructor = $user->instructor;
            if ($instructor) {
                return $instructor->courses()->where('courses.id', $course->id)->exists();
            }
        }
        
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Course $course): bool
    {
        // Admin can delete any course
        if ($user->role === 'admin') {
            return true;
        }
        
        // Department can delete courses in their department
        if ($user->role === 'department') {
            return $course->department_id === $user->department_id;
        }
        
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Course $course): bool
    {
        return in_array($user->role, ['admin', 'department']);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Course $course): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can enroll in the course.
     */
    public function enroll(User $user, Course $course): bool
    {
        // Students can enroll in courses
        if ($user->role === 'student') {
            $student = $user->student;
            if ($student) {
                // Check if student is in the same department or course allows cross-department enrollment
                return $student->department_id === $course->department_id || $course->allow_cross_department;
            }
        }
        
        // Admin can enroll students in any course
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can manage enrollments.
     */
    public function manageEnrollments(User $user, Course $course): bool
    {
        // Admin can manage any course enrollments
        if ($user->role === 'admin') {
            return true;
        }
        
        // Department can manage enrollments for their courses
        if ($user->role === 'department') {
            return $course->department_id === $user->department_id;
        }
        
        // Instructors can view enrollments for their courses
        if ($user->role === 'instructor') {
            $instructor = $user->instructor;
            if ($instructor) {
                return $instructor->courses()->where('courses.id', $course->id)->exists();
            }
        }
        
        return false;
    }

    /**
     * Determine whether the user can assign instructors to the course.
     */
    public function assignInstructor(User $user, Course $course): bool
    {
        // Admin can assign instructors to any course
        if ($user->role === 'admin') {
            return true;
        }
        
        // Department can assign instructors to their courses
        if ($user->role === 'department') {
            return $course->department_id === $user->department_id;
        }
        
        return false;
    }
}