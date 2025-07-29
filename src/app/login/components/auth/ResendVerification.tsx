// src/app/login/components/auth/ResendVerification.tsx
import React, { useState } from "react";
import axios from "axios";
import styles from "@/app/login/login.module.css";

export default function ResendVerification({ 
  showMessage, 
  closeMessageBox 
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResendVerification = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showMessage(
        'Email Required',
        'Please enter your email address to resend the verification link.',
        'warning'
      );
      return;
    }

    setLoading(true);
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const response = await axios.post(`${API_BASE_URL}/api/users/resend-verification`, {
        email: email.toLowerCase().trim()
      });
      
      if (response.status === 200) {
        showMessage(
          'Verification Email Sent! 📧',
          'Please check your email inbox (and spam folder) for the new verification link.',
          'success'
        );
        setEmail(""); // Clear the form
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      
      const errorMessage = error.response?.data?.message || 'Failed to resend verification email. Please try again.';
      
      showMessage(
        'Resend Failed',
        errorMessage,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.resendSection}>
      <div className={styles.resendHeader}>
        <h3>📧 Resend Verification Email</h3>
        <p>Didn't receive the verification email? Enter your email below to get a new one.</p>
      </div>
      
      <form onSubmit={handleResendVerification} className={styles.resendForm}>
        <div className={styles.inputGroup}>
          <label htmlFor="resendEmail">Email Address</label>
          <input
            type="email"
            id="resendEmail"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <button
          type="submit"
          className={styles.resendButton}
          disabled={loading}
        >
          {loading ? "Sending..." : "Resend Verification Email"}
        </button>
      </form>
      
      <div className={styles.resendTips}>
        <h4>💡 Tips:</h4>
        <ul>
          <li>Check your spam/junk folder</li>
          <li>Make sure you're using the same email address</li>
          <li>Verification links expire after 24 hours</li>
          <li>You can only request a new email every few minutes</li>
        </ul>
      </div>
    </div>
  );
}