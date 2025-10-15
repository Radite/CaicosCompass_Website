"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  DollarSign, TrendingUp, Download, RefreshCw, 
  Calendar, Filter, Award, Package
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
  
  // Icon mapping for categories
  const categoryIcons: any = {
    'Transportation': '🚗',
    'Stay': '🏨',
    'Dining': '🍽️',
    'Activity': '🎯'
  };

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
                {revenueData?.growthMetrics?.revenueGrowth?.toFixed(1) || 0}% from last period
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
              <p>${revenueData?.averageOrderValue?.toLocaleString() || '0'}</p>
              <div className={`${styles.statCardChange} ${styles.textGreen}`}>
                <TrendingUp size={16} />
                {revenueData?.growthMetrics?.aovGrowth?.toFixed(1) || 0}% from last period
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
              <p>{revenueData?.totalBookings || 0}</p>
              <div className={`${styles.statCardChange} ${styles.textGreen}`}>
                <TrendingUp size={16} />
                {revenueData?.growthMetrics?.bookingGrowth?.toFixed(1) || 0}% from last period
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
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="month" 
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: 500 }}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: 500 }}
            />
            <Tooltip 
              formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3B82F6" 
              strokeWidth={3}
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue by Category and Top Vendors */}
      <div className={`${styles.grid} ${styles.gridCols1} ${styles.gridLgCols2}`}>
        {/* Revenue by Category */}
        <div className={`${styles.card} ${styles.revenueCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.revenueCardHeaderContent}>
              <Package size={20} className={styles.revenueCardIcon} />
              <h3 className={styles.cardTitle}>Revenue by Category</h3>
            </div>
          </div>
          
          <div className={styles.categoryChartContainer}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={revenueData?.revenueByCategory || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  dataKey="revenue"
                  nameKey="category"
                  paddingAngle={3}
                >
                  {(revenueData?.revenueByCategory || []).map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.categoryLegendGrid}>
            {(revenueData?.revenueByCategory || []).map((category: any, index: number) => (
              <div key={index} className={styles.categoryLegendItem}>
                <div className={styles.categoryLegendHeader}>
                  <div className={styles.categoryLegendDot} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <div className={styles.categoryLegendInfo}>
                    <div className={styles.categoryLegendName}>
                      <span className={styles.categoryEmoji}>{categoryIcons[category.category] || '📦'}</span>
                      {category.category}
                    </div>
                    <div className={styles.categoryLegendBookings}>{category.bookings} bookings</div>
                  </div>
                </div>
                <div className={styles.categoryLegendStats}>
                  <div className={styles.categoryLegendRevenue}>${category.revenue?.toLocaleString()}</div>
                  <div className={styles.categoryLegendPercentage}>
                    {((category.revenue / revenueData.totalRevenue) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Vendors */}
        <div className={`${styles.card} ${styles.vendorsCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.vendorsCardHeaderContent}>
              <Award size={20} className={styles.vendorsCardIcon} />
              <h3 className={styles.cardTitle}>Top Vendors by Revenue</h3>
            </div>
          </div>
          
          <div className={styles.vendorsList}>
            {(revenueData?.topVendors || []).slice(0, 8).map((vendor: any, index: number) => (
              <div key={index} className={styles.vendorItem}>
                <div className={styles.vendorRank}>
                  <span className={styles.vendorRankNumber}>#{index + 1}</span>
                </div>
                <div className={styles.vendorInfo}>
                  <div className={styles.vendorName}>{vendor.vendorName}</div>
                  <div className={styles.vendorMeta}>
                    <span className={styles.vendorBookings}>
                      <Calendar size={12} />
                      {vendor.bookings} bookings
                    </span>
                    <span className={styles.vendorDivider}>•</span>
                    <span className={styles.vendorAvg}>
                      ${Math.round(vendor.revenue / vendor.bookings)} avg
                    </span>
                  </div>
                </div>
                <div className={styles.vendorRevenue}>
                  <div className={styles.vendorRevenueAmount}>${vendor.revenue.toLocaleString()}</div>
                  <div className={styles.vendorRevenueBar}>
                    <div 
                      className={styles.vendorRevenueBarFill}
                      style={{ 
                        width: `${(vendor.revenue / revenueData.topVendors[0].revenue) * 100}%`,
                        background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]} 0%, ${COLORS[(index + 1) % COLORS.length]} 100%)`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(revenueData?.topVendors || []).length === 0 && (
            <div className={styles.emptyState}>
              <Award size={48} className={styles.emptyStateIcon} />
              <p className={styles.emptyStateText}>No vendor data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
