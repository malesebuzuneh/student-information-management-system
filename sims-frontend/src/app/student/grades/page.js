'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Table from '@/components/ui/Table';
import { FileText, TrendingUp, Award, BarChart3 } from 'lucide-react';
import api from '@/services/api';

const StudentGradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [gpa, setGpa] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/grades');
      setGrades(response.data.grades || []);
      setGpa(response.data.gpa || 0);
      setTotalCredits(response.data.total_credits || 0);
    } catch (error) {
      console.error('Error fetching grades:', error);
      setError('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (['A+', 'A', 'A-'].includes(grade)) return 'text-green-600 bg-green-100';
    if (['B+', 'B', 'B-'].includes(grade)) return 'text-blue-600 bg-blue-100';
    if (['C+', 'C', 'C-'].includes(grade)) return 'text-yellow-600 bg-yellow-100';
    if (['D+', 'D'].includes(grade)) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const columns = [
    {
      header: 'Course',
      accessor: 'course',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{row.course?.code || 'N/A'}</div>
          <div className="text-sm text-gray-600">{row.course?.title || 'N/A'}</div>
        </div>
      ),
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
      header: 'Assignment Type',
      accessor: 'assignment_type',
      render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A',
    },
    {
      header: 'Assignment Name',
      accessor: 'assignment_name',
      render: (value) => value || 'N/A',
    },
    {
      header: 'Points',
      accessor: 'points_earned',
      render: (value, row) => row.points_earned && row.total_points ? `${row.points_earned}/${row.total_points}` : 'N/A',
    },
    {
      header: 'Date',
      accessor: 'created_at',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A',
    },
  ];

  const stats = [
    {
      title: 'Current GPA',
      value: gpa.toFixed(2),
      icon: Award,
      color: 'bg-green-500',
    },
    {
      title: 'Grades Received',
      value: grades.length,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Credits',
      value: totalCredits,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading grades...</div>
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

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
              <p className="text-gray-600">View your academic performance</p>
            </div>
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
            
            {grades.length > 0 ? (
              <Table
                columns={columns}
                data={grades}
                loading={false}
              />
            ) : (
              <div className="p-12 text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Grades Yet</h3>
                <p className="text-gray-600">You don't have any grades recorded yet.</p>
                <p className="text-sm text-gray-500 mt-2">Grades will appear here once your instructors enter them.</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StudentGradesPage;