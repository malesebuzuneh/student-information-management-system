<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGradeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Grade::class);
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
            'assignment_type' => ['required', Rule::in(['quiz', 'assignment', 'midterm', 'final', 'project', 'participation', 'lab', 'homework'])],
            'assignment_name' => ['required', 'string', 'max:255'],
            'points_earned' => ['required', 'numeric', 'min:0'],
            'total_points' => ['required', 'numeric', 'min:0.01'],
            'letter_grade' => ['nullable', Rule::in(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'])],
            'grade_points' => ['nullable', 'numeric', 'min:0', 'max:4'],
            'semester' => ['required', Rule::in(['Fall', 'Spring', 'Summer'])],
            'year' => ['required', 'integer', 'min:2020', 'max:' . (date('Y') + 1)],
            'graded_date' => ['required', 'date', 'before_or_equal:today'],
            'comments' => ['nullable', 'string', 'max:1000'],
            'status' => ['sometimes', Rule::in(['draft', 'published', 'archived'])],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:100'],
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
            'assignment_type.required' => 'Assignment type is required.',
            'assignment_type.in' => 'Invalid assignment type selected.',
            'assignment_name.required' => 'Assignment name is required.',
            'points_earned.required' => 'Points earned is required.',
            'points_earned.min' => 'Points earned cannot be negative.',
            'total_points.required' => 'Total points is required.',
            'total_points.min' => 'Total points must be greater than 0.',
            'letter_grade.in' => 'Invalid letter grade selected.',
            'grade_points.min' => 'Grade points cannot be negative.',
            'grade_points.max' => 'Grade points cannot exceed 4.0.',
            'semester.required' => 'Semester is required.',
            'semester.in' => 'Invalid semester selected.',
            'year.required' => 'Academic year is required.',
            'year.min' => 'Year cannot be before 2020.',
            'year.max' => 'Year cannot be more than 1 year in the future.',
            'graded_date.required' => 'Graded date is required.',
            'graded_date.before_or_equal' => 'Graded date cannot be in the future.',
            'status.in' => 'Invalid status selected.',
            'weight.min' => 'Weight cannot be negative.',
            'weight.max' => 'Weight cannot exceed 100%.',
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
            'assignment_type' => 'assignment type',
            'assignment_name' => 'assignment name',
            'points_earned' => 'points earned',
            'total_points' => 'total points',
            'letter_grade' => 'letter grade',
            'grade_points' => 'grade points',
            'graded_date' => 'graded date',
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
            // Validate that points earned doesn't exceed total points
            if ($this->points_earned > $this->total_points) {
                $validator->errors()->add('points_earned', 'Points earned cannot exceed total points.');
            }
            
            // Validate instructor teaches the course
            $user = $this->user();
            if ($user->role === 'instructor') {
                $instructor = $user->instructor;
                if ($instructor && $instructor->id != $this->instructor_id) {
                    $validator->errors()->add('instructor_id', 'You can only create grades as yourself.');
                }
                
                if ($instructor && !$instructor->courses()->where('courses.id', $this->course_id)->exists()) {
                    $validator->errors()->add('course_id', 'You are not assigned to teach this course.');
                }
            }
            
            // Validate student is enrolled in the course
            if ($this->student_id && $this->course_id) {
                $student = \App\Models\Student::find($this->student_id);
                if ($student && !$student->courses()->where('courses.id', $this->course_id)->exists()) {
                    $validator->errors()->add('student_id', 'Student is not enrolled in the selected course.');
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
            'status' => $this->status ?? 'published',
            'graded_date' => $this->graded_date ?? now()->toDateString(),
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