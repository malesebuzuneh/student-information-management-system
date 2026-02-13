<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $student = $this->route('student');
        return $this->user()->can('update', $student);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $student = $this->route('student');
        $userId = $student->user_id;
        $studentId = $student->id;

        return [
            // User information (limited fields for students updating their own profile)
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($userId)],
            'password' => ['sometimes', 'string', 'min:8', 'confirmed'],
            
            // Student specific information
            'student_id' => ['sometimes', 'string', 'max:50', Rule::unique('students')->ignore($studentId)],
            'department_id' => ['sometimes', 'exists:departments,id'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'date_of_birth' => ['sometimes', 'date', 'before:today'],
            'enrollment_date' => ['sometimes', 'date', 'before_or_equal:today'],
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'suspended', 'graduated'])],
            
            // Optional fields
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:20'],
            'emergency_contact_relationship' => ['nullable', 'string', 'max:100'],
            
            // Academic information (admin/department only)
            'gpa' => ['sometimes', 'numeric', 'min:0', 'max:4'],
            'total_credits' => ['sometimes', 'integer', 'min:0'],
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
            'email.unique' => 'This email address is already registered.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
            'student_id.unique' => 'This Student ID is already taken.',
            'department_id.exists' => 'Selected department does not exist.',
            'date_of_birth.before' => 'Date of birth must be before today.',
            'enrollment_date.before_or_equal' => 'Enrollment date cannot be in the future.',
            'status.in' => 'Invalid student status selected.',
            'gpa.numeric' => 'GPA must be a number.',
            'gpa.min' => 'GPA cannot be negative.',
            'gpa.max' => 'GPA cannot exceed 4.0.',
            'total_credits.integer' => 'Total credits must be a whole number.',
            'total_credits.min' => 'Total credits cannot be negative.',
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
            
            // Students can only update limited fields
            if ($user->role === 'student') {
                $restrictedFields = ['student_id', 'department_id', 'enrollment_date', 'status', 'gpa', 'total_credits'];
                
                foreach ($restrictedFields as $field) {
                    if ($this->has($field)) {
                        $validator->errors()->add($field, "You are not authorized to update this field.");
                    }
                }
            }
        });
    }
}