"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './success.module.css';

export default function AuthSuccess() {
  const [tokenData, setTokenData] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleAuthSuccess = () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userStr = urlParams.get('user');

        console.log('🔍 Auth Success Page Data:', { token: !!token, userStr: !!userStr });

        if (token) {
          setTokenData(token);
          localStorage.setItem('authToken', token);
        }

        if (userStr) {
          const user = JSON.parse(decodeURIComponent(userStr));
          setUserData(user);
          localStorage.setItem('user', JSON.stringify(user));
          console.log('✅ User data saved:', user);
        }

        setLoading(false);

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          handleRedirect();
        }, 3000);

      } catch (error) {
        console.error('❌ Error parsing auth data:', error);
        setLoading(false);
      }
    };

    handleAuthSuccess();
  }, []);

  const handleRedirect = () => {
    setRedirecting(true);
    
    if (userData?.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (userData?.role === 'business-manager') {
      router.push('/business/dashboard');
    } else {
      router.push('/');
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className={styles.successPage}>
        <div className={styles.overlay}></div>
        <div className={styles.contentContainer}>
          <div className={styles.successCard}>
            <div className={styles.brandLogo}>
              <span>TurksExplorer</span>
            </div>
            <div className={styles.loadingSpinner}></div>
            <h2 className={styles.title}>Processing your authentication...</h2>
            <p className={styles.subtitle}>Please wait while we complete your login.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenData || !userData) {
    return (
      <div className={styles.successPage}>
        <div className={styles.overlay}></div>
        <div className={styles.contentContainer}>
          <div className={styles.successCard}>
            <div className={styles.brandLogo}>
              <span>TurksExplorer</span>
            </div>
            <div className={styles.errorIcon}>❌</div>
            <h2 className={styles.title}>Authentication Failed</h2>
            <p className={styles.subtitle}>There was an error processing your login. Please try again.</p>
            <button 
              className={styles.primaryButton}
              onClick={() => router.push('/login')}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.successPage}>
      <div className={styles.overlay}></div>
      <div className={styles.contentContainer}>
        <div className={styles.successCard}>
          <div className={styles.brandLogo}>
            <span>TurksExplorer</span>
          </div>
          
          <div className={styles.successIcon}>🎉</div>
          
          <h2 className={styles.title}>Welcome back!</h2>
          <p className={styles.subtitle}>You have successfully signed in to your account.</p>
          
          <div className={styles.userInfo}>
            <div className={styles.userDetails}>
              <h3>Hello, {userData.name}!</h3>
              <p className={styles.userEmail}>{userData.email}</p>
              <span className={styles.userRole}>{userData.role}</span>
            </div>
          </div>

          <div className={styles.redirectInfo}>
            <p>You'll be redirected to your dashboard in a few seconds...</p>
            {redirecting && <div className={styles.smallSpinner}></div>}
          </div>

          <div className={styles.buttonGroup}>
            <button 
              className={styles.primaryButton}
              onClick={handleRedirect}
              disabled={redirecting}
            >
              {redirecting ? 'Redirecting...' : 'Go to Dashboard'}
            </button>
            
            <button 
              className={styles.secondaryButton}
              onClick={handleGoHome}
              disabled={redirecting}
            >
              Go Home
            </button>
          </div>

          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <details className={styles.debugSection}>
              <summary>🔧 Debug Info</summary>
              <div className={styles.debugContent}>
                <p><strong>Token:</strong> {tokenData ? '✅ Received' : '❌ Missing'}</p>
                <p><strong>User ID:</strong> {userData._id}</p>
                <p><strong>Verified:</strong> {userData.isVerified ? '✅' : '❌'}</p>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}