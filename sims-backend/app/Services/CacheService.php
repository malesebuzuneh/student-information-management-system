<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\Student;
use App\Models\Course;
use App\Models\Department;
use App\Models\Instructor;

class CacheService
{
    // Cache TTL constants (in seconds)
    const SHORT_TTL = 300;    // 5 minutes
    const MEDIUM_TTL = 1800;  // 30 minutes
    const LONG_TTL = 3600;    // 1 hour
    const DAILY_TTL = 86400;  // 24 hours

    /**
     * Get or cache student data with relationships
     */
    public function getStudent(int $studentId, array $with = []): ?Student
    {
        $cacheKey = "student.{$studentId}." . md5(implode(',', $with));
        
        return Cache::remember($cacheKey, self::MEDIUM_TTL, function () use ($studentId, $with) {
            Log::info('Cache miss for student', ['student_id' => $studentId]);
            return Student::with($with)->find($studentId);
        });
    }

    /**
     * Get or cache course data with relationships
     */
    public function getCourse(int $courseId, array $with = []): ?Course
    {
        $cacheKey = "course.{$courseId}." . md5(implode(',', $with));
        
        return Cache::remember($cacheKey, self::MEDIUM_TTL, function () use ($courseId, $with) {
            Log::info('Cache miss for course', ['course_id' => $courseId]);
            return Course::with($with)->find($courseId);
        });
    }

    /**
     * Get or cache department statistics
     */
    public function getDepartmentStats(int $departmentId): array
    {
        $cacheKey = "department.stats.{$departmentId}";
        
        return Cache::remember($cacheKey, self::LONG_TTL, function () use ($departmentId) {
            Log::info('Cache miss for department stats', ['department_id' => $departmentId]);
            
            $department = Department::find($departmentId);
            if (!$department) {
                return [];
            }

            return [
                'total_students' => $department->students()->count(),
                'total_instructors' => $department->instructors()->count(),
                'total_courses' => $department->courses()->count(),
                'active_courses' => $department->courses()->where('status', 'active')->count(),
                'average_gpa' => $department->students()->avg('gpa') ?? 0,
                'updated_at' => now()->toISOString(),
            ];
        });
    }

    /**
     * Get or cache system-wide statistics
     */
    public function getSystemStats(): array
    {
        $cacheKey = 'system.stats';
        
        return Cache::remember($cacheKey, self::LONG_TTL, function () {
            Log::info('Cache miss for system stats');
            
            return [
                'total_students' => Student::count(),
                'total_instructors' => Instructor::count(),
                'total_courses' => Course::count(),
                'total_departments' => Department::count(),
                'active_students' => Student::where('status', 'active')->count(),
                'active_courses' => Course::where('status', 'active')->count(),
                'updated_at' => now()->toISOString(),
            ];
        });
    }

    /**
     * Get or cache student's enrolled courses
     */
    public function getStudentCourses(int $studentId): array
    {
        $cacheKey = "student.{$studentId}.courses";
        
        return Cache::remember($cacheKey, self::MEDIUM_TTL, function () use ($studentId) {
            Log::info('Cache miss for student courses', ['student_id' => $studentId]);
            
            $student = Student::with(['courses.instructors.user', 'courses.department'])
                             ->find($studentId);
            
            if (!$student) {
                return [];
            }

            return $student->courses->map(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'code' => $course->course_code,
                    'credits' => $course->credits,
                    'department' => $course->department->name,
                    'instructors' => $course->instructors->pluck('user.name'),
                    'status' => $course->pivot->status ?? 'enrolled',
                ];
            })->toArray();
        });
    }

    /**
     * Get or cache instructor's assigned courses
     */
    public function getInstructorCourses(int $instructorId): array
    {
        $cacheKey = "instructor.{$instructorId}.courses";
        
        return Cache::remember($cacheKey, self::MEDIUM_TTL, function () use ($instructorId) {
            Log::info('Cache miss for instructor courses', ['instructor_id' => $instructorId]);
            
            $instructor = Instructor::with(['courses.students', 'courses.department'])
                                  ->find($instructorId);
            
            if (!$instructor) {
                return [];
            }

            return $instructor->courses->map(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'code' => $course->course_code,
                    'credits' => $course->credits,
                    'department' => $course->department->name,
                    'enrolled_students' => $course->students->count(),
                    'max_students' => $course->max_students,
                ];
            })->toArray();
        });
    }

    /**
     * Get or cache popular courses (most enrolled)
     */
    public function getPopularCourses(int $limit = 10): array
    {
        $cacheKey = "courses.popular.{$limit}";
        
        return Cache::remember($cacheKey, self::DAILY_TTL, function () use ($limit) {
            Log::info('Cache miss for popular courses');
            
            return Course::withCount('students')
                        ->orderBy('students_count', 'desc')
                        ->limit($limit)
                        ->get()
                        ->map(function ($course) {
                            return [
                                'id' => $course->id,
                                'title' => $course->title,
                                'code' => $course->course_code,
                                'enrolled_count' => $course->students_count,
                            ];
                        })
                        ->toArray();
        });
    }

    /**
     * Invalidate student-related cache
     */
    public function invalidateStudentCache(int $studentId): void
    {
        $patterns = [
            "student.{$studentId}.*",
            "department.stats.*",
            "system.stats",
        ];

        foreach ($patterns as $pattern) {
            Cache::forget($pattern);
        }

        Log::info('Invalidated student cache', ['student_id' => $studentId]);
    }

    /**
     * Invalidate course-related cache
     */
    public function invalidateCourseCache(int $courseId): void
    {
        $patterns = [
            "course.{$courseId}.*",
            "courses.popular.*",
            "department.stats.*",
            "system.stats",
        ];

        foreach ($patterns as $pattern) {
            Cache::forget($pattern);
        }

        Log::info('Invalidated course cache', ['course_id' => $courseId]);
    }

    /**
     * Invalidate instructor-related cache
     */
    public function invalidateInstructorCache(int $instructorId): void
    {
        $patterns = [
            "instructor.{$instructorId}.*",
            "department.stats.*",
            "system.stats",
        ];

        foreach ($patterns as $pattern) {
            Cache::forget($pattern);
        }

        Log::info('Invalidated instructor cache', ['instructor_id' => $instructorId]);
    }

    /**
     * Invalidate department-related cache
     */
    public function invalidateDepartmentCache(int $departmentId): void
    {
        $patterns = [
            "department.stats.{$departmentId}",
            "system.stats",
        ];

        foreach ($patterns as $pattern) {
            Cache::forget($pattern);
        }

        Log::info('Invalidated department cache', ['department_id' => $departmentId]);
    }

    /**
     * Clear all application cache
     */
    public function clearAllCache(): void
    {
        Cache::flush();
        Log::info('Cleared all application cache');
    }

    /**
     * Get cache statistics
     */
    public function getCacheStats(): array
    {
        // This would require Redis or Memcached for detailed stats
        // For database cache, we can provide basic info
        return [
            'driver' => config('cache.default'),
            'status' => 'active',
            'last_cleared' => Cache::get('cache.last_cleared', 'Never'),
        ];
    }

    /**
     * Warm up frequently accessed cache
     */
    public function warmUpCache(): void
    {
        Log::info('Starting cache warm-up');

        // Warm up system stats
        $this->getSystemStats();

        // Warm up popular courses
        $this->getPopularCourses();

        // Warm up department stats for all departments
        Department::pluck('id')->each(function ($departmentId) {
            $this->getDepartmentStats($departmentId);
        });

        Log::info('Cache warm-up completed');
    }
}