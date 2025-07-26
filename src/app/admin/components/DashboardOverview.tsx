"use client";

import React from 'react';
import { AdminDashboardStats } from '../types/admin.types';
import { 
  Users, DollarSign, MessageSquare, Activity, 
  TrendingUp, TrendingDown, RefreshCw 
} from 'lucide-react';
import styles from '../admin.module.css';

interface DashboardOverviewProps {
  stats: AdminDashboardStats | null;
  onRefresh: () => void;
}

export default function DashboardOverview({ stats, onRefresh }: DashboardOverviewProps) {
  if (!stats) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard statistics...</p>
      </div>
    );
  }

  const StatCard = ({ title, value, change, icon: Icon, colorClass }: {
    title: string;
    value: string | number;
    change?: number;
    icon: any;
    colorClass: string;
  }) => (
    <div className={styles.statCard}>
      <div className={styles.statCardContent}>
        <div className={styles.statCardInfo}>
          <h3>{title}</h3>
          <p>{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {change !== undefined && (
            <div className={`${styles.statCardChange} ${change >= 0 ? styles.textGreen : styles.textRed}`}>
              {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(change)}% from last month
            </div>
          )}
        </div>
        <div className={`${styles.statCardIconContainer} ${colorClass}`}>
          <Icon className={styles.statCardIcon} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button 
          onClick={onRefresh}
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>

      {/* Key Metrics */}
      <div className={`${styles.grid} ${styles.gridCols1} ${styles.gridMdCols2} ${styles.gridLgCols4}`}>
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          change={stats.growthRate} 
          icon={Users} 
          colorClass={styles.bgBlue}
        />
        <StatCard 
          title="Total Bookings" 
          value={stats.totalBookings} 
          change={5.2} 
          icon={MessageSquare} 
          colorClass={styles.bgGreen}
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          change={12.5} 
          icon={DollarSign} 
          colorClass={styles.bgYellow}
        />
        <StatCard 
          title="Active Vendors" 
          value={stats.platformMetrics.activeVendors} 
          change={2.1} 
          icon={Activity} 
          colorClass={styles.bgPurple}
        />
      </div>

      {/* Platform Metrics */}
      <div className={`${styles.grid} ${styles.gridCols1} ${styles.gridMdCols2} ${styles.gridLgCols4}`}>
        <StatCard 
          title="Pending Approvals" 
          value={stats.platformMetrics.pendingApprovals} 
          icon={Activity} 
          colorClass={stats.platformMetrics.pendingApprovals > 10 ? styles.bgRed : styles.bgGreen}
        />
        <StatCard 
          title="Total Listings" 
          value={stats.platformMetrics.totalListings} 
          change={8.3} 
          icon={Activity} 
          colorClass={styles.bgBlue}
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${stats.platformMetrics.conversionRate}%`} 
          change={1.2} 
          icon={TrendingUp} 
          colorClass={styles.bgGreen}
        />
        <StatCard 
          title="System Health" 
          value="99.9%" 
          change={0.1} 
          icon={Activity} 
          colorClass={styles.bgGreen}
        />
      </div>

      {/* Recent Activity */}
      <div className={`${styles.grid} ${styles.gridCols1} ${styles.gridLgCols2}`}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Recent Users</h3>
          </div>
          <div className="space-y-3">
            {stats.recentUsers?.slice(0, 5).map((user) => (
              <div key={user._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-medium">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{user.name}</span>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Recent Bookings</h3>
          </div>
          <div className="space-y-3">
            {stats.recentBookings?.slice(0, 5).map((booking) => (
              <div key={booking._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    booking.status === 'confirmed' ? 'bg-green-500' : 
                    booking.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <span className="font-medium text-gray-900">{booking.serviceName}</span>
                    <p className="text-sm text-gray-500">{booking.user?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${booking.paymentDetails?.totalAmount}</div>
                  <div className={`text-xs ${styles.badge} ${
                    booking.status === 'confirmed' ? styles.badgeSuccess :
                    booking.status === 'pending' ? styles.badgeWarning :
                    styles.badgeDanger
                  }`}>{booking.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}