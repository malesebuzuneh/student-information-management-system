# Student Information Management System (SIMS)

A comprehensive web-based Student Information Management System built with Laravel (Backend) and Next.js (Frontend).

## 🎯 Features

### Role-Based Access Control
- **Admin**: Full system control, user management, course creation
- **Department Head**: Department-specific management, enrollment approvals, instructor assignments
- **Instructor**: Course teaching, grade entry, attendance tracking
- **Student**: Course enrollment, grade viewing, profile management

### Core Functionality
- ✅ User authentication and authorization
- ✅ Course management and enrollment workflow
- ✅ Grade entry and approval system
- ✅ Attendance tracking
- ✅ Department management
- ✅ Student and instructor management
- ✅ Real-time dashboards for all roles
- ✅ Enrollment approval workflow

## 🏗️ System Architecture

### Backend (Laravel 11)
- RESTful API architecture
- Sanctum authentication
- Policy-based authorization
- MySQL database
- Comprehensive API documentation

### Frontend (Next.js 16)
- React-based UI
- Server-side rendering
- Responsive design
- Role-based routing
- Protected routes

## 📋 Course Workflow

1. **Admin creates course** → Course visible to department and students
2. **Student registers for course** → Enrollment request (pending status)
3. **Department assigns instructor** → Instructor can teach course
4. **Department approves enrollment** → Student can access course
5. **Instructor enters grades** → Grade submission workflow
6. **Department approves grades** → Grade approval
7. **Admin finalizes grades** → Student can view final grades

## 🚀 Installation

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- MySQL 8.0+
- Git

### Backend Setup

```bash
cd sims-backend

# Install dependencies
composer install

# Copy environment file
copy .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=sims_db
# DB_USERNAME=root
# DB_PASSWORD=

# Run migrations
php artisan migrate

# Seed database with sample data
php artisan db:seed

# Start development server
php artisan serve
```

Backend will run on: `http://localhost:8000`

### Frontend Setup

```bash
cd sims-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:3000`

## 🔑 Default Login Credentials

After seeding the database, use these credentials:

### Admin
- **Username**: `admin`
- **Password**: `password`

### Department Head (IT Department)
- **Username**: `assmamaw`
- **Password**: `password`

### Test Accounts
Additional test accounts are created during seeding. Check the seeders for details.

## 📁 Project Structure

```
student-information-management-system/
├── sims-backend/           # Laravel backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   ├── Middleware/
│   │   │   └── Requests/
│   │   ├── Models/
│   │   └── Policies/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php
│
├── sims-frontend/          # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/
│   │   │   ├── department/
│   │   │   ├── instructor/
│   │   │   └── student/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── services/
│   └── public/
│
└── README.md
```

## 🔐 Security Features

- JWT token-based authentication
- Role-based access control (RBAC)
- Policy-based authorization
- Protected API routes
- CORS configuration
- Password hashing
- SQL injection prevention
- XSS protection

## 🛠️ Technologies Used

### Backend
- Laravel 11
- PHP 8.2+
- MySQL
- Laravel Sanctum (Authentication)
- Laravel Policies (Authorization)

### Frontend
- Next.js 16
- React 19
- Tailwind CSS
- Axios
- Lucide Icons

## 📊 Database Schema

### Main Tables
- `users` - System users with role-based access
- `departments` - Academic departments
- `students` - Student information
- `instructors` - Instructor information
- `courses` - Course catalog
- `grades` - Student grades with approval workflow
- `attendances` - Attendance records
- `course_instructor` - Course-instructor assignments
- `course_student` - Course enrollments with status

## 🔄 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/profile` - Get user profile

### Admin Routes
- `GET /api/admin/dashboard` - Admin dashboard data
- `POST /api/courses` - Create course
- `GET /api/students` - List students
- `POST /api/students` - Create student
- `GET /api/instructors` - List instructors
- `POST /api/instructors` - Create instructor

### Department Routes
- `GET /api/department/dashboard` - Department dashboard
- `POST /api/courses/{courseId}/assign-instructor` - Assign instructor
- `PUT /api/courses/{courseId}/students/{studentId}/approve` - Approve enrollment
- `GET /api/department/pending-enrollments` - View pending enrollments

### Student Routes
- `GET /api/student/dashboard` - Student dashboard
- `GET /api/student/available-courses` - View available courses
- `POST /api/student/enroll/{courseId}` - Request enrollment
- `GET /api/student/grades` - View grades

### Instructor Routes
- `GET /api/instructor/dashboard` - Instructor dashboard
- `GET /api/instructor/courses` - View assigned courses
- `POST /api/instructor/grades` - Enter grades
- `POST /api/instructor/attendance` - Record attendance

## 📝 Documentation

Additional documentation files:
- `COURSE_WORKFLOW_SUMMARY.md` - Detailed course workflow
- `COURSE_WORKFLOW_IMPLEMENTATION.md` - Implementation details
- `ROLE_PERMISSIONS_VERIFICATION.md` - Role permissions matrix
- `API_DOCUMENTATION.md` - Complete API documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Authors

- **Maleseb Uzuneh** - [GitHub](https://github.com/malesebuzuneh)

## 🙏 Acknowledgments

- Laravel Framework
- Next.js Framework
- Tailwind CSS
- All contributors and testers

## 📞 Support

For support, email your-email@example.com or open an issue in the GitHub repository.

---

**Note**: This is a development version. For production deployment, ensure proper security configurations, environment variables, and server setup.
