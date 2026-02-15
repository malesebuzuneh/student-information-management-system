'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  BookOpen, 
  Calendar, 
  User,
  Award,
  Target,
  Bell,
  FileText,
  BarChart3
} from 'lucide-react';
import api from '@/services/api';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/dashboard');
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
      <ProtectedRoute allowedRoles={['student']}>
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
      <ProtectedRoute allowedRoles={['student']}>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const { student, academic_info, courses, recent_grades, upcoming_deadlines, announcements } = dashboardData;

  // Academic stats cards
  const academicCards = [
    {
      title: 'Current GPA',
      value: academic_info.gpa.toFixed(2),
      icon: Award,
      color: 'bg-blue-500',
      description: `Out of 4.0 scale`
    },
    {
      title: 'Enrolled Courses',
      value: academic_info.enrolled_courses,
      icon: BookOpen,
      color: 'bg-green-500',
      description: `This semester`
    },
    {
      title: 'Total Credits',
      value: academic_info.total_credits,
      icon: Target,
      color: 'bg-purple-500',
      description: 'Credits earned'
    }
  ];

  const getGradeColor = (grade) => {
    if (['A+', 'A', 'A-'].includes(grade)) return 'text-green-600 bg-green-100';
    if (['B+', 'B', 'B-'].includes(grade)) return 'text-blue-600 bg-blue-100';
    if (['C+', 'C', 'C-'].includes(grade)) return 'text-yellow-600 bg-yellow-100';
    if (['D+', 'D'].includes(grade)) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getDaysUntilDeadline = (dueDate) => {
    const today = new Date();
    const deadline = new Date(dueDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {student.name}!</h1>
              <p className="text-gray-600">
                {student.student_id} • {student.department?.name} • Year {academic_info.current_year}, Semester {academic_info.current_semester}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=3B82F6&color=fff&size=60`}
                alt={student.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
          </div>

          {/* Academic Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {academicCards.map((card, index) => {
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
            {/* Enrolled Courses */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">My Courses</h3>
              <div className="space-y-4">
                {courses.length > 0 ? (
                  courses.map((course, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{course.title}</h4>
                          <p className="text-sm text-gray-600">{course.code} • {course.credits || 3} Credits</p>
                          <p className="text-sm text-gray-500">
                            {course.instructors?.map(instructor => instructor.name).join(', ') || 'No instructor assigned'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Enrolled
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No courses enrolled yet</p>
                    <p className="text-sm text-gray-500">Contact your department to enroll in courses</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Deadlines</h3>
              <div className="space-y-3">
                {upcoming_deadlines && upcoming_deadlines.length > 0 ? (
                  upcoming_deadlines.map((deadline, index) => {
                    const daysLeft = getDaysUntilDeadline(deadline.due_date);
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{deadline.title}</p>
                            <p className="text-xs text-gray-600">{deadline.course}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(deadline.due_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            daysLeft <= 1 ? 'bg-red-100 text-red-800' :
                            daysLeft <= 3 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {daysLeft <= 0 ? 'Due' : `${daysLeft}d left`}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No upcoming deadlines</p>
                    <p className="text-sm text-gray-500">You're all caught up!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Grades and Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Grades */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Grades</h3>
              <div className="space-y-3">
                {recent_grades.length > 0 ? (
                  recent_grades.map((grade, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{grade.course?.title || 'Unknown Course'}</p>
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
                    <p className="text-gray-600">No grades available yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Announcements</h3>
              <div className="space-y-3">
                {announcements && announcements.length > 0 ? (
                  announcements.map((announcement, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{announcement.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{announcement.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {announcement.course} • {new Date(announcement.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Bell className="h-4 w-4 text-blue-500 mt-1" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No announcements</p>
                    <p className="text-sm text-gray-500">Check back later for updates</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <User className="h-6 w-6 text-blue-500 mb-2" />
                <p className="font-medium text-gray-900">View Profile</p>
                <p className="text-sm text-gray-600">Update personal information</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <Calendar className="h-6 w-6 text-green-500 mb-2" />
                <p className="font-medium text-gray-900">View Schedule</p>
                <p className="text-sm text-gray-600">Check class timetable</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                <FileText className="h-6 w-6 text-purple-500 mb-2" />
                <p className="font-medium text-gray-900">View Transcript</p>
                <p className="text-sm text-gray-600">Download academic record</p>
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StudentDashboard;