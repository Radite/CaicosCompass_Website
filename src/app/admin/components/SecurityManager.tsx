"use client";

import React, { useState } from 'react';
import { 
  Shield, Lock, Eye, AlertTriangle, 
  Users, Key, Settings, Clock
} from 'lucide-react';
import styles from '../admin.module.css';

interface SecurityManagerProps {}

export default function SecurityManager({}: SecurityManagerProps) {
  const [activeSecurityTab, setActiveSecurityTab] = useState('overview');

  const securityTabs = [
    { id: 'overview', label: 'Security Overview', icon: Shield },
    { id: 'permissions', label: 'Permissions', icon: Lock },
    { id: 'sessions', label: 'Active Sessions', icon: Eye },
    { id: 'threats', label: 'Threat Detection', icon: AlertTriangle }
  ];

  const renderSecurityOverview = () => (
    <div className="space-y-6">
      <div className={`${styles.grid} ${styles.gridCols1} ${styles.gridMdCols2} ${styles.gridLgCols4}`}>
        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>Security Score</h3>
              <p>87/100</p>
              <div className={`${styles.statCardChange} ${styles.textGreen}`}>
                <Shield size={16} />
                Good security
              </div>
            </div>
            <div className={`${styles.statCardIconContainer} ${styles.bgGreen}`}>
              <Shield className={styles.statCardIcon} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>Active Sessions</h3>
              <p>23</p>
              <div className={`${styles.statCardChange} text-gray-600`}>
                <Users size={16} />
                Currently online
              </div>
            </div>
            <div className={`${styles.statCardIconContainer} ${styles.bgBlue}`}>
              <Users className={styles.statCardIcon} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>Failed Logins</h3>
              <p>5</p>
              <div className={`${styles.statCardChange} text-yellow-600`}>
                <AlertTriangle size={16} />
                Last 24 hours
              </div>
            </div>
            <div className={`${styles.statCardIconContainer} ${styles.bgYellow}`}>
              <AlertTriangle className={styles.statCardIcon} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardContent}>
            <div className={styles.statCardInfo}>
              <h3>2FA Enabled</h3>
              <p>78%</p>
              <div className={`${styles.statCardChange} ${styles.textGreen}`}>
                <Lock size={16} />
                Of admin users
              </div>
            </div>
            <div className={`${styles.statCardIconContainer} ${styles.bgPurple}`}>
              <Lock className={styles.statCardIcon} />
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.grid} ${styles.gridCols1} ${styles.gridLgCols2}`}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Security Recommendations</h3>
          </div>
          <div className="space-y-4">
            {[
              { 
                priority: 'high', 
                title: 'Enable 2FA for all admin accounts',
                description: '22% of admin accounts don\'t have 2FA enabled',
                action: 'Configure 2FA'
              },
              { 
                priority: 'medium', 
                title: 'Update password policy',
                description: 'Require stronger passwords with special characters',
                action: 'Update Policy'
              },
              { 
                priority: 'low', 
                title: 'Review user permissions',
                description: 'Some users have excessive permissions',
                action: 'Review Permissions'
              }
            ].map((rec, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${styles.badge} ${
                        rec.priority === 'high' ? styles.badgeDanger :
                        rec.priority === 'medium' ? styles.badgeWarning :
                        styles.badgeInfo
                      }`}>
                        {rec.priority} priority
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  </div>
                  <button className={`${styles.btn} ${styles.btnPrimary} ml-4`}>
                    {rec.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Recent Security Events</h3>
          </div>
          <div className="space-y-3">
            {[
              { type: 'warning', event: 'Multiple failed login attempts from IP 192.168.1.100', time: '2 min ago' },
              { type: 'info', event: 'Admin user enabled 2FA', time: '15 min ago' },
              { type: 'error', event: 'Suspicious API access pattern detected', time: '1 hour ago' },
              { type: 'info', event: 'Password policy updated', time: '2 hours ago' },
              { type: 'warning', event: 'User account locked due to failed attempts', time: '3 hours ago' }
            ].map((event, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  event.type === 'error' ? 'bg-red-500' : 
                  event.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{event.event}</p>
                  <p className="text-xs text-gray-500 mt-1">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPermissions = () => (
    <div className="space-y-6">
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Role-Based Access Control</h3>
        </div>
        <div className="space-y-4">
          {[
            { 
              role: 'Super Admin',
              users: 2,
              permissions: ['Full System Access', 'User Management', 'System Settings', 'Backup & Recovery'],
              color: 'red'
            },
            { 
              role: 'Admin',
              users: 5,
              permissions: ['User Management', 'Content Management', 'Analytics', 'Reports'],
              color: 'blue'
            },
            { 
              role: 'Business Manager',
              users: 23,
              permissions: ['Own Listings', 'Bookings', 'Analytics', 'Profile Management'],
              color: 'green'
            },
            { 
              role: 'User',
              users: 1247,
              permissions: ['View Listings', 'Make Bookings', 'Profile Management'],
              color: 'gray'
            }
          ].map((role, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-medium text-gray-900">{role.role}</h4>
                  <span className="text-sm text-gray-500">({role.users} users)</span>
                </div>
                <button className={`${styles.btn} ${styles.btnSecondary}`}>
                  Edit Permissions
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission, idx) => (
                  <span key={idx} className={`${styles.badge} ${styles.badgeInfo}`}>
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActiveSessions = () => (
    <div className="space-y-6">
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Active User Sessions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>User</th>
                <th className={styles.tableHeaderCell}>Role</th>
                <th className={styles.tableHeaderCell}>IP Address</th>
                <th className={styles.tableHeaderCell}>Location</th>
                <th className={styles.tableHeaderCell}>Last Activity</th>
                <th className={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { user: 'John Admin', role: 'Admin', ip: '192.168.1.100', location: 'New York, US', lastActivity: '2 min ago' },
                { user: 'Jane Manager', role: 'Business Manager', ip: '10.0.0.50', location: 'London, UK', lastActivity: '5 min ago' },
                { user: 'Bob User', role: 'User', ip: '203.0.113.1', location: 'Toronto, CA', lastActivity: '10 min ago' }
              ].map((session, index) => (
                <tr key={index} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className="font-medium text-gray-900">{session.user}</div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={`${styles.badge} ${
                      session.role === 'Admin' ? styles.badgeDanger :
                      session.role === 'Business Manager' ? styles.badgeInfo :
                      styles.badgeSuccess
                    }`}>
                      {session.role}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className="font-mono text-sm">{session.ip}</span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className="text-gray-900">{session.location}</span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className="text-gray-600">{session.lastActivity}</span>
                  </td>
                  <td className={styles.tableCell}>
                    <button className={`${styles.btn} ${styles.btnDanger} text-xs`}>
                      Terminate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderThreatDetection = () => (
    <div className="space-y-6">
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Threat Detection & Prevention</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Firewall Status</h4>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`${styles.badge} ${styles.badgeSuccess}`}>Active</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-600">Blocked Attempts</span>
                <span className="font-medium">1,247 today</span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Rate Limiting</h4>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`${styles.badge} ${styles.badgeSuccess}`}>Enabled</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-600">Requests Throttled</span>
                <span className="font-medium">23 today</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Recent Threats Blocked</h4>
            {[
              { threat: 'SQL Injection Attempt', ip: '203.0.113.5', time: '15 min ago', severity: 'high' },
              { threat: 'Brute Force Login Attack', ip: '198.51.100.10', time: '1 hour ago', severity: 'medium' },
              { threat: 'Suspicious API Access', ip: '192.0.2.20', time: '2 hours ago', severity: 'low' }
            ].map((threat, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{threat.threat}</div>
                  <div className="text-sm text-gray-500">From {threat.ip} • {threat.time}</div>
                </div>
                <span className={`${styles.badge} ${
                  threat.severity === 'high' ? styles.badgeDanger :
                  threat.severity === 'medium' ? styles.badgeWarning :
                  styles.badgeInfo
                }`}>
                  {threat.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityContent = () => {
    switch (activeSecurityTab) {
      case 'overview': return renderSecurityOverview();
      case 'permissions': return renderPermissions();
      case 'sessions': return renderActiveSessions();
      case 'threats': return renderThreatDetection();
      default: return renderSecurityOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Security & Permissions</h1>
      </div>

      {/* Security Navigation */}
<div className={styles.securityTabNavigation}>
  <nav className={styles.securityTabNav}>
    {securityTabs.map((tab) => {
      const Icon = tab.icon;
      return (
        <button
          key={tab.id}
          onClick={() => setActiveSecurityTab(tab.id)}
          className={`${styles.securityTabButton} ${
            activeSecurityTab === tab.id ? styles.securityTabButtonActive : ''
          }`}
        >
          <Icon className={styles.securityTabIcon} />
          {tab.label}
        </button>
      );
    })}
  </nav>
</div>

      {/* Security Content */}
      {renderSecurityContent()}
    </div>
  );
}