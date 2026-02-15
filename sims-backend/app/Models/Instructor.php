<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Instructor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'instructor_id',
        'department_id',
        'qualification',
        'specialization',
        'status',
        'archived_at',
        'last_login',
        'user_id', // Add user_id to link with User model
    ];

    protected $casts = [
        'archived_at' => 'datetime',
        'last_login' => 'datetime',
    ];

    // Instructor belongs to a User (for authentication)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Instructor belongs to a Department
    public function department()
    {
        return $this->belongsTo(Department::class);
    }
    
    // Instructor teaches many Courses (many-to-many)
    public function courses()
    {
        return $this->belongsToMany(Course::class, 'course_instructor');
    }

    // Generate unique instructor ID
    public static function generateInstructorId($departmentCode = null, $year = null)
    {
        $year = $year ?: date('y'); // Current year in 2-digit format
        
        // If no department code provided, use INS as default
        if (!$departmentCode) {
            $departmentCode = 'INS';
        }
        
        // Get the last instructor ID for this department and year
        $lastInstructor = self::where('instructor_id', 'like', "{$departmentCode}/%/{$year}")
                             ->orderBy('instructor_id', 'desc')
                             ->first();
        
        if ($lastInstructor) {
            // Extract the sequence number and increment
            $parts = explode('/', $lastInstructor->instructor_id);
            $sequence = intval($parts[1]) + 1;
        } else {
            // Start from 10001 for first instructor
            $sequence = 10001;
        }
        
        return "{$departmentCode}/" . str_pad($sequence, 5, '0', STR_PAD_LEFT) . "/{$year}";
    }
}
