<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'head_name',
        'head_email',
        'head_instructor_id',
        'phone',
        'location',
        'established_year',
        'status'
    ];

    protected $casts = [
        'established_year' => 'integer',
    ];

    public function students()
    {
        return $this->hasMany(Student::class);
    }
    
    public function instructors()
    {
        return $this->hasMany(Instructor::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    // Department head relationship
    public function headInstructor()
    {
        return $this->belongsTo(Instructor::class, 'head_instructor_id');
    }

    // Scope for active departments
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Scope for inactive departments
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }
}
