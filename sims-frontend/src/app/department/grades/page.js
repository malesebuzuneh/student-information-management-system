'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { CheckCircle, XCircle, Eye, Award, Clock, User } from 'lucide-react';
import api from '@/services/api';

const DepartmentGradesPage = () => {
  const [pendingGrades, setPendingGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [processing, setProcessing] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    fetchPendingGrades();
  }, []);

  const fetchPendingGrades = async () => {
    try {
      setLoading(true);
      const response = await api.get('/department/pending-grades');
      setPendingGrades(response.data.pending_grades || []);
    } catch (error) {
      console.error('Error fetching pending grades:', error);
      showNotification('Failed to load pending grades', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (grade) => {
    setSelectedGrade(grade);
    setShowDetailModal(true);
  };

  const handleApprove = async (gradeId) => {
    if (!window.confirm('Are you sure you want to approve this grade?')) {
      return;
    }

    try {
      setProcessing(gradeId);
      await api.put(`/department/grades/${gradeId}/approve`);
      showNotification('Grade approved successfully');
      fetchPendingGrades();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error approving grade:', error);
      const errorMessage = error.response?.data?.error || 'Failed to approve grade';
      showNotification(errorMessage, 'error');
    } finally {
      setProcessing(null);
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
      header: 'Student',
      accessor: 'student',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{row.student?.name}</p>
          <p className="text-sm text-gray-600">{row.student?.student_id}</p>
        </div>
      ),
    },
    {
      header: 'Course',
      accessor: 'course',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{row.course?.code}</p>
          <p className="text-sm text-gray-600">{row.course?.title}</p>
        </div>
      ),
    },
    {
      header: 'Instructor',
      accessor: 'instructor',
      render: (value, row) => row.instructor?.name || 'N/A',
    },
    {
      header: 'Grade',
      accessor: 'grade',
      render: (value) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      header: 'Submitted',
      accessor: 'submitted_at',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending Approval
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(row)}
          >
            <Eye size={16} className="mr-1" />
            Review
          </Button>
          <Button
            size="sm"
            onClick={() => handleApprove(row.id)}
            disabled={processing === row.id}
          >
            {processing === row.id ? (
              <>
                <Clock size={16} className="mr-1 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle size={16} className="mr-1" />
                Approve
              </>
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['department']}>
      <DashboardLayout>
        <div className="space-y-6">
          {notification && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
              notification.type === 'error' 
                ? 'bg-red-500 text-white' 
                : 'bg-green-500 text-white'
            }`}>
              {notification.message}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grade Approval</h1>
            <p className="text-gray-600">Review and approve submitted grades</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-yellow-500 rounded-lg p-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingGrades.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Grades Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Pending Grades</h2>
              <p className="text-sm text-gray-600">Grades submitted by instructors awaiting your approval</p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : pendingGrades.length === 0 ? (
              <div className="p-12 text-center">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Grades</h3>
                <p className="text-gray-600">All submitted grades have been reviewed.</p>
              </div>
            ) : (
              <Table
                columns={columns}
                data={pendingGrades}
                loading={false}
              />
            )}
          </div>

          {/* Grade Detail Modal */}
          <Modal
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            title="Grade Details"
          >
            {selectedGrade && (
              <div className="space-y-6">
                {/* Student Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Student Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Name:</span>
                      <span className="text-sm text-gray-900">{selectedGrade.student?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Student ID:</span>
                      <span className="text-sm text-gray-900">{selectedGrade.student?.student_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Email:</span>
                      <span className="text-sm text-gray-900">{selectedGrade.student?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Course Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Course Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Course Code:</span>
                      <span className="text-sm text-gray-900">{selectedGrade.course?.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Course Title:</span>
                      <span className="text-sm text-gray-900">{selectedGrade.course?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Instructor:</span>
                      <span className="text-sm text-gray-900">{selectedGrade.instructor?.name}</span>
                    </div>
                  </div>
                </div>

                {/* Grade Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Grade Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Grade:</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(selectedGrade.grade)}`}>
                        {selectedGrade.grade}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Submitted Date:</span>
                      <span className="text-sm text-gray-900">
                        {selectedGrade.submitted_at ? new Date(selectedGrade.submitted_at).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedGrade.id)}
                    disabled={processing === selectedGrade.id}
                  >
                    {processing === selectedGrade.id ? (
                      <>
                        <Clock size={16} className="mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} className="mr-2" />
                        Approve Grade
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DepartmentGradesPage;
