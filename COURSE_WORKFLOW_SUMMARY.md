# Course Workflow - Student Information Management System

## 📋 Complete Course Lifecycle

### Step 1: Admin Creates Course
**Actor**: Admin  
**Action**: Add new course to the system  
**API Endpoint**: `POST /api/courses`  
**Frontend**: Admin Dashboard → Courses → Add Course

**Request Body**:
```json
{
  "code": "CS101",
  "title": "Introduction to Computer Science",
  "department_id": 1,
  "credits": 3,
  "description": "Basic programming concepts"
}
```

**Result**: 
- Course is created and visible to:
  - Department heads (in their department)
  - Students (in their department)
  - Instructors (in their department)

---

### Step 2: Student Registers for Course
**Actor**: Student  
**Action**: Request enrollment in available course  
**API Endpoint**: `POST /api/student/enroll/{courseId}`  
**Frontend**: Student Dashboard → Courses → Available Courses → Enroll

**Result**:
- Enrollment request created with status: `pending`
- Student can see the course in "My Enrollments" with pending status
- Department head can see the pending enrollment request

---

### Step 3: Department Assigns Instructor to Course
**Actor**: Department Head  
**Action**: Assign one or more instructors to teach the course  
**API Endpoint**: `POST /api/courses/{courseId}/assign-instructor`  
**Frontend**: Department Dashboard → Assign Instructor

**Request Body**:
```json
{
  "instructor_ids": [1, 2]
}
```

**Result**:
- Instructor(s) assigned to the course
- Instructor can now see the course in their "My Courses" list
- Course shows instructor name to students

---

### Step 4: Department Approves Student Enrollment
**Actor**: Department Head  
**Action**: Approve or reject student enrollment requests  
**API Endpoints**: 
- Approve: `PUT /api/courses/{courseId}/students/{studentId}/approve`
- Reject: `PUT /api/courses/{courseId}/students/{studentId}/reject`  
**Frontend**: Department Dashboard → Enrollments → Pending Enrollments

**Result**:
- If approved: Enrollment status = `approved`
  - Student can access course materials
  - Student appears in instructor's student list
  - Course appears in student's schedule
- If rejected: Enrollment status = `rejected`
  - Student is notified of rejection
  - Student can request enrollment again if needed

---

## 🔄 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    COURSE WORKFLOW                          │
└─────────────────────────────────────────────────────────────┘

Step 1: Admin Creates Course
   ↓
   [Course Created]
   ├─→ Visible to Department
   ├─→ Visible to Students (same dept)
   └─→ Visible to Instructors (same dept)

Step 2: Student Registers
   ↓
   [Enrollment Request: PENDING]
   └─→ Appears in Department's pending list

Step 3: Department Assigns Instructor
   ↓
   [Instructor Assigned]
   ├─→ Instructor sees course in "My Courses"
   └─→ Students see instructor name

Step 4: Department Approves Enrollment
   ↓
   [Enrollment Status: APPROVED]
   ├─→ Student can access course
   ├─→ Student appears in instructor's list
   └─→ Course appears in student's schedule
```

---

## 👥 Role Permissions

### Admin
- ✅ Create courses
- ✅ Edit courses
- ✅ Delete courses
- ✅ View all courses
- ✅ Assign instructors (optional - can delegate to department)

### Department Head
- ✅ View courses in their department
- ✅ Assign instructors to courses
- ✅ Remove instructors from courses
- ✅ Approve student enrollments
- ✅ Reject student enrollments
- ✅ View pending enrollment requests
- ❌ Cannot create courses (admin only)

### Student
- ✅ View available courses in their department
- ✅ Request enrollment in courses
- ✅ View enrolled courses
- ✅ View course details and instructors
- ❌ Cannot enroll without department approval

### Instructor
- ✅ View assigned courses
- ✅ View enrolled students (approved only)
- ✅ Enter grades for students
- ✅ Take attendance
- ❌ Cannot assign themselves to courses

---

## 🎯 Key Features

### Course Visibility
- Courses are **department-specific**
- Students only see courses from their own department
- Department heads only manage their department's courses

### Enrollment Process
- Student enrollment requires **department approval**
- Prevents unauthorized course access
- Allows department to manage class sizes

### Instructor Assignment
- Department heads control instructor assignments
- Multiple instructors can be assigned to one course
- Instructors can be removed if needed

### Status Tracking
- Enrollment status: `pending` → `approved` or `rejected`
- Clear visibility of enrollment state for all parties

---

## 📊 Database Relationships

### Courses Table
- `id`, `code`, `title`, `department_id`, `credits`, `description`

### Course-Instructor Relationship (Many-to-Many)
- Table: `course_instructor`
- Links courses with instructors

### Course-Student Relationship (Many-to-Many)
- Table: `course_student`
- Includes `status` field: pending, approved, rejected
- Includes timestamps for tracking

---

## 🚀 API Endpoints Summary

### Admin Endpoints
```
POST   /api/courses                    # Create course
GET    /api/courses                    # List all courses
GET    /api/courses/{id}               # View course details
PUT    /api/courses/{id}               # Update course
DELETE /api/courses/{id}               # Delete course
```

### Department Endpoints
```
GET    /api/department/courses                              # List department courses
POST   /api/courses/{courseId}/assign-instructor           # Assign instructor
DELETE /api/courses/{courseId}/instructors/{instructorId}  # Remove instructor
GET    /api/department/pending-enrollments                 # View pending enrollments
PUT    /api/courses/{courseId}/students/{studentId}/approve # Approve enrollment
PUT    /api/courses/{courseId}/students/{studentId}/reject  # Reject enrollment
```

### Student Endpoints
```
GET    /api/student/available-courses   # View available courses
POST   /api/student/enroll/{courseId}   # Request enrollment
GET    /api/student/enrolled-courses    # View enrolled courses
```

### Instructor Endpoints
```
GET    /api/instructor/courses                      # View assigned courses
GET    /api/instructor/courses/{courseId}/students  # View course students
```

---

## ✅ Workflow Status: FULLY IMPLEMENTED

All steps of your described workflow are implemented and working:

1. ✅ Admin adds course → visible to department and students
2. ✅ Student registers for course → creates pending enrollment
3. ✅ Department assigns instructor to course → instructor can teach
4. ✅ Department approves enrollment → student can access course

The system is ready to use with this exact workflow!
