// src/app/vendor/pending-approval/page.tsx
"use client";
import React from 'react';
import styles from './pending-approval.module.css';

export default function PendingApproval() {
  return (
    <div className={styles.container}>
      <div className={styles.backgroundOverlay}></div>
      
      <div className={styles.contentWrapper}>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <div className={styles.clockIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
          </div>
          
          <div className={styles.content}>
            <h1 className={styles.title}>Application Under Review</h1>
            <div className={styles.statusBadge}>
              <span className={styles.statusText}>Pending Approval</span>
            </div>
            
            <p className={styles.description}>
              Thank you for your business application! Our team is currently reviewing your submission 
              to ensure it meets our quality standards and platform requirements.
            </p>
            
            <div className={styles.timelineContainer}>
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineIcon} ${styles.completed}`}>✓</div>
                <div className={styles.timelineContent}>
                  <h3>Application Submitted</h3>
                  <p>Your business information has been received</p>
                </div>
              </div>
              
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineIcon} ${styles.active}`}>2</div>
                <div className={styles.timelineContent}>
                  <h3>Under Review</h3>
                  <p>Our team is verifying your business details</p>
                </div>
              </div>
              
              <div className={styles.timelineItem}>
                <div className={styles.timelineIcon}>3</div>
                <div className={styles.timelineContent}>
                  <h3>Email Notification</h3>
                  <p>You'll receive approval confirmation within 24-48 hours</p>
                </div>
              </div>
            </div>
            
            <div className={styles.infoBox}>
              <div className={styles.infoIcon}>💡</div>
              <div>
                <h4>What happens next?</h4>
                <ul>
                  <li>We'll verify your business license and credentials</li>
                  <li>Our team will review your service offerings</li>
                  <li>You'll receive an email once approved</li>
                  <li>After approval, you can start creating listings</li>
                </ul>
              </div>
            </div>
            
            <div className={styles.actions}>
              <button
                onClick={() => window.location.href = '/'}
                className={styles.homeButton}
              >
                Return to Homepage
              </button>
              <button
                onClick={() => window.location.href = '/contact'}
                className={styles.contactButton}
              >
                Contact Support
              </button>
            </div>
            
            <div className={styles.footer}>
              <p>Questions? Email us at <a href="mailto:support@turksexplorer.com">support@turksexplorer.com</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}