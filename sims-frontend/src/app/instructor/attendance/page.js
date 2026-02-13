'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import { UserCheck, UserX, Clock, Calendar, Plus, Save } from 'lucide-react';

const InstructorAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    // Mock data for now - replace with actual API calls
    setTimeout(() => {
      setCourses([
        { id: 1, code: 'CS101', name: 'Introduction to Programming' },
        { id: 2, code: 'CS201', name: 'Data Structures' },
        { id: 3, code: 'CS301', name: 'Database Systems' }
      ]);

      setAttendance([
        {
          id: 1,
          student_name: 'John Doe',
          student_id: 'STU001',
          course_code: 'CS101',
          course_name: 'Introduction to Programming',
          date: '2026-02-01',
          status: 'Present',
          time_in: '10:00 AM',
          time_out: '11:30 AM',
          notes: ''
        },
        {
          id: 2,
          student_name: 'Jane Smith',
          student_id: 'STU002',
          course_code: 'CS101',
          course_name: 'Introduction to Programming',
          date: '2026-02-01',
          status: 'Present',
          time_in: '10:05 AM',
          time_out: '11:30 AM',
          notes: 'Late arrival'
        },
        {
          id: 3,
          student_name: 'Mike Johnson',
          student_id: 'STU003',
          course_code: 'CS101',
          course_name: 'Introduction to Programming',
          date: '2026-02-01',
          status: 'Absent',
          time_in: '',
          time_out: '',
          notes: 'Sick leave'
        },
        {
          id: 4,
          student_name: 'Sarah Wilson',
          student_id: 'STU004',
          course_code: 'CS201',
          course_name: 'Data Structures',
          date: '2026-02-01',
          status: 'Present',
          time_in: '2:00 PM',
          time_out: '3:30 PM',
          notes: ''
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredAttendance = attendance.filter(record => {
    const courseMatch = selectedCourse ? record.course_code === selectedCourse : true;
    const dateMatch = record.date === selectedDate;
    return courseMatch && dateMatch;
  });

  const columns = [
    {
      header: 'Student',
      accessor: 'student_name',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.student_id}</div>
        </div>
      )
    },
    {
      header: 'Course',
      accessor: 'course_code',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.course_name}</div>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'date'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <div className="flex items-center space-x-2">
          {value === 'Present' ? (
            <UserCheck className="h-4 w-4 text-green-500" />
          ) : (
            <UserX className="h-4 w-4 text-red-500" />
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'Present' 
              ? 'bg-green-100 text-green-800' 
              : value === 'Absent'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {value}
          </span>
        </div>
      )
    },
    {
      header: 'Time In',
      accessor: 'time_in',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-gray-500" />
          <span>{value || '-'}</span>
        </div>
      )
    },
    {
      header: 'Time Out',
      accessor: 'time_out',
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-gray-500" />
          <span>{value || '-'}</span>
        </div>
      )
    },
    {
      header: 'Notes',
      accessor: 'notes',
      render: (value) => (
        <span className="text-sm text-gray-600">{value || '-'}</span>
      )
    }
  ];

  const handleTakeAttendance = () => {
    if (!selectedCourse) {
      alert('Please select a course first');
      return;
    }

    // Mock student list for the selected course
    const mockStudents = [
      { id: 'STU001', name: 'John Doe' },
      { id: 'STU002', name: 'Jane Smith' },
      { id: 'STU003', name: 'Mike Johnson' },
      { id: 'STU004', name: 'Sarah Wilson' },
      { id: 'STU005', name: 'Emily Brown' }
    ];

    const initialAttendanceData = mockStudents.map(student => ({
      student_id: student.id,
      student_name: student.name,
      status: 'Present',
      time_in: '',
      time_out: '',
      notes: ''
    }));

    setAttendanceData(initialAttendanceData);
    setIsModalOpen(true);
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => 
      prev.map(record => 
        record.student_id === studentId 
          ? { ...record, status }
          : record
      )
    );
  };

  const handleTimeChange = (studentId, field, value) => {
    setAttendanceData(prev => 
      prev.map(record => 
        record.student_id === studentId 
          ? { ...record, [field]: value }
          : record
      )
    );
  };

  const handleNotesChange = (studentId, notes) => {
    setAttendanceData(prev => 
      prev.map(record => 
        record.student_id === studentId 
          ? { ...record, notes }
          : record
      )
    );
  };

  const handleSaveAttendance = () => {
    // Handle save attendance logic here
    console.log('Saving attendance:', {
      course: selectedCourse,
      date: selectedDate,
      attendance: attendanceData
    });
    setIsModalOpen(false);
  };

  const getAttendanceStats = () => {
    const total = filteredAttendance.length;
    const present = filteredAttendance.filter(record => record.status === 'Present').length;
    const absent = filteredAttendance.filter(record => record.status === 'Absent').length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, attendanceRate };
  };

  const stats = getAttendanceStats();

  return (
    <ProtectedRoute allowedRoles={['instructor']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
              <p className="text-gray-600">Track and manage student attendance</p>
            </div>
            <Button onClick={handleTakeAttendance}>
              <Plus className="h-4 w-4 mr-2" />
              Take Attendance
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Filters and Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course
                      </label>
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Courses</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.code}>
                            {course.code} - {course.name}
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
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Students:</span>
                      <span className="font-medium">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Present:</span>
                      <span className="font-medium text-green-600">{stats.present}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Absent:</span>
                      <span className="font-medium text-red-600">{stats.absent}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-gray-600">Attendance Rate:</span>
                      <span className="font-medium text-blue-600">{stats.attendanceRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Attendance Records ({filteredAttendance.length})
                  </h3>
                </div>
                <Table
                  data={filteredAttendance}
                  columns={columns}
                />
              </div>
            </>
          )}

          {/* Take Attendance Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={`Take Attendance - ${selectedCourse} (${selectedDate})`}
            size="lg"
          >
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Student</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Time In</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Time Out</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {attendanceData.map((record) => (
                      <tr key={record.student_id}>
                        <td className="px-4 py-2">
                          <div>
                            <div className="font-medium">{record.student_name}</div>
                            <div className="text-sm text-gray-500">{record.student_id}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={record.status}
                            onChange={(e) => handleStatusChange(record.student_id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Late">Late</option>
                            <option value="Excused">Excused</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="time"
                            value={record.time_in}
                            onChange={(e) => handleTimeChange(record.student_id, 'time_in', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={record.status === 'Absent'}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="time"
                            value={record.time_out}
                            onChange={(e) => handleTimeChange(record.student_id, 'time_out', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={record.status === 'Absent'}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={record.notes}
                            onChange={(e) => handleNotesChange(record.student_id, e.target.value)}
                            placeholder="Notes..."
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveAttendance}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Attendance
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default InstructorAttendance;