# SIMS API Documentation

## Overview
Student Information Management System (SIMS) API provides comprehensive endpoints for managing educational institution data including students, instructors, courses, grades, and attendance.

## Base URL
- **Development**: `http://127.0.0.1:8000/api`
- **Production**: `https://api.sims.edu`

## Authentication
The API uses Laravel Sanctum for authentication. Include the bearer token in the Authorization header:
```
Authorization: Bearer {your-token}
```

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - User login
- `POST /logout` - User logout (requires auth)
- `GET /profile` - Get user profile (requires auth)

### Students (Admin/Department access)
- `GET /students` - List all students
- `POST /students` - Create new student
- `GET /students/{id}` - Get student details
- `PUT /students/{id}` - Update student
- `DELETE /students/{id}` - Delete student
- `POST /courses/{courseId}/enroll` - Enroll in course (Student)
- `GET /students/{id}/grades` - View student grades
- `GET /students/{id}/schedule` - View student schedule

### Instructors (Admin/Department access)
- `GET /instructors` - List all instructors
- `POST /instructors` - Create new instructor
- `GET /instructors/{id}` - Get instructor details
- `PUT /instructors/{id}` - Update instructor
- `DELETE /instructors/{id}` - Delete instructor
- `GET /instructors/{id}/courses` - Get assigned courses

### Courses (All authenticated users can view)
- `GET /courses` - List all courses
- `POST /courses` - Create new course (Admin/Department)
- `GET /courses/{id}` - Get course details
- `PUT /courses/{id}` - Update course (Admin/Department/Instructor)
- `DELETE /courses/{id}` - Delete course (Admin/Department)

### Grades (Instructor/Admin access)
- `GET /grades` - List grades
- `POST /grades` - Create new grade
- `GET /grades/{id}` - Get grade details
- `PUT /grades/{id}` - Update grade
- `DELETE /grades/{id}` - Delete grade

### Attendance (Instructor/Admin access)
- `GET /attendance` - List attendance records
- `POST /attendance` - Mark attendance
- `GET /attendance/{id}` - Get attendance details
- `PUT /attendance/{id}` - Update attendance
- `DELETE /attendance/{id}` - Delete attendance

### Reports (Admin/Department/Instructor access)
- `GET /reports/student-enrollment` - Student enrollment report
- `GET /reports/course-assignments` - Course assignment report
- `GET /reports/department-summary` - Department summary report

### Settings (Admin access)
- `GET /settings` - List system settings
- `POST /settings` - Create setting
- `PUT /settings/{id}` - Update setting
- `DELETE /settings/{id}` - Delete setting

## Response Format
All API responses follow a consistent JSON format:

### Success Response
```json
{
  "data": {
    // Response data
  },
  "meta": {
    "version": "1.0",
    "timestamp": "2024-02-01T12:00:00Z"
  }
}
```

### Error Response
```json
{
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

## HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity (Validation Error)
- `500` - Internal Server Error

## Rate Limiting
API requests are limited to 60 requests per minute per user/IP address.

## Pagination
List endpoints support pagination with the following parameters:
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 15, max: 100)

## Filtering and Sorting
Most list endpoints support filtering and sorting:
- `filter[field]=value` - Filter by field value
- `sort=field` - Sort by field (prefix with `-` for descending)

## Example Usage

### Login
```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sims.com",
    "password": "password"
  }'
```

### Get Students (with token)
```bash
curl -X GET http://127.0.0.1:8000/api/students \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json"
```

### Create Student
```bash
curl -X POST http://127.0.0.1:8000/api/students \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "student_id": "STU001",
    "department_id": 1,
    "date_of_birth": "2000-01-01",
    "enrollment_date": "2024-01-01"
  }'
```

## Error Handling
The API provides detailed error messages for debugging:

### Validation Errors (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### Authorization Errors (403)
```json
{
  "message": "This action is unauthorized."
}
```

## Testing
Use the provided Postman collection (`SIMS_API_Postman_Collection.json`) for comprehensive API testing.

## Support
For API support, contact: admin@sims.edu