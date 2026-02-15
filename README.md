# Student Information Management System (SIMS)

A comprehensive web-based Student Information Management System built for Madda Walabu University - Computing College.

## 🎓 Overview

SIMS is a full-stack web application that manages student information, course enrollment, grades, and attendance. The system supports multiple user roles with specific permissions and workflows.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with React, TypeScript, and Tailwind CSS
- **Backend**: Laravel 11 with PHP 8.2+
- **Database**: MySQL
- **Authentication**: Laravel Sanctum with role-based access control

## 👥 User Roles

### 🔧 Admin
- Manage all users (students, instructors, department heads)
- Create and manage departments
- System-wide oversight and reporting
- Final grade approval

### 🏢 Department Head
- Manage department courses
- Approve student enrollments
- Assign instructors to courses
- Department-level reporting

### 👨‍🏫 Instructor
- View assigned courses and students
- Enter and manage grades
- Record student attendance
- Course-level reporting

### 🎓 Student
- View enrolled courses
- Check grades and attendance
- Update personal profile
- Request course enrollment

## 🚀 Features

### Core Functionality
- **User Management**: Role-based authentication and authorization
- **Course Management**: Create, assign, and manage courses
- **Enrollment System**: Student enrollment with department approval
- **Grade Management**: Grade entry, approval workflow, and reporting
- **Attendance Tracking**: Record and monitor student attendance
- **Dashboard Analytics**: Role-specific dashboards with key metrics

### Security Features
- JWT-based authentication
- Role-based access control
- Password change enforcement
- Secure API endpoints
- Input validation and sanitization

## 📋 Prerequisites

### Backend Requirements
- PHP 8.2 or higher
- Composer
- MySQL 8.0 or higher
- Laravel 11

### Frontend Requirements
- Node.js 18 or higher
- npm or yarn

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/student-information-management-system.git
cd student-information-management-system
```

### 2. Backend Setup (Laravel)
```bash
cd sims-backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sims_db
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Run migrations and seeders
php artisan migrate
php artisan db:seed

# Start the backend server
php artisan serve
```

### 3. Frontend Setup (Next.js)
```bash
cd sims-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure API URL in .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Start the frontend server
npm run dev
```

## 🔑 Default Login Credentials

### Admin
- **Username**: `melese74`
- **Password**: `password123`

### Department Heads
- **CS Department**: `cs1000126` / `password123`
- **IT Department**: `ithead` / `password123`
- **IS Department**: `isyhead` / `password123`
- **ISY Department**: `ishead` / `password123`

### Instructors
- **Andualem**: `cs1000226` / `password123`
- **Milion Sime**: `instructor_milion` / `password123`

### Students
- **Miese Haji**: `UGR/50001/26` / `password123`

## 📁 Project Structure

```
student-information-management-system/
├── sims-backend/                 # Laravel backend
│   ├── app/
│   │   ├── Http/Controllers/     # API controllers
│   │   ├── Models/              # Eloquent models
│   │   ├── Policies/            # Authorization policies
│   │   └── Middleware/          # Custom middleware
│   ├── database/
│   │   ├── migrations/          # Database migrations
│   │   └── seeders/             # Database seeders
│   └── routes/api.php           # API routes
├── sims-frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/                 # App router pages
│   │   ├── components/          # Reusable components
│   │   ├── contexts/            # React contexts
│   │   ├── services/            # API services
│   │   └── utils/               # Utility functions
│   └── public/                  # Static assets
└── README.md                    # This file
```

## 🔄 Workflow

### Student Enrollment Process
1. **Student** requests enrollment in a course
2. **Department Head** approves/rejects the enrollment
3. **Instructor** can see enrolled students
4. **Student** appears in course roster

### Grade Management Process
1. **Instructor** enters grades for students
2. **Department Head** reviews and approves grades
3. **Admin** finalizes grades (optional)
4. **Student** can view final grades

## 🌐 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `POST /api/change-password` - Change password

### Admin Routes
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/students` - Manage students
- `GET /api/instructors` - Manage instructors
- `GET /api/departments` - Manage departments

### Department Routes
- `GET /api/department/dashboard` - Department dashboard
- `GET /api/department/courses` - Department courses
- `PUT /api/courses/{id}/students/{id}/approve` - Approve enrollment

### Instructor Routes
- `GET /api/instructor/dashboard` - Instructor dashboard
- `GET /api/instructor/courses` - Assigned courses
- `POST /api/instructor/grades` - Enter grades
- `POST /api/instructor/attendance` - Record attendance

### Student Routes
- `GET /api/student/dashboard` - Student dashboard
- `GET /api/student/grades` - View grades
- `POST /api/student/enroll/{courseId}` - Request enrollment

## 🧪 Testing

### Backend Testing
```bash
cd sims-backend
php artisan test
```

### Frontend Testing
```bash
cd sims-frontend
npm run test
```

## 🚀 Deployment

### Production Environment Variables

#### Backend (.env)
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

SANCTUM_STATEFUL_DOMAINS=your-frontend-domain.com
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Deployment Steps
1. Set up production database
2. Configure environment variables
3. Run migrations: `php artisan migrate --force`
4. Run seeders: `php artisan db:seed --force`
5. Build frontend: `npm run build`
6. Deploy to your hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **Development Team** - Initial work and ongoing development

## 🙏 Acknowledgments

- Madda Walabu University - Computing College
- Laravel Framework
- Next.js Framework
- All contributors and testers

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - User management and authentication
  - Course and enrollment management
  - Grade and attendance tracking
  - Role-based dashboards

---

**Made with ❤️ for Madda Walabu University - Computing College**