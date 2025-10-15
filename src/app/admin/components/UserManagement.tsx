"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '../types/admin.types';
import { 
  Plus, Search, RefreshCw, Eye, Edit, Trash2, 
  CheckCircle, XCircle, Filter, X, Save
} from 'lucide-react';
import styles from '../admin.module.css';

interface UserManagementProps {
  users: User[];
  onRefresh: () => void;
}

interface UserFormData {
  name: string;
  email: string;
  role: string;
  loyaltyPoints: number;
  isActive: boolean;
  phoneNumber?: string;
  businessProfile?: {
    businessName: string;
    businessType: string;
    isApproved: boolean;
  };
}

export default function UserManagement({ users: initialUsers, onRefresh }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('view');
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'user',
    loyaltyPoints: 0,
    isActive: true,
    phoneNumber: '',
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: getAuthHeaders(),
        params: {
          role: roleFilter !== 'all' ? roleFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchTerm || undefined
        }
      });
      
      if (response.data.success && response.data.users) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return `${styles.badge} ${styles.badgeDanger}`;
      case 'business-manager': return `${styles.badge} ${styles.badgeInfo}`;
      default: return `${styles.badge} ${styles.badgeSuccess}`;
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: getAuthHeaders()
      });
      setSelectedUser(response.data.user);
      setModalMode('view');
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Failed to load user details');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints || 0,
      isActive: user.isActive,
      phoneNumber: user.phoneNumber || '',
      businessProfile: user.businessProfile ? {
        businessName: user.businessProfile.businessName,
        businessType: user.businessProfile.businessType,
        isApproved: user.businessProfile.isApproved
      } : undefined
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'user',
      loyaltyPoints: 0,
      isActive: true,
      phoneNumber: '',
    });
    setModalMode('add');
    setShowModal(true);
  };

  const handleSaveUser = async () => {
    try {
      setLoading(true);
      
      if (modalMode === 'add') {
        // Create new user
        await axios.post(`${API_BASE_URL}/api/users/register`, {
          ...formData,
          password: 'tempPassword123' // You may want a better default or require password input
        }, {
          headers: getAuthHeaders()
        });
        alert('User created successfully');
      } else if (modalMode === 'edit' && selectedUser) {
        // Update existing user
        await axios.put(`${API_BASE_URL}/api/admin/users/${selectedUser._id}`, formData, {
          headers: getAuthHeaders()
        });
        alert('User updated successfully');
      }
      
      setShowModal(false);
      await fetchUsers();
      onRefresh();
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: getAuthHeaders()
      });
      alert('User deleted successfully');
      await fetchUsers();
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/status`, {}, {
        headers: getAuthHeaders()
      });
      await fetchUsers();
      onRefresh();
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/role`, 
        { role: newRole },
        { headers: getAuthHeaders() }
      );
      await fetchUsers();
      onRefresh();
      alert('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <div className="flex gap-3">
          <button 
            onClick={fetchUsers}
            disabled={loading}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button 
            onClick={handleAddUser}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            <Plus size={16} />
            Add User
          </button>
        </div>
      </div>

      <div className={styles.card}>
        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className={styles.searchContainer}>
                <Search className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Search users by name or email..." 
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="business-manager">Business Managers</option>
              <option value="admin">Admins</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>User</th>
                <th className={styles.tableHeaderCell}>Role</th>
                <th className={styles.tableHeaderCell}>Status</th>
                <th className={styles.tableHeaderCell}>Joined</th>
                <th className={styles.tableHeaderCell}>Loyalty Points</th>
                <th className={styles.tableHeaderCell}>Business</th>
                <th className={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={getRoleBadgeClass(user.role)}>
                      {user.role.replace('-', ' ')}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <button
                      onClick={() => handleToggleStatus(user._id, user.isActive)}
                      className={`flex items-center text-sm gap-1 ${
                        user.isActive ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
                      }`}
                      title="Click to toggle status"
                    >
                      {user.isActive ? 
                        <CheckCircle size={16} /> : 
                        <XCircle size={16} />
                      }
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className={styles.tableCell}>
                    <div className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    {user.lastLoginAt && (
                      <div className="text-xs text-gray-400">
                        Last: {new Date(user.lastLoginAt).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className={styles.tableCell}>
                    <span className="font-medium">{user.loyaltyPoints || 0}</span>
                  </td>
                  <td className={styles.tableCell}>
                    {user.businessProfile ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.businessProfile.businessName}
                        </div>
                        <span className={`${styles.badge} ${
                          user.businessProfile.isApproved ? styles.badgeSuccess : styles.badgeWarning
                        }`}>
                          {user.businessProfile.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className={styles.tableCell}>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewUser(user._id)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No users found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'view' ? 'User Details' : modalMode === 'edit' ? 'Edit User' : 'Add New User'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {modalMode === 'view' && selectedUser ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-lg font-semibold">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Role</label>
                    <p className="text-lg">
                      <span className={getRoleBadgeClass(selectedUser.role)}>
                        {selectedUser.role.replace('-', ' ')}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-lg">
                      <span className={`flex items-center gap-2 ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedUser.isActive ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Loyalty Points</label>
                    <p className="text-lg">{selectedUser.loyaltyPoints || 0}</p>
                  </div>
                  {selectedUser.phoneNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-lg">{selectedUser.phoneNumber}</p>
                    </div>
                  )}
                  {selectedUser.businessProfile && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-bold text-lg mb-3">Business Profile</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Business Name</label>
                          <p className="text-lg">{selectedUser.businessProfile.businessName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Business Type</label>
                          <p className="text-lg">{selectedUser.businessProfile.businessType}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Approval Status</label>
                          <p>
                            <span className={`${styles.badge} ${
                              selectedUser.businessProfile.isApproved ? styles.badgeSuccess : styles.badgeWarning
                            }`}>
                              {selectedUser.businessProfile.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="border-t pt-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Joined</label>
                        <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                      </div>
                      {selectedUser.lastLoginAt && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Last Login</label>
                          <p>{new Date(selectedUser.lastLoginAt).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveUser(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="user">User</option>
                      <option value="business-manager">Business Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loyalty Points</label>
                    <input
                      type="number"
                      value={formData.loyaltyPoints}
                      onChange={(e) => setFormData({ ...formData, loyaltyPoints: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active User</label>
                  </div>

                  {formData.role === 'business-manager' && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-bold text-lg mb-3">Business Profile</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                          <input
                            type="text"
                            value={formData.businessProfile?.businessName || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              businessProfile: { 
                                ...formData.businessProfile!,
                                businessName: e.target.value,
                                businessType: formData.businessProfile?.businessType || '',
                                isApproved: formData.businessProfile?.isApproved || false
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                          <select
                            value={formData.businessProfile?.businessType || ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              businessProfile: { 
                                ...formData.businessProfile!,
                                businessName: formData.businessProfile?.businessName || '',
                                businessType: e.target.value,
                                isApproved: formData.businessProfile?.isApproved || false
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Type</option>
                            <option value="restaurant">Restaurant</option>
                            <option value="hotel">Hotel</option>
                            <option value="tour-operator">Tour Operator</option>
                            <option value="transportation">Transportation</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        {modalMode === 'edit' && (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="isApproved"
                              checked={formData.businessProfile?.isApproved || false}
                              onChange={(e) => setFormData({ 
                                ...formData, 
                                businessProfile: { 
                                  ...formData.businessProfile!,
                                  businessName: formData.businessProfile?.businessName || '',
                                  businessType: formData.businessProfile?.businessType || '',
                                  isApproved: e.target.checked
                                }
                              })}
                              className="mr-2"
                            />
                            <label htmlFor="isApproved" className="text-sm font-medium text-gray-700">Approved Business</label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t mt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className={`${styles.btn} ${styles.btnSecondary} flex-1`}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`${styles.btn} ${styles.btnPrimary} flex-1`}
                      disabled={loading}
                    >
                      <Save size={16} />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}