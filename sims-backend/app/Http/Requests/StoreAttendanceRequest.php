<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAttendanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Attendance::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'student_id' => ['required', 'exists:students,id'],
            'course_id' => ['required', 'exists:courses,id'],
            'instructor_id' => ['required', 'exists:instructors,id'],
            'attendance_date' => ['required', 'date', 'before_or_equal:today'],
            'status' => ['required', Rule::in(['present', 'absent', 'late', 'excused'])],
            'check_in_time' => ['nullable', 'date_format:H:i:s'],
            'check_out_time' => ['nullable', 'date_format:H:i:s', 'after:check_in_time'],
            'notes' => ['nullable', 'string', 'max:500'],
            'semester' => ['required', Rule::in(['Fall', 'Spring', 'Summer'])],
            'year' => ['required', 'integer', 'min:2020', 'max:' . (date('Y') + 1)],
            
            // Bulk attendance (for multiple students)
            'students' => ['sometimes', 'array'],
            'students.*.student_id' => ['required_with:students', 'exists:students,id'],
            'students.*.status' => ['required_with:students', Rule::in(['present', 'absent', 'late', 'excused'])],
            'students.*.check_in_time' => ['nullable', 'date_format:H:i:s'],
            'students.*.check_out_time' => ['nullable', 'date_format:H:i:s', 'after:students.*.check_in_time'],
            'students.*.notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'student_id.required' => 'Student selection is required.',
            'student_id.exists' => 'Selected student does not exist.',
            'course_id.required' => 'Course selection is required.',
            'course_id.exists' => 'Selected course does not exist.',
            'instructor_id.required' => 'Instructor selection is required.',
            'instructor_id.exists' => 'Selected instructor does not exist.',
            'attendance_date.required' => 'Attendance date is required.',
            'attendance_date.before_or_equal' => 'Attendance date cannot be in the future.',
            'status.required' => 'Attendance status is required.',
            'status.in' => 'Invalid attendance status selected.',
            'check_in_time.date_format' => 'Check-in time must be in HH:MM:SS format.',
            'check_out_time.date_format' => 'Check-out time must be in HH:MM:SS format.',
            'check_out_time.after' => 'Check-out time must be after check-in time.',
            'semester.required' => 'Semester is required.',
            'semester.in' => 'Invalid semester selected.',
            'year.required' => 'Academic year is required.',
            'year.min' => 'Year cannot be before 2020.',
            'year.max' => 'Year cannot be more than 1 year in the future.',
            'students.*.student_id.required_with' => 'Student ID is required for bulk attendance.',
            'students.*.student_id.exists' => 'One or more selected students do not exist.',
            'students.*.status.required_with' => 'Status is required for each student.',
            'students.*.status.in' => 'Invalid status for one or more students.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'student_id' => 'student',
            'course_id' => 'course',
            'instructor_id' => 'instructor',
            'attendance_date' => 'attendance date',
            'check_in_time' => 'check-in time',
            'check_out_time' => 'check-out time',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $user = $this->user();
            
            // Validate instructor teaches the course
            if ($user->role === 'instructor') {
                $instructor = $user->instructor;
                if ($instructor && $instructor->id != $this->instructor_id) {
                    $validator->errors()->add('instructor_id', 'You can only mark attendance as yourself.');
                }
                
                if ($instructor && !$instructor->courses()->where('courses.id', $this->course_id)->exists()) {
                    $validator->errors()->add('course_id', 'You are not assigned to teach this course.');
                }
            }
            
            // Validate student is enrolled in the course (single student)
            if ($this->student_id && $this->course_id) {
                $student = \App\Models\Student::find($this->student_id);
                if ($student && !$student->courses()->where('courses.id', $this->course_id)->exists()) {
                    $validator->errors()->add('student_id', 'Student is not enrolled in the selected course.');
                }
            }
            
            // Validate bulk students are enrolled in the course
            if ($this->has('students') && $this->course_id) {
                foreach ($this->students as $index => $studentData) {
                    if (isset($studentData['student_id'])) {
                        $student = \App\Models\Student::find($studentData['student_id']);
                        if ($student && !$student->courses()->where('courses.id', $this->course_id)->exists()) {
                            $validator->errors()->add("students.{$index}.student_id", 'Student is not enrolled in the selected course.');
                        }
                    }
                }
            }
            
            // Check for duplicate attendance records
            if ($this->student_id && $this->course_id && $this->attendance_date) {
                $existingAttendance = \App\Models\Attendance::where([
                    'student_id' => $this->student_id,
                    'course_id' => $this->course_id,
                    'attendance_date' => $this->attendance_date,
                ])->exists();
                
                if ($existingAttendance) {
                    $validator->errors()->add('attendance_date', 'Attendance record already exists for this student on this date.');
                }
            }
        });
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'attendance_date' => $this->attendance_date ?? now()->toDateString(),
            'semester' => $this->semester ?? 'Fall',
            'year' => $this->year ?? date('Y'),
        ]);
        
        // Auto-assign instructor if user is instructor
        if ($this->user()->role === 'instructor' && !$this->instructor_id) {
            $instructor = $this->user()->instructor;
            if ($instructor) {
                $this->merge(['instructor_id' => $instructor->id]);
            }
        }
    }
}