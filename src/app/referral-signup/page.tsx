'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './referralSignup.module.css';

export default function ReferralSignup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    partnerType: 'taxi-driver',
    businessName: '',
    businessLocation: ''
  });

  const partnerTypes = [
    { value: 'taxi-driver', label: 'Taxi/Transportation Driver' },
    { value: 'concierge', label: 'Hotel Concierge' },
    { value: 'travel-agent', label: 'Travel Agent' },
    { value: 'hotel-staff', label: 'Hotel Staff' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/referral/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error creating account');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/referral-signup-success');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.successMessage}>
          <h2>✅ Application Submitted!</h2>
          <p>Thank you for signing up as a referral partner. We'll review your application and get back to you shortly.</p>
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1>Become a Referral Partner</h1>
          <p>Earn 5% commission on every booking you refer to Caicos Compass</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your full name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1 (649) 123-4567"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="partnerType">Partner Type *</label>
            <select
              id="partnerType"
              name="partnerType"
              value={formData.partnerType}
              onChange={handleChange}
              required
            >
              {partnerTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="businessName">Business Name (if applicable)</label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="e.g., Sunshine Taxi Service"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="businessLocation">Location/Island</label>
            <input
              type="text"
              id="businessLocation"
              name="businessLocation"
              value={formData.businessLocation}
              onChange={handleChange}
              placeholder="e.g., Providenciales"
            />
          </div>

          <div className={styles.infoBox}>
            <h4>How it works:</h4>
            <ul>
              <li>You receive a unique referral code (e.g., ABC12345)</li>
              <li>Share it with tourists you meet</li>
              <li>They use it during checkout on Caicos Compass</li>
              <li>You earn 5% commission on every booking</li>
              <li>Request payouts anytime from your dashboard</li>
            </ul>
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className={styles.disclaimer}>
            All applicants will be reviewed by our team before approval.
          </p>
        </form>
      </div>
    </div>
  );
}
