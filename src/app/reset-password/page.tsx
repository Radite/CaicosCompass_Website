"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    // Validate token when component mounts
    const validateToken = async () => {
      if (!token || !email) {
        setMessage("Invalid password reset link. Please request a new one.");
        setTokenValid(false);
        setTokenChecked(true);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/forgot/validate-reset-token`, {
          params: { token, email }
        });
        
        if (response.status === 200) {
          setTokenValid(true);
        } else {
          setMessage("This password reset link has expired. Please request a new one.");
          setTokenValid(false);
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setMessage(error.response?.data?.message || "Invalid or expired reset link. Please request a new one.");
        setTokenValid(false);
      } finally {
        setTokenChecked(true);
      }
    };

    validateToken();
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setMessage("Please fill in all fields.");
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/forgot/reset-password", {
        email,
        token,
        password
      });
      
      if (response.status === 200) {
        setIsSuccess(true);
        setMessage("Your password has been successfully reset.");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setIsSuccess(false);
      setMessage(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!tokenChecked) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.overlay}></div>
        <div className={styles.contentContainer}>
          <div className={styles.formContainer}>
            <div className={styles.formWrapper}>
              <h2 className={styles.formTitle}>Verifying Reset Link</h2>
              <p className={styles.formSubtitle}>Please wait while we verify your reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.overlay}></div>
      
      <div className={styles.contentContainer}>
        <div className={styles.formContainer}>
          <div className={styles.brandLogo}>
            <span>CaicosCompass</span>
          </div>
          
          <div className={styles.formWrapper}>
            {!tokenValid ? (
              <div className={styles.invalidToken}>
                <h2 className={styles.formTitle}>Invalid Reset Link</h2>
                <p className={styles.errorMessage}>{message}</p>
                <Link href="/forgot-password" className={styles.submitButton}>
                  Request New Reset Link
                </Link>
                <div className={styles.formToggle}>
                  <Link href="/login" className={styles.backLink}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to Login
                  </Link>
                </div>
              </div>
            ) : isSuccess ? (
              <div className={styles.successMessage}>
                <FontAwesomeIcon icon={faCheck} className={styles.successIcon} />
                <h2 className={styles.formTitle}>Password Reset Successful</h2>
                <p>{message}</p>
                <p className={styles.smallText}>
                  You will be redirected to the login page in a few seconds...
                </p>
                <Link href="/login" className={styles.backLink}>
                  <FontAwesomeIcon icon={faArrowLeft} /> Back to Login
                </Link>
              </div>
            ) : (
              <>
                <h2 className={styles.formTitle}>Create New Password</h2>
                <p className={styles.formSubtitle}>
                  Please enter and confirm your new password
                </p>
                
                <form onSubmit={handleSubmit}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="password">New Password</label>
                    <input
                      type="password"
                      id="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  {message && <div className={`${styles.message} ${styles.errorMessage}`}>{message}</div>}
                  
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading}
                  >
                    {loading ? "Updating Password..." : "Update Password"}
                  </button>
                  
                  <div className={styles.formToggle}>
                    <Link href="/login" className={styles.backLink}>
                      <FontAwesomeIcon icon={faArrowLeft} /> Back to Login
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
        
        <div className={styles.imageContainer}>
          <div className={styles.imageText}>
            <h1>Secure Your Account</h1>
            <p>Create a strong password to protect your luxury travel experiences</p>
          </div>
        </div>
      </div>
    </div>
  );
}