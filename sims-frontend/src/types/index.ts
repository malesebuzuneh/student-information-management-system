// User and Authentication Types
export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  role: 'admin' | 'department' | 'instructor' | 'student';
  status: 'active' | 'inactive';
  department_id?: number;
  is_first_login?: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  department?: Department;
  instructor?: Instructor;
  student?: Student;
  headed_department?: Department;
  is_department_head?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  is_first_login: boolean;
  message: string;
}

// Department Types
export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  head_name?: string;
  head_email?: string;
  head_instructor_id?: number;
  phone?: string;
  location?: string;
  established_year?: number;
  status: 'active' | 'inactive';
  students_count?: number;
  instructors_count?: number;
  courses_count?: number;
  created_at?: string;
  updated_at?: string;
  students?: Student[];
  instructors?: Instructor[];
  courses?: Course[];
  headInstructor?: Instructor;
}

// Student Types
export interface Student {
  id: number;
  name: string;
  email: string;
  student_id: string;
  department_id: number;
  user_id?: number;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  phone?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  program?: string;
  year: number;
  semester: number;
  admission_type: 'regular' | 'transfer' | 'international' | 'scholarship';
  admission_date?: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  is_first_login?: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  department?: Department;
  user?: User;
  courses?: Course[];
  grades?: Grade[];
  attendances?: Attendance[];
}

// Instructor Types
export interface Instructor {
  id: number;
  name: string;
  email: string;
  instructor_id: string;
  department_id: number;
  user_id?: number;
  phone?: string;
  qualification?: string;
  status: 'active' | 'inactive' | 'archived';
  is_first_login?: boolean;
  last_login?: string;
  archived_at?: string;
  created_at?: string;
  updated_at?: string;
  department?: Department;
  user?: User;
  courses?: Course[];
  students?: Student[];
}

// Course Types
export interface Course {
  id: number;
  code: string;
  title: string;
  description?: string;
  department_id: number;
  students_count?: number;
  instructors_count?: number;
  created_at?: string;
  updated_at?: string;
  department?: Department;
  instructors?: Instructor[];
  students?: Student[];
  grades?: Grade[];
  attendances?: Attendance[];
}

// Enrollment Types
export interface Enrollment {
  id?: number;
  course_id: number;
  student_id: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
  student_name?: string;
  student_email?: string;
  course_title?: string;
  course_code?: string;
  department_name?: string;
}

// Grade Types
export interface Grade {
  id: number;
  student_id: number;
  course_id: number;
  grade: string;
  points?: number;
  semester?: string;
  academic_year?: string;
  created_at?: string;
  updated_at?: string;
  student?: Student;
  course?: Course;
}

// Attendance Types
export interface Attendance {
  id: number;
  student_id: number;
  course_id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  student?: Student;
  course?: Course;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  success?: boolean;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
}

// Dashboard Types
export interface DashboardStats {
  total_students: number;
  total_instructors: number;
  total_courses: number;
  total_departments?: number;
  department_name?: string;
  department_code?: string;
  pending_enrollments: number;
  approved_enrollments: number;
  rejected_enrollments: number;
}

export interface DashboardData {
  overview: DashboardStats;
  department?: Department;
  recent_enrollments: Enrollment[];
  course_utilization: Course[];
  instructor_workload: Instructor[];
  student_progress: {
    excellent: number;
    good: number;
    average: number;
    below_average: number;
  };
  enrollment_trends: {
    month: string;
    enrollments: number;
  }[];
  message: string;
}

// Form Types
export interface DepartmentFormData {
  name: string;
  code: string;
  description: string;
  head_name: string;
  head_email: string;
  phone: string;
  location: string;
  established_year: string;
  status: 'active' | 'inactive';
}

export interface CourseFormData {
  code: string;
  title: string;
  description: string;
}

export interface StudentFormData {
  name: string;
  email: string;
  student_id?: string;
  department_id: number;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  phone?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  program?: string;
  year: number;
  semester: number;
  admission_type: 'regular' | 'transfer' | 'international' | 'scholarship';
}

// Notification Types
export interface Notification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

// Table Types
export interface TableColumn<T = any> {
  header: string;
  accessor: keyof T | string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

// Component Props Types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}