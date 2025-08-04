"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faList, faCalendarCheck, faDollarSign, faStar, faEye, 
  faArrowUp, faArrowDown, faPlus, faEdit
} from '@fortawesome/free-solid-svg-icons';
import styles from '../dashboard.module.css';

interface DashboardOverviewProps {
  stats: any;
  vendorData: any;
}

interface QuickStat {
  label: string;
  value: string | number;
  icon: any;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
  color: string;
}

export default function DashboardOverview({ stats, vendorData }: DashboardOverviewProps) {
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchRecentActivity();
  }, []);

const fetchRecentActivity = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/recent-activity`,
      { headers: getAuthHeaders() }
    );
    setRecentActivity(response.data);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    setLoading(false);
  }
};

  const quickStats: QuickStat[] = [
    {
      label: 'Total Listings',
      value: vendorData?.businessProfile?.metrics?.totalListings || stats?.totalListings || 0,
      icon: faList,
      trend: { direction: 'up', percentage: 12 },
      color: '#0D4C92'
    },
    {
      label: 'Total Bookings',
      value: vendorData?.businessProfile?.metrics?.totalBookings || stats?.activeBookings || 0,
      icon: faCalendarCheck,
      trend: { direction: 'up', percentage: 8 },
      color: '#28a745'
    },
    {
      label: 'Total Revenue',
      value: `${(vendorData?.businessProfile?.metrics?.totalRevenue || stats?.monthlyRevenue || 0).toLocaleString()}`,
      icon: faDollarSign,
      trend: { direction: 'up', percentage: 15 },
      color: '#D4AF37'
    },
    {
      label: 'Average Rating',
      value: (vendorData?.businessProfile?.metrics?.averageRating || stats?.averageRating || 0).toFixed(1),
      icon: faStar,
      trend: { direction: 'up', percentage: 5 },
      color: '#ff6b6b'
    }
  ];

  return (
    <div className={styles.dashboardOverview}>
      {/* Quick Stats Cards */}
      <div className={styles.statsGrid}>
        {quickStats.map((stat, index) => (
          <div key={index} className={styles.statCard} style={{ borderLeft: `4px solid ${stat.color}` }}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon} style={{ backgroundColor: `${stat.color}20` }}>
                <FontAwesomeIcon icon={stat.icon} style={{ color: stat.color }} />
              </div>
              {stat.trend && (
                <div className={`${styles.trend} ${stat.trend.direction === 'up' ? styles.trendUp : styles.trendDown}`}>
                  <FontAwesomeIcon icon={stat.trend.direction === 'up' ? faArrowUp : faArrowDown} />
                  <span>{stat.trend.percentage}%</span>
                </div>
              )}
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>{stat.value}</h3>
              <p className={styles.statLabel}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h3>Quick Actions</h3>
        <div className={styles.actionButtons}>
          <button className={styles.actionBtn} style={{ backgroundColor: '#0D4C92' }}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Create New Listing</span>
          </button>
          <button className={styles.actionBtn} style={{ backgroundColor: '#28a745' }}>
            <FontAwesomeIcon icon={faEye} />
            <span>View All Bookings</span>
          </button>
          <button className={styles.actionBtn} style={{ backgroundColor: '#D4AF37' }}>
            <FontAwesomeIcon icon={faEdit} />
            <span>Update Pricing</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.recentActivity}>
        <h3>Recent Activity</h3>
        <div className={styles.activityList}>
          {loading ? (
            <div className={styles.activitySkeleton}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className={styles.skeletonItem}></div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity: any, index) => (
              <div key={index} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <FontAwesomeIcon icon={getActivityIcon(activity.type)} />
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>{activity.description}</p>
                  <span className={styles.activityTime}>{formatTimeAgo(activity.createdAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Overview */}
      <div className={styles.performanceOverview}>
        <h3>Performance Overview</h3>
        <div className={styles.performanceCharts}>
          {/* This would include chart components */}
          <div className={styles.chartPlaceholder}>
            <p>Revenue Chart</p>
            <div className={styles.mockChart}>
              {/* Mock chart bars */}
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i} 
                  className={styles.chartBar} 
                  style={{ height: `${Math.random() * 100}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Listings */}
      <div className={styles.topListings}>
        <h3>Top Performing Listings</h3>
        <div className={styles.listingsList}>
          {stats?.topPerformingListings?.map((listing: any, index: number) => (
            <div key={index} className={styles.listingItem}>
              <img 
                src={listing.images?.[0] || '/placeholder.jpg'} 
                alt={listing.name}
                className={styles.listingImage}
              />
              <div className={styles.listingInfo}>
                <h4>{listing.name}</h4>
                <p>{listing.category}</p>
                <span className={styles.listingRevenue}>${listing.revenue}</span>
              </div>
            </div>
          )) || (
            <div className={styles.emptyState}>
              <p>No performance data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getActivityIcon(type: string) {
  switch(type) {
    case 'booking': return faCalendarCheck;
    case 'review': return faStar;
    case 'listing': return faList;
    default: return faEye;
  }
}

function formatTimeAgo(date: string) {
  const now = new Date();
  const activityDate = new Date(date);
  const diffInMs = now.getTime() - activityDate.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
  return `${Math.floor(diffInHours / 24)} days ago`;
}