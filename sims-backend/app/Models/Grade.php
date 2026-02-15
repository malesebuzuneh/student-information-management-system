<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'course_id',
        'instructor_id',
        'grade'
    ];

    // Relationships
    public function student() 
    { 
        return $this->belongsTo(Student::class); 
    }
    
    public function course() 
    { 
        return $this->belongsTo(Course::class); 
    }
    
    public function instructor() 
    { 
        return $this->belongsTo(Instructor::class); 
    }

    // For backward compatibility with complex workflow (if needed later)
    public function departmentApprovedBy() 
    { 
        return $this->belongsTo(User::class, 'department_approved_by'); 
    }
    
    public function finalizedBy() 
    { 
        return $this->belongsTo(User::class, 'finalized_by'); 
    }

    // Simple status methods (for current simple table structure)
    public function isDraft() 
    { 
        return false; // All grades are considered final in simple structure
    }
    
    public function isSubmitted() 
    { 
        return true; // All grades are considered submitted
    }
    
    public function isDepartmentApproved() 
    { 
        return true; // All grades are considered approved
    }
    
    public function isFinalized() 
    { 
        return true; // All grades are considered finalized
    }

    // Simple scope methods (return all grades since we don't have status column)
    public function scopeDraft($query) 
    { 
        return $query; // Return all grades
    }
    
    public function scopeSubmitted($query) 
    { 
        return $query; // Return all grades
    }
    
    public function scopeDepartmentApproved($query) 
    { 
        return $query; // Return all grades
    }
    
    public function scopeFinalized($query) 
    { 
        return $query; // Return all grades since all are considered finalized
    }
}
