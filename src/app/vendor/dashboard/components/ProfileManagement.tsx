"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faBuilding, faPhone, faEnvelope, faGlobe,
  faMapMarkerAlt, faClock, faCalendar, faCreditCard,
  faSave, faEdit, faCheck, faTimes, faUpload, faShield,
  faBell, faKey, faTrash, faPlus, faEye, faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import styles from '../dashboard.module.css';

interface ProfileManagementProps {
  vendorData: any;
  onUpdate: () => void;
}

interface BusinessProfile {
  businessName: string;
  businessType: string;
  description: string;
  logo: string;
  coverImage: string;
  contactInfo: {
    phone: string;
    email: string;
    website: string;
    address: string;
    island: string;
  };
  businessHours: {
    [key: string]: {
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    };
  };
  paymentInfo: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    accountHolder: string;
  };
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    website: string;
  };
  settings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    bookingAutoConfirm: boolean;
    showPhoneNumber: boolean;
    allowReviews: boolean;
  };
}

export default function ProfileManagement({ vendorData, onUpdate }: ProfileManagementProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [profile, setProfile] = useState<BusinessProfile>({
    businessName: '',
    businessType: '',
    description: '',
    logo: '',
    coverImage: '',
    contactInfo: {
      phone: '',
      email: '',
      website: '',
      address: '',
      island: ''
    },
    businessHours: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      saturday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' }
    },
    paymentInfo: {
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      accountHolder: ''
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      website: ''
    },
    settings: {
      emailNotifications: true,
      smsNotifications: true,
      bookingAutoConfirm: false,
      showPhoneNumber: true,
      allowReviews: true
    }
  });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: faBuilding },
    { id: 'contact', label: 'Contact', icon: faPhone },
    { id: 'hours', label: 'Business Hours', icon: faClock },
    { id: 'payment', label: 'Payment Info', icon: faCreditCard },
    { id: 'social', label: 'Social Media', icon: faGlobe },
    { id: 'settings', label: 'Settings', icon: faShield },
    { id: 'security', label: 'Security', icon: faKey }
  ];

  const businessTypes = [
    'restaurant', 'hotel-resort', 'villa-rental', 'airbnb-host',
    'tour-operator', 'transportation-service', 'retail-shop', 'wellness-spa', 'other'
  ];

  const islands = [
    'Providenciales', 'Grand Turk', 'North Caicos',
    'Middle Caicos', 'South Caicos', 'Salt Cay'
  ];

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  };

