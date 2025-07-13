// src/app/admin/page.tsx - Complete Admin Dashboard
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCalendarCheck,
  faDollarSign,
  faChartLine,
  faEye,
  faEdit,
  faTrash,
  faPlus,
  faSearch,
  faFilter,
  faDownload,
  faBell,
  faCog,
  faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";
import styles from "./admin.module.css";

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  growthRate: number;
  recentBookings: Booking[];
  recentUsers: User[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  loyaltyPoints: number;
  isActive: boolean;
}

interface Booking {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  serviceName: string;
  category: string;
  status: string;
  paymentDetails: {
    totalAmount: number;
    amountPaid: number;
  };
  date: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    checkAuth();
    if (activeTab === "dashboard") {
      fetchDashboardStats();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "bookings") {
      fetchBookings();
    }
  }, [activeTab]);

  const checkAuth = () => {
    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");
    
    if (!token || userRole !== "admin") {
      window.location.href = "/login";
      return;
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/dashboard`,
        { headers: getAuthHeaders() }
      );
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/users`,
        { headers: getAuthHeaders() }
      );
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/bookings`,
        { headers: getAuthHeaders() }
      );
      setBookings(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    }
  };

  const handleUserStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}/status`,
        { isActive: !currentStatus },
        { headers: getAuthHeaders() }
      );
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status");
    }
  };

  const handleBookingStatusUpdate = async (bookingId: string, status: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/bookings/${bookingId}/status`,
        { status },
        { headers: getAuthHeaders() }
      );
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to update booking status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return styles.statusConfirmed;
      case 'pending':
        return styles.statusPending;
      case 'canceled':
        return styles.statusCanceled;
      default:
        return styles.statusDefault;
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || booking.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <h2>Loading Admin Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>TurksExplorer</h2>
          <p className={styles.sidebarSubtitle}>Admin Panel</p>
        </div>

        <nav className={styles.sidebarNav}>
          <button
            className={`${styles.navItem} ${activeTab === "dashboard" ? styles.active : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <FontAwesomeIcon icon={faChartLine} className={styles.navIcon} />
            Dashboard
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "users" ? styles.active : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <FontAwesomeIcon icon={faUsers} className={styles.navIcon} />
            Users
          </button>
          <button
            className={`${styles.navItem} ${activeTab === "bookings" ? styles.active : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            <FontAwesomeIcon icon={faCalendarCheck} className={styles.navIcon} />
            Bookings
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className={styles.navIcon} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>
            {activeTab === "dashboard" && "Dashboard Overview"}
            {activeTab === "users" && "User Management"}
            {activeTab === "bookings" && "Booking Management"}
          </h1>
          <div className={styles.headerActions}>
            <button className={styles.notificationBtn}>
              <FontAwesomeIcon icon={faBell} />
            </button>
            <button className={styles.settingsBtn}>
              <FontAwesomeIcon icon={faCog} />
            </button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && stats && (
          <div className={styles.dashboardContent}>
            {/* Stats Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statsCard}>
                <div className={styles.statsIcon}>
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <div className={styles.statsContent}>
                  <h3 className={styles.statsNumber}>{stats.totalUsers}</h3>
                  <p className={styles.statsLabel}>Total Users</p>
                </div>
              </div>

              <div className={styles.statsCard}>
                <div className={styles.statsIcon}>
                  <FontAwesomeIcon icon={faCalendarCheck} />
                </div>
                <div className={styles.statsContent}>
                  <h3 className={styles.statsNumber}>{stats.totalBookings}</h3>
                  <p className={styles.statsLabel}>Total Bookings</p>
                </div>
              </div>

              <div className={styles.statsCard}>
                <div className={styles.statsIcon}>
                  <FontAwesomeIcon icon={faDollarSign} />
                </div>
                <div className={styles.statsContent}>
                  <h3 className={styles.statsNumber}>{formatCurrency(stats.totalRevenue)}</h3>
                  <p className={styles.statsLabel}>Total Revenue</p>
                </div>
              </div>

              <div className={styles.statsCard}>
                <div className={styles.statsIcon}>
                  <FontAwesomeIcon icon={faChartLine} />
                </div>
                <div className={styles.statsContent}>
                  <h3 className={styles.statsNumber}>+{stats.growthRate}%</h3>
                  <p className={styles.statsLabel}>Growth Rate</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={styles.recentActivity}>
              <div className="row">
                <div className="col-lg-6">
                  <div className={styles.activityCard}>
                    <h3 className={styles.cardTitle}>Recent Bookings</h3>
                    <div className={styles.activityList}>
                      {stats.recentBookings.map((booking) => (
                        <div key={booking._id} className={styles.activityItem}>
                          <div className={styles.activityInfo}>
                            <h4>{booking.serviceName}</h4>
                            <p>{booking.user.name}</p>
                            <span className={styles.activityDate}>
                              {formatDate(booking.createdAt)}
                            </span>
                          </div>
                          <div className={`${styles.activityStatus} ${getStatusBadgeClass(booking.status)}`}>
                            {booking.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className={styles.activityCard}>
                    <h3 className={styles.cardTitle}>Recent Users</h3>
                    <div className={styles.activityList}>
                      {stats.recentUsers.map((user) => (
                        <div key={user._id} className={styles.activityItem}>
                          <div className={styles.activityInfo}>
                            <h4>{user.name}</h4>
                            <p>{user.email}</p>
                            <span className={styles.activityDate}>
                              {formatDate(user.createdAt)}
                            </span>
                          </div>
                          <div className={`${styles.activityStatus} ${user.isActive ? styles.statusConfirmed : styles.statusCanceled}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <div className={styles.searchBar}>
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <div className={styles.tableActions}>
                <button className={styles.exportBtn}>
                  <FontAwesomeIcon icon={faDownload} />
                  Export
                </button>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Loyalty Points</th>
                    <th>Join Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={styles.roleBadge}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.loyaltyPoints || 0}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <button
                          className={`${styles.statusToggle} ${user.isActive ? styles.active : styles.inactive}`}
                          onClick={() => handleUserStatusToggle(user._id, user.isActive)}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button className={styles.actionBtn} title="View">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className={styles.actionBtn} title="Edit">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete">
                            <FontAwesomeIcon icon={faTrash} />
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

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <div className={styles.searchBar}>
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
              <div className={styles.tableActions}>
                <button className={styles.exportBtn}>
                  <FontAwesomeIcon icon={faDownload} />
                  Export
                </button>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Customer</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.serviceName}</td>
                      <td>
                        <div>
                          <div>{booking.user.name}</div>
                          <small className={styles.userEmail}>{booking.user.email}</small>
                        </div>
                      </td>
                      <td>
                        <span className={styles.categoryBadge}>
                          {booking.category}
                        </span>
                      </td>
                      <td>{formatDate(booking.date || booking.createdAt)}</td>
                      <td>{formatCurrency(booking.paymentDetails.totalAmount)}</td>
                      <td>
                        <select
                          value={booking.status}
                          onChange={(e) => handleBookingStatusUpdate(booking._id, e.target.value)}
                          className={`${styles.statusSelect} ${getStatusBadgeClass(booking.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="canceled">Canceled</option>
                        </select>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button className={styles.actionBtn} title="View">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className={styles.actionBtn} title="Edit">
                            <FontAwesomeIcon icon={faEdit} />
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
    </div>
  );
}