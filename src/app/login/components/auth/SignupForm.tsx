import React, { useState } from "react";
import styles from "@/app/login/login.module.css";
import { register } from "../services/authService";

export default function SignupForm({ 
  loading, 
  setLoading, 
  showMessage, 
  closeMessageBox,
  toggleForms 
}) {
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!signupName || !signupEmail || !signupPassword || !confirmPassword) {
      showMessage(
        'Missing Information',
        'Please fill in all fields to create your account.',
        'warning'
      );
      return;
    }
    
    if (signupPassword !== confirmPassword) {
      showMessage(
        'Password Mismatch',
        'Passwords do not match. Please check and try again.',
        'error'
      );
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register({
        name: signupName.trim(),
        email: signupEmail.toLowerCase().trim(),
        password: signupPassword.trim(),
        role: "user"
      });
      
      if (result.success) {
        showMessage(
          'Registration Successful! 🎉',
          result.message || 'Account created successfully! Please check your email for the verification link.',
          'success',
          {
            confirmText: 'Continue to Login',
            onConfirm: () => {
              toggleForms();
              closeMessageBox();
            }
          }
        );
      } else {
        showMessage(
          'Registration Failed',
          result.message || 'Registration failed. Please try again.',
          'error'
        );
      }
    } catch (error) {
      console.error("Signup error:", error);
      showMessage(
        'Registration Error',
        error.message || "An error occurred during signup.",
        'error'
      );
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.inputGroup}>
        <label htmlFor="signupName">Full Name</label>
        <input
          type="text"
          id="signupName"
          placeholder="Enter your full name"
          value={signupName}
          onChange={(e) => setSignupName(e.target.value)}
          required
        />
      </div>
      
      <div className={styles.inputGroup}>
        <label htmlFor="signupEmail">Email Address</label>
        <input
          type="email"
          id="signupEmail"
          placeholder="Enter your email"
          value={signupEmail}
          onChange={(e) => setSignupEmail(e.target.value)}
          required
        />
      </div>
      
      <div className={styles.inputGroup}>
        <label htmlFor="signupPassword">Password</label>
        <input
          type="password"
          id="signupPassword"
          placeholder="Create a password"
          value={signupPassword}
          onChange={(e) => setSignupPassword(e.target.value)}
          required
        />
      </div>
      
      <div className={styles.inputGroup}>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      
      <button
        type="submit"
        className={styles.submitButton}
        disabled={loading}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}