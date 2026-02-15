'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

function InstructorAttendanceContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const courseParam = searchParams.get('course');
  
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [existingAttendance, setExistingAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  // Auto-select course if provided in URL
  useEffect(() => {
    if (courseParam && courses.length > 0) {
      const course = courses.find(c => c.id.toString() === courseParam);
      if (course) {
        setSelectedCourse(course.id);
      }
    }
  }, [courseParam, courses]);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseStudents(selectedCourse);
      fetchCourseAttendance(selectedCourse);
    }
  }, [selectedCourse, attendanceDate]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/instructor/courses');
      setCourses(response.data.courses || response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  const fetchCourseStudents = async (courseId) => {
    try {
      const response = await api.get(`/instructor/courses/${courseId}/students`);
      const studentsData = response.data.students || response.data || [];
      setStudents(studentsData);
      
      // Initialize attendance records
      const records = {};
      studentsData.forEach(student => {
        records[student.id] = 'present';
      });
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const fetchCourseAttendance = async (courseId) => {
    try {
      const response = await api.get(`/instructor/courses/${courseId}/attendance`);
      const attendanceData = response.data.attendance || response.data || [];
      setExistingAttendance(attendanceData);
      
      // Pre-fill attendance if already recorded for this date
      const todayRecords = attendanceData.filter(
        record => record.date === attendanceDate
      );
      
      if (todayRecords.length > 0) {
        const records = {};
        todayRecords.forEach(record => {
          records[record.student_id] = record.status;
        });
        setAttendanceRecords(records);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setExistingAttendance([]);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        student_id: parseInt(studentId),
        status
      }));

      await api.post('/instructor/attendance/bulk', {
        course_id: selectedCourse,
        date: attendanceDate,
        records
      });

      setMessage({ type: 'success', text: 'Attendance recorded successfully!' });
      fetchCourseAttendance(selectedCourse);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to record attendance' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStats = () => {
    const filtered = existingAttendance.filter(record => record.date === attendanceDate);
    return {
      total: filtered.length,
      present: filtered.filter(r => r.status === 'present').length,
      absent: filtered.filter(r => r.status === 'absent').length,
      late: filtered.filter(r => r.status === 'late').length
    };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
            <p className="text-gray-600">Record and manage student attendance</p>
          </div>

          {/* Course Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Course
                </label>
                <select
                  value={selectedCourse || ''}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a course...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {selectedCourse && (
            <>
              {/* Statistics */}
              {stats.total > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Total</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Present</div>
                    <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Absent</div>
                    <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Late</div>
                    <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                  </div>
                </div>
              )}

              {/* Attendance Form */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Record Attendance</h2>

                {message.text && (
                  <div className={`mb-4 p-3 rounded ${
                    message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {message.text}
                  </div>
                )}

                {students.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No students enrolled in this course
                  </p>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Student ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Name
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map(student => (
                            <tr key={student.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {student.student_id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {student.name || student.user?.name || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <div className="flex justify-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(student.id, 'present')}
                                    className={`px-4 py-2 rounded text-sm font-medium ${
                                      attendanceRecords[student.id] === 'present'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    Present
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(student.id, 'absent')}
                                    className={`px-4 py-2 rounded text-sm font-medium ${
                                      attendanceRecords[student.id] === 'absent'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    Absent
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(student.id, 'late')}
                                    className={`px-4 py-2 rounded text-sm font-medium ${
                                      attendanceRecords[student.id] === 'late'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    Late
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {loading ? 'Saving...' : 'Save Attendance'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
  );
}

export default function InstructorAttendance() {
  return (
    <ProtectedRoute allowedRoles={['instructor']}>
      <DashboardLayout>
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        }>
          <InstructorAttendanceContent />
        </Suspense>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
