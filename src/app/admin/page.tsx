"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import {
  Users, DollarSign, Activity, Server, Database, Shield,
  Settings, FileText, Bell, Download, Upload, Trash2,
  Eye, Edit, Plus, Search, Filter, RefreshCw, AlertTriangle,
  CheckCircle, XCircle, Clock, TrendingUp, TrendingDown,
  Mail, MessageSquare, BarChart3, Monitor, Wifi, HardDrive, Cpu, MemoryStick
} from 'lucide-react';
import styles from './admin.module.css';
import DashboardOverview from './components/DashboardOverview';
import VendorManagement from './components/VendorManagement';
import UserManagement from './components/UserManagement';
import BookingManagement from './components/BookingManagement';
import RevenueAnalytics from './components/RevenueAnalytics';
import SystemMonitoring from './components/SystemMonitoring';
import BackupManager from './components/BackupManager';
import SecurityManager from './components/SecurityManager';
import AuditLogs from './components/AuditLogs';
import SystemSettings from './components/SystemSettings';
import { AdminDashboardStats, User, Booking } from './types/admin.types';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(0);
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'revenue', label: 'Revenue Tracking', icon: DollarSign },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'vendors', label: 'Vendor Management', icon: Users }, // ADD THIS LINE
    { id: 'bookings', label: 'Booking Management', icon: MessageSquare },
    { id: 'system', label: 'System Monitoring', icon: Monitor },
    { id: 'backup', label: 'Backup & Maintenance', icon: Database },
    { id: 'security', label: 'Security & Permissions', icon: Shield },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  useEffect(() => {
    checkAuth();
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const checkAuth = () => {
    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");
    
    if (!token || userRole !== "admin") {
      window.location.href = "/login";
      return false;
    }
    return true;
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchInitialData = async () => {
    try {
      await fetchDashboardStats();
      setLoading(false);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setLoading(false);
    }
  };

  const fetchTabData = async () => {
    switch (activeTab) {
      case 'users':
        await fetchUsers();
        break;
      case 'bookings':
        await fetchBookings();
        break;
      default:
        break;
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard`, {
        headers: getAuthHeaders()
      });
      setDashboardStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

const fetchUsers = async () => {
  try {
    console.log('🔄 Fetching users from API...');
    
    const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
      headers: getAuthHeaders()
    });

    console.log('📥 Full API Response:', response.data);
    console.log('👥 Users array:', response.data.users);
    console.log('📊 Response structure:', {
      hasUsers: !!response.data.users,
      usersLength: response.data.users?.length,
      isArray: Array.isArray(response.data.users),
      hasPagination: !!response.data.pagination
    });

    // Handle the response structure from your API
    if (response.data && response.data.users && Array.isArray(response.data.users)) {
      setUsers(response.data.users);
      console.log('✅ Users set successfully:', response.data.users.length, 'users');
      console.log('👤 First user:', response.data.users[0]);
    } else {
      console.error('❌ Unexpected response structure:', response.data);
      setUsers([]);
    }
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    console.error("📄 Error details:", error.response?.data);
    setUsers([]);
  }
};

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/bookings`, {
        headers: getAuthHeaders()
      });
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading admin dashboard...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview stats={dashboardStats} onRefresh={fetchDashboardStats} />;
      case 'revenue':
        return <RevenueAnalytics />;
      case 'users':
        return <UserManagement users={users} onRefresh={fetchUsers} />;
      case 'vendors':
        return <VendorManagement />;
      case 'bookings':
        return <BookingManagement bookings={bookings} onRefresh={fetchBookings} />;
      case 'system':
        return <SystemMonitoring />;
      case 'backup':
        return <BackupManager />;
      case 'security':
        return <SecurityManager />;
      case 'audit':
        return <AuditLogs />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <DashboardOverview stats={dashboardStats} onRefresh={fetchDashboardStats} />;
    }
  };

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.logoText}>Admin Portal</h2>
          <p className={styles.logoSubtext}>System Management</p>
        </div>
        
        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
              >
                <Icon className={styles.navIcon} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              <span>A</span>
            </div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>Admin User</p>
              <p className={styles.userEmail}>admin@company.com</p>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <Settings className={styles.logoutIcon} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.notificationBtn}>
              <Bell className={styles.notificationIcon} />
              {notifications > 0 && (
                <span className={styles.notificationBadge}>{notifications}</span>
              )}
            </button>
            <button className={styles.mailBtn}>
              <Mail className={styles.mailIcon} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.pageContent}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}