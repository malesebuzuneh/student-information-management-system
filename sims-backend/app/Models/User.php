<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;   // 👈 Add this line

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;  // 👈 Add HasApiTokens here

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
        'status',
        'is_first_login',
        'is_developer_controlled',
        'last_login',
        'department_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_first_login' => 'boolean',
            'is_developer_controlled' => 'boolean',
            'last_login' => 'datetime',
        ];
    }

    // User can be a Student
    public function student()
    {
        return $this->hasOne(Student::class);
    }

    // User can be an Instructor
    public function instructor()
    {
        return $this->hasOne(Instructor::class);
    }

    // User belongs to a Department (for department heads)
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    // Check if user is a department head
    public function isDepartmentHead()
    {
        if ($this->role !== 'department') {
            return false;
        }

        // Check if user is linked to an instructor who is a department head
        if ($this->instructor) {
            return Department::where('head_instructor_id', $this->instructor->id)->exists();
        }

        return false;
    }

    // Get the department this user heads (if any)
    public function headedDepartment()
    {
        if ($this->instructor) {
            return Department::where('head_instructor_id', $this->instructor->id)->first();
        }

        return null;
    }
}
