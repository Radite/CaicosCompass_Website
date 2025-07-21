import React, { useState } from "react";
import styles from "@/app/login/login.module.css";
import SocialLoginButtons from "./SocialLoginButtons";
import { login } from "../services/authService";

export default function LoginForm({ 
  loading, 
  setLoading, 
  showMessage, 
  closeMessageBox,
  toggleForms 
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!email || !password) {
    showMessage(
      'Missing Information',
      'Please fill in both email and password fields.',
      'warning'
    );
    return;
  }
  
  setLoading(true);
  
  try {
    const result = await login({
      email: email.toLowerCase().trim(),
      password: password.trim()
    });
    
    if (result.success) {
      window.location.href = result.redirectUrl;
      return;
    } else {
      showMessage(
        'Login Failed',
        result.message || 'Invalid login credentials.',
        'error'
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    showMessage(
      'Login Error',
      error.message || 'An error occurred during login. Please try again.',
      'error'
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.inputGroup}>
        <label htmlFor="loginEmail">Email Address</label>
        <input
          type="email"
          id="loginEmail"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className={styles.inputGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="loginPassword">Password</label>
          <a href="#" className={styles.forgotPassword}>Forgot Password?</a>
        </div>
        <input
          type="password"
          id="loginPassword"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <button
        type="submit"
        className={styles.submitButton}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
      
      <SocialLoginButtons />
      
      <div className={styles.formToggle}>
        <span>
          Don't have an account?{" "}
          <button type="button" className={styles.toggleLink} onClick={toggleForms}>
            Register
          </button>
        </span>
      </div>
    </form>
  );
}