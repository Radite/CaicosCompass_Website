'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SavedPaymentMethods from './components/SavedPaymentMethods';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('payment-methods');

  if (!isAuthenticated) {
    return <div>Please log in to access settings</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <button
          className={activeTab === 'payment-methods' ? styles.active : ''}
          onClick={() => setActiveTab('payment-methods')}
        >
          Payment Methods
        </button>
        {/* Add other tabs as needed */}
      </div>

      <div className={styles.content}>
        {activeTab === 'payment-methods' && <SavedPaymentMethods />}
      </div>
    </div>
  );
}