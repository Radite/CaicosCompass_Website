"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faList, faPlus, faCalendarCheck, faChartBar, 
  faTags, faUser, faCog, faSignOutAlt, faBell, faSearch,
  faFilter, faEdit, faEye, faTrash, faToggleOn, faToggleOff
} from '@fortawesome/free-solid-svg-icons';
import styles from './dashboard.module.css';
import ProtectedRoute from '../../components/ProtectedRoute';

// Import all dashboard components
import DashboardOverview from './components/DashboardOverview';
import ListingManagement from './components/ListingManagement';
import CreateListing from './components/CreateListing';
import EditListing from './components/EditListing';
import BookingManagement from './components/BookingManagement';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import DiscountManager from './components/DiscountManager';
import ProfileManagement from './components/ProfileManagement';
import MediaManager from './components/MediaManager';

interface VendorData {
  _id: string;
  name: string;
  email: string;
  role: string;
  businessProfile: {
    businessName: string;
    businessType: string;
    businessDescription: string;
    businessPhone: string;
    businessWebsite: string;
    businessAddress: {
      street: string;
      city: string;
      island: string;
      postalCode: string;
    };
    servicesOffered: string[];
    isApproved: boolean;
    documents: any[];
    operatingHours: any[];
    metrics: {
      totalListings: number;
      totalBookings: number;
      totalRevenue: number;
      averageRating: number;
      responseRate: number;
      responseTime: number;
    };
  };
  notifications: any[];
}

interface DashboardStats {
  totalListings: number;
  activeBookings: number;
  monthlyRevenue: number;
  averageRating: number;
  pendingReviews: number;
  recentBookings: any[];
  topPerformingListings: any[];
}

export default function VendorDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState([]);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: faChartLine },
    { id: 'listings', label: 'My Listings', icon: faList },
    { id: 'create-listing', label: 'Create Listing', icon: faPlus },
    { id: 'bookings', label: 'Bookings', icon: faCalendarCheck },
    { id: 'analytics', label: 'Analytics', icon: faChartBar },
    { id: 'discounts', label: 'Promotions', icon: faTags },
    { id: 'media', label: 'Media Manager', icon: faEye },
    { id: 'profile', label: 'Profile', icon: faUser },
  ];

  useEffect(() => {
    checkAuth();
    fetchVendorData();
    fetchDashboardStats();
    fetchNotifications();
  }, []);

const checkAuth = () => {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');
  
  console.log('🔐 Auth Check:');
  console.log('Token exists:', !!token);
  console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');
  console.log('User role:', userRole);
  console.log('Role check passes:', userRole === 'business-manager');
  
  if (!token || userRole !== 'business-manager') {
    console.log('❌ Auth failed, redirecting to login');
    window.location.href = '/login';
    return;
  }
  console.log('✅ Auth passed');
};

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchVendorData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/profile`,
        { headers: getAuthHeaders() }
      );
      setVendorData(response.data);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/business-dashboard`,
        { headers: getAuthHeaders() }
      );
      setDashboardStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/notifications`,
        { headers: getAuthHeaders() }
      );
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  const renderActiveSection = () => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      );
    }

    switch(activeSection) {
      case 'overview':
        return <DashboardOverview stats={dashboardStats} vendorData={vendorData} />;
// WITH THIS:
      case 'listings':
        return (
          <ListingManagement 
            onEditListing={(id) => {
              setEditingListingId(id);
              setActiveSection('edit-listing');
            }}
            onCreateListing={() => setActiveSection('create-listing')}
          />
        );
      case 'create-listing':
        return (
          <CreateListing 
            onSuccess={() => {
              setActiveSection('listings');
              fetchDashboardStats();
            }}
          />
        );
      case 'edit-listing':
        return (
          <EditListing 
            listingId={editingListingId}
            onSuccess={() => {
              setActiveSection('listings');
              setEditingListingId(null);
              fetchDashboardStats();
            }}
            onCancel={() => {
              setActiveSection('listings');
              setEditingListingId(null);
            }}
          />
        );
      case 'bookings':
        return <BookingManagement />;
      case 'analytics':
        return <AnalyticsDashboard vendorData={vendorData} />;
      case 'discounts':
        return <DiscountManager vendorData={vendorData} />;
      case 'media':
        return <MediaManager vendorData={vendorData} />;
      case 'profile':
        return <ProfileManagement vendorData={vendorData} onUpdate={fetchVendorData} />;
      default:
        return <DashboardOverview stats={dashboardStats} vendorData={vendorData} />;
    }
  };

  if (!vendorData) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading vendor dashboard...</p>
      </div>
    );
  }

  return (
      <ProtectedRoute 
      requiredRole="business-manager"
      redirectTo="/login"
    >
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <h2>{sidebarCollapsed ? 'VD' : 'Vendor Dashboard'}</h2>
          </div>
          <button 
            className={styles.collapseBtn}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            ☰
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeSection === item.id ? styles.active : ''}`}
              onClick={() => setActiveSection(item.id)}
              title={sidebarCollapsed ? item.label : ''}
            >
              <FontAwesomeIcon icon={item.icon} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h1>
            <p className={styles.businessName}>{vendorData.businessProfile?.businessName || 'Business Dashboard'}</p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.notifications}>
              <button className={styles.notificationBtn}>
                <FontAwesomeIcon icon={faBell} />
                {notifications.length > 0 && (
                  <span className={styles.notificationBadge}>{notifications.length}</span>
                )}
              </button>
            </div>

            <div className={styles.userProfile}>
              <img 
                src="https://placeholder.pics/svg/40x40/0D4C92/FFFFFF/U" 
                alt="Profile" 
                className={styles.profileImage}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placeholder.pics/svg/40x40/0D4C92/FFFFFF/U';
                }}
              />
              <div className={styles.userInfo}>
                <span className={styles.userName}>{vendorData.name}</span>
                <span className={`${styles.verificationStatus} ${
                  vendorData.businessProfile?.isApproved ? styles.approved : styles.pending
                }`}>
                  {vendorData.businessProfile?.isApproved ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className={styles.dashboardContent}>
          {renderActiveSection()}
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}