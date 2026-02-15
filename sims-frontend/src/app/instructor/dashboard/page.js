'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Award,
  Target,
  Bell,
  FileText,
  BarChart3,
  ClipboardList
} from 'lucide-react';
import api from '@/services/api';

const InstructorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/instructor/dashboard');
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
      <ProtectedRoute allowedRoles={['instructor']}>
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
      <ProtectedRoute allowedRoles={['instructor']}>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const { instructor, overview, assigned_courses, recent_grades, attendance_stats, upcoming_classes, pending_tasks, course_performance } = dashboardData;

  // Overview stats cards
  const overviewCards = [
    {
      title: 'Assigned Courses',
      value: overview.total_courses,
      icon: BookOpen,
      color: 'bg-blue-500',
      description: 'Active courses'
    },
    {
      title: 'Total Students',
      value: overview.total_students,
      icon: Users,
      color: 'bg-green-500',
      description: 'Across all courses'
    },
    {
      title: 'Grades Entered',
      value: overview.total_grades_entered,
      icon: Award,
      color: 'bg-purple-500',
      description: 'Recent entries'
    },
    {
      title: 'Attendance Sessions',
      value: overview.attendance_sessions,
      icon: CheckCircle,
      color: 'bg-orange-500',
      description: 'Total sessions'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade) => {
    if (['A+', 'A', 'A-'].includes(grade)) return 'text-green-600 bg-green-100';
    if (['B+', 'B', 'B-'].includes(grade)) return 'text-blue-600 bg-blue-100';
    if (['C+', 'C', 'C-'].includes(grade)) return 'text-yellow-600 bg-yellow-100';
    if (['D+', 'D'].includes(grade)) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <ProtectedRoute allowedRoles={['instructor']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {instructor.name}!</h1>
            <p className="text-gray-600">
              {instructor.instructor_id} • {instructor.department?.name} Department
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assigned Courses */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">My Courses</h3>
              <div className="space-y-4">
                {assigned_courses.length > 0 ? (
                  assigned_courses.map((course, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{course.title}</h4>
                          <p className="text-sm text-gray-600">{course.code} • {course.credits || 3} Credits</p>
                          <p className="text-sm text-gray-500">{course.department?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{course.students_count}</p>
                          <p className="text-sm text-gray-600">students</p>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          View Students
                        </button>
                        <button className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Enter Grades
                        </button>
                        <button className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          Attendance
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No courses assigned yet</p>
                    <p className="text-sm text-gray-500">Contact your department for course assignments</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Tasks</h3>
              <div className="space-y-3">
                {pending_tasks && pending_tasks.length > 0 ? (
                  pending_tasks.map((task, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{task.task}</p>
                          <p className="text-xs text-gray-600">{task.course}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.count && (
                            <p className="text-xs text-gray-600 mt-1 text-center">{task.count} items</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending tasks</p>
                    <p className="text-sm text-gray-500">You're all caught up!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Classes and Recent Grades */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Classes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Classes</h3>
              <div className="space-y-3">
                {upcoming_classes && upcoming_classes.length > 0 ? (
                  upcoming_classes.map((class_item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{class_item.course}</p>
                        <p className="text-sm text-gray-600">
                          {class_item.time} • {class_item.room}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(class_item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{class_item.students_enrolled}</p>
                        <p className="text-xs text-gray-600">students</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No upcoming classes</p>
                    <p className="text-sm text-gray-500">Your schedule is clear</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Grades */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Grades Entered</h3>
              <div className="space-y-3">
                {recent_grades.length > 0 ? (
                  recent_grades.slice(0, 5).map((grade, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{grade.student?.name}</p>
                        <p className="text-sm text-gray-600">{grade.course?.code}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(grade.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(grade.grade)}`}>
                        {grade.grade}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No grades entered yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Course Performance Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Course Performance Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {course_performance.map((performance, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{performance.course.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{performance.course.code}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Grade:</span>
                      <span className="text-sm font-medium text-gray-900">{performance.average_grade}/4.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Students:</span>
                      <span className="text-sm font-medium text-gray-900">{performance.students_enrolled}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Grades Entered:</span>
                      <span className="text-sm font-medium text-gray-900">{performance.total_grades}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(performance.average_grade / 4.0) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <ClipboardList className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{attendance_stats.total_sessions}</p>
                <p className="text-sm text-gray-600">Total Sessions</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{attendance_stats.students_present_today}</p>
                <p className="text-sm text-gray-600">Present Today</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{attendance_stats.average_attendance}%</p>
                <p className="text-sm text-gray-600">Average Attendance</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <Award className="h-6 w-6 text-blue-500 mb-2" />
                <p className="font-medium text-gray-900">Enter Grades</p>
                <p className="text-sm text-gray-600">Grade student work</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
                <p className="font-medium text-gray-900">Take Attendance</p>
                <p className="text-sm text-gray-600">Mark student attendance</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <Users className="h-6 w-6 text-purple-500 mb-2" />
                <p className="font-medium text-gray-900">View Students</p>
                <p className="text-sm text-gray-600">Manage course students</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <FileText className="h-6 w-6 text-orange-500 mb-2" />
                <p className="font-medium text-gray-900">Course Reports</p>
                <p className="text-sm text-gray-600">Generate reports</p>
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default InstructorDashboard;