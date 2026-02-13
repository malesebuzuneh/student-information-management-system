'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Building2, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Award,
  Target,
  BarChart3,
  UserCheck,
  FileText
} from 'lucide-react';
import api from '@/services/api';

const DepartmentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/department/dashboard');
      console.log('Dashboard API Response:', response.data); // Debug log
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response?.data); // Debug log
      setError(`Failed to load dashboard data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['department']}>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading dashboard...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['department']}>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const { 
    overview, 
    department, 
    recent_enrollments = [], 
    course_utilization = [], 
    instructor_workload = [], 
    student_progress = {}, 
    enrollment_trends = [] 
  } = dashboardData || {};

  // Handle the case where we have a single department instead of multiple departments
  const departments = department ? [department] : [];

  // Overview stats cards with fallback values
  const overviewCards = [
    {
      title: 'Total Students',
      value: overview?.total_students || 0,
      icon: Users,
      color: 'bg-blue-500',
      description: overview?.department_name ? `In ${overview.department_name}` : 'Across all departments'
    },
    {
      title: 'Total Instructors',
      value: overview?.total_instructors || 0,
      icon: GraduationCap,
      color: 'bg-green-500',
      description: 'Active instructors'
    },
    {
      title: 'Total Courses',
      value: overview?.total_courses || 0,
      icon: BookOpen,
      color: 'bg-purple-500',
      description: 'Available courses'
    },
    {
      title: 'Department',
      value: overview?.department_code || 'N/A',
      icon: Building2,
      color: 'bg-orange-500',
      description: overview?.department_name || 'Department'
    }
  ];

  // Enrollment stats cards with fallback values
  const enrollmentCards = [
    {
      title: 'Pending Enrollments',
      value: overview?.pending_enrollments || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      description: 'Awaiting approval'
    },
    {
      title: 'Approved Enrollments',
      value: overview?.approved_enrollments || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      description: 'Successfully enrolled'
    },
    {
      title: 'Rejected Enrollments',
      value: overview?.rejected_enrollments || 0,
      icon: XCircle,
      color: 'bg-red-500',
      description: 'Not approved'
    }
  ];

  const getEnrollmentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (category) => {
    switch (category) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'average': return 'bg-yellow-500';
      case 'below_average': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['department']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {overview?.department_name ? `${overview.department_name} Department Dashboard` : 'Department Dashboard'}
            </h1>
            <p className="text-gray-600">
              {overview?.department_name ? `${overview.department_name} (${overview.department_code}) - Academic Management Overview` : 'Academic Management Overview'}
            </p>
          </div>

          {/* Overview Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {overviewCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className={`${card.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-gray-600">{card.description}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enrollment Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {enrollmentCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className={`${card.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-gray-600">{card.description}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Department Overview */}
          {departments.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Department Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {departments.map((dept, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{dept.name}</h4>
                      <span className="text-sm text-gray-600">{dept.code}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Students:</span>
                        <span className="font-medium text-blue-600">{dept.students_count || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Instructors:</span>
                        <span className="font-medium text-green-600">{dept.instructors_count || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Courses:</span>
                        <span className="font-medium text-purple-600">{dept.courses_count || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Enrollments */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Enrollment Requests</h3>
              <div className="space-y-3">
                {recent_enrollments.length > 0 ? (
                  recent_enrollments.slice(0, 8).map((enrollment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{enrollment.student_name}</p>
                        <p className="text-sm text-gray-600">{enrollment.student_id}</p>
                        <p className="text-sm text-gray-500">{enrollment.course_code} - {enrollment.course_title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(enrollment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEnrollmentStatusColor(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent enrollments</p>
                  </div>
                )}
              </div>
            </div>

            {/* Course Utilization */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Course Utilization</h3>
              <div className="space-y-3">
                {course_utilization.length > 0 ? (
                  course_utilization.slice(0, 8).map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{course.title}</p>
                        <p className="text-sm text-gray-600">{course.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">{course.students_count || 0}</p>
                        <p className="text-sm text-gray-600">students</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No course data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Student Progress and Instructor Workload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Progress Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Student Performance Distribution</h3>
              <div className="space-y-4">
                {Object.keys(student_progress).length > 0 ? (
                  Object.entries(student_progress).map(([category, count], index) => {
                    const total = Object.values(student_progress).reduce((sum, val) => sum + val, 0);
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded ${getProgressColor(category)}`}></div>
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {category.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-gray-900">{count}</span>
                          <span className="text-sm text-gray-600">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No performance data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Instructor Workload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Instructor Workload</h3>
              <div className="space-y-3">
                {instructor_workload.length > 0 ? (
                  instructor_workload.slice(0, 6).map((instructor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{instructor.name}</p>
                        <p className="text-sm text-gray-600">{instructor.department?.name || 'Department'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{instructor.courses_count || 0} courses</p>
                        <p className="text-sm text-gray-600">{instructor.total_students || 0} students</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No instructor data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enrollment Trends Chart Placeholder */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Enrollment Trends (Last 6 Months)</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Chart visualization would go here</p>
                <p className="text-sm text-gray-500 mt-2">
                  Total enrollments in period: {enrollment_trends.reduce((sum, trend) => sum + trend.enrollments, 0)}
                </p>
                <div className="mt-4 flex justify-center space-x-4 text-sm">
                  {enrollment_trends.map((trend, index) => (
                    <div key={index} className="text-center">
                      <p className="font-medium text-gray-900">{trend.enrollments}</p>
                      <p className="text-gray-600">{trend.month}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <UserCheck className="h-6 w-6 text-blue-500 mb-2" />
                <p className="font-medium text-gray-900">Approve Enrollments</p>
                <p className="text-sm text-gray-600">Review pending requests</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <BookOpen className="h-6 w-6 text-green-500 mb-2" />
                <p className="font-medium text-gray-900">Manage Courses</p>
                <p className="text-sm text-gray-600">Add or update courses</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <GraduationCap className="h-6 w-6 text-purple-500 mb-2" />
                <p className="font-medium text-gray-900">Assign Instructors</p>
                <p className="text-sm text-gray-600">Manage course assignments</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <FileText className="h-6 w-6 text-orange-500 mb-2" />
                <p className="font-medium text-gray-900">Generate Reports</p>
                <p className="text-sm text-gray-600">Department analytics</p>
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DepartmentDashboard;