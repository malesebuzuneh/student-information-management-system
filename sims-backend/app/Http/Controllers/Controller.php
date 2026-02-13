<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

/**
 * @OA\Info(
 *     title="Student Information Management System (SIMS) API",
 *     version="1.0.0",
 *     description="A comprehensive API for managing student information, courses, grades, and attendance in educational institutions.",
 *     @OA\Contact(
 *         email="admin@sims.edu",
 *         name="SIMS Support Team"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 * 
 * @OA\Server(
 *     url="http://127.0.0.1:8000/api",
 *     description="Local Development Server"
 * )
 * 
 * @OA\Server(
 *     url="https://api.sims.edu",
 *     description="Production Server"
 * )
 * 
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Laravel Sanctum Bearer Token Authentication"
 * )
 * 
 * @OA\Tag(
 *     name="Authentication",
 *     description="User authentication and authorization endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Students",
 *     description="Student management endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Instructors",
 *     description="Instructor management endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Courses",
 *     description="Course management endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Departments",
 *     description="Department management endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Grades",
 *     description="Grade management endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Attendance",
 *     description="Attendance tracking endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Reports",
 *     description="Reporting and analytics endpoints"
 * )
 * 
 * @OA\Tag(
 *     name="Settings",
 *     description="System settings and configuration endpoints"
 * )
 */
class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;
}