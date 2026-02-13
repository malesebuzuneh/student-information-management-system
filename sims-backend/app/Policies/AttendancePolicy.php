<?php

namespace App\Policies;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AttendancePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin, instructors, and department can view attendance records
        return in_array($user->role, ['admin', 'instructor', 'department']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Attendance $attendance): bool
    {
        // Admin can view any attendance record
        if ($user->role === 'admin') {
            return true;
        }
        
        // Students can view their own attendance
        if ($user->role === 'student') {
            return $user->id === $attendance->student->user_id;
        }
        
        // Instructors can view attendance for courses they teach
        if ($user->role === 'instructor') {
            $instructor = $user->instructor;
            if ($instructor) {
                return $instructor->courses()->where('courses.id', $attendance->course_id)->exists();
            }
        }
        
        // Department can view attendance for students in their department
        if ($user->role === 'department') {
            return $attendance->student->department_id === $user->department_id;
        }
        
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin and instructors can create attendance records
        return in_array($user->role, ['admin', 'instructor']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Attendance $attendance): bool
    {
        // Admin can update any attendance record
        if ($user->role === 'admin') {
            return true;
        }
        
        // Instructors can update attendance for courses they teach
        if ($user->role === 'instructor') {
            $instructor = $user->instructor;
            if ($instructor) {
                $canManageCourse = $instructor->courses()->where('courses.id', $attendance->course_id)->exists();
                // Allow updates within 48 hours of the attendance date
                $withinTimeLimit = $attendance->attendance_date->diffInHours(now()) <= 48;
                return $canManageCourse && $withinTimeLimit;
            }
        }
        
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Attendance $attendance): bool
    {
        // Admin can delete any attendance record
        if ($user->role === 'admin') {
            return true;
        }
        
        // Instructors can delete attendance records for courses they teach (within time limit)
        if ($user->role === 'instructor') {
            $instructor = $user->instructor;
            if ($instructor) {
                $canManageCourse = $instructor->courses()->where('courses.id', $attendance->course_id)->exists();
                // Allow deletion within 24 hours of creation
                $withinTimeLimit = $attendance->created_at->diffInHours(now()) <= 24;
                return $canManageCourse && $withinTimeLimit;
            }
        }
        
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Attendance $attendance): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Attendance $attendance): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can bulk update attendance.
     */
    public function bulkUpdate(User $user): bool
    {
        // Admin and instructors can bulk update attendance
        return in_array($user->role, ['admin', 'instructor']);
    }

    /**
     * Determine whether the user can export attendance reports.
     */
    public function export(User $user): bool
    {
        // Admin, instructors, and department can export attendance
        return in_array($user->role, ['admin', 'instructor', 'department']);
    }

    /**
     * Determine whether the user can mark attendance for a specific date.
     */
    public function markAttendance(User $user, $courseId): bool
    {
        // Admin can mark attendance for any course
        if ($user->role === 'admin') {
            return true;
        }
        
        // Instructors can mark attendance for courses they teach
        if ($user->role === 'instructor') {
            $instructor = $user->instructor;
            if ($instructor) {
                return $instructor->courses()->where('courses.id', $courseId)->exists();
            }
        }
        
        return false;
    }
}