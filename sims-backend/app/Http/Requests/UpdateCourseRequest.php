<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCourseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $course = $this->route('course');
        return $this->user()->can('update', $course);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $course = $this->route('course');
        $courseId = $course->id;

        return [
            'course_code' => ['sometimes', 'string', 'max:20', Rule::unique('courses')->ignore($courseId)],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'credits' => ['sometimes', 'integer', 'min:1', 'max:6'],
            'department_id' => ['sometimes', 'exists:departments,id'],
            'semester' => ['sometimes', Rule::in(['Fall', 'Spring', 'Summer'])],
            'year' => ['sometimes', 'integer', 'min:2020', 'max:' . (date('Y') + 2)],
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'archived'])],
            'max_students' => ['sometimes', 'integer', 'min:1', 'max:500'],
            'prerequisites' => ['nullable', 'string', 'max:500'],
            'syllabus' => ['nullable', 'string', 'max:2000'],
            
            // Schedule information
            'schedule' => ['sometimes', 'array'],
            'schedule.day_of_week' => ['required_with:schedule', Rule::in(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])],
            'schedule.start_time' => ['required_with:schedule', 'date_format:H:i'],
            'schedule.end_time' => ['required_with:schedule', 'date_format:H:i', 'after:schedule.start_time'],
            'schedule.room' => ['nullable', 'string', 'max:50'],
            'schedule.building' => ['nullable', 'string', 'max:100'],
            
            // Instructor assignment
            'instructor_ids' => ['sometimes', 'array'],
            'instructor_ids.*' => ['exists:instructors,id'],
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
            'course_code.unique' => 'This course code is already taken.',
            'credits.min' => 'Course must have at least 1 credit hour.',
            'credits.max' => 'Course cannot exceed 6 credit hours.',
            'department_id.exists' => 'Selected department does not exist.',
            'semester.in' => 'Invalid semester selected.',
            'year.min' => 'Year cannot be before 2020.',
            'year.max' => 'Year cannot be more than 2 years in the future.',
            'status.in' => 'Invalid course status selected.',
            'max_students.min' => 'Course must allow at least 1 student.',
            'max_students.max' => 'Course capacity cannot exceed 500 students.',
            'schedule.end_time.after' => 'End time must be after start time.',
            'instructor_ids.*.exists' => 'One or more selected instructors do not exist.',
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
            $course = $this->route('course');
            
            // Instructors can only update limited fields
            if ($user->role === 'instructor') {
                $restrictedFields = ['course_code', 'credits', 'department_id', 'semester', 'year', 'max_students'];
                
                foreach ($restrictedFields as $field) {
                    if ($this->has($field)) {
                        $validator->errors()->add($field, "You are not authorized to update this field.");
                    }
                }
                
                // Verify instructor teaches this course
                $instructor = $user->instructor;
                if ($instructor && !$instructor->courses()->where('courses.id', $course->id)->exists()) {
                    $validator->errors()->add('course', "You are not authorized to update this course.");
                }
            }
        });
    }
}