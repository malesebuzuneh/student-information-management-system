<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'student_id',
        'date_of_birth',
        'gender',
        'address',
        'phone',
        'emergency_contact',
        'emergency_phone',
        'department_id',
        'program',
        'year',
        'semester',
        'admission_type',
        'admission_date',
        'status',
        'last_login',
        'user_id',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'admission_date' => 'date',
        'last_login' => 'datetime',
    ];

    // Student belongs to a User (for authentication)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Student belongs to a Department
    public function department()
    {
        return $this->belongsTo(Department::class);
    }
    
    // Student enrolls in many Courses (many-to-many)
    public function courses()
    {
        return $this->belongsToMany(Course::class, 'course_student');
    }

    // Student has many Grades
    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    // Student has many Attendance records
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    // Generate unique student ID
    public static function generateStudentId($departmentCode = null, $year = null)
    {
        $year = $year ?: date('y'); // Current year in 2-digit format
        
        // Always use UGR as the prefix for all students
        $prefix = 'UGR';
        
        // Get the last student ID for this year (regardless of department)
        $lastStudent = self::where('student_id', 'like', "{$prefix}/%/{$year}")
                          ->orderBy('student_id', 'desc')
                          ->first();
        
        if ($lastStudent) {
            // Extract the sequence number and increment
            $parts = explode('/', $lastStudent->student_id);
            $sequence = intval($parts[1]) + 1;
        } else {
            // Start from 50001 for first student
            $sequence = 50001;
        }
        
        return "{$prefix}/" . str_pad($sequence, 5, '0', STR_PAD_LEFT) . "/{$year}";
    }

    // Check if student needs to change password on first login
    public function needsPasswordChange()
    {
        return $this->user && $this->user->is_first_login;
    }

    // Mark first login as completed
    public function completeFirstLogin()
    {
        $this->update(['last_login' => now()]);
        if ($this->user) {
            $this->user->update(['is_first_login' => false, 'last_login' => now()]);
        }
    }

    // Get default avatar
    public function getAvatarUrlAttribute()
    {
        // Return a default avatar based on name initials
        return "https://ui-avatars.com/api/?name=" . urlencode($this->name) . "&background=3B82F6&color=fff&size=200";
    }
}
