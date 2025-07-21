"use client";
import React, { useState } from "react";
import styles from "./login.module.css";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
import BusinessSignupForm from "./components/auth/BusinessSignupForm";
import AccountTypeSelector from "./components/auth/AccountTypeSelector";
import CustomMessageBox from "./components/shared/CustomMessageBox";
import { useMessage } from "./utils/messageUtils";

export default function LoginPage() {
  // Toggle state: true = Login, false = Sign Up
  const [isLogin, setIsLogin] = useState(true);
  // Business signup toggle
  const [isBusinessSignup, setIsBusinessSignup] = useState(false);
  // Loading state for button feedback
  const [loading, setLoading] = useState(false);

  // Message box utilities
  const { messageBox, showMessage, closeMessageBox } = useMessage();

  // Toggle between forms
  const toggleForms = () => {
    setIsLogin(!isLogin);
    setIsBusinessSignup(false);
  };

  // Toggle business signup
  const toggleBusinessSignup = () => {
    setIsBusinessSignup(!isBusinessSignup);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.overlay}></div>
      
      <div className={styles.contentContainer}>
        <div className={styles.formContainer}>
          <div className={styles.brandLogo}>
            <span>TurksExplorer</span>
          </div>
          
          {isLogin ? (
            <div className={styles.formWrapper}>
              <h2 className={styles.formTitle}>Welcome Back</h2>
              <p className={styles.formSubtitle}>Sign in to continue your journey</p>
              
              <LoginForm 
                loading={loading}
                setLoading={setLoading}
                showMessage={showMessage}
                closeMessageBox={closeMessageBox}
                toggleForms={toggleForms}
              />
            </div>
          ) : (
            <div className={styles.formWrapper}>
              <AccountTypeSelector 
                isBusinessSignup={isBusinessSignup}
                onToggle={toggleBusinessSignup}
              />

              {!isBusinessSignup ? (
                <SignupForm 
                  loading={loading}
                  setLoading={setLoading}
                  showMessage={showMessage}
                  closeMessageBox={closeMessageBox}
                  toggleForms={toggleForms}
                />
              ) : (
                <BusinessSignupForm 
                  loading={loading}
                  setLoading={setLoading}
                  showMessage={showMessage}
                  closeMessageBox={closeMessageBox}
                  toggleForms={toggleForms}
                  setIsBusinessSignup={setIsBusinessSignup}
                />
              )}
                
              <div className={styles.formToggle}>
                <span>
                  Already have an account?{" "}
                  <button type="button" className={styles.toggleLink} onClick={toggleForms}>
                    Sign In
                  </button>
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.imageContainer}>
          <div className={styles.imageText}>
            <h1>Experience Paradise</h1>
            <p>Explore the pristine beaches and luxury accommodations of Turks and Caicos</p>
          </div>
        </div>
      </div>

      <CustomMessageBox {...messageBox} onClose={closeMessageBox} />
    </div>
  );
}