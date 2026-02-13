'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Table from '@/components/ui/Table';
import { FileText, TrendingUp, Award } from 'lucide-react';

const StudentGradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('current');

  useEffect(() => {
    fetchGrades();
  }, [selectedSemester]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockGrades = [
        {
          id: 1,
          courseCode: 'CS101',
          courseName: 'Introduction to Programming',
          assignment: 'Midterm Exam',
          grade: 'A',
          points: 95,
          maxPoints: 100,
          weight: '30%',
          date: '2024-01-15',
        },
        {
          id: 2,
          courseCode: 'CS101',
          courseName: 'Introduction to Programming',
          assignment: 'Assignment 1',
          grade: 'A-',
          points: 88,
          maxPoints: 100,
          weight: '15%',
          date: '2024-01-10',
        },
        {
          id: 3,
          courseCode: 'MATH201',
          courseName: 'Calculus II',
          assignment: 'Quiz 1',
          grade: 'B+',
          points: 87,
          maxPoints: 100,
          weight: '10%',
          date: '2024-01-12',
        },
        {
          id: 4,
          courseCode: 'PHYS101',
          courseName: 'Physics I',
          assignment: 'Lab Report 1',
          grade: 'A',
          points: 92,
          maxPoints: 100,
          weight: '20%',
          date: '2024-01-08',
        },
      ];
      
      setGrades(mockGrades);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    const gradeColors = {
      'A': 'text-green-600 bg-green-100',
      'A-': 'text-green-600 bg-green-100',
      'B+': 'text-blue-600 bg-blue-100',
      'B': 'text-blue-600 bg-blue-100',
      'B-': 'text-blue-600 bg-blue-100',
      'C+': 'text-yellow-600 bg-yellow-100',
      'C': 'text-yellow-600 bg-yellow-100',
      'C-': 'text-yellow-600 bg-yellow-100',
      'D': 'text-orange-600 bg-orange-100',
      'F': 'text-red-600 bg-red-100',
    };
    return gradeColors[grade] || 'text-gray-600 bg-gray-100';
  };

  const columns = [
    {
      header: 'Course',
      accessor: 'courseCode',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{row.courseName}</div>
        </div>
      ),
    },
    {
      header: 'Assignment',
      accessor: 'assignment',
    },
    {
      header: 'Grade',
      accessor: 'grade',
      render: (value, row) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      header: 'Points',
      accessor: 'points',
      render: (value, row) => `${value}/${row.maxPoints}`,
    },
    {
      header: 'Weight',
      accessor: 'weight',
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (value, row) => new Date(value).toLocaleDateString(),
    },
  ];

  const calculateGPA = () => {
    const gradePoints = {
      'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0
    };
    
    const courseGrades = {};
    grades.forEach(grade => {
      if (!courseGrades[grade.courseCode]) {
        courseGrades[grade.courseCode] = [];
      }
      courseGrades[grade.courseCode].push(grade);
    });

    let totalPoints = 0;
    let totalCourses = 0;
    
    Object.values(courseGrades).forEach(courseGradeList => {
      const avgGrade = courseGradeList.reduce((sum, g) => sum + (gradePoints[g.grade] || 0), 0) / courseGradeList.length;
      totalPoints += avgGrade;
      totalCourses++;
    });

    return totalCourses > 0 ? (totalPoints / totalCourses).toFixed(2) : '0.00';
  };

  const stats = [
    {
      title: 'Current GPA',
      value: calculateGPA(),
      icon: Award,
      color: 'bg-green-500',
    },
    {
      title: 'Assignments Graded',
      value: grades.length,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Average Score',
      value: grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + g.points, 0) / grades.length) + '%' : '0%',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
              <p className="text-gray-600">View your academic performance</p>
            </div>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="current">Current Semester</option>
              <option value="fall2023">Fall 2023</option>
              <option value="spring2023">Spring 2023</option>
            </select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className={`${stat.color} rounded-lg p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grades Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Grade Details</h2>
            </div>
            
            <Table
              columns={columns}
              data={grades}
              loading={loading}
            />
          </div>

          {/* Grade Distribution Chart Placeholder */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Grade Distribution</h3>
            <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Grade distribution chart would go here</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StudentGradesPage;