"use client";
import React, { useState } from "react";
import axios from "axios";
import styles from "./login.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faFacebookF, faApple } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";

// Custom Message Box Component
const CustomMessageBox = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  confirmText = 'OK',
  showCancel = false,
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={styles.messageBoxOverlay} onClick={onClose}>
      <div className={styles.messageBox} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.header} ${styles[type]}`}>
          <div className={styles.icon}>{getIcon()}</div>
          <h3 className={styles.title}>{title}</h3>
        </div>
        
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
        </div>
        
        <div className={styles.actions}>
          {showCancel && (
            <button 
              className={styles.cancelButton}
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          )}
          <button 
            className={`${styles.confirmButton} ${styles[type]}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function LuxuriousLoginPage() {
  // Toggle state: true = Login, false = Sign Up
  const [isLogin, setIsLogin] = useState(true);
  // Business signup toggle
  const [isBusinessSignup, setIsBusinessSignup] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Regular signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Business signup form state
  const [businessData, setBusinessData] = useState({
    // Personal info
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    confirmPassword: "",
    ownerPhone: "",
    
    // Business info
    businessName: "",
    businessType: "",
    businessLicense: "",
    businessPhone: "",
    businessDescription: "",
    businessWebsite: "",
    servicesOffered: [],
    
    // Address
    street: "",
    city: "",
    island: "",
    postalCode: ""
  });

  // Document upload state
  const [documents, setDocuments] = useState([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState("");

  // Loading state for button feedback
  const [loading, setLoading] = useState(false);

  // Custom Message Box state
  const [messageBox, setMessageBox] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    showCancel: false,
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null
  });

  // Business type options
  const businessTypes = [
    "restaurant",
    "hotel-resort", 
    "villa-rental",
    "airbnb-host",
    "tour-operator",
    "transportation-service",
    "retail-shop",
    "wellness-spa",
    "other"
  ];

  // Service options
  const serviceOptions = [
    "dining",
    "stays", 
    "activities",
    "transportation",
    "shopping",
    "wellness-spa"
  ];

  // Island options
  const islands = [
    "Providenciales",
    "Grand Turk",
    "North Caicos",
    "Middle Caicos", 
    "South Caicos",
    "Salt Cay"
  ];

  // Document type options
  const documentTypes = [
    { value: "business-license", label: "Business License" },
    { value: "government-id", label: "Government-issued ID" },
    { value: "passport", label: "Passport" },
    { value: "insurance-certificate", label: "Insurance Certificate" },
    { value: "professional-certification", label: "Professional Certification" },
    { value: "tax-registration", label: "Tax Registration" },
    { value: "bank-statement", label: "Bank Statement" },
    { value: "utility-bill", label: "Utility Bill (Address Proof)" },
    { value: "trade-certificate", label: "Trade Certificate" },
    { value: "health-permit", label: "Health Permit" },
    { value: "tourism-license", label: "Tourism License" },
    { value: "other", label: "Other Document" }
  ];

  // Helper function to show messages
  const showMessage = (title, message, type = 'info', options = {}) => {
    setMessageBox({
      isOpen: true,
      title,
      message,
      type,
      showCancel: options.showCancel || false,
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null
    });
  };

  const closeMessageBox = () => {
    setMessageBox(prev => ({ ...prev, isOpen: false }));
  };

  // Toggle between forms
  const toggleForms = () => {
    setIsLogin(!isLogin);
    setIsBusinessSignup(false); // Reset business signup when toggling
  };

  // Toggle business signup
  const toggleBusinessSignup = () => {
    setIsBusinessSignup(!isBusinessSignup);
  };

  // Handle business data changes
  const handleBusinessDataChange = (field, value) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle services selection
  const handleServiceToggle = (service) => {
    setBusinessData(prev => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter(s => s !== service)
        : [...prev.servicesOffered, service]
    }));
  };

  // Handle document upload
  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/jpg'];
    
    if (!selectedDocumentType) {
      showMessage(
        'Document Type Required',
        'Please select a document type before uploading.',
        'warning'
      );
      return;
    }
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        showMessage(
          'File Too Large',
          `File ${file.name} is too large. Maximum size is 10MB.`,
          'error'
        );
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        showMessage(
          'Invalid File Format',
          `File ${file.name} has invalid format. Only JPG, PNG, and PDF files are allowed.`,
          'error'
        );
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadingDocs(true);
    
    try {
      const uploadedDocs = [];
      
      for (const file of validFiles) {
        // Convert file to base64 for now (in production, use cloud storage)
        const base64 = await convertToBase64(file);
        
        const docData = {
          fileName: file.name,
          fileType: selectedDocumentType, // Use the selected document type
          fileSize: file.size,
          fileData: base64, // In production, this would be a URL
          uploadedAt: new Date().toISOString(),
          documentLabel: documentTypes.find(type => type.value === selectedDocumentType)?.label || selectedDocumentType
        };
        
        uploadedDocs.push(docData);
      }
      
      setDocuments(prev => [...prev, ...uploadedDocs]);
      // Reset the document type selection after successful upload
      setSelectedDocumentType("");
      // Clear the file input
      e.target.value = "";
    } catch (error) {
      showMessage(
        'Upload Error',
        'Error uploading documents. Please try again.',
        'error'
      );
      console.error('Upload error:', error);
    } finally {
      setUploadingDocs(false);
    }
  };

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Remove document
  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle Login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showMessage(
        'Missing Information',
        'Please fill in both email and password fields.',
        'warning'
      );
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        email: loginEmail.toLowerCase().trim(),
        password: loginPassword.trim(),
      }, { withCredentials: true });
  
      if (response.status === 200 && response.data) {
        const { token, user } = response.data;
        if (token) {
          localStorage.setItem("authToken", token);
          localStorage.setItem("user", JSON.stringify(user));
          
          showMessage(
            'Login Successful! 🎉',
            'Welcome back! Redirecting you to your dashboard...',
            'success',
            {
              confirmText: 'Continue',
              onConfirm: () => {
                // Route based on user role
                switch (user.role) {
                  case 'admin':
                    window.location.href = "/admin/dashboard";
                    break;
                  case 'business-manager':
                    if (user.businessProfile?.isApproved) {
                      window.location.href = "/vendor/dashboard";
                    } else {
                      window.location.href = "/vendor/pending-approval";
                    }
                    break;
                  case 'user':
                  default:
                    window.location.href = "/";
                    break;
                }
                closeMessageBox();
              }
            }
          );
        } else {
          showMessage(
            'Login Failed',
            'Authentication token is missing. Please try again.',
            'error'
          );
        }
      } else {
        showMessage(
          'Login Failed',
          response.data.message || 'Invalid login credentials.',
          'error'
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      showMessage(
        'Login Error',
        error.response?.data?.message || 'An error occurred during login. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Regular Signup form submission
  const handleSignupSubmit = async (e) => {
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
      const response = await axios.post("http://localhost:5000/api/users/register", {
        name: signupName.trim(),
        email: signupEmail.toLowerCase().trim(),
        password: signupPassword.trim(),
        role: "user"
      });
      
      if (response.status === 201 && response.data) {
        showMessage(
          'Registration Successful! 🎉',
          response.data.message || 'Account created successfully! Please check your email for the verification link.',
          'success',
          {
            confirmText: 'Continue to Login',
            onConfirm: () => {
              setIsLogin(true);
              closeMessageBox();
            }
          }
        );
      } else {
        showMessage(
          'Registration Failed',
          response.data.message || 'Registration failed. Please try again.',
          'error'
        );
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error.response?.data?.message || "An error occurred during signup.";
      showMessage(
        'Registration Error',
        errorMessage,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Business Signup form submission
  const handleBusinessSignupSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const required = [
      'ownerName', 'ownerEmail', 'ownerPassword', 'confirmPassword',
      'businessName', 'businessType', 'businessPhone', 'businessDescription',
      'street', 'city', 'island'
    ];
    
    for (let field of required) {
      if (!businessData[field]) {
        showMessage(
          'Missing Information',
          `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          'warning'
        );
        return;
      }
    }
    
    if (businessData.ownerPassword !== businessData.confirmPassword) {
      showMessage(
        'Password Mismatch',
        'Passwords do not match. Please check and try again.',
        'error'
      );
      return;
    }
    
    if (businessData.servicesOffered.length === 0) {
      showMessage(
        'Services Required',
        'Please select at least one service you offer.',
        'warning'
      );
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/users/register", {
        // Personal info
        name: businessData.ownerName.trim(),
        email: businessData.ownerEmail.toLowerCase().trim(),
        password: businessData.ownerPassword.trim(),
        phoneNumber: businessData.ownerPhone.trim(),
        role: "business-manager",
        
        // Business profile
        businessProfile: {
          businessName: businessData.businessName.trim(),
          businessType: businessData.businessType,
          businessLicense: businessData.businessLicense.trim(),
          businessAddress: {
            street: businessData.street.trim(),
            city: businessData.city.trim(),
            island: businessData.island,
            postalCode: businessData.postalCode.trim()
          },
          businessPhone: businessData.businessPhone.trim(),
          businessDescription: businessData.businessDescription.trim(),
          businessWebsite: businessData.businessWebsite.trim(),
          servicesOffered: businessData.servicesOffered,
          documents: documents,
          isApproved: false
        }
      });
      
      if (response.status === 201 && response.data) {
        showMessage(
          'Application Submitted Successfully! 🎉',
          'Your business application has been submitted and will be reviewed by our team within 24-48 hours. You will receive an email notification once approved.',
          'success',
          {
            confirmText: 'Continue to Login',
            onConfirm: () => {
              setIsLogin(true);
              setIsBusinessSignup(false);
              closeMessageBox();
            }
          }
        );
      } else {
        showMessage(
          'Registration Failed',
          response.data.message || 'Business registration failed. Please try again.',
          'error'
        );
      }
    } catch (error) {
      console.error("Business signup error:", error);
      const errorMessage = error.response?.data?.message || "An error occurred during business registration.";
      showMessage(
        'Registration Error',
        errorMessage,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Social login click handlers
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };
  
  const handleFacebookLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/facebook";
  };
  
  const handleAppleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/apple";
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
              {/* Account Type Selection */}
              <div className={styles.accountTypeSelector}>
                <h2 className={styles.formTitle}>Create Account</h2>
                <div className={styles.toggleButtons}>
                  <button
                    type="button"
                    className={`${styles.toggleButton} ${!isBusinessSignup ? styles.active : ''}`}
                    onClick={() => setIsBusinessSignup(false)}
                  >
                    Personal Account
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleButton} ${isBusinessSignup ? styles.active : ''}`}
                    onClick={() => setIsBusinessSignup(true)}
                  >
                    Business Account
                  </button>
                </div>
                <p className={styles.formSubtitle}>
                  {isBusinessSignup 
                    ? "Register your business to offer services on our platform"
                    : "Begin your journey of luxury experiences"
                  }
                </p>
              </div>

              {!isBusinessSignup ? (
                /* Regular User Signup */
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
                </form>
              ) : (
                /* Business Signup Form */
                <form onSubmit={handleBusinessSignupSubmit} className={styles.businessForm}>
                  {/* Owner Information */}
                  <div className={styles.sectionTitle}>Owner Information</div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label>Owner Name *</label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={businessData.ownerName}
                        onChange={(e) => handleBusinessDataChange('ownerName', e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        placeholder="Your phone number"
                        value={businessData.ownerPhone}
                        onChange={(e) => handleBusinessDataChange('ownerPhone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Email Address *</label>
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={businessData.ownerEmail}
                      onChange={(e) => handleBusinessDataChange('ownerEmail', e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label>Password *</label>
                      <input
                        type="password"
                        placeholder="Create a password"
                        value={businessData.ownerPassword}
                        onChange={(e) => handleBusinessDataChange('ownerPassword', e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Confirm Password *</label>
                      <input
                        type="password"
                        placeholder="Confirm password"
                        value={businessData.confirmPassword}
                        onChange={(e) => handleBusinessDataChange('confirmPassword', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className={styles.sectionTitle}>Business Information</div>
                  
                  <div className={styles.inputGroup}>
                    <label>Business Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Paradise Tours TC"
                      value={businessData.businessName}
                      onChange={(e) => handleBusinessDataChange('businessName', e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label>Business Type *</label>
                      <select
                        value={businessData.businessType}
                        onChange={(e) => handleBusinessDataChange('businessType', e.target.value)}
                        required
                      >
                        <option value="">Select business type</option>
                        {businessTypes.map(type => (
                          <option key={type} value={type}>
                            {type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Business Phone *</label>
                      <input
                        type="tel"
                        placeholder="Business phone number"
                        value={businessData.businessPhone}
                        onChange={(e) => handleBusinessDataChange('businessPhone', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Business License</label>
                    <input
                      type="text"
                      placeholder="Business license number (if applicable)"
                      value={businessData.businessLicense}
                      onChange={(e) => handleBusinessDataChange('businessLicense', e.target.value)}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Business Description *</label>
                    <textarea
                      placeholder="Describe your business and services..."
                      value={businessData.businessDescription}
                      onChange={(e) => handleBusinessDataChange('businessDescription', e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Website</label>
                    <input
                      type="url"
                      placeholder="https://yourbusiness.com"
                      value={businessData.businessWebsite}
                      onChange={(e) => handleBusinessDataChange('businessWebsite', e.target.value)}
                    />
                  </div>

                  {/* Services Offered */}
                  <div className={styles.inputGroup}>
                    <label>Services You Offer *</label>
                    <div className={styles.checkboxGroup}>
                      {serviceOptions.map(service => (
                        <label key={service} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={businessData.servicesOffered.includes(service)}
                            onChange={() => handleServiceToggle(service)}
                          />
                          <span>{service.charAt(0).toUpperCase() + service.slice(1)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Business Address */}
                  <div className={styles.sectionTitle}>Business Address</div>
                  
                  <div className={styles.inputGroup}>
                    <label>Street Address *</label>
                    <input
                      type="text"
                      placeholder="Street address"
                      value={businessData.street}
                      onChange={(e) => handleBusinessDataChange('street', e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label>City *</label>
                      <input
                        type="text"
                        placeholder="City"
                        value={businessData.city}
                        onChange={(e) => handleBusinessDataChange('city', e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Island *</label>
                      <select
                        value={businessData.island}
                        onChange={(e) => handleBusinessDataChange('island', e.target.value)}
                        required
                      >
                        <option value="">Select island</option>
                        {islands.map(island => (
                          <option key={island} value={island}>{island}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Postal Code</label>
                    <input
                      type="text"
                      placeholder="Postal code"
                      value={businessData.postalCode}
                      onChange={(e) => handleBusinessDataChange('postalCode', e.target.value)}
                    />
                  </div>

                  {/* Document Upload Section */}
                  <div className={styles.sectionTitle}>Supporting Documents</div>
                  
                  <div className={styles.documentUploadSection}>
                    <div className={styles.uploadInstructions}>
                      <p>Upload supporting documents for your business application (optional but recommended):</p>
                      <ul>
                        <li>Business License</li>
                        <li>Government-issued ID or Passport</li>
                        <li>Insurance Certificate</li>
                        <li>Professional Certifications</li>
                        <li>Tax Registration Documents</li>
                        <li>Any other relevant documents</li>
                      </ul>
                      <p className={styles.uploadLimits}>
                        <strong>Accepted formats:</strong> JPG, PNG, PDF | <strong>Max size:</strong> 10MB per file
                      </p>
                    </div>

                    {/* Document Type Selector */}
                    <div className={styles.documentTypeSelector}>
                      <label htmlFor="documentType">Document Type *</label>
                      <select
                        id="documentType"
                        value={selectedDocumentType}
                        onChange={(e) => setSelectedDocumentType(e.target.value)}
                        className={styles.documentTypeSelect}
                      >
                        <option value="">Select document type...</option>
                        {documentTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.fileUploadArea}>
                      <input
                        type="file"
                        id="documentUpload"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleDocumentUpload}
                        className={styles.fileInput}
                        disabled={!selectedDocumentType}
                      />
                      <label 
                        htmlFor="documentUpload" 
                        className={`${styles.fileUploadLabel} ${!selectedDocumentType ? styles.disabled : ''}`}
                      >
                        <div className={styles.uploadIcon}>📎</div>
                        <div>
                          <div className={styles.uploadText}>
                            {uploadingDocs ? 'Uploading...' : 
                             !selectedDocumentType ? 'Select document type first' :
                             'Choose Files or Drag & Drop'}
                          </div>
                          <div className={styles.uploadSubtext}>
                            JPG, PNG, PDF up to 10MB each
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Uploaded Documents List */}
                    {documents.length > 0 && (
                      <div className={styles.uploadedDocuments}>
                        <h4>Uploaded Documents ({documents.length})</h4>
                        {documents.map((doc, index) => (
                          <div key={index} className={styles.documentItem}>
                            <div className={styles.documentInfo}>
                              <div className={styles.documentIcon}>
                                {doc.fileName.toLowerCase().endsWith('.pdf') ? '📄' : '🖼️'}
                              </div>
                              <div className={styles.documentDetails}>
                                <div className={styles.documentName}>{doc.fileName}</div>
                                <div className={styles.documentMeta}>
                                  <span className={styles.documentType}>
                                    {doc.documentLabel}
                                  </span>
                                  <span className={styles.documentSize}>
                                    {formatFileSize(doc.fileSize)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className={styles.removeDocButton}
                              title="Remove document"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.businessNote}>
                    <p><strong>Note:</strong> Your business application will be reviewed by our team within 24-48 hours. You will receive an email notification once approved.</p>
                  </div>
                  
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading}
                  >
                    {loading ? "Submitting Application..." : "Submit Business Application"}
                  </button>
                </form>
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

      {/* Custom Message Box Component */}
      <CustomMessageBox
        isOpen={messageBox.isOpen}
        onClose={closeMessageBox}
        title={messageBox.title}
        message={messageBox.message}
        type={messageBox.type}
        showCancel={messageBox.showCancel}
        confirmText={messageBox.confirmText}
        cancelText={messageBox.cancelText}
        onConfirm={messageBox.onConfirm}
        onCancel={messageBox.onCancel}
      />
    </div>
  );
}