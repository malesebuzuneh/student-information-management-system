<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'course_id',
        'instructor_id',
        'date',
        'status'
    ];

    public function student() { return $this->belongsTo(Student::class); }
    public function course() { return $this->belongsTo(Course::class); }
    public function instructor() { return $this->belongsTo(Instructor::class); }
}
