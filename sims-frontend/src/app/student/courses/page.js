'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { 
  BookOpen, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  GraduationCap,
  Building2,
  Plus
} from 'lucide-react';
import api from '@/services/api';

const StudentCoursesPage = () => {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('available');

  // Simple notification system
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const [availableResponse, enrolledResponse] = await Promise.all([
        api.get('/student/available-courses'),
        api.get('/student/enrolled-courses')
      ]);
      
      setAvailableCourses(availableResponse.data.courses || []);
      setEnrolledCourses(enrolledResponse.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      showNotification('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async (courseId) => {
    try {
      setEnrolling(courseId);
      await api.post(`/student/enroll/${courseId}`);
      showNotification('Enrollment request submitted successfully!');
      fetchCourses(); // Refresh the lists
    } catch (error) {
      console.error('Error enrolling in course:', error);
      const errorMessage = error.response?.data?.error || 'Failed to enroll in course';
      showNotification(errorMessage, 'error');
    } finally {
      setEnrolling(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading courses...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Notification */}
          {notification && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
              notification.type === 'error' 
                ? 'bg-red-500 text-white' 
                : 'bg-green-500 text-white'
            }`}>
              {notification.message}
            </div>
          )}

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600">Manage your course enrollments</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('available')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'available'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Available Courses ({availableCourses.length})
              </button>
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'enrolled'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Enrollments ({enrolledCourses.length})
              </button>
            </nav>
          </div>

          {/* Available Courses Tab */}
          {activeTab === 'available' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Available Courses</h2>
                <p className="text-sm text-gray-600">Courses you can enroll in from your department</p>
              </div>
              
              <div className="p-6">
                {availableCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableCourses.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{course.title}</h3>
                            <p className="text-sm text-gray-600 mb-1">{course.code}</p>
                            <p className="text-sm text-gray-500">{course.department?.name}</p>
                          </div>
                          <BookOpen className="h-6 w-6 text-blue-500" />
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <GraduationCap className="h-4 w-4 mr-2" />
                            <span>
                              {course.instructors?.length > 0 
                                ? course.instructors.map(instructor => instructor.name).join(', ')
                                : 'No instructor assigned'
                              }
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{course.students_count} students enrolled</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Building2 className="h-4 w-4 mr-2" />
                            <span>{course.credits || 3} credits</span>
                          </div>
                        </div>

                        {course.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                        )}

                        <Button
                          onClick={() => handleEnrollment(course.id)}
                          disabled={enrolling === course.id}
                          className="w-full"
                        >
                          {enrolling === course.id ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Enrolling...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Enroll
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Courses</h3>
                    <p className="text-gray-600">
                      All courses in your department are either enrolled or not available for enrollment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enrolled Courses Tab */}
          {activeTab === 'enrolled' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">My Enrollments</h2>
                <p className="text-sm text-gray-600">Courses you have enrolled in</p>
              </div>
              
              <div className="p-6">
                {enrolledCourses.length > 0 ? (
                  <div className="space-y-4">
                    {enrolledCourses.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(course.pivot.status)}`}>
                                {getStatusIcon(course.pivot.status)}
                                <span className="ml-1 capitalize">{course.pivot.status}</span>
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Course Code:</span> {course.code}
                              </div>
                              <div>
                                <span className="font-medium">Department:</span> {course.department?.name}
                              </div>
                              <div>
                                <span className="font-medium">Credits:</span> {course.credits || 3}
                              </div>
                            </div>

                            <div className="mt-3">
                              <span className="font-medium text-sm text-gray-600">Instructors:</span>
                              <span className="text-sm text-gray-600 ml-2">
                                {course.instructors?.length > 0 
                                  ? course.instructors.map(instructor => instructor.name).join(', ')
                                  : 'No instructor assigned'
                                }
                              </span>
                            </div>

                            <div className="mt-2 text-xs text-gray-500">
                              Enrolled on: {new Date(course.pivot.created_at).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="ml-4">
                            <BookOpen className="h-8 w-8 text-blue-500" />
                          </div>
                        </div>

                        {course.pivot.status === 'pending' && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                              <p className="text-sm text-yellow-800">
                                Your enrollment request is pending approval from the department.
                              </p>
                            </div>
                          </div>
                        )}

                        {course.pivot.status === 'rejected' && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                              <p className="text-sm text-red-800">
                                Your enrollment request was not approved. Contact your department for more information.
                              </p>
                            </div>
                          </div>
                        )}

                        {course.pivot.status === 'approved' && (
                          <div className="mt-4 flex space-x-3">
                            <Button size="sm" variant="outline">
                              View Grades
                            </Button>
                            <Button size="sm" variant="outline">
                              Course Materials
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Enrollments Yet</h3>
                    <p className="text-gray-600 mb-4">
                      You haven't enrolled in any courses yet. Browse available courses to get started.
                    </p>
                    <Button onClick={() => setActiveTab('available')}>
                      Browse Available Courses
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StudentCoursesPage;