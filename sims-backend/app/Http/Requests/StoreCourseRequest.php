<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Course::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'course_code' => ['required', 'string', 'max:20', 'unique:courses'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'credits' => ['required', 'integer', 'min:1', 'max:6'],
            'department_id' => ['required', 'exists:departments,id'],
            'semester' => ['required', Rule::in(['Fall', 'Spring', 'Summer'])],
            'year' => ['required', 'integer', 'min:2020', 'max:' . (date('Y') + 2)],
            'status' => ['required', Rule::in(['active', 'inactive', 'archived'])],
            'max_students' => ['required', 'integer', 'min:1', 'max:500'],
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
            'course_code.required' => 'Course code is required.',
            'course_code.unique' => 'This course code is already taken.',
            'title.required' => 'Course title is required.',
            'credits.required' => 'Credit hours are required.',
            'credits.min' => 'Course must have at least 1 credit hour.',
            'credits.max' => 'Course cannot exceed 6 credit hours.',
            'department_id.required' => 'Department selection is required.',
            'department_id.exists' => 'Selected department does not exist.',
            'semester.required' => 'Semester is required.',
            'semester.in' => 'Invalid semester selected.',
            'year.required' => 'Academic year is required.',
            'year.min' => 'Year cannot be before 2020.',
            'year.max' => 'Year cannot be more than 2 years in the future.',
            'status.required' => 'Course status is required.',
            'status.in' => 'Invalid course status selected.',
            'max_students.required' => 'Maximum student capacity is required.',
            'max_students.min' => 'Course must allow at least 1 student.',
            'max_students.max' => 'Course capacity cannot exceed 500 students.',
            'schedule.end_time.after' => 'End time must be after start time.',
            'instructor_ids.*.exists' => 'One or more selected instructors do not exist.',
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
            'course_code' => 'course code',
            'department_id' => 'department',
            'max_students' => 'maximum students',
            'instructor_ids' => 'instructors',
            'schedule.day_of_week' => 'day of week',
            'schedule.start_time' => 'start time',
            'schedule.end_time' => 'end time',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'status' => $this->status ?? 'active',
            'year' => $this->year ?? date('Y'),
        ]);
    }
}