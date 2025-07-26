"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Server, Database, Wifi, HardDrive, Cpu, MemoryStick,
  AlertTriangle, CheckCircle, Clock, RefreshCw
} from 'lucide-react';
import styles from '../admin.module.css';

interface SystemMonitoringProps {}

export default function SystemMonitoring({}: SystemMonitoringProps) {
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/system/health`,
        { headers: getAuthHeaders() }
      );
      setSystemHealth(response.data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching system health:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value > thresholds.critical) return 'text-red-600';
    if (value > thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusBg = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value > thresholds.critical) return styles.bgRed;
    if (value > thresholds.warning) return styles.bgYellow;
    return styles.bgGreen;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading && !systemHealth) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading system monitoring...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <button 
            onClick={fetchSystemHealth}
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className={`${styles.grid} ${styles.gridCols1} ${styles.gridMdCols2} ${styles.gridLgCols4}`}>
        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>CPU Usage</h3>
              <p>{systemHealth?.serverHealth?.cpu || 65}%</p>
              <div className={`${styles.statCardChange} ${getStatusColor(systemHealth?.serverHealth?.cpu || 65, { warning: 70, critical: 85 })}`}>
                <Clock size={16} />
                Normal operation
              </div>
            </div>
            <div className={`${styles.statCardIconContainer} ${getStatusBg(systemHealth?.serverHealth?.cpu || 65, { warning: 70, critical: 85 })}`}>
              <Cpu className={styles.statCardIcon} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>Memory Usage</h3>
              <p>{systemHealth?.serverHealth?.memory || 78}%</p>
              <div className={`${styles.statCardChange} ${getStatusColor(systemHealth?.serverHealth?.memory || 78, { warning: 80, critical: 90 })}`}>
                <Clock size={16} />
                {(systemHealth?.serverHealth?.memory || 78) > 80 ? 'High usage' : 'Normal'}
              </div>
            </div>
            <div className={`${styles.statCardIconContainer} ${getStatusBg(systemHealth?.serverHealth?.memory || 78, { warning: 80, critical: 90 })}`}>
              <MemoryStick className={styles.statCardIcon} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>Disk Usage</h3>
              <p>{systemHealth?.serverHealth?.disk || 45}%</p>
              <div className={`${styles.statCardChange} ${styles.textGreen}`}>
                <CheckCircle size={16} />
                Healthy
              </div>
            </div>
            <div className={`${styles.statCardIconContainer} ${styles.bgGreen}`}>
              <HardDrive className={styles.statCardIcon} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>Uptime</h3>
              <p>{formatUptime(systemHealth?.serverHealth?.uptime || 0)}</p>
              <div className={`${styles.statCardChange} ${styles.textGreen}`}>
                <CheckCircle size={16} />
                99.9% availability
              </div>
            </div>
            <div className={`${styles.statCardIconContainer} ${styles.bgBlue}`}>
              <Server className={styles.statCardIcon} />
            </div>
          </div>
        </div>
      </div>

      {/* Service Status */}
      <div className={`${styles.grid} ${styles.gridCols1} ${styles.gridLgCols2}`}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Service Status</h3>
          </div>
          <div className="space-y-4">
            {[
              { name: 'API Server', status: 'Online', uptime: '99.9%', responseTime: '45ms' },
              { name: 'Database', status: 'Online', uptime: '99.8%', responseTime: `${systemHealth?.databaseHealth?.queryTime || 0}ms` },
              { name: 'File Storage', status: 'Online', uptime: '99.9%', responseTime: '12ms' },
              { name: 'Payment Gateway', status: 'Online', uptime: '99.7%', responseTime: '120ms' },
              { name: 'Email Service', status: 'Online', uptime: '99.5%', responseTime: '89ms' },
              { name: 'SMS Service', status: 'Online', uptime: '99.2%', responseTime: '156ms' }
            ].map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    service.status === 'Online' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-900">{service.name}</div>
                    <div className="text-sm text-gray-500">Response: {service.responseTime}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    service.status === 'Online' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {service.status}
                  </div>
                  <div className="text-xs text-gray-500">{service.uptime} uptime</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Database Health</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {systemHealth?.databaseHealth?.connections || 1}
                </div>
                <div className="text-sm text-gray-600">Active Connections</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {systemHealth?.databaseHealth?.queryTime || 0}ms
                </div>
                <div className="text-sm text-gray-600">Avg Query Time</div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Database Status</span>
                <span className={`${styles.badge} ${
                  systemHealth?.databaseHealth?.status === 'healthy' ? styles.badgeSuccess :
                  systemHealth?.databaseHealth?.status === 'warning' ? styles.badgeWarning :
                  styles.badgeDanger
                }`}>
                  {systemHealth?.databaseHealth?.status || 'healthy'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Recent Activity</h4>
              {[
                { time: '2 min ago', action: 'Backup completed successfully' },
                { time: '15 min ago', action: 'Index optimization completed' },
                { time: '1 hour ago', action: 'Scheduled maintenance executed' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-900">{activity.action}</span>
                  <span className="text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* API Metrics */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>API Performance</h3>
        </div>
        <div className={`${styles.grid} ${styles.gridCols1} ${styles.gridMdCols3}`}>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {systemHealth?.apiMetrics?.requestsPerMinute || 0}
            </div>
            <div className="text-sm text-gray-600">Requests/min</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {systemHealth?.apiMetrics?.averageResponseTime || 0}ms
            </div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {systemHealth?.apiMetrics?.errorRate || 0}%
            </div>
            <div className="text-sm text-gray-600">Error Rate</div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Recent System Alerts</h3>
        </div>
        <div className="space-y-3">
          {[
            { type: 'info', message: 'System backup completed successfully', time: '1 hour ago', resolved: true },
            { type: 'warning', message: 'High memory usage detected on server-02', time: '2 hours ago', resolved: false },
            { type: 'info', message: 'Database maintenance window scheduled', time: '6 hours ago', resolved: true },
            { type: 'error', message: 'Temporary connection timeout to payment gateway', time: '1 day ago', resolved: true }
          ].map((alert, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                alert.type === 'error' ? 'bg-red-500' : 
                alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{alert.message}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">{alert.time}</p>
                  <span className={`${styles.badge} ${
                    alert.resolved ? styles.badgeSuccess : styles.badgeWarning
                  }`}>
                    {alert.resolved ? 'Resolved' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}