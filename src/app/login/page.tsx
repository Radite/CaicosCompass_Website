"use client";
import React, { useState } from "react";
import axios from "axios";
import styles from "./login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faFacebookF, faApple } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";

export default function LuxuriousLoginPage() {
  // Toggle state: true = Login, false = Sign Up
  const [isLogin, setIsLogin] = useState(true);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading state for button feedback
  const [loading, setLoading] = useState(false);

  // Toggle between forms
  const toggleForms = () => {
    setIsLogin(!isLogin);
  };

  // Handle Login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      alert("Please fill in both fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        email: loginEmail.toLowerCase().trim(),
        password: loginPassword.trim(),
      }, { withCredentials: true }); // Ensures cookies (refresh token) are sent
  
      if (response.status === 200 && response.data) {
        const { token } = response.data;
        if (token) {
          localStorage.setItem("authToken", token);
          alert("Login Successful!");
          window.location.href = "/";
        } else {
          console.error("Login failed: Token missing.");
          alert("Login Failed: Token missing.");
        }
      } else {
        console.error("Login Failed:", response.data.message);
        alert(response.data.message || "Invalid login credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup form submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }
    if (signupPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/users/register", {
        name: signupName.trim(),
        email: signupEmail.toLowerCase().trim(),
        password: signupPassword.trim(),
      });
      
      if (response.status === 201 && response.data) {
        alert(
          response.data.message ||
            "Registration Successful! Please check your email for the verification link."
        );
        setIsLogin(true);
      } else {
        alert(response.data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage =
        error.response?.data?.message || "An error occurred during signup.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Social login click handlers
  const handleGoogleLogin = () => {
    console.log("Google login clicked");
    // Integrate Google login
  };
  
  const handleFacebookLogin = () => {
    console.log("Facebook login clicked");
    // Integrate Facebook login
  };
  
  const handleAppleLogin = () => {
    console.log("Apple login clicked");
    // Integrate Apple login
  };

  return (
    <div className={styles.loginPage}>
      {/* Background overlay with luxury gradient */}
      <div className={styles.overlay}></div>
      
      <div className={styles.contentContainer}>
        <div className={styles.formContainer}>
          <div className={styles.brandLogo}>
            <span>CaicosCompass</span>
          </div>
          
          {isLogin ? (
            <div className={styles.formWrapper}>
              <h2 className={styles.formTitle}>Welcome Back</h2>
              <p className={styles.formSubtitle}>Sign in to continue your luxury travels</p>
              
              <form onSubmit={handleLoginSubmit}>
                <div className={styles.inputGroup}>
                  <label htmlFor="loginEmail">Email Address</label>
                  <input
                    type="email"
                    id="loginEmail"
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
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
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
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
                
                {/* Social Login Section */}
                <div className={styles.socialLogin}>
                  <p className={styles.socialText}>Or continue with</p>
                  <div className={styles.socialButtons}>
                    <button type="button" className={styles.socialBtn} onClick={handleGoogleLogin}>
                      <FontAwesomeIcon icon={faGoogle} />
                    </button>
                    <button type="button" className={styles.socialBtn} onClick={handleFacebookLogin}>
                      <FontAwesomeIcon icon={faFacebookF} />
                    </button>
                    <button type="button" className={styles.socialBtn} onClick={handleAppleLogin}>
                      <FontAwesomeIcon icon={faApple} />
                    </button>
                  </div>
                </div>
                
                <div className={styles.formToggle}>
                  <span>
                    Don't have an account?{" "}
                    <button type="button" className={styles.toggleLink} onClick={toggleForms}>
                      Register
                    </button>
                  </span>
                </div>
              </form>
            </div>
          ) : (
            <div className={styles.formWrapper}>
              <h2 className={styles.formTitle}>Create Account</h2>
              <p className={styles.formSubtitle}>Begin your journey of luxury experiences</p>
              
              <form onSubmit={handleSignupSubmit}>
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
                
                <div className={styles.formToggle}>
                  <span>
                    Already have an account?{" "}
                    <button type="button" className={styles.toggleLink} onClick={toggleForms}>
                      Sign In
                    </button>
                  </span>
                </div>
              </form>
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
    </div>
  );
}