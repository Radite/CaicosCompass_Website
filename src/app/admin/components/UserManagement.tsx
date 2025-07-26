"use client";

import React, { useState } from 'react';
import { User } from '../types/admin.types';
import { 
  Plus, Search, RefreshCw, Eye, Edit, Trash2, 
  CheckCircle, XCircle, Filter
} from 'lucide-react';
import styles from '../admin.module.css';

interface UserManagementProps {
  users: User[];
  onRefresh: () => void;
}

export default function UserManagement({ users, onRefresh }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <div className="flex gap-3">
          <button 
            onClick={onRefresh}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className={`${styles.btn} ${styles.btnPrimary}`}>
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
                  placeholder="Search users..." 
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
                    <span className={`flex items-center text-sm gap-1 ${
                      user.isActive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {user.isActive ? 
                        <CheckCircle size={16} /> : 
                        <XCircle size={16} />
                      }
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
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
                      <button className="text-blue-600 hover:text-blue-900 p-1">
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-900 p-1">
                        <Edit size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination would go here */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}