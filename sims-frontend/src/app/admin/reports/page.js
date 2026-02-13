'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { Download, FileText, Users, BookOpen, BarChart3 } from 'lucide-react';
import api from '@/services/api';

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    {
      id: 'student-enrollment',
      title: 'Student Enrollment Report',
      description: 'Comprehensive report of all student enrollments by course and department',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      id: 'course-assignments',
      title: 'Course Assignment Report',
      description: 'Report showing instructor assignments to courses',
      icon: BookOpen,
      color: 'bg-green-500',
    },
    {
      id: 'department-summary',
      title: 'Department Summary Report',
      description: 'Overview of department statistics and performance metrics',
      icon: BarChart3,
      color: 'bg-purple-500',
    },
    {
      id: 'academic-performance',
      title: 'Academic Performance Report',
      description: 'Student grades and performance analytics',
      icon: FileText,
      color: 'bg-orange-500',
    },
  ];

  const generateReport = async (reportType) => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/${reportType}`);
      alert('Report generated successfully');
      
      // Mock download functionality
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${reportType}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Generate and download system reports</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <div key={report.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`${report.color} rounded-lg p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {report.description}
                      </p>
                      <Button
                        onClick={() => generateReport(report.id)}
                        loading={loading}
                        disabled={loading}
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Reports</h2>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No reports generated yet</p>
                <p className="text-sm text-gray-400">Generated reports will appear here</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">1</div>
                <div className="text-sm text-gray-600">Total Instructors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">1</div>
                <div className="text-sm text-gray-600">Total Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">1</div>
                <div className="text-sm text-gray-600">Departments</div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminReportsPage;