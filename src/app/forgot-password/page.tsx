"use client";
import React, { useState } from "react";
import axios from "axios";
import styles from "../login/login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

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
    
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/forgot/forgot-password", {
        email: email.toLowerCase().trim()
      });
      
      if (response.status === 200) {
        setIsSuccess(true);
        setMessage("Password reset link has been sent to your email.");
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
            <h2 className={styles.formTitle}>Reset Password</h2>
            <p className={styles.formSubtitle}>
              Enter your email address to receive a password reset link
            </p>
            
            {isSuccess ? (
              <div className={styles.successMessage}>
                <p>{message}</p>
                <p className={styles.smallText}>
                  Please check your inbox and follow the instructions to reset your password.
                </p>
                <Link href="/login" className={styles.backLink}>
                  <FontAwesomeIcon icon={faArrowLeft} /> Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                {message && <div className={`${styles.message} ${styles.errorMessage}`}>{message}</div>}
                
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                
                <div className={styles.formToggle}>
                  <Link href="/login" className={styles.backLink}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
        
        <div className={styles.imageContainer}>
          <div className={styles.imageText}>
            <h1>Reset Your Access</h1>
            <p>Get back to planning your dream vacation in Turks and Caicos</p>
          </div>
        </div>
      </div>
    </div>
  );
}