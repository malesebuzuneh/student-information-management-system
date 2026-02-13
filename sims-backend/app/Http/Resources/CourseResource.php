<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
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
            'course_code' => $this->course_code,
            'title' => $this->title,
            'description' => $this->description,
            'credits' => $this->credits,
            'semester' => $this->semester,
            'year' => $this->year,
            'status' => $this->status,
            'max_students' => $this->max_students,
            'enrolled_students_count' => $this->when(
                $this->relationLoaded('students'),
                $this->students->count()
            ),
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'instructors' => InstructorResource::collection($this->whenLoaded('instructors')),
            'students' => StudentResource::collection($this->whenLoaded('students')),
            'grades' => GradeResource::collection($this->whenLoaded('grades')),
            'attendance' => AttendanceResource::collection($this->whenLoaded('attendance')),
            'schedule' => $this->whenLoaded('schedule', function () {
                return [
                    'id' => $this->schedule->id,
                    'day_of_week' => $this->schedule->day_of_week,
                    'start_time' => $this->schedule->start_time,
                    'end_time' => $this->schedule->end_time,
                    'room' => $this->schedule->room,
                    'building' => $this->schedule->building,
                ];
            }),
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