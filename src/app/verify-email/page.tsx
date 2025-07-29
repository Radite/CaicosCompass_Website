// src/app/verify-email/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './verify-email.module.css';

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setVerificationStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    // Call verification API
    verifyEmail(token);
  }, [searchParams]);

  // Countdown and redirect on success
  useEffect(() => {
    if (verificationStatus === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (verificationStatus === 'success' && countdown === 0) {
      router.push('/login');
    }
  }, [verificationStatus, countdown, router]);

  const verifyEmail = async (token) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await axios.get(`${API_BASE_URL}/api/users/verify-email?token=${token}`);
      
      if (response.status === 200) {
        setVerificationStatus('success');
        setMessage('Email verified successfully! Welcome to CaicosCompass! 🎉');
      }
    } catch (error) {
      setVerificationStatus('error');
      
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Verification failed. Please try again or contact support.');
      }
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleResendEmail = () => {
    router.push('/login?resend=true');
  };

  if (verificationStatus === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loadingSpinner}></div>
          <h1 className={styles.title}>Verifying Your Email...</h1>
          <p className={styles.subtitle}>Please wait while we verify your account.</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successIcon}>✅</div>
          <h1 className={styles.title}>Email Verified Successfully!</h1>
          <p className={styles.subtitle}>{message}</p>
          
          <div className={styles.welcomeMessage}>
            <p>🏝️ Your CaicosCompass account is now active!</p>
            <p>You can now:</p>
            <ul className={styles.featureList}>
              <li>🎯 Discover amazing activities</li>
              <li>🏨 Book accommodations</li>
              <li>🍽️ Find great dining spots</li>
              <li>🚗 Arrange transportation</li>
            </ul>
          </div>

          <div className={styles.redirectInfo}>
            <p>Redirecting to login in <span className={styles.countdown}>{countdown}</span> seconds...</p>
          </div>

          <button 
            className={styles.primaryButton}
            onClick={handleGoToLogin}
          >
            Go to Login Now
          </button>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.errorIcon}>❌</div>
          <h1 className={styles.title}>Verification Failed</h1>
          <p className={styles.subtitle}>{message}</p>

          <div className={styles.troubleshooting}>
            <h3>What went wrong?</h3>
            <ul>
              <li>🔗 The verification link may have expired (24 hours)</li>
              <li>⚡ The link may have already been used</li>
              <li>📧 You may have clicked an old verification email</li>
            </ul>
          </div>

          <div className={styles.buttonGroup}>
            <button 
              className={styles.primaryButton}
              onClick={handleResendEmail}
            >
              Request New Verification Email
            </button>
            <button 
              className={styles.secondaryButton}
              onClick={handleGoToLogin}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}