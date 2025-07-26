"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Filter, Calendar, Download, 
  RefreshCw, Eye, AlertTriangle
} from 'lucide-react';
import styles from '../admin.module.css';

interface AuditLogsProps {}

export default function AuditLogs({}: AuditLogsProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter, dateRange]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (actionFilter !== 'all') params.append('action', actionFilter);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const response = await axios.get(
        `${API_BASE_URL}/api/admin/audit-logs?${params}`,
        { headers: getAuthHeaders() }
      );
      
      setLogs(response.data.logs || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockLogs = [
    {
      _id: '1',
      userName: 'John Admin',
      action: 'user_create',
      resource: 'user_management',
      details: { targetUser: 'jane@example.com' },
      ipAddress: '192.168.1.100',
      timestamp: '2024-07-25T14:30:00Z'
    },
    {
      _id: '2',
      userName: 'Admin System',
      action: 'settings_update',
      resource: 'system_config',
      details: { setting: 'backup_schedule' },
      ipAddress: '127.0.0.1',
      timestamp: '2024-07-25T14:15:00Z'
    },
    {
      _id: '3',
      userName: 'Jane Manager',
      action: 'login',
      resource: 'authentication',
      details: { success: true },
      ipAddress: '10.0.0.50',
      timestamp: '2024-07-25T14:00:00Z'
    }
  ];

  const displayLogs = logs.length > 0 ? logs : mockLogs;

  const filteredLogs = displayLogs.filter(log => {
    const matchesSearch = log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getActionIcon = (action: string) => {
    if (action.includes('delete') || action.includes('remove')) {
      return <AlertTriangle size={16} className="text-red-500" />;
    }
    if (action.includes('create') || action.includes('add')) {
      return <div className="w-4 h-4 bg-green-500 rounded-full"></div>;
    }
    if (action.includes('update') || action.includes('edit')) {
      return <div className="w-4 h-4 bg-blue-500 rounded-full"></div>;
    }
    return <div className="w-4 h-4 bg-gray-500 rounded-full"></div>;
  };

  const getActionBadgeClass = (action: string) => {
    if (action.includes('delete') || action.includes('remove')) {
      return `${styles.badge} ${styles.badgeDanger}`;
    }
    if (action.includes('create') || action.includes('add')) {
      return `${styles.badge} ${styles.badgeSuccess}`;
    }
    if (action.includes('update') || action.includes('edit')) {
      return `${styles.badge} ${styles.badgeInfo}`;
    }
    return `${styles.badge}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <div className="flex gap-3">
          <button 
            onClick={fetchAuditLogs}
            className={`${styles.btn} ${styles.btnSecondary}`}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button className={`${styles.btn} ${styles.btnSuccess}`}>
            <Download size={16} />
            Export Logs
          </button>
        </div>
      </div>

      <div className={styles.card}>
        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search logs..." 
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              value={actionFilter} 
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="user_create">User Created</option>
              <option value="user_update">User Updated</option>
              <option value="user_delete">User Deleted</option>
              <option value="settings_update">Settings Updated</option>
              <option value="booking_update">Booking Updated</option>
            </select>
            
            <input 
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Start date"
            />
            
            <input 
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="End date"
            />
          </div>
        </div>
        
        {/* Audit Logs Table */}
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>Timestamp</th>
                <th className={styles.tableHeaderCell}>User</th>
                <th className={styles.tableHeaderCell}>Action</th>
                <th className={styles.tableHeaderCell}>Resource</th>
                <th className={styles.tableHeaderCell}>IP Address</th>
                <th className={styles.tableHeaderCell}>Details</th>
                <th className={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log._id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <div className="font-medium text-gray-900">{log.userName}</div>
                  </td>
                  <td className={styles.tableCell}>
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className={getActionBadgeClass(log.action)}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className="text-gray-900">{log.resource.replace('_', ' ')}</span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className="font-mono text-sm text-gray-600">{log.ipAddress}</span>
                  </td>
                  <td className={styles.tableCell}>
                    <div className="text-sm text-gray-600">
                      {log.details && typeof log.details === 'object' ? (
                        <div>
                          {Object.entries(log.details).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {String(value)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        JSON.stringify(log.details)
                      )}
                    </div>
                  </td>
<td className={styles.tableCell}>
  <div className="flex gap-2">
    <button className={`${styles.auditActionButton} ${styles.auditViewButton}`}>
      <Eye className={styles.userActionButtonIcon} />
    </button>
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {filteredLogs.length} of {displayLogs.length} log entries
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={`${styles.grid} ${styles.gridCols1} ${styles.gridMdCols4}`}>
        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>Today's Actions</h3>
              <p>{filteredLogs.filter(log => 
                new Date(log.timestamp).toDateString() === new Date().toDateString()
              ).length}</p>
            </div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>Failed Logins</h3>
              <p>{filteredLogs.filter(log => 
                log.action === 'login' && log.details?.success === false
              ).length}</p>
            </div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>User Changes</h3>
              <p>{filteredLogs.filter(log => 
                log.action.includes('user_')
              ).length}</p>
            </div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>System Changes</h3>
              <p>{filteredLogs.filter(log => 
                log.action.includes('settings_') || log.action.includes('system_')
              ).length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}