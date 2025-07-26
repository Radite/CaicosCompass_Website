"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  DollarSign, TrendingUp, Download, RefreshCw, 
  Calendar, Filter
} from 'lucide-react';
import styles from '../admin.module.css';

interface RevenueAnalyticsProps {}

export default function RevenueAnalytics({}: RevenueAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [revenueData, setRevenueData] = useState<any>(null);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchRevenueData();
  }, [period]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/analytics/revenue?period=${period}`,
        { headers: getAuthHeaders() }
      );
      setRevenueData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading revenue analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
        <div className="flex gap-3">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
            <option value="365">Last Year</option>
          </select>
          <button 
            onClick={fetchRevenueData}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className={`${styles.btn} ${styles.btnSuccess}`}>
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className={`${styles.grid} ${styles.gridCols1} ${styles.gridMdCols3}`}>
        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>Total Revenue</h3>
              <p>${revenueData?.totalRevenue?.toLocaleString() || '0'}</p>
              <div className={`${styles.statCardChange} ${styles.textGreen}`}>
                <TrendingUp size={16} />
                12.5% from last period
              </div>
            </div>
            <div className={`${styles.statCardIconContainer} ${styles.bgGreen}`}>
              <DollarSign className={styles.statCardIcon} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>Average Order Value</h3>
              <p>${Math.round((revenueData?.totalRevenue || 0) / Math.max(1, revenueData?.monthlyRevenue?.reduce((sum: number, month: any) => sum + month.bookings, 0) || 1))}</p>
              <div className={`${styles.statCardChange} ${styles.textGreen}`}>
                <TrendingUp size={16} />
                8.2% from last period
              </div>
            </div>
            <div className={`${styles.statCardIconContainer} ${styles.bgBlue}`}>
              <DollarSign className={styles.statCardIcon} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>Total Bookings</h3>
              <p>{revenueData?.monthlyRevenue?.reduce((sum: number, month: any) => sum + month.bookings, 0) || 0}</p>
              <div className={`${styles.statCardChange} ${styles.textGreen}`}>
                <TrendingUp size={16} />
                15.3% from last period
              </div>
            </div>
            <div className={`${styles.statCardIconContainer} ${styles.bgYellow}`}>
              <Calendar className={styles.statCardIcon} />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Revenue Trend</h3>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={revenueData?.monthlyRevenue || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue by Category and Top Vendors */}
      <div className={`${styles.grid} ${styles.gridCols1} ${styles.gridLgCols2}`}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Revenue by Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueData?.revenueByCategory || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="revenue"
                nameKey="category"
              >
                {(revenueData?.revenueByCategory || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-4">
            {(revenueData?.revenueByCategory || []).map((category: any, index: number) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm text-gray-600">{category.category}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Top Vendors by Revenue</h3>
          </div>
          <div className="space-y-4">
            {(revenueData?.topVendors || []).slice(0, 8).map((vendor: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{vendor.vendorName}</div>
                  <div className="text-sm text-gray-500">{vendor.bookings} bookings</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    ${vendor.revenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    ${Math.round(vendor.revenue / vendor.bookings)} avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}