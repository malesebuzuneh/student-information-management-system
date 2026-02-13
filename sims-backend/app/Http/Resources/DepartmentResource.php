<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'head_of_department' => $this->head_of_department,
            'phone' => $this->phone,
            'email' => $this->email,
            'office_location' => $this->office_location,
            'established_year' => $this->established_year,
            'status' => $this->status,
            'students_count' => $this->when(
                $this->relationLoaded('students'),
                $this->students->count()
            ),
            'instructors_count' => $this->when(
                $this->relationLoaded('instructors'),
                $this->instructors->count()
            ),
            'courses_count' => $this->when(
                $this->relationLoaded('courses'),
                $this->courses->count()
            ),
            'students' => StudentResource::collection($this->whenLoaded('students')),
            'instructors' => InstructorResource::collection($this->whenLoaded('instructors')),
            'courses' => CourseResource::collection($this->whenLoaded('courses')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Get additional data that should be returned with the resource array.
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'version' => '1.0',
                'timestamp' => now()->toISOString(),
            ],
        ];
    }
}