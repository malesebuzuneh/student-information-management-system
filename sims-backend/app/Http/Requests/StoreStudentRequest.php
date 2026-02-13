<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Student::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // User information
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            
            // Student specific information
            'student_id' => ['required', 'string', 'max:50', 'unique:students'],
            'department_id' => ['required', 'exists:departments,id'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'enrollment_date' => ['required', 'date', 'before_or_equal:today'],
            'status' => ['required', Rule::in(['active', 'inactive', 'suspended', 'graduated'])],
            
            // Optional fields
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:20'],
            'emergency_contact_relationship' => ['nullable', 'string', 'max:100'],
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
            'name.required' => 'Student name is required.',
            'email.required' => 'Email address is required.',
            'email.unique' => 'This email address is already registered.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
            'student_id.required' => 'Student ID is required.',
            'student_id.unique' => 'This Student ID is already taken.',
            'department_id.required' => 'Department selection is required.',
            'department_id.exists' => 'Selected department does not exist.',
            'date_of_birth.required' => 'Date of birth is required.',
            'date_of_birth.before' => 'Date of birth must be before today.',
            'enrollment_date.required' => 'Enrollment date is required.',
            'enrollment_date.before_or_equal' => 'Enrollment date cannot be in the future.',
            'status.required' => 'Student status is required.',
            'status.in' => 'Invalid student status selected.',
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
            'department_id' => 'department',
            'date_of_birth' => 'date of birth',
            'enrollment_date' => 'enrollment date',
            'emergency_contact_name' => 'emergency contact name',
            'emergency_contact_phone' => 'emergency contact phone',
            'emergency_contact_relationship' => 'emergency contact relationship',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'enrollment_date' => $this->enrollment_date ?? now()->toDateString(),
            'status' => $this->status ?? 'active',
        ]);
    }
}