'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/utils/authGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Calendar, MapPin, Phone } from 'lucide-react';
import api from '@/services/api';

const StudentProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    emergency_contact: '',
    emergency_phone: '',
  });

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
    fetchStudentProfile();
  }, [user]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      // Get current user's student profile
      const response = await api.get('/profile');
      const userData = response.data;
      
      if (userData.role === 'student' && userData.student) {
        const studentResponse = await api.get(`/students/${userData.student.id}`);
        const student = studentResponse.data;
        setStudentData(student);
        
        // Initialize form with student data
        setFormData({
          name: student.name || '',
          email: student.email || '',
          phone: student.phone || '',
          address: student.address || '',
          date_of_birth: student.date_of_birth || '',
          emergency_contact: student.emergency_contact || '',
          emergency_phone: student.emergency_phone || '',
        });
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
      showNotification('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/students/${studentData.id}`, formData);
      showNotification('Profile updated successfully');
      setIsEditing(false);
      fetchStudentProfile(); // Refresh data
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile', 'error');
    }
  };

  const handleDeleteProfileImage = async () => {
    // Photo functionality removed
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading profile...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!studentData) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">Unable to load profile data</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const profileFields = [
    { label: 'Full Name', name: 'name', icon: User, type: 'text' },
    { label: 'Email Address', name: 'email', icon: Mail, type: 'email' },
    { label: 'Phone Number', name: 'phone', icon: Phone, type: 'tel' },
    { label: 'Address', name: 'address', icon: MapPin, type: 'text' },
    { label: 'Date of Birth', name: 'date_of_birth', icon: Calendar, type: 'date' },
    { label: 'Emergency Contact', name: 'emergency_contact', icon: User, type: 'text' },
    { label: 'Emergency Phone', name: 'emergency_phone', icon: Phone, type: 'tel' },
  ];

  const readOnlyFields = [
    { label: 'Student ID', value: studentData.student_id },
    { label: 'Department', value: studentData.department?.name || 'N/A' },
    { label: 'Program', value: studentData.program || 'N/A' },
    { label: 'Academic Year', value: `Year ${studentData.year || 'N/A'}` },
    { label: 'Semester', value: `Semester ${studentData.semester || 'N/A'}` },
    { label: 'Admission Date', value: studentData.admission_date ? new Date(studentData.admission_date).toLocaleDateString() : 'N/A' },
    { label: 'Status', value: studentData.status || 'N/A' },
  ];

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
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
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">Manage your personal information</p>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? 'outline' : 'primary'}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          {/* Profile Overview */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Profile Overview</h2>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(studentData.name)}&background=3B82F6&color=fff&size=120`}
                    alt={studentData.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{studentData.name}</h3>
                  <p className="text-gray-600">{studentData.student_id}</p>
                  <p className="text-sm text-gray-500">{studentData.department?.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileFields.map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.name}>
                      {isEditing ? (
                        <Input
                          label={field.label}
                          name={field.name}
                          type={field.type}
                          value={formData[field.name]}
                          onChange={handleChange}
                          required={field.name === 'name' || field.name === 'email'}
                        />
                      ) : (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.label}
                          </label>
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Icon className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-900">{formData[field.name] || 'Not provided'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Academic Information</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {readOnlyFields.map((field, index) => (
                  <div key={index} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-900 font-medium">{field.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Academic Progress */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Academic Progress</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">--</div>
                  <div className="text-sm text-gray-600">Current GPA</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">--</div>
                  <div className="text-sm text-gray-600">Credits Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">--</div>
                  <div className="text-sm text-gray-600">Degree Progress</div>
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-500">
                Academic progress data will be available once grades are recorded.
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StudentProfilePage;