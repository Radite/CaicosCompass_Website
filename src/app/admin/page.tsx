// src/app/admin/page.tsx - Complete Admin Dashboard
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';
import {
  FaUsers,
  FaCalendarCheck,
  FaDollarSign,
  FaChartLine,
  FaSearch,
  FaFilter,
  FaDownload,
  FaEdit,
  FaTrash,
  FaEye,
  FaBan,
  FaCheck,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';

// Types
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface Booking {
  _id: string;
  user: { name: string; email: string };
  category: string;
  status: string;
  paymentDetails: {
    totalAmount: number;
    amountPaid: number;
    remainingBalance: number;
  };
  date?: string;
  startDate?: string;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  newUsersThisMonth: number;
  revenueThisMonth: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  // Dashboard data
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    newUsersThisMonth: 0,
    revenueThisMonth: 0,
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  
  // Filters and search
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');

  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) {
      fetchUsers();
    } else if (activeTab === 'bookings' && bookings.length === 0) {
      fetchBookings();
    }
  }, [activeTab]);

  useEffect(() => {
    filterUsers();
  }, [users, userSearch, userFilter]);

  useEffect(() => {
    filterBookings();
  }, [bookings, bookingSearch, bookingFilter]);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      
      if (userData.role !== 'admin') {
        router.push('/');
        return;
      }

      setUser(userData);
      await fetchDashboardStats();
      setLoading(false);
    } catch (error) {
      console.error('Error checking admin access:', error);
      setError('Access denied');
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/all-users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/all-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (userSearch) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase())
      );
    }

    if (userFilter !== 'all') {
      filtered = filtered.filter(user => {
        switch (userFilter) {
          case 'verified':
            return user.isVerified;
          case 'unverified':
            return !user.isVerified;
          case 'admin':
            return user.role === 'admin';
          case 'business-manager':
            return user.role === 'business-manager';
          case 'user':
            return user.role === 'user';
          default:
            return true;
        }
      });
    }

    setFilteredUsers(filtered);
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (bookingSearch) {
      filtered = filtered.filter(booking =>
        booking._id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        booking.user.name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        booking.user.email.toLowerCase().includes(bookingSearch.toLowerCase())
      );
    }

    if (bookingFilter !== 'all') {
      filtered = filtered.filter(booking => {
        switch (bookingFilter) {
          case 'confirmed':
            return booking.status === 'confirmed';
          case 'pending':
            return booking.status === 'pending';
          case 'cancelled':
            return booking.status === 'cancelled';
          case 'completed':
            return booking.status === 'completed';
          default:
            return true;
        }
      });
    }

    setFilteredBookings(filtered);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
      } else {
        throw new Error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setUsers(users.filter(user => user._id !== userId));
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setBookings(bookings.map(booking => 
          booking._id === bookingId ? { ...booking, status: newStatus } : booking
        ));
      } else {
        throw new Error('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    }
  };

  const exportData = (type: string) => {
    const data = type === 'users' ? filteredUsers : filteredBookings;
    const headers = type === 'users' 
      ? ['Name', 'Email', 'Role', 'Verified', 'Created At']
      : ['ID', 'User', 'Category', 'Status', 'Amount', 'Date'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => {
        if (type === 'users') {
          const user = item as User;
          return [
            user.name,
            user.email,
            user.role,
            user.isVerified ? 'Yes' : 'No',
            new Date(user.createdAt).toLocaleDateString()
          ].join(',');
        } else {
          const booking = item as Booking;
          return [
            booking._id,
            booking.user.name,
            booking.category,
            booking.status,
            booking.paymentDetails.totalAmount,
            booking.date || booking.startDate || new Date(booking.createdAt).toLocaleDateString()
          ].join(',');
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <FaExclamationTriangle className={styles.errorIcon} />
        <h2>Access Denied</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>

      <div className={styles.navigation}>
        <button
          className={`${styles.navButton} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaChartLine /> Overview
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUsers /> Users
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'bookings' ? styles.active : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <FaCalendarCheck /> Bookings
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className={styles.overview}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FaUsers />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
                <span className={styles.statChange}>
                  +{stats.newUsersThisMonth} this month
                </span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FaCalendarCheck />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.totalBookings}</h3>
                <p>Total Bookings</p>
                <span className={styles.statChange}>
                  {stats.pendingBookings} pending
                </span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FaDollarSign />
              </div>
              <div className={styles.statContent}>
                <h3>${stats.totalRevenue.toLocaleString()}</h3>
                <p>Total Revenue</p>
                <span className={styles.statChange}>
                  +${stats.revenueThisMonth.toLocaleString()} this month
                </span>
              </div>
            </div>
          </div>

          <div className={styles.recentActivity}>
            <h3>Recent Activity</h3>
            <div className={styles.activityList}>
              {bookings.slice(0, 5).map(booking => (
                <div key={booking._id} className={styles.activityItem}>
                  <div className={styles.activityInfo}>
                    <strong>{booking.user.name}</strong> booked {booking.category}
                    <span className={styles.activityTime}>
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={`${styles.activityStatus} ${styles[booking.status]}`}>
                    {booking.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className={styles.usersTab}>
          <div className={styles.tabHeader}>
            <h2>User Management</h2>
            <div className={styles.tabActions}>
              <div className={styles.searchBox}>
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Users</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="admin">Admins</option>
                <option value="business-manager">Business Managers</option>
                <option value="user">Regular Users</option>
              </select>
              <button
                onClick={() => exportData('users')}
                className={styles.exportButton}
              >
                <FaDownload /> Export
              </button>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                        className={styles.roleSelect}
                      >
                        <option value="user">User</option>
                        <option value="business-manager">Business Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${user.isVerified ? styles.verified : styles.unverified}`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => router.push(`/admin/users/${user._id}`)}
                          className={styles.viewButton}
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => deleteUser(user._id)}
                          className={styles.deleteButton}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className={styles.bookingsTab}>
          <div className={styles.tabHeader}>
            <h2>Booking Management</h2>
            <div className={styles.tabActions}>
              <div className={styles.searchBox}>
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                />
              </div>
              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Bookings</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
              <button
                onClick={() => exportData('bookings')}
                className={styles.exportButton}
              >
                <FaDownload /> Export
              </button>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>User</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => (
                  <tr key={booking._id}>
                    <td>#{booking._id.slice(-8)}</td>
                    <td>
                      <div>
                        <div>{booking.user.name}</div>
                        <div className={styles.userEmail}>{booking.user.email}</div>
                      </div>
                    </td>
                    <td>{booking.category}</td>
                    <td>
                      {booking.date || booking.startDate 
                        ? new Date(booking.date || booking.startDate).toLocaleDateString()
                        : new Date(booking.createdAt).toLocaleDateString()
                      }
                    </td>
                    <td>${booking.paymentDetails.totalAmount.toFixed(2)}</td>
                    <td>
                      <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                        className={`${styles.statusSelect} ${styles[booking.status]}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => router.push(`/admin/bookings/${booking._id}`)}
                          className={styles.viewButton}
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                          className={styles.cancelButton}
                        >
                          <FaBan />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}