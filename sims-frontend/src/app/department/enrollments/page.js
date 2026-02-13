'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Search, Check, X, Clock, Users, BookOpen, AlertCircle } from 'lucide-react';
import api from '@/services/api';

const EnrollmentsPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processing, setProcessing] = useState(null);
  const [notification, setNotification] = useState(null);

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
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/department/pending-enrollments');
      setEnrollments(response.data.pending_enrollments || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      showNotification('Failed to load enrollments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (courseId, studentId, action) => {
    try {
      setProcessing(`${courseId}-${studentId}-${action}`);
      
      const endpoint = action === 'approve' 
        ? `/courses/${courseId}/students/${studentId}/approve`
        : `/courses/${courseId}/students/${studentId}/reject`;
      
      const response = await api.put(endpoint);
      
      showNotification(response.data.message);
      fetchEnrollments(); // Refresh the list
    } catch (error) {
      console.error(`Error ${action}ing enrollment:`, error);
      const errorMessage = error.response?.data?.message || `Failed to ${action} enrollment`;
      showNotification(errorMessage, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <Check className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = 
      enrollment.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: 'Student',
      accessor: 'student_name',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{row.student_name}</p>
          <p className="text-sm text-gray-600">{row.student_id}</p>
          <p className="text-sm text-gray-500">{row.student_email}</p>
        </div>
      ),
    },
    {
      header: 'Course',
      accessor: 'course_title',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{row.course_title}</p>
          <p className="text-sm text-gray-600">{row.course_code}</p>
          <p className="text-sm text-gray-500">{row.department_name}</p>
        </div>
      ),
    },
    {
      header: 'Request Date',
      accessor: 'created_at',
      render: (value) => (
        <div>
          <p className="text-sm text-gray-900">
            {new Date(value).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {getStatusIcon(value)}
          <span className="ml-1 capitalize">{value}</span>
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          {row.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => handleApproval(row.course_id, row.student_id, 'approve')}
                disabled={processing === `${row.course_id}-${row.student_id}-approve`}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing === `${row.course_id}-${row.student_id}-approve` ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleApproval(row.course_id, row.student_id, 'reject')}
                disabled={processing === `${row.course_id}-${row.student_id}-reject`}
              >
                {processing === `${row.course_id}-${row.student_id}-reject` ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
          {row.status !== 'pending' && (
            <span className="text-sm text-gray-500 italic">
              {row.status === 'approved' ? 'Approved' : 'Rejected'}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['department']}>
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

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Enrollment Management</h1>
              <p className="text-gray-600">Review and approve student enrollment requests</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-yellow-500 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredEnrollments.filter(e => e.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-green-500 p-3 rounded-lg">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-blue-500 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unique Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(enrollments.map(e => e.student_id)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by student name, ID, or course..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Loading enrollments...</div>
              </div>
            ) : filteredEnrollments.length > 0 ? (
              <Table
                columns={columns}
                data={filteredEnrollments}
                loading={loading}
              />
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Enrollment Requests</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No enrollment requests match your current filters.'
                    : 'There are no enrollment requests at this time.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default EnrollmentsPage;