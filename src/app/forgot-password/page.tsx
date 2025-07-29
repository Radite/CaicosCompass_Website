"use client";
import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import styles from "../login/login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage("Please enter your email address.");
      setIsSuccess(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address.");
      setIsSuccess(false);
      return;
    }
    
    setLoading(true);
    setMessage("");
    
    try {
      const response = await axios.post("http://localhost:5000/api/forgot/forgot-password", {
        email: email.toLowerCase().trim()
      });
      
      if (response.status === 200) {
        setIsSuccess(true);
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setIsSuccess(false);
      setMessage(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.overlay}></div>
      
      <div className={styles.contentContainer}>
        <div className={styles.formContainer}>
          <div className={styles.brandLogo}>
            <span>CaicosCompass</span>
          </div>
          
          <div className={styles.formWrapper}>
            <h2 className={styles.formTitle}>Reset Your Password</h2>
            <p className={styles.formSubtitle}>
              Enter your email address to receive a password reset link
            </p>

            {/* OAuth Users Info Box */}
            <div className={styles.infoBox}>
              <div className={styles.infoIcon}>
                <FontAwesomeIcon icon={faInfoCircle} />
              </div>
              <div className={styles.infoContent}>
                <h4>Using Google, Facebook, or Apple?</h4>
                <p>If you signed up with a social account, you can't reset your password here. Simply sign in using your social account button on the login page.</p>
              </div>
            </div>
            
            {isSuccess ? (
              <div className={styles.successSection}>
                <div className={styles.successMessage}>
                  <h3>📧 Check Your Email</h3>
                  <p>{message}</p>
                  <div className={styles.emailInstructions}>
                    <h4>What to do next:</h4>
                    <ol>
                      <li>Check your email inbox (and spam folder)</li>
                      <li>Click the "Reset Password" button in the email</li>
                      <li>Create your new password</li>
                      <li>Sign in with your new password</li>
                    </ol>
                  </div>
                  <p className={styles.smallText}>
                    The reset link will expire in 1 hour for security.
                  </p>
                </div>
                
                <div className={styles.actionButtons}>
                  <Link href="/login" className={styles.primaryButton}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to Login
                  </Link>
                  <button 
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      setIsSuccess(false);
                      setMessage("");
                      setEmail("");
                    }}
                  >
                    Send Another Reset Link
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.resetForm}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your registered email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                
                {message && (
                  <div className={`${styles.message} ${isSuccess ? styles.successMessage : styles.errorMessage}`}>
                    {message}
                  </div>
                )}
                
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? "Sending Reset Link..." : "Send Reset Link"}
                </button>
                
                <div className={styles.formFooter}>
                  <Link href="/login" className={styles.backLink}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to Login
                  </Link>
                </div>

                {/* Security Notice */}
                <div className={styles.securityNotice}>
                  <h4>🔒 Security Notice</h4>
                  <ul>
                    <li>We'll only send reset links to registered email addresses</li>
                    <li>Reset links expire after 1 hour</li>
                    <li>If you don't receive an email, check your spam folder</li>
                    <li>Contact support if you continue having issues</li>
                  </ul>
                </div>
              </form>
            )}
          </div>
        </div>
        
        <div className={styles.imageContainer}>
          <div className={styles.imageText}>
            <h1>Secure Account Recovery</h1>
            <p>Get back to planning your dream vacation in the Turks & Caicos Islands</p>
          </div>
        </div>
      </div>
    </div>
  );
}