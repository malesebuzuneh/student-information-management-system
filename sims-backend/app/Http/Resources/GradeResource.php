<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GradeResource extends JsonResource
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
            'student' => new StudentResource($this->whenLoaded('student')),
            'course' => new CourseResource($this->whenLoaded('course')),
            'instructor' => new InstructorResource($this->whenLoaded('instructor')),
            'assignment_type' => $this->assignment_type,
            'assignment_name' => $this->assignment_name,
            'points_earned' => $this->points_earned,
            'total_points' => $this->total_points,
            'percentage' => $this->when(
                $this->total_points > 0,
                round(($this->points_earned / $this->total_points) * 100, 2)
            ),
            'letter_grade' => $this->letter_grade,
            'grade_points' => $this->grade_points,
            'semester' => $this->semester,
            'year' => $this->year,
            'graded_date' => $this->graded_date,
            'comments' => $this->comments,
            'status' => $this->status,
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