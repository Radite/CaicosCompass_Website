'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, FileText, Copy, Check } from 'lucide-react';
import styles from './referralDashboard.module.css';

interface Partner {
  _id: string;
  name: string;
  email: string;
  referralCode: string;
  partnerType: string;
  businessName?: string;
  businessLocation?: string;
  commissionPercentage: number;
  status: string;
  createdAt: string;
}

interface Statistics {
  totalReferrals: number;
  totalEarned: number;
  pendingAmount: number;
  requestedAmount: number;
  paidAmount: number;
  pendingCommissions: number;
}

interface MonthlyData {
  _id: { year: number; month: number };
  revenue: number;
  bookings: number;
}

interface Referral {
  _id: string;
  bookingDetails: {
    serviceType: string;
    serviceName: string;
    touristName: string;
  };
  commissionAmount: number;
  status: string;
  earnedDate?: string;
  createdAt: string;
}

export default function ReferralDashboard() {
  const [partnerId, setPartnerId] = useState('');
  const [partner, setPartner] = useState<Partner | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentReferrals, setRecentReferrals] = useState<Referral[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [processingPayout, setProcessingPayout] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  useEffect(() => {
    // Get partnerId from localStorage or URL
    const stored = localStorage.getItem('referralPartnerId');
    if (stored) {
      setPartnerId(stored);
      fetchDashboardData(stored);
    } else {
      setError('Partner ID not found. Please sign in again.');
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/referral/dashboard?partnerId=${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error loading dashboard');
        setLoading(false);
        return;
      }

      setPartner(data.data.partner);
      setStatistics(data.data.statistics);
      setRecentReferrals(data.data.recentReferrals);
      setMonthlyData(data.data.monthlyData);
    } catch (err) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (partner?.referralCode) {
      navigator.clipboard.writeText(partner.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRequestPayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setProcessingPayout(true);

    try {
      const response = await fetch('/api/referral/request-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId,
          amount: parseFloat(payoutAmount)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Error requesting payout');
        setProcessingPayout(false);
        return;
      }

      setPayoutSuccess(true);
      setPayoutAmount('');
      
      // Refresh dashboard
      setTimeout(() => {
        fetchDashboardData(partnerId);
        setPayoutSuccess(false);
      }, 2000);
    } catch (err) {
      alert(err.message || 'Error requesting payout');
    } finally {
      setProcessingPayout(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading your dashboard...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!partner || !statistics) {
    return <div className={styles.error}>No data available</div>;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Welcome, {partner.name}!</h1>
          <p>Your Caicos Compass Referral Dashboard</p>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className={styles.codeSection}>
        <div className={styles.codeBox}>
          <h3>Your Referral Code</h3>
          <div className={styles.codeDisplay}>
            <code>{partner.referralCode}</code>
            <button 
              onClick={copyReferralCode}
              className={styles.copyButton}
              title="Copy referral code"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
          <p className={styles.codeInstruction}>
            Share this code with tourists. They'll use it during checkout to give you credit.
          </p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <h4>Total Referrals</h4>
            <p className={styles.statNumber}>{statistics.totalReferrals}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <DollarSign size={24} />
          </div>
          <div className={styles.statContent}>
            <h4>Total Earned</h4>
            <p className={styles.statNumber}>${statistics.totalEarned.toFixed(2)}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <h4>Pending Commission</h4>
            <p className={styles.statNumber}>${statistics.pendingAmount.toFixed(2)}</p>
            <p className={styles.statSubtext}>{statistics.pendingCommissions} bookings</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FileText size={24} />
          </div>
          <div className={styles.statContent}>
            <h4>Requested for Payout</h4>
            <p className={styles.statNumber}>${statistics.requestedAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Payout Request Section */}
      {statistics.pendingAmount > 0 && (
        <div className={styles.payoutSection}>
          <h3>Request a Payout</h3>
          <p>Available to withdraw: <strong>${statistics.pendingAmount.toFixed(2)}</strong></p>
          
          {payoutSuccess && (
            <div className={styles.successMessage}>
              ✅ Payout request submitted! Check your account for updates.
            </div>
          )}

          <div className={styles.payoutForm}>
            <input
              type="number"
              min="0"
              step="0.01"
              max={statistics.pendingAmount}
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              placeholder={`Enter amount (max: $${statistics.pendingAmount.toFixed(2)})`}
              disabled={processingPayout}
            />
            <button
              onClick={handleRequestPayout}
              disabled={processingPayout || !payoutAmount}
              className={styles.payoutButton}
            >
              {processingPayout ? 'Processing...' : 'Request Payout'}
            </button>
          </div>
        </div>
      )}

      {/* Paid Amount Info */}
      {statistics.paidAmount > 0 && (
        <div className={styles.paidSection}>
          <h4>Total Payouts Completed: ${statistics.paidAmount.toFixed(2)}</h4>
        </div>
      )}

      {/* Recent Referrals */}
      <div className={styles.referralsSection}>
        <h3>Recent Referrals</h3>
        {recentReferrals.length > 0 ? (
          <div className={styles.referralsList}>
            {recentReferrals.map(referral => (
              <div key={referral._id} className={styles.referralItem}>
                <div className={styles.referralInfo}>
                  <h4>{referral.bookingDetails.serviceName}</h4>
                  <p>{referral.bookingDetails.serviceType}</p>
                  <p className={styles.touristName}>Tourist: {referral.bookingDetails.touristName}</p>
                </div>
                <div className={styles.referralMoney}>
                  <p className={styles.amount}>${referral.commissionAmount.toFixed(2)}</p>
                  <p className={styles.status}>{referral.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noData}>No referrals yet. Start sharing your code!</p>
        )}
      </div>

      {/* Account Info */}
      <div className={styles.accountSection}>
        <h3>Account Information</h3>
        <div className={styles.accountDetails}>
          <p><strong>Type:</strong> {partner.partnerType}</p>
          {partner.businessName && <p><strong>Business:</strong> {partner.businessName}</p>}
          {partner.businessLocation && <p><strong>Location:</strong> {partner.businessLocation}</p>}
          <p><strong>Commission Rate:</strong> {partner.commissionPercentage}%</p>
          <p><strong>Status:</strong> {partner.status}</p>
          <p><strong>Member Since:</strong> {new Date(partner.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
