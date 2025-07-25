"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faChartBar, faChartPie, faDollarSign,
  faCalendarAlt, faUsers, faArrowUp, faArrowDown,
  faDownload, faRefresh
} from '@fortawesome/free-solid-svg-icons';
import styles from '../dashboard.module.css';

interface AnalyticsDashboardProps {
  vendorData: any;
}

interface RevenueData {
  totalRevenue: number;
  averageBookingValue: number;
  revenueGrowth: number;
  totalBookings: number;
  dailyRevenue: { [key: string]: number };
  period: number;
}

interface BookingData {
  totalBookings: number;
  confirmedBookings: number;
  conversionRate: number;
  statusBreakdown: { [key: string]: number };
  categoryBreakdown: { [key: string]: number };
  dailyBookings: { [key: string]: number };
  period: number;
}

interface PerformanceData {
  overview: {
    totalRevenue: number;
    totalBookings: number;
    averageRating: number;
    totalListings: number;
    activeListings: number;
  };
  topPerformers: {
    byRevenue: any[];
    byBookings: any[];
    byRating: any[];
  };
  allListings: any[];
}

export default function AnalyticsDashboard({ vendorData }: AnalyticsDashboardProps) {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [activeChart, setActiveChart] = useState('revenue');

  const periodOptions = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 3 Months' },
    { value: '365', label: 'Last Year' }
  ];

  const chartTypes = [
    { id: 'revenue', label: 'Revenue', icon: faDollarSign },
    { id: 'bookings', label: 'Bookings', icon: faCalendarAlt },
    { id: 'performance', label: 'Performance', icon: faChartBar }
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [revenueResponse, bookingResponse, performanceResponse] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/analytics/revenue?period=${selectedPeriod}`,
          { headers: getAuthHeaders() }
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/analytics/bookings?period=${selectedPeriod}`,
          { headers: getAuthHeaders() }
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/analytics/performance`,
          { headers: getAuthHeaders() }
        )
      ]);

      setRevenueData(revenueResponse.data);
      setBookingData(bookingResponse.data);
      setPerformanceData(performanceResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  const exportAnalytics = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/vendor/analytics/export?period=${selectedPeriod}`,
        { 
          headers: getAuthHeaders(),
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting analytics:', error);
      alert('Error exporting analytics report. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const renderRevenueChart = () => {
    if (!revenueData) return null;

    const dailyData = Object.entries(revenueData.dailyRevenue).map(([date, revenue]) => ({
      date,
      revenue
    }));

    return (
      <div className={styles.chartContainer}>
        <h4>Revenue Trend</h4>
        <div className={styles.chartWrapper}>
          <div className={styles.mockLineChart}>
            {dailyData.map((data, index) => (
              <div
                key={index}
                className={styles.chartPoint}
                style={{
                  left: `${(index / (dailyData.length - 1)) * 100}%`,
                  bottom: `${(data.revenue / Math.max(...dailyData.map(d => d.revenue))) * 80 + 10}%`
                }}
                title={`${data.date}: ${formatCurrency(data.revenue)}`}
              />
            ))}
            <div className={styles.chartLine} />
          </div>
        </div>
        
        <div className={styles.chartStats}>
          <div className={styles.chartStat}>
            <span className={styles.statLabel}>Total Revenue</span>
            <span className={styles.statValue}>{formatCurrency(revenueData.totalRevenue)}</span>
          </div>
          <div className={styles.chartStat}>
            <span className={styles.statLabel}>Average Booking</span>
            <span className={styles.statValue}>{formatCurrency(revenueData.averageBookingValue)}</span>
          </div>
          <div className={styles.chartStat}>
            <span className={styles.statLabel}>Growth</span>
            <span className={`${styles.statValue} ${revenueData.revenueGrowth >= 0 ? styles.positive : styles.negative}`}>
              <FontAwesomeIcon icon={revenueData.revenueGrowth >= 0 ? faTrendUp : faTrendDown} />
              {formatPercentage(revenueData.revenueGrowth)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderBookingsChart = () => {
    if (!bookingData) return null;

    return (
      <div className={styles.chartContainer}>
        <h4>Booking Analytics</h4>
        
        <div className={styles.chartGrid}>
          {/* Status Breakdown */}
          <div className={styles.pieChartContainer}>
            <h5>Bookings by Status</h5>
            <div className={styles.pieChart}>
              {Object.entries(bookingData.statusBreakdown).map(([status, count], index) => {
                const colors = ['#28a745', '#ffc107', '#dc3545', '#0D4C92'];
                return (
                  <div key={status} className={styles.pieSegment}>
                    <div 
                      className={styles.pieLabel}
                      style={{ color: colors[index % colors.length] }}
                    >
                      <span className={styles.pieDot} style={{ backgroundColor: colors[index % colors.length] }} />
                      {status}: {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className={styles.pieChartContainer}>
            <h5>Bookings by Category</h5>
            <div className={styles.pieChart}>
              {Object.entries(bookingData.categoryBreakdown).map(([category, count], index) => {
                const colors = ['#0D4C92', '#28a745', '#ffc107', '#dc3545'];
                return (
                  <div key={category} className={styles.pieSegment}>
                    <div 
                      className={styles.pieLabel}
                      style={{ color: colors[index % colors.length] }}
                    >
                      <span className={styles.pieDot} style={{ backgroundColor: colors[index % colors.length] }} />
                      {category}: {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.chartStats}>
          <div className={styles.chartStat}>
            <span className={styles.statLabel}>Total Bookings</span>
            <span className={styles.statValue}>{bookingData.totalBookings}</span>
          </div>
          <div className={styles.chartStat}>
            <span className={styles.statLabel}>Confirmed</span>
            <span className={styles.statValue}>{bookingData.confirmedBookings}</span>
          </div>
          <div className={styles.chartStat}>
            <span className={styles.statLabel}>Conversion Rate</span>
            <span className={styles.statValue}>{bookingData.conversionRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceChart = () => {
    if (!performanceData) return null;

    return (
      <div className={styles.chartContainer}>
        <h4>Listing Performance</h4>
        
        <div className={styles.performanceGrid}>
          {/* Top Performers by Revenue */}
          <div className={styles.topPerformersSection}>
            <h5>Top Revenue Generators</h5>
            <div className={styles.performersList}>
              {performanceData.topPerformers.byRevenue.slice(0, 5).map((listing, index) => (
                <div key={listing.listingId} className={styles.performerItem}>
                  <div className={styles.performerRank}>#{index + 1}</div>
                  <div className={styles.performerInfo}>
                    <h6>{listing.name}</h6>
                    <span className={styles.performerCategory}>{listing.category}</span>
                  </div>
                  <div className={styles.performerValue}>
                    {formatCurrency(listing.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers by Bookings */}
          <div className={styles.topPerformersSection}>
            <h5>Most Booked</h5>
            <div className={styles.performersList}>
              {performanceData.topPerformers.byBookings.slice(0, 5).map((listing, index) => (
                <div key={listing.listingId} className={styles.performerItem}>
                  <div className={styles.performerRank}>#{index + 1}</div>
                  <div className={styles.performerInfo}>
                    <h6>{listing.name}</h6>
                    <span className={styles.performerCategory}>{listing.category}</span>
                  </div>
                  <div className={styles.performerValue}>
                    {listing.totalBookings} bookings
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers by Rating */}
          <div className={styles.topPerformersSection}>
            <h5>Highest Rated</h5>
            <div className={styles.performersList}>
              {performanceData.topPerformers.byRating.slice(0, 5).map((listing, index) => (
                <div key={listing.listingId} className={styles.performerItem}>
                  <div className={styles.performerRank}>#{index + 1}</div>
                  <div className={styles.performerInfo}>
                    <h6>{listing.name}</h6>
                    <span className={styles.performerCategory}>{listing.category}</span>
                  </div>
                  <div className={styles.performerValue}>
                    {listing.averageRating.toFixed(1)} ★
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.chartStats}>
          <div className={styles.chartStat}>
            <span className={styles.statLabel}>Total Listings</span>
            <span className={styles.statValue}>{performanceData.overview.totalListings}</span>
          </div>
          <div className={styles.chartStat}>
            <span className={styles.statLabel}>Active Listings</span>
            <span className={styles.statValue}>{performanceData.overview.activeListings}</span>
          </div>
          <div className={styles.chartStat}>
            <span className={styles.statLabel}>Average Rating</span>
            <span className={styles.statValue}>{performanceData.overview.averageRating.toFixed(1)} ★</span>
          </div>
        </div>
      </div>
    );
  };

  const renderActiveChart = () => {
    switch (activeChart) {
      case 'revenue':
        return renderRevenueChart();
      case 'bookings':
        return renderBookingsChart();
      case 'performance':
        return renderPerformanceChart();
      default:
        return renderRevenueChart();
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className={styles.analyticsDashboard}>
      {/* Header */}
      <div className={styles.analyticsHeader}>
        <div className={styles.headerInfo}>
          <h2>Analytics Dashboard</h2>
          <p>Insights and performance metrics for your business</p>
        </div>

        <div className={styles.headerActions}>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={styles.periodSelect}
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button onClick={fetchAnalyticsData} className={styles.refreshBtn}>
            <FontAwesomeIcon icon={faRefresh} />
            Refresh
          </button>

          <button onClick={exportAnalytics} className={styles.exportBtn}>
            <FontAwesomeIcon icon={faDownload} />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className={styles.keyMetrics}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: '#28a74520', color: '#28a745' }}>
            <FontAwesomeIcon icon={faDollarSign} />
          </div>
          <div className={styles.metricContent}>
            <h3>{formatCurrency(revenueData?.totalRevenue || 0)}</h3>
            <p>Total Revenue</p>
            {revenueData && (
              <span className={`${styles.metricChange} ${revenueData.revenueGrowth >= 0 ? styles.positive : styles.negative}`}>
                <FontAwesomeIcon icon={revenueData.revenueGrowth >= 0 ? faTrendUp : faTrendDown} />
                {formatPercentage(revenueData.revenueGrowth)}
              </span>
            )}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: '#0D4C9220', color: '#0D4C92' }}>
            <FontAwesomeIcon icon={faCalendarAlt} />
          </div>
          <div className={styles.metricContent}>
            <h3>{bookingData?.totalBookings || 0}</h3>
            <p>Total Bookings</p>
            <span className={styles.metricSubtext}>
              {bookingData?.confirmedBookings || 0} confirmed
            </span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: '#ffc10720', color: '#ffc107' }}>
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className={styles.metricContent}>
            <h3>{bookingData?.conversionRate.toFixed(1) || 0}%</h3>
            <p>Conversion Rate</p>
            <span className={styles.metricSubtext}>
              Booking to confirmation
            </span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ backgroundColor: '#dc354520', color: '#dc3545' }}>
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className={styles.metricContent}>
            <h3>{performanceData?.overview.averageRating.toFixed(1) || 0} ★</h3>
            <p>Average Rating</p>
            <span className={styles.metricSubtext}>
              Across all listings
            </span>
          </div>
        </div>
      </div>

      {/* Chart Navigation */}
      <div className={styles.chartNavigation}>
        {chartTypes.map(chart => (
          <button
            key={chart.id}
            className={`${styles.chartNavBtn} ${activeChart === chart.id ? styles.active : ''}`}
            onClick={() => setActiveChart(chart.id)}
          >
            <FontAwesomeIcon icon={chart.icon} />
            <span>{chart.label}</span>
          </button>
        ))}
      </div>

      {/* Chart Content */}
      <div className={styles.chartContent}>
        {renderActiveChart()}
      </div>
    </div>
  );
}