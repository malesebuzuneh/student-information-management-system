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
  AlertCircle,
  UserCheck,
  UserX,
  Calendar,
  BarChart3
} from 'lucide-react';
import api from '@/services/api';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
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
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const { overview, enrollments, departments, recent_activity, top_courses } = dashboardData;

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Students',
      value: overview.total_students,
      icon: Users,
      color: 'bg-blue-500',
      change: `+${overview.recent_students} this month`,
      changeType: 'positive'
    },
    {
      title: 'Total Instructors',
      value: overview.total_instructors,
      icon: GraduationCap,
      color: 'bg-green-500',
      change: `+${overview.recent_instructors} this month`,
      changeType: 'positive'
    },
    {
      title: 'Total Courses',
      value: overview.total_courses,
      icon: BookOpen,
      color: 'bg-purple-500',
      change: 'Active courses',
      changeType: 'neutral'
    },
    {
      title: 'Departments',
      value: overview.total_departments,
      icon: Building2,
      color: 'bg-orange-500',
      change: 'Computing College',
      changeType: 'neutral'
    }
  ];

  const enrollmentCards = [
    {
      title: 'Total Enrollments',
      value: enrollments.total,
      icon: TrendingUp,
      color: 'bg-indigo-500'
    },
    {
      title: 'Pending Approvals',
      value: enrollments.pending,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Approved',
      value: enrollments.approved,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Need Password Change',
      value: overview.users_needing_password_change,
      icon: AlertCircle,
      color: 'bg-red-500'
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">MWU SIMS - System Overview and Statistics</p>
          </div>

          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((card, index) => {
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
                    <span className={`text-sm ${
                      card.changeType === 'positive' ? 'text-green-600' : 
                      card.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {card.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enrollment Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                </div>
              );
            })}
          </div>

          {/* Student Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Student Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-700">Active Students</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{overview.active_students}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserX className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-gray-700">Inactive Students</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{overview.inactive_students}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Students</span>
                    <span className="text-lg font-semibold text-gray-900">{overview.total_students}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Department Overview</h3>
              <div className="space-y-3">
                {departments.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{dept.name}</p>
                      <p className="text-sm text-gray-600">{dept.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {dept.students_count} students, {dept.instructors_count} instructors
                      </p>
                      <p className="text-sm text-gray-600">{dept.courses_count} courses</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity and Top Courses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Student Registrations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Student Registrations</h3>
              <div className="space-y-3">
                {recent_activity.students.length > 0 ? (
                  recent_activity.students.map((student, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">
                          {student.student_id} • {student.department?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(student.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent registrations</p>
                )}
              </div>
            </div>

            {/* Top Courses by Enrollment */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Courses by Enrollment</h3>
              <div className="space-y-3">
                {top_courses.length > 0 ? (
                  top_courses.map((course, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{course.title}</p>
                        <p className="text-sm text-gray-600">{course.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">{course.students_count}</p>
                        <p className="text-sm text-gray-600">students</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No course data available</p>
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
                  Total enrollments in period: {enrollments.trends.reduce((sum, trend) => sum + trend.enrollments, 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <Users className="h-6 w-6 text-blue-500 mb-2" />
                <p className="font-medium text-gray-900">Add New Student</p>
                <p className="text-sm text-gray-600">Register a new student</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <GraduationCap className="h-6 w-6 text-green-500 mb-2" />
                <p className="font-medium text-gray-900">Add New Instructor</p>
                <p className="text-sm text-gray-600">Register a new instructor</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <BookOpen className="h-6 w-6 text-purple-500 mb-2" />
                <p className="font-medium text-gray-900">Create New Course</p>
                <p className="text-sm text-gray-600">Add a new course</p>
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminDashboard;