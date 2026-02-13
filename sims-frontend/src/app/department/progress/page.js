'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Search, TrendingUp, Users, BookOpen, Award, Eye, Download } from 'lucide-react';
import api from '@/services/api';

const ProgressPage = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    fetchStudentProgress();
    fetchCourses();
  }, []);

  const fetchStudentProgress = async () => {
    try {
      setLoading(true);
      // Mock data for student progress since we don't have the endpoint yet
      const mockProgress = [
        {
          id: 1,
          student: { id: 1, name: 'John Doe', email: 'john@student.com' },
          course: { id: 2, code: 'CS101', title: 'Introduction to Programming' },
          enrollmentDate: '2026-01-15',
          attendance: 85,
          assignments: { completed: 8, total: 10 },
          grades: { current: 87, letter: 'B+' },
          status: 'active',
          lastActivity: '2026-02-01'
        },
        {
          id: 2,
          student: { id: 2, name: 'Jane Smith', email: 'jane@student.com' },
          course: { id: 3, code: 'CS201', title: 'Data Structures' },
          enrollmentDate: '2026-01-15',
          attendance: 92,
          assignments: { completed: 9, total: 10 },
          grades: { current: 94, letter: 'A' },
          status: 'active',
          lastActivity: '2026-02-02'
        },
        {
          id: 3,
          student: { id: 3, name: 'Bob Johnson', email: 'bob@student.com' },
          course: { id: 2, code: 'CS101', title: 'Introduction to Programming' },
          enrollmentDate: '2026-01-20',
          attendance: 78,
          assignments: { completed: 6, total: 10 },
          grades: { current: 72, letter: 'C+' },
          status: 'at-risk',
          lastActivity: '2026-01-30'
        },
        {
          id: 4,
          student: { id: 4, name: 'Alice Brown', email: 'alice@student.com' },
          course: { id: 3, code: 'CS201', title: 'Data Structures' },
          enrollmentDate: '2026-01-18',
          attendance: 96,
          assignments: { completed: 10, total: 10 },
          grades: { current: 98, letter: 'A+' },
          status: 'excellent',
          lastActivity: '2026-02-02'
        },
      ];
      
      setStudents(mockProgress);
    } catch (error) {
      console.error('Error fetching student progress:', error);
      alert('Failed to fetch student progress');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      // Use department-specific endpoint
      const response = await api.get('/department/courses');
      setCourses(response.data.courses || response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('Failed to fetch courses');
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'excellent':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'active':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'at-risk':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const exportProgress = () => {
    alert('Progress report exported successfully');
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = selectedCourse === 'all' || student.course.id.toString() === selectedCourse;
    
    return matchesSearch && matchesCourse;
  });

  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active' || s.status === 'excellent').length,
    atRiskStudents: students.filter(s => s.status === 'at-risk').length,
    averageGrade: students.reduce((sum, s) => sum + s.grades.current, 0) / students.length || 0,
  };

  const columns = [
    {
      header: 'Student',
      accessor: 'student',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{row.student.name}</div>
          <div className="text-sm text-gray-600">{row.student.email}</div>
        </div>
      ),
    },
    {
      header: 'Course',
      accessor: 'course',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{row.course.code}</div>
          <div className="text-sm text-gray-600">{row.course.title}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value, row) => (
        <span className={getStatusBadge(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      header: 'Grade',
      accessor: 'grades',
      render: (value, row) => (
        <div className="text-center">
          <div className={`font-bold ${getGradeColor(row.grades.current)}`}>
            {row.grades.current}%
          </div>
          <div className="text-sm text-gray-600">{row.grades.letter}</div>
        </div>
      ),
    },
    {
      header: 'Attendance',
      accessor: 'attendance',
      render: (value, row) => (
        <div className="text-center">
          <div className={`font-medium ${value >= 80 ? 'text-green-600' : 'text-red-600'}`}>
            {value}%
          </div>
        </div>
      ),
    },
    {
      header: 'Assignments',
      accessor: 'assignments',
      render: (value, row) => (
        <div className="text-center">
          <div className="font-medium">
            {row.assignments.completed}/{row.assignments.total}
          </div>
          <div className="text-sm text-gray-600">
            {Math.round((row.assignments.completed / row.assignments.total) * 100)}%
          </div>
        </div>
      ),
    },
    {
      header: 'Last Activity',
      accessor: 'lastActivity',
      render: (value, row) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => alert(`Viewing details for ${row.student.name}`)}
        >
          <Eye size={16} className="mr-1" />
          View Details
        </Button>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['department']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Progress</h1>
              <p className="text-gray-600">Monitor student performance and progress</p>
            </div>
            <Button onClick={exportProgress}>
              <Download size={20} className="mr-2" />
              Export Report
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-lg p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-green-500 rounded-lg p-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeStudents}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-red-500 rounded-lg p-3">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">At Risk</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.atRiskStudents}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-purple-500 rounded-lg p-3">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Grade</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageGrade.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search students or courses..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Courses</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id.toString()}>
                        {course.code} - {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <Table
              columns={columns}
              data={filteredStudents}
              loading={loading}
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ProgressPage;