"use client";

import React, { useState } from 'react';
import { 
  Settings, Save, RefreshCw, Mail, 
  Globe, Shield, Database, Bell
} from 'lucide-react';
import styles from '../admin.module.css';

interface SystemSettingsProps {}

export default function SystemSettings({}: SystemSettingsProps) {
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'TurksExplorer Admin',
      siteDescription: 'Turks and Caicos Tourism Platform',
      contactEmail: 'admin@turksexplorer.com',
      timezone: 'America/Grand_Turk',
      language: 'en',
      maintenanceMode: false
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: 'noreply@turksexplorer.com',
      fromName: 'TurksExplorer'
    },
    security: {
      sessionTimeout: '24',
      maxLoginAttempts: '5',
      passwordMinLength: '8',
      requireSpecialChars: true,
      require2FA: false,
      allowRegistration: true
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      marketingEmails: true,
      bookingUpdates: true,
      systemAlerts: true
    }
  });

  const settingsTabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  const handleInputChange = (category: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    try {
      // Here you would make an API call to save settings
      console.log('Saving settings:', settings);
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Site Configuration</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.general.siteName}
                onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.general.contactEmail}
                onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={settings.general.timezone}
                onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="America/Grand_Turk">Grand Turk (UTC-5)</option>
                <option value="America/New_York">New York (UTC-5)</option>
                <option value="Europe/London">London (UTC+0)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={settings.general.language}
                onChange={(e) => handleInputChange('general', 'language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Description
            </label>
            <textarea
              value={settings.general.siteDescription}
              onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
              <p className="text-sm text-gray-600">Temporarily disable site access for maintenance</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings.general.maintenanceMode}
                onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>SMTP Configuration</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                value={settings.email.smtpHost}
                onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="smtp.gmail.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port
              </label>
              <input
                type="text"
                value={settings.email.smtpPort}
                onChange={(e) => handleInputChange('email', 'smtpPort', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="587"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Username
              </label>
              <input
                type="text"
                value={settings.email.smtpUsername}
                onChange={(e) => handleInputChange('email', 'smtpUsername', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your-email@gmail.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Password
              </label>
              <input
                type="password"
                value={settings.email.smtpPassword}
                onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email
              </label>
              <input
                type="email"
                value={settings.email.fromEmail}
                onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="noreply@turksexplorer.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Name
              </label>
              <input
                type="text"
                value={settings.email.fromName}
                onChange={(e) => handleInputChange('email', 'fromName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="TurksExplorer"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className={`${styles.btn} ${styles.btnSecondary}`}>
              Test Connection
            </button>
            <button className={`${styles.btn} ${styles.btnPrimary}`}>
              Send Test Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Authentication & Security</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (hours)
              </label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleInputChange('security', 'sessionTimeout', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="168"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => handleInputChange('security', 'maxLoginAttempts', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="3"
                max="10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Password Length
              </label>
              <input
                type="number"
                value={settings.security.passwordMinLength}
                onChange={(e) => handleInputChange('security', 'passwordMinLength', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="6"
                max="20"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Require Special Characters</h4>
                <p className="text-sm text-gray-600">Force passwords to include special characters</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.security.requireSpecialChars}
                  onChange={(e) => handleInputChange('security', 'requireSpecialChars', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Require 2FA for Admins</h4>
                <p className="text-sm text-gray-600">Force two-factor authentication for admin users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.security.require2FA}
                  onChange={(e) => handleInputChange('security', 'require2FA', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Allow Public Registration</h4>
                <p className="text-sm text-gray-600">Allow new users to register accounts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.security.allowRegistration}
                  onChange={(e) => handleInputChange('security', 'allowRegistration', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Notification Preferences</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Send notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                <p className="text-sm text-gray-600">Send notifications via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.notifications.smsNotifications}
                  onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-600">Send browser push notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.notifications.pushNotifications}
                  onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Marketing Emails</h4>
                <p className="text-sm text-gray-600">Send promotional and marketing emails</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.notifications.marketingEmails}
                  onChange={(e) => handleInputChange('notifications', 'marketingEmails', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Booking Updates</h4>
                <p className="text-sm text-gray-600">Notify about booking status changes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.notifications.bookingUpdates}
                  onChange={(e) => handleInputChange('notifications', 'bookingUpdates', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">System Alerts</h4>
                <p className="text-sm text-gray-600">Notify about system issues and maintenance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.notifications.systemAlerts}
                  onChange={(e) => handleInputChange('notifications', 'systemAlerts', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsContent = () => {
    switch (activeSettingsTab) {
      case 'general': return renderGeneralSettings();
      case 'email': return renderEmailSettings();
      case 'security': return renderSecuritySettings();
      case 'notifications': return renderNotificationSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <div className="flex gap-3">
          <button className={`${styles.btn} ${styles.btnSecondary}`}>
            <RefreshCw size={16} />
            Reset to Defaults
          </button>
          <button 
            onClick={saveSettings}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            <Save size={16} />
            Save Settings
          </button>
        </div>
      </div>

      {/* Settings Navigation */}
<div className="border-b border-gray-200">
  <nav className={styles.settingsTabNavigation}>
    <div className={styles.settingsTabNav}>
      {settingsTabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveSettingsTab(tab.id)}
            className={`${styles.settingsTabButton} ${
              activeSettingsTab === tab.id ? styles.settingsTabButtonActive : ''
            }`}
          >
            <Icon className={styles.settingsTabIcon} />
            {tab.label}
          </button>
        );
      })}
    </div>
  </nav>
</div>
<div className={styles.settingsCard}>
  <div className={styles.settingsFormGrid}>

      {/* Settings Content */}
      {renderSettingsContent()}
      
      {/* Save Button at Bottom */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <div className="flex gap-3">
          <button className={`${styles.btn} ${styles.btnSecondary}`}>
            Cancel Changes
          </button>
          <button 
            onClick={saveSettings}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            <Save size={16} />
            Save All Settings
          </button>
        </div>
      </div>
    </div>
      </div>
</div>
  );
}
