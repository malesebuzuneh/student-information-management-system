'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Calendar, Clock, MapPin, BookOpen, User } from 'lucide-react';
import api from '@/services/api';

const StudentSchedulePage = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/enrolled-courses');
      const approvedCourses = response.data.courses?.filter(
        course => course.pivot.status === 'approved'
      ) || [];
      setEnrolledCourses(approvedCourses);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading schedule...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
            <p className="text-gray-600">View your weekly class schedule</p>
          </div>

          {/* Course List View */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Enrolled Courses</h2>
              <p className="text-sm text-gray-600">Your approved courses for this semester</p>
            </div>
            
            <div className="p-6">
              {enrolledCourses.length > 0 ? (
                <div className="space-y-4">
                  {enrolledCourses.map((course, index) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="font-medium">Course Code:</span>
                              <span className="ml-2">{course.code}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="font-medium">Credits:</span>
                              <span className="ml-2">{course.credits || 3}</span>
                            </div>

                            <div className="flex items-center text-gray-600">
                              <User className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="font-medium">Instructor:</span>
                              <span className="ml-2">
                                {course.instructors?.length > 0 
                                  ? course.instructors.map(instructor => instructor.name).join(', ')
                                  : 'TBA'
                                }
                              </span>
                            </div>

                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="font-medium">Department:</span>
                              <span className="ml-2">{course.department?.name}</span>
                            </div>
                          </div>

                          {course.description && (
                            <div className="mt-3 text-sm text-gray-600">
                              <p className="line-clamp-2">{course.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Scheduled</h3>
                  <p className="text-gray-600">
                    You don't have any approved courses yet. Enroll in courses to see your schedule.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Calendar View */}
          {enrolledCourses.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Weekly Overview</h2>
                <p className="text-sm text-gray-600">Your courses organized by day</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3 text-center">{day}</h3>
                      <div className="space-y-2">
                        {enrolledCourses.map((course) => (
                          <div key={course.id} className="bg-blue-50 border border-blue-200 rounded p-2">
                            <p className="text-xs font-medium text-blue-900">{course.code}</p>
                            <p className="text-xs text-blue-700 truncate">{course.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-sm text-gray-500">
                  <p>Note: Specific class times and locations will be announced by your instructors.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StudentSchedulePage;