const [showPaymentDetails, setShowPaymentDetails] = useState(false);
const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
const [verificationPassword, setVerificationPassword] = useState('');
const [isVerifying, setIsVerifying] = useState(false);
const [decryptedPaymentInfo, setDecryptedPaymentInfo] = useState({
  bankName: '',
  accountHolderName: '',
  accountNumber: '',
  routingNumber: ''
});
const verifyPasswordAndShowDetails = async () => {
  if (!verificationPassword) {
    alert('Please enter your password');
    return;
  }

  try {
    setIsVerifying(true);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/decrypted-payment-info`,
      { password: verificationPassword },
      { headers: getAuthHeaders() }
    );

    if (response.data.success) {
      setDecryptedPaymentInfo(response.data.paymentInfo);
      setShowPaymentDetails(true);
      setShowPasswordPrompt(false);
      setVerificationPassword('');
    } else {
      alert(response.data.message || 'Incorrect password');
    }
  } catch (error: any) {
    console.error('Password verification failed:', error);
    alert(error.response?.data?.message || 'Error verifying password');
  } finally {
    setIsVerifying(false);
  }
};

// Replace the togglePaymentDetails function with this:
const togglePaymentDetails = () => {
  if (!showPaymentDetails) {
    setShowPasswordPrompt(true);
  } else {
    setShowPaymentDetails(false);
    setShowPasswordPrompt(false);
    setVerificationPassword('');
    // Clear decrypted data when hiding
    setDecryptedPaymentInfo({
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      routingNumber: ''
    });
  }
};

// Add this helper function to determine if a field is encrypted (shows as masked)
const isFieldEncrypted = (value: string) => {
  return value && (value.includes('****') || value.length > 50); // Basic check for encrypted/masked data
};
useEffect(() => {
  if (vendorData?.businessProfile) {
    setProfile(prev => ({
      ...prev,
      businessName: vendorData.businessProfile.businessName || '',
      businessType: vendorData.businessProfile.businessType || '',
      description: vendorData.businessProfile.businessDescription || '',
      logo: vendorData.businessProfile.logo || '',
      coverImage: vendorData.businessProfile.coverImage || '',
      contactInfo: {
        phone: vendorData.businessProfile.businessPhone || '',
        email: vendorData.email || '',
        website: vendorData.businessProfile.businessWebsite || '',
        address: vendorData.businessProfile.businessAddress?.street || '',
        island: vendorData.businessProfile.businessAddress?.island || ''
      },
      businessHours: vendorData.businessProfile.businessHours || {
        monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
        tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
        wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
        thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
        friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
        saturday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
        sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' }
      },
      paymentInfo: vendorData.businessProfile.paymentInfo || {
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        accountHolderName: ''
      },
      socialMedia: vendorData.businessProfile.socialMedia || {
        facebook: '',
        instagram: '',
        twitter: '',
        website: ''
      },
      settings: vendorData.businessProfile.settings || {
        emailNotifications: true,
        smsNotifications: true,
        bookingAutoConfirm: false,
        showPhoneNumber: true,
        allowReviews: true
      }
    }));
  }
}, [vendorData]);


  const handleInputChange = (section: string, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof BusinessProfile],
        [field]: value
      }
    }));
  };

  const handleDirectChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHoursChange = (day: string, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'cover') => {
    try {
      if (type === 'logo') setUploadingLogo(true);
      else setUploadingCover(true);

      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/image`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (type === 'logo') {
        setProfile(prev => ({ ...prev, logo: response.data.url }));
      } else {
        setProfile(prev => ({ ...prev, coverImage: response.data.url }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingCover(false);
    }
  };

const handleSaveProfile = async () => {
  try {
    setSaving(true);

    // Prepare the profile data
    let profileToSave = { ...profile };

    // If payment details are currently shown (decrypted), use the decrypted values
    if (showPaymentDetails) {
      profileToSave.paymentInfo = {
        ...profile.paymentInfo,
        ...decryptedPaymentInfo
      };
    }

    await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/business-profile`,
      profileToSave,
      { headers: getAuthHeaders() }
    );

    alert('Profile updated successfully!');
    
    // Hide payment details after saving for security
    if (showPaymentDetails) {
      setShowPaymentDetails(false);
      setDecryptedPaymentInfo({
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        routingNumber: ''
      });
    }
    
    onUpdate();
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Error updating profile. Please try again.');
  } finally {
    setSaving(false);
  }
};

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long!');
      return;
    }

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: getAuthHeaders() }
      );

      alert('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.message || 'Error changing password. Please try again.');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className={styles.tabContent}>
            {/* Logo Upload */}
            <div className={styles.imageUploadSection}>
              <h4>Business Logo</h4>
              <div className={styles.logoUpload}>
                {profile.logo ? (
                  <div className={styles.logoPreview}>
                    <img src={profile.logo} alt="Business Logo" />
                    <button 
                      className={styles.changeLogoBtn}
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      Change Logo
                    </button>
                  </div>
                ) : (
                  <div 
                    className={styles.logoPlaceholder}
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    <FontAwesomeIcon icon={faUpload} />
                    <span>Upload Logo</span>
                  </div>
                )}
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
                />
                {uploadingLogo && <div className={styles.uploadingIndicator}>Uploading...</div>}
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className={styles.imageUploadSection}>
              <h4>Cover Image</h4>
              <div className={styles.coverUpload}>
                {profile.coverImage ? (
                  <div className={styles.coverPreview}>
                    <img src={profile.coverImage} alt="Cover Image" />
                    <button 
                      className={styles.changeCoverBtn}
                      onClick={() => document.getElementById('cover-upload')?.click()}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      Change Cover
                    </button>
                  </div>
                ) : (
                  <div 
                    className={styles.coverPlaceholder}
                    onClick={() => document.getElementById('cover-upload')?.click()}
                  >
                    <FontAwesomeIcon icon={faUpload} />
                    <span>Upload Cover Image</span>
                  </div>
                )}
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
                />
                {uploadingCover && <div className={styles.uploadingIndicator}>Uploading...</div>}
              </div>
            </div>

            {/* Basic Information */}
            <div className={styles.formGroup}>
              <label>Business Name *</label>
              <input
                type="text"
                value={profile.businessName}
                onChange={(e) => handleDirectChange('businessName', e.target.value)}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Business Type *</label>
              <select
                value={profile.businessType}
                onChange={(e) => handleDirectChange('businessType', e.target.value)}
                className={styles.formSelect}
              >
                <option value="">Select Business Type</option>
                {businessTypes.map(type => (
                  <option key={type} value={type}>
                    {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Business Description</label>
              <textarea
                value={profile.description}
                onChange={(e) => handleDirectChange('description', e.target.value)}
                className={styles.formTextarea}
                rows={5}
                placeholder="Describe your business, services, and what makes you unique..."
              />
            </div>

            {/* Verification Status */}
            <div className={styles.verificationStatus}>
              <h4>Verification Status</h4>
              <div className={styles.verificationInfo}>
                <div className={`${styles.statusBadge} ${vendorData?.businessProfile?.isApproved ? styles.verified : styles.pending}`}>
                  <FontAwesomeIcon icon={vendorData?.businessProfile?.isApproved ? faCheck : faClock} />
                  <span>{vendorData?.businessProfile?.isApproved ? 'Verified' : 'Pending Verification'}</span>
                </div>
                <p>
                  {vendorData?.businessProfile?.isApproved 
                    ? 'Your business has been verified and approved.'
                    : 'Your business verification is pending review. This usually takes 1-3 business days.'
                  }
                </p>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className={styles.tabContent}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={profile.contactInfo.phone}
                  onChange={(e) => handleInputChange('contactInfo', 'phone', e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email Address *</label>
                <input
                  type="email"
                  value={profile.contactInfo.email}
                  onChange={(e) => handleInputChange('contactInfo', 'email', e.target.value)}
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Website</label>
              <input
                type="url"
                value={profile.contactInfo.website}
                onChange={(e) => handleInputChange('contactInfo', 'website', e.target.value)}
                className={styles.formInput}
                placeholder="https://your-website.com"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Island *</label>
                <select
                  value={profile.contactInfo.island}
                  onChange={(e) => handleInputChange('contactInfo', 'island', e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Select Island</option>
                  {islands.map(island => (
                    <option key={island} value={island}>{island}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Address *</label>
                <input
                  type="text"
                  value={profile.contactInfo.address}
                  onChange={(e) => handleInputChange('contactInfo', 'address', e.target.value)}
                  className={styles.formInput}
                  placeholder="Street address"
                />
              </div>
            </div>
          </div>
        );

      case 'hours':
        return (
          <div className={styles.tabContent}>
            <h4>Business Operating Hours</h4>
            <p>Set your regular business hours. You can block specific dates in individual listings.</p>

            <div className={styles.businessHoursGrid}>
              {daysOfWeek.map(day => (
                <div key={day.key} className={styles.dayHours}>
                  <div className={styles.dayLabel}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={profile.businessHours[day.key]?.isOpen || false}
                        onChange={(e) => handleHoursChange(day.key, 'isOpen', e.target.checked)}
                      />
                      <span>{day.label}</span>
                    </label>
                  </div>

                  {profile.businessHours[day.key]?.isOpen && (
                    <div className={styles.timeInputs}>
                      <input
                        type="time"
                        value={profile.businessHours[day.key]?.openTime || '09:00'}
                        onChange={(e) => handleHoursChange(day.key, 'openTime', e.target.value)}
                        className={styles.timeInput}
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={profile.businessHours[day.key]?.closeTime || '17:00'}
                        onChange={(e) => handleHoursChange(day.key, 'closeTime', e.target.value)}
                        className={styles.timeInput}
                      />
                    </div>
                  )}

                  {!profile.businessHours[day.key]?.isOpen && (
                    <div className={styles.closedIndicator}>
                      <span>Closed</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.hoursActions}>
              <button
                type="button"
                onClick={() => {
                  const allOpen = { isOpen: true, openTime: '09:00', closeTime: '17:00' };
                  setProfile(prev => ({
                    ...prev,
                    businessHours: {
                      monday: allOpen,
                      tuesday: allOpen,
                      wednesday: allOpen,
                      thursday: allOpen,
                      friday: allOpen,
                      saturday: allOpen,
                      sunday: allOpen
                    }
                  }));
                }}
                className={styles.quickActionBtn}
              >
                Open All Days (9 AM - 5 PM)
              </button>

              <button
                type="button"
                onClick={() => {
                  const weekdayOpen = { isOpen: true, openTime: '09:00', closeTime: '17:00' };
                  const weekendClosed = { isOpen: false, openTime: '09:00', closeTime: '17:00' };
                  setProfile(prev => ({
                    ...prev,
                    businessHours: {
                      monday: weekdayOpen,
                      tuesday: weekdayOpen,
                      wednesday: weekdayOpen,
                      thursday: weekdayOpen,
                      friday: weekdayOpen,
                      saturday: weekendClosed,
                      sunday: weekendClosed
                    }
                  }));
                }}
                className={styles.quickActionBtn}
              >
                Weekdays Only
              </button>
            </div>
          </div>
        );

case 'payment':
  return (
    <div className={styles.tabContent}>
      <div className={styles.paymentNotice}>
        <FontAwesomeIcon icon={faShield} />
        <p>🔒 Your payment information is encrypted and secure. Account and routing numbers are masked for security.</p>
      </div>

      {/* Show/Hide Details Button */}
      <div className={styles.paymentDetailsToggle}>
        <button
          type="button"
          onClick={togglePaymentDetails}
          className={`${styles.toggleDetailsBtn} ${showPaymentDetails ? styles.hide : styles.show}`}
        >
          <FontAwesomeIcon icon={showPaymentDetails ? faEyeSlash : faEye} />
          {showPaymentDetails ? 'Hide Details' : 'Show Full Details'}
        </button>
      </div>

      {/* Password Verification Modal */}
      {showPasswordPrompt && (
        <div className={styles.passwordVerification}>
          <div className={styles.verificationBox}>
            <h4>Verify Your Identity</h4>
            <p>Enter your password to view and edit full banking details:</p>
            <div className={styles.passwordInputGroup}>
              <input
                type="password"
                value={verificationPassword}
                onChange={(e) => setVerificationPassword(e.target.value)}
                placeholder="Enter your password"
                className={styles.formInput}
                onKeyPress={(e) => e.key === 'Enter' && verifyPasswordAndShowDetails()}
              />
              <div className={styles.verificationButtons}>
                <button
                  type="button"
                  onClick={verifyPasswordAndShowDetails}
                  disabled={isVerifying || !verificationPassword}
                  className={styles.verifyBtn}
                >
                  {isVerifying ? (
                    <>
                      <div className={styles.spinner}></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} />
                      Verify & Show
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordPrompt(false);
                    setVerificationPassword('');
                  }}
                  className={styles.cancelBtn}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.formGroup}>
        <label>Bank Name *</label>
        <input
          type="text"
          value={showPaymentDetails ? decryptedPaymentInfo.bankName : (profile.paymentInfo.bankName || '')}
          onChange={(e) => {
            if (showPaymentDetails) {
              setDecryptedPaymentInfo(prev => ({ ...prev, bankName: e.target.value }));
            } else {
              handleInputChange('paymentInfo', 'bankName', e.target.value);
            }
          }}
          className={styles.formInput}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Account Holder Name *</label>
        <input
          type="text"
          value={showPaymentDetails ? decryptedPaymentInfo.accountHolderName : (profile.paymentInfo.accountHolderName || '')}
          onChange={(e) => {
            if (showPaymentDetails) {
              setDecryptedPaymentInfo(prev => ({ ...prev, accountHolderName: e.target.value }));
            } else {
              handleInputChange('paymentInfo', 'accountHolderName', e.target.value);
            }
          }}
          className={styles.formInput}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>
            Account Number *
            {!showPaymentDetails && profile.paymentInfo.accountNumber && 
              <small> (encrypted)</small>
            }
          </label>
          <input
            type="text"
            value={
              showPaymentDetails 
                ? decryptedPaymentInfo.accountNumber 
                : (profile.paymentInfo.accountNumber ? '••••••••••••••••' : '')
            }
            onChange={(e) => {
              if (showPaymentDetails) {
                setDecryptedPaymentInfo(prev => ({ ...prev, accountNumber: e.target.value }));
              }
            }}
            className={styles.formInput}
            placeholder={
              !showPaymentDetails && profile.paymentInfo.accountNumber
                ? "Click 'Show Full Details' to view and edit"
                : "Enter account number"
            }
            readOnly={!showPaymentDetails && !!profile.paymentInfo.accountNumber}
          />
          {!showPaymentDetails && profile.paymentInfo.accountNumber && (
            <small className={styles.maskedNotice}>
              🔒 Encrypted - Click "Show Full Details" to view and edit
            </small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>
            Routing Number *
            {!showPaymentDetails && profile.paymentInfo.routingNumber && 
              <small> (encrypted)</small>
            }
          </label>
          <input
            type="text"
            value={
              showPaymentDetails 
                ? decryptedPaymentInfo.routingNumber 
                : (profile.paymentInfo.routingNumber ? '•••••••••' : '')
            }
            onChange={(e) => {
              if (showPaymentDetails) {
                setDecryptedPaymentInfo(prev => ({ ...prev, routingNumber: e.target.value }));
              }
            }}
            className={styles.formInput}
            placeholder={
              !showPaymentDetails && profile.paymentInfo.routingNumber
                ? "Click 'Show Full Details' to view and edit"
                : "Enter routing number"
            }
            readOnly={!showPaymentDetails && !!profile.paymentInfo.routingNumber}
          />
          {!showPaymentDetails && profile.paymentInfo.routingNumber && (
            <small className={styles.maskedNotice}>
              🔒 Encrypted - Click "Show Full Details" to view and edit
            </small>
          )}
        </div>
      </div>

      {showPaymentDetails && (
        <div className={styles.securityWarning}>
          <FontAwesomeIcon icon={faShield} />
          <p>
            <strong>Security Notice:</strong> Full banking details are now visible and editable. 
            Make sure no one else can see your screen. Click "Hide Details" when finished.
          </p>
        </div>
      )}
    </div>
  );  return (
    <div className={styles.tabContent}>
      <div className={styles.paymentNotice}>
        <FontAwesomeIcon icon={faShield} />
        <p>🔒 Your payment information is encrypted and secure. Account and routing numbers are masked for security.</p>
      </div>

      {/* Show/Hide Details Button */}
      <div className={styles.paymentDetailsToggle}>
        <button
          type="button"
          onClick={togglePaymentDetails}
          className={`${styles.toggleDetailsBtn} ${showPaymentDetails ? styles.hide : styles.show}`}
        >
          <FontAwesomeIcon icon={showPaymentDetails ? faEyeSlash : faEye} />
          {showPaymentDetails ? 'Hide Details' : 'Show Full Details'}
        </button>
      </div>

      {/* Password Verification Modal */}
      {showPasswordPrompt && (
        <div className={styles.passwordVerification}>
          <div className={styles.verificationBox}>
            <h4>Verify Your Identity</h4>
            <p>Enter your password to view and edit full banking details:</p>
            <div className={styles.passwordInputGroup}>
              <input
                type="password"
                value={verificationPassword}
                onChange={(e) => setVerificationPassword(e.target.value)}
                placeholder="Enter your password"
                className={styles.formInput}
                onKeyPress={(e) => e.key === 'Enter' && verifyPasswordAndShowDetails()}
              />
              <div className={styles.verificationButtons}>
                <button
                  type="button"
                  onClick={verifyPasswordAndShowDetails}
                  disabled={isVerifying || !verificationPassword}
                  className={styles.verifyBtn}
                >
                  {isVerifying ? (
                    <>
                      <div className={styles.spinner}></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} />
                      Verify & Show
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordPrompt(false);
                    setVerificationPassword('');
                  }}
                  className={styles.cancelBtn}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.formGroup}>
        <label>Bank Name *</label>
        <input
          type="text"
          value={showPaymentDetails ? decryptedPaymentInfo.bankName : (profile.paymentInfo.bankName || '')}
          onChange={(e) => {
            if (showPaymentDetails) {
              setDecryptedPaymentInfo(prev => ({ ...prev, bankName: e.target.value }));
            } else {
              handleInputChange('paymentInfo', 'bankName', e.target.value);
            }
          }}
          className={styles.formInput}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Account Holder Name *</label>
        <input
          type="text"
          value={showPaymentDetails ? decryptedPaymentInfo.accountHolderName : (profile.paymentInfo.accountHolderName || '')}
          onChange={(e) => {
            if (showPaymentDetails) {
              setDecryptedPaymentInfo(prev => ({ ...prev, accountHolderName: e.target.value }));
            } else {
              handleInputChange('paymentInfo', 'accountHolderName', e.target.value);
            }
          }}
          className={styles.formInput}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>
            Account Number *
            {!showPaymentDetails && isFieldEncrypted(profile.paymentInfo.accountNumber) && 
              <small> (encrypted)</small>
            }
          </label>
          <input
            type="text"
            value={
              showPaymentDetails 
                ? decryptedPaymentInfo.accountNumber 
                : (isFieldEncrypted(profile.paymentInfo.accountNumber) ? '********' : (profile.paymentInfo.accountNumber || ''))
            }
            onChange={(e) => {
              if (showPaymentDetails) {
                setDecryptedPaymentInfo(prev => ({ ...prev, accountNumber: e.target.value }));
              }
              // Don't allow changes when not showing details
            }}
            className={styles.formInput}
            placeholder={
              !showPaymentDetails && isFieldEncrypted(profile.paymentInfo.accountNumber)
                ? "Click 'Show Full Details' to view and edit"
                : "Enter account number"
            }
            readOnly={!showPaymentDetails && isFieldEncrypted(profile.paymentInfo.accountNumber)}
          />
          {!showPaymentDetails && isFieldEncrypted(profile.paymentInfo.accountNumber) && (
            <small className={styles.maskedNotice}>
              🔒 Encrypted - Click "Show Full Details" to view and edit
            </small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>
            Routing Number *
            {!showPaymentDetails && isFieldEncrypted(profile.paymentInfo.routingNumber) && 
              <small> (encrypted)</small>
            }
          </label>
          <input
            type="text"
            value={
              showPaymentDetails 
                ? decryptedPaymentInfo.routingNumber 
                : (isFieldEncrypted(profile.paymentInfo.routingNumber) ? '********' : (profile.paymentInfo.routingNumber || ''))
            }
            onChange={(e) => {
              if (showPaymentDetails) {
                setDecryptedPaymentInfo(prev => ({ ...prev, routingNumber: e.target.value }));
              }
              // Don't allow changes when not showing details
            }}
            className={styles.formInput}
            placeholder={
              !showPaymentDetails && isFieldEncrypted(profile.paymentInfo.routingNumber)
                ? "Click 'Show Full Details' to view and edit"
                : "Enter routing number"
            }
            readOnly={!showPaymentDetails && isFieldEncrypted(profile.paymentInfo.routingNumber)}
          />
          {!showPaymentDetails && isFieldEncrypted(profile.paymentInfo.routingNumber) && (
            <small className={styles.maskedNotice}>
              🔒 Encrypted - Click "Show Full Details" to view and edit
            </small>
          )}
        </div>
      </div>

      {showPaymentDetails && (
        <div className={styles.securityWarning}>
          <FontAwesomeIcon icon={faShield} />
          <p>
            <strong>Security Notice:</strong> Full banking details are now visible and editable. 
            Make sure no one else can see your screen. Click "Hide Details" when finished.
          </p>
        </div>
      )}
    </div>
  );
      case 'social':
        return (
          <div className={styles.tabContent}>
            <h4>Social Media Profiles</h4>
            <p>Connect your social media accounts to increase visibility and credibility.</p>

            <div className={styles.formGroup}>
              <label>Facebook Page</label>
              <input
                type="url"
                value={profile.socialMedia.facebook}
                onChange={(e) => handleInputChange('socialMedia', 'facebook', e.target.value)}
                className={styles.formInput}
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Instagram Profile</label>
              <input
                type="url"
                value={profile.socialMedia.instagram}
                onChange={(e) => handleInputChange('socialMedia', 'instagram', e.target.value)}
                className={styles.formInput}
                placeholder="https://instagram.com/yourusername"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Twitter Profile</label>
              <input
                type="url"
                value={profile.socialMedia.twitter}
                onChange={(e) => handleInputChange('socialMedia', 'twitter', e.target.value)}
                className={styles.formInput}
                placeholder="https://twitter.com/yourusername"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Website</label>
              <input
                type="url"
                value={profile.socialMedia.website}
                onChange={(e) => handleInputChange('socialMedia', 'website', e.target.value)}
                className={styles.formInput}
                placeholder="https://your-website.com"
              />
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className={styles.tabContent}>
            <h4>Notification Preferences</h4>
            
            <div className={styles.settingsGroup}>
              <label className={styles.settingItem}>
                <input
                  type="checkbox"
                  checked={profile.settings.emailNotifications}
                  onChange={(e) => handleInputChange('settings', 'emailNotifications', e.target.checked)}
                />
                <div className={styles.settingContent}>
                  <h5>Email Notifications</h5>
                  <p>Receive booking confirmations, cancellations, and updates via email</p>
                </div>
              </label>

              <label className={styles.settingItem}>
                <input
                  type="checkbox"
                  checked={profile.settings.smsNotifications}
                  onChange={(e) => handleInputChange('settings', 'smsNotifications', e.target.checked)}
                />
                <div className={styles.settingContent}>
                  <h5>SMS Notifications</h5>
                  <p>Receive urgent booking notifications via text message</p>
                </div>
              </label>
            </div>

            <h4>Booking Settings</h4>

            <div className={styles.settingsGroup}>
              <label className={styles.settingItem}>
                <input
                  type="checkbox"
                  checked={profile.settings.bookingAutoConfirm}
                  onChange={(e) => handleInputChange('settings', 'bookingAutoConfirm', e.target.checked)}
                />
                <div className={styles.settingContent}>
                  <h5>Auto-Confirm Bookings</h5>
                  <p>Automatically confirm new bookings without manual review</p>
                </div>
              </label>

              <label className={styles.settingItem}>
                <input
                  type="checkbox"
                  checked={profile.settings.allowReviews}
                  onChange={(e) => handleInputChange('settings', 'allowReviews', e.target.checked)}
                />
                <div className={styles.settingContent}>
                  <h5>Allow Customer Reviews</h5>
                  <p>Let customers leave reviews and ratings for your services</p>
                </div>
              </label>
            </div>

            <h4>Privacy Settings</h4>

            <div className={styles.settingsGroup}>
              <label className={styles.settingItem}>
                <input
                  type="checkbox"
                  checked={profile.settings.showPhoneNumber}
                  onChange={(e) => handleInputChange('settings', 'showPhoneNumber', e.target.checked)}
                />
                <div className={styles.settingContent}>
                  <h5>Show Phone Number</h5>
                  <p>Display your phone number publicly on your listings</p>
                </div>
              </label>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className={styles.tabContent}>
            <h4>Change Password</h4>
            <p>Keep your account secure by using a strong password and updating it regularly.</p>

            <div className={styles.passwordForm}>
              <div className={styles.formGroup}>
                <label>Current Password *</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>New Password *</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className={styles.formInput}
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Confirm New Password *</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={styles.formInput}
                />
              </div>

              <button
                type="button"
                onClick={handlePasswordChange}
                className={styles.passwordChangeBtn}
                disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                <FontAwesomeIcon icon={faKey} />
                Change Password
              </button>
            </div>

            <div className={styles.securityTips}>
              <h5>Security Tips</h5>
              <ul>
                <li>Use a password that's at least 8 characters long</li>
                <li>Include uppercase and lowercase letters, numbers, and symbols</li>
                <li>Don't use personal information in your password</li>
                <li>Use a unique password that you don't use elsewhere</li>
                <li>Consider using a password manager</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.profileManagement}>
      {/* Header */}
      <div className={styles.profileHeader}>
        <div className={styles.headerInfo}>
          <h2>Profile Management</h2>
          <p>Manage your business profile, settings, and account information</p>
        </div>

        <button 
          onClick={handleSaveProfile}
          disabled={saving}
          className={styles.saveBtn}
        >
          {saving ? (
            <>
              <div className={styles.spinner}></div>
              Saving...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Profile Tabs */}
      <div className={styles.profileTabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <FontAwesomeIcon icon={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.profileContent}>
        {renderTabContent()}
      </div>
    </div>
  );
}