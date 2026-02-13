<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'title',
        'description',
        'department_id',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function instructors()
    {
        return $this->belongsToMany(Instructor::class, 'course_instructor');
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'course_student');
    }
    public function schedules()
{
    return $this->hasMany(Schedule::class);
}

}
