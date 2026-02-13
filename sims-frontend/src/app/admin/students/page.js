'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Plus, Search, Edit, Trash2, User } from 'lucide-react';
import api from '@/services/api';

// Helper function to get default form data - moved outside component to prevent recreation
const getDefaultFormData = () => ({
  name: '',
  email: '',
  date_of_birth: '',
  gender: '',
  address: '',
  phone: '',
  emergency_contact: '',
  emergency_phone: '',
  department_id: '',
  program: '',
  year: 1,
  semester: 1,
  admission_type: 'regular',
  admission_date: new Date().toISOString().split('T')[0],
});

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState(() => getDefaultFormData());

  // Simple notification system with better error display
  const showNotification = (message, type = 'success') => {
    console.log(`Notification (${type}):`, message);
    setNotification({ message, type });
  };

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    let mounted = true;
    
    const fetchStudentsData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/students');
        const studentsData = response.data.data || response.data || [];
        if (mounted) {
          setStudents(Array.isArray(studentsData) ? studentsData : []);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        if (mounted) {
          setStudents([]);
          showNotification('Failed to fetch students', 'error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const fetchDepartmentsData = async () => {
      try {
        const response = await api.get('/departments');
        const departmentsData = response.data.data || response.data || [];
        if (mounted) {
          setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        if (mounted) {
          setDepartments([]);
          showNotification('Failed to fetch departments', 'error');
        }
      }
    };
    
    const initializeData = async () => {
      try {
        await Promise.all([fetchStudentsData(), fetchDepartmentsData()]);
      } catch (error) {
        if (mounted) {
          console.error('Error initializing data:', error);
        }
      }
    };

    initializeData();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students');
      const studentsData = response.data.data || response.data || [];
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      showNotification('Failed to fetch students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      const departmentsData = response.data.data || response.data || [];
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
      showNotification('Failed to fetch departments', 'error');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'date_of_birth', 'gender', 'address', 'phone', 'emergency_contact', 'emergency_phone', 'department_id', 'program'];
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].toString().trim() === '');
    
    if (missingFields.length > 0) {
      showNotification(`Please fill in all required fields: ${missingFields.join(', ')}`, 'error');
      return;
    }
    
    try {
      console.log('Submitting student data:', formData);
      
      const studentData = {
        ...formData,
        department_id: parseInt(formData.department_id),
        year: parseInt(formData.year),
        semester: parseInt(formData.semester)
      };
      
      console.log('Processed student data:', studentData);
      
      const response = await api.post('/students', studentData);
      
      console.log('Student creation response:', response.data);
      
      // Show success message with login credentials
      const { student, temporary_password, student_id, username } = response.data;
      alert(
        `Student registered successfully!\n\nStudent Details:\nStudent ID: ${student_id}\nName: ${student.name}\nEmail: ${student.email}\n\nLogin Credentials:\nUsername: ${username}\nTemporary Password: ${temporary_password}\n\nPlease share these credentials with the student. They will be required to change their password on first login.`
      );
      
      setShowAddModal(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to add student';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        errorMessage = errorMessages.join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
    }
  };

  const handleResetPassword = async (student) => {
    if (window.confirm(`Are you sure you want to reset the password for ${student.name}?`)) {
      try {
        const response = await api.post(`/students/${student.id}/reset-password`);
        const { new_password } = response.data;
        alert(
          `Password reset successfully!\n\nNew Login Credentials:\nUsername: ${student.user?.username || 'N/A'}\nNew Password: ${new_password}\n\nPlease share this with the student.`
        );
      } catch (error) {
        console.error('Error resetting password:', error);
        showNotification('Failed to reset password', 'error');
      }
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      const studentData = {
        ...formData,
        department_id: parseInt(formData.department_id)
      };
      await api.put(`/students/${editingStudent.id}`, studentData);
      showNotification('Student updated successfully');
      setEditingStudent(null);
      resetForm();
      fetchStudents();
    } catch (error) {
      console.error('Error updating student:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update student';
      showNotification(errorMessage, 'error');
    }
  };

  const handleDeleteStudent = async (student) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/students/${student.id}`);
        showNotification('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        showNotification('Failed to delete student', 'error');
      }
    }
  };

  const openEditModal = (student) => {
    if (!student) return;
    
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      date_of_birth: student.date_of_birth || '',
      gender: student.gender || '',
      address: student.address || '',
      phone: student.phone || '',
      emergency_contact: student.emergency_contact || '',
      emergency_phone: student.emergency_phone || '',
      department_id: student.department_id?.toString() || '',
      program: student.program || '',
      year: student.year || 1,
      semester: student.semester || 1,
      admission_type: student.admission_type || 'regular',
      admission_date: student.admission_date || new Date().toISOString().split('T')[0],
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData(getDefaultFormData());
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingStudent(null);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseInt(value)) : value
    }));
  };

  // Component for status badge
  const StatusBadge = ({ status }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      status === 'active' 
        ? 'bg-green-100 text-green-800' 
        : status === 'inactive'
        ? 'bg-red-100 text-red-800'
        : status === 'graduated'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-yellow-100 text-yellow-800'
    }`}>
      {status || 'N/A'}
    </span>
  );

  // Component for login status
  const LoginStatus = ({ user, isFirstLogin }) => (
    <div className="flex flex-col space-y-1">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        user 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {user ? 'Active' : 'No Login'}
      </span>
      {user && isFirstLogin && (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          First Login Required
        </span>
      )}
    </div>
  );

  // Component for action buttons
  const ActionButtons = ({ student }) => {
    return (
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => openEditModal(student)}
        >
          <Edit size={16} />
        </Button>

        {student.user && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleResetPassword(student)}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            Reset Password
          </Button>
        )}
        <Button
          size="sm"
          variant="danger"
          onClick={() => handleDeleteStudent(student)}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    );
  };

  const filteredStudents = students.filter(student =>
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Student ID',
      accessor: 'student_id',
    },
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Username',
      accessor: 'user',
      render: (value, row) => row.user?.username || 'N/A',
    },
    {
      header: 'Department',
      accessor: 'department_id',
      render: (value, row) => row.department?.name || 'N/A',
    },
    {
      header: 'Program',
      accessor: 'program',
    },
    {
      header: 'Year/Semester',
      accessor: 'year',
      render: (value, row) => `Year ${row.year || 'N/A'}, Sem ${row.semester || 'N/A'}`,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value, row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Login Status',
      accessor: 'user',
      render: (value, row) => <LoginStatus user={row.user} isFirstLogin={row.is_first_login} />,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => <ActionButtons student={row} />,
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
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
              <h1 className="text-2xl font-bold text-gray-900">Students</h1>
              <p className="text-gray-600">Manage student records</p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus size={20} className="mr-2" />
              Add Student
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by student ID..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Table
              columns={columns}
              data={filteredStudents}
              loading={loading}
            />
          </div>

          {/* Add/Edit Student Modal */}
          <Modal
            isOpen={showAddModal || editingStudent}
            onClose={closeModal}
            title={editingStudent ? 'Edit Student' : 'Add New Student'}
          >
            <form onSubmit={editingStudent ? handleEditStudent : handleAddStudent}>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Personal Information */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                    <Input
                      label="Date of Birth"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Input
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                    <Input
                      label="Emergency Contact Name"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mt-4">
                    <Input
                      label="Emergency Contact Phone"
                      name="emergency_phone"
                      value={formData.emergency_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        name="department_id"
                        value={formData.department_id}
                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Program/Degree"
                      name="program"
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                      placeholder="e.g., Bachelor of Science in Computer Science"
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Academic Year
                      </label>
                      <select
                        name="year"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value={1}>1st Year</option>
                        <option value={2}>2nd Year</option>
                        <option value={3}>3rd Year</option>
                        <option value={4}>4th Year</option>
                        <option value={5}>5th Year</option>
                        <option value={6}>6th Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Semester
                      </label>
                      <select
                        name="semester"
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value={1}>1st Semester</option>
                        <option value={2}>2nd Semester</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admission Type
                      </label>
                      <select
                        name="admission_type"
                        value={formData.admission_type}
                        onChange={(e) => setFormData({ ...formData, admission_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="regular">Regular</option>
                        <option value="transfer">Transfer</option>
                        <option value="international">International</option>
                        <option value="scholarship">Scholarship</option>
                      </select>
                    </div>
                    <Input
                      label="Admission Date"
                      name="admission_date"
                      type="date"
                      value={formData.admission_date}
                      onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingStudent ? 'Update' : 'Register'} Student
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StudentsPage;