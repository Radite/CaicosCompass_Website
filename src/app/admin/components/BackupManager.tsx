"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Download, Upload, RefreshCw, Database, 
  Clock, CheckCircle, AlertTriangle, Trash2,
  Server, HardDrive, Calendar
} from 'lucide-react';
import styles from '../admin.module.css';

interface BackupManagerProps {}

export default function BackupManager({}: BackupManagerProps) {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/system/backups`,
        { headers: getAuthHeaders() }
      );
      setBackups(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching backups:', error);
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setBackupInProgress(true);
      await axios.post(
        `${API_BASE_URL}/api/admin/system/backup`,
        {},
        { headers: getAuthHeaders() }
      );
      await fetchBackups();
      setBackupInProgress(false);
    } catch (error) {
      console.error('Error creating backup:', error);
      setBackupInProgress(false);
    }
  };

  // Mock data for demonstration
  const mockBackups = [
    {
      id: '1',
      name: 'Full System Backup',
      type: 'full',
      size: '2.4 GB',
      createdAt: '2024-07-25T02:00:00Z',
      status: 'completed',
      duration: '45 minutes'
    },
    {
      id: '2',
      name: 'Database Backup',
      type: 'database',
      size: '850 MB',
      createdAt: '2024-07-24T02:00:00Z',
      status: 'completed',
      duration: '12 minutes'
    },
    {
      id: '3',
      name: 'User Files Backup',
      type: 'files',
      size: '1.2 GB',
      createdAt: '2024-07-23T02:00:00Z',
      status: 'completed',
      duration: '23 minutes'
    }
  ];

  const displayBackups = backups.length > 0 ? backups : mockBackups;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Backup & Maintenance</h1>
        <div className="flex gap-3">
          <button 
            onClick={fetchBackups}
            className={`${styles.btn} ${styles.btnSecondary}`}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button 
            onClick={createBackup}
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={backupInProgress}
          >
            <Download size={16} />
            {backupInProgress ? 'Creating...' : 'Create Backup'}
          </button>
        </div>
      </div>

      {/* Backup Status Overview */}
      <div className={`${styles.grid} ${styles.gridCols1} ${styles.gridMdCols3}`}>
        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>Last Backup</h3>
              <p>2 hours ago</p>
              <div className={`${styles.statCardChange} ${styles.textGreen}`}>
                <CheckCircle size={16} />
                Successful
              </div>
            </div>
            <div className={`${styles.statCardIconContainer} ${styles.bgGreen}`}>
              <Database className={styles.statCardIcon} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>Total Backups</h3>
              <p>{displayBackups.length}</p>
              <div className={`${styles.statCardChange} ${styles.textGreen}`}>
                <Clock size={16} />
                Auto-scheduled
              </div>
            </div>
            <div className={`${styles.statCardIconContainer} ${styles.bgBlue}`}>
              <Server className={styles.statCardIcon} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>Storage Used</h3>
              <p>4.6 GB</p>
              <div className={`${styles.statCardChange} ${styles.textGreen}`}>
                <HardDrive size={16} />
                15% of quota
              </div>
            </div>
            <div className={`${styles.statCardIconContainer} ${styles.bgYellow}`}>
              <HardDrive className={styles.statCardIcon} />
            </div>
          </div>
        </div>
      </div>

      {/* Backup Management */}
      <div className={`${styles.grid} ${styles.gridCols1} ${styles.gridLgCols2}`}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Backup Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">Automatic Backups</h4>
                <p className="text-sm text-gray-600">Run backups automatically on schedule</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Backup Types</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Full System Backup</span>
                  <span className="text-sm text-gray-500">Daily at 2:00 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Database Only</span>
                  <span className="text-sm text-gray-500">Every 6 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">User Files</span>
                  <span className="text-sm text-gray-500">Daily at 3:00 AM</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Quick Actions</h4>
              <div className="grid grid-cols-1 gap-2">
                <button className={`${styles.btn} ${styles.btnSecondary} justify-start`}>
                  <Database size={16} />
                  Backup Database Now
                </button>
                <button className={`${styles.btn} ${styles.btnSecondary} justify-start`}>
                  <HardDrive size={16} />
                  Backup Files Now
                </button>
                <button className={`${styles.btn} ${styles.btnSecondary} justify-start`}>
                  <Upload size={16} />
                  Restore from Backup
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Maintenance Tools</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <button className={`${styles.btn} ${styles.btnPrimary} justify-start`}>
                <RefreshCw size={16} />
                Clear System Cache
              </button>
              <button className={`${styles.btn} ${styles.btnSuccess} justify-start`}>
                <Database size={16} />
                Optimize Database
              </button>
              <button className={`${styles.btn} ${styles.btnSecondary} justify-start`}>
                <Trash2 size={16} />
                Clean Temporary Files
              </button>
              <button className={`${styles.btn} ${styles.btnSecondary} justify-start`}>
                <Server size={16} />
                System Health Check
              </button>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Scheduled Tasks</h4>
              <div className="space-y-2">
                {[
                  { task: 'Daily Backup', schedule: 'Every day at 2:00 AM', status: 'Active' },
                  { task: 'Cache Cleanup', schedule: 'Every 6 hours', status: 'Active' },
                  { task: 'Log Rotation', schedule: 'Weekly on Sunday', status: 'Active' },
                  { task: 'Database Optimization', schedule: 'Monthly', status: 'Active' }
                ].map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{task.task}</div>
                      <div className="text-xs text-gray-500">{task.schedule}</div>
                    </div>
                    <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Backups */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Recent Backups</h3>
        </div>
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>Backup Name</th>
                <th className={styles.tableHeaderCell}>Type</th>
                <th className={styles.tableHeaderCell}>Size</th>
                <th className={styles.tableHeaderCell}>Created</th>
                <th className={styles.tableHeaderCell}>Duration</th>
                <th className={styles.tableHeaderCell}>Status</th>
                <th className={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayBackups.map((backup) => (
                <tr key={backup.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className="font-medium text-gray-900">{backup.name}</div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={`${styles.badge} ${
                      backup.type === 'full' ? styles.badgeInfo :
                      backup.type === 'database' ? styles.badgeSuccess :
                      styles.badgeWarning
                    }`}>
                      {backup.type}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className="text-gray-900">{backup.size}</span>
                  </td>
                  <td className={styles.tableCell}>
                    <div>
                      <div className="text-sm text-gray-900">
                        {new Date(backup.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(backup.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className="text-gray-600">{backup.duration}</span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={`${styles.badge} ${
                      backup.status === 'completed' ? styles.badgeSuccess :
                      backup.status === 'in-progress' ? styles.badgeWarning :
                      styles.badgeDanger
                    }`}>
                      {backup.status}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1">
                        <Download size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}