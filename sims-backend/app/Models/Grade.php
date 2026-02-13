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
        'grade',
        'status',
        'submitted_at',
        'department_approved_at',
        'finalized_at',
        'department_approved_by',
        'finalized_by'
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'department_approved_at' => 'datetime',
        'finalized_at' => 'datetime',
    ];

    // Grade status constants
    const STATUS_DRAFT = 'draft';
    const STATUS_SUBMITTED = 'submitted';
    const STATUS_DEPARTMENT_APPROVED = 'department_approved';
    const STATUS_FINALIZED = 'finalized';

    // Relationships
    public function student() { return $this->belongsTo(Student::class); }
    public function course() { return $this->belongsTo(Course::class); }
    public function instructor() { return $this->belongsTo(Instructor::class); }
    public function departmentApprovedBy() { return $this->belongsTo(User::class, 'department_approved_by'); }
    public function finalizedBy() { return $this->belongsTo(User::class, 'finalized_by'); }

    // Workflow methods
    public function submit()
    {
        $this->update([
            'status' => self::STATUS_SUBMITTED,
            'submitted_at' => now()
        ]);
    }

    public function departmentApprove($approver)
    {
        $this->update([
            'status' => self::STATUS_DEPARTMENT_APPROVED,
            'department_approved_at' => now(),
            'department_approved_by' => $approver->id
        ]);
    }

    public function finalize($finalizer)
    {
        $this->update([
            'status' => self::STATUS_FINALIZED,
            'finalized_at' => now(),
            'finalized_by' => $finalizer->id
        ]);
    }

    // Status check methods
    public function isDraft() { return $this->status === self::STATUS_DRAFT; }
    public function isSubmitted() { return $this->status === self::STATUS_SUBMITTED; }
    public function isDepartmentApproved() { return $this->status === self::STATUS_DEPARTMENT_APPROVED; }
    public function isFinalized() { return $this->status === self::STATUS_FINALIZED; }

    // Scope methods
    public function scopeDraft($query) { return $query->where('status', self::STATUS_DRAFT); }
    public function scopeSubmitted($query) { return $query->where('status', self::STATUS_SUBMITTED); }
    public function scopeDepartmentApproved($query) { return $query->where('status', self::STATUS_DEPARTMENT_APPROVED); }
    public function scopeFinalized($query) { return $query->where('status', self::STATUS_FINALIZED); }
}
