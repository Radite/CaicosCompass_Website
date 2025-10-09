// src/app/profile/page.tsx - Main Profile Page (Refactored)
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./profile.module.css";
import { UserProfile } from "./types";
import { EditModal } from "./components/EditModal";
import { PersonalInfoSection, PersonalInfoForm } from "./sections/PersonalInfoSection";
import { TravelPreferencesSection, TravelPreferencesForm } from "./sections/TravelPreferencesSection";
import { AccommodationSection, AccommodationForm } from "./sections/AccommodationSection";
import { GroupDetailsSection, GroupDetailsForm } from "./sections/GroupDetailsSection";
import { BudgetSection, BudgetForm } from "./sections/BudgetSection";
import { FoodPreferencesSection, FoodPreferencesForm, MustDoActivitiesForm } from "./sections/FoodPreferencesSection";
import { PrivacySection, PrivacySettingsForm } from "./sections/PrivacySection";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load profile.");
        setLoading(false);
      });
  }, []);

  const calculateProfileCompletion = () => {
    if (!user) return 0;
    
    let totalPoints = 0;
    let earnedPoints = 0;
    
    // Personal Information (15 points)
    totalPoints += 15;
    if (user.name) earnedPoints += 3;
    if (user.email) earnedPoints += 3;
    if (user.phoneNumber) earnedPoints += 3;
    if (user.dateOfBirth) earnedPoints += 3;
    if (user.profilePicture) earnedPoints += 3;
    
    // Travel Preferences (20 points)
    totalPoints += 20;
    if (user.travelPreferences?.style?.length) earnedPoints += 5;
    if (user.travelPreferences?.preferredDestinations?.length) earnedPoints += 5;
    if (user.travelPreferences?.activities?.length) earnedPoints += 5;
    if (user.travelPreferences?.transportation) earnedPoints += 5;
    
    // Accommodation Preferences (15 points)
    totalPoints += 15;
    if (user.accommodationPreferences?.type) earnedPoints += 5;
    if (user.accommodationPreferences?.location) earnedPoints += 5;
    if (user.accommodationPreferences?.accommodationFor?.length) earnedPoints += 5;
    
    // Group Details (15 points)
    totalPoints += 15;
    if (user.groupDetails?.adults && user.groupDetails.adults > 0) earnedPoints += 3;
    if (user.groupDetails?.children !== undefined && user.groupDetails.children >= 0) earnedPoints += 3;
    if (user.groupDetails?.pets !== undefined) earnedPoints += 3;
    if (user.groupDetails?.accessibilityNeeds?.length) earnedPoints += 3;
    if (user.groupDetails?.dietaryRestrictions?.length) earnedPoints += 3;
    
    // Budget (10 points)
    totalPoints += 10;
    if (user.budget?.total && user.budget.total > 0) earnedPoints += 5;
    const allocation = user.budget?.allocation;
    if (allocation) {
      const total = (allocation.accommodation || 0) + (allocation.food || 0) + 
                    (allocation.activities || 0) + (allocation.transportation || 0);
      if (total === 100) earnedPoints += 5;
    }
    
    // Food Preferences (10 points)
    totalPoints += 10;
    if (user.foodPreferences?.cuisines?.length) earnedPoints += 5;
    if (user.foodPreferences?.diningStyle) earnedPoints += 5;
    
    // Activities & Additional Info (10 points)
    totalPoints += 10;
    if (user.mustDoActivities?.length) earnedPoints += 5;
    if (user.fitnessLevel) earnedPoints += 5;
    
    // Privacy Settings (5 points)
    totalPoints += 5;
    if (user.privacySettings?.profileVisibility) earnedPoints += 2.5;
    if (user.privacySettings?.shareActivity !== undefined) earnedPoints += 2.5;
    
    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const handleEditClick = (section: string, currentData: any) => {
    setFormData(currentData || {});
    setActiveModal(section);
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("authToken");
    
    try {
      let dataToSend;
      
      if (activeModal === 'budget') {
        dataToSend = {
          budget: {
            total: formData.total,
            allocation: formData.allocation
          }
        };
      } else {
        dataToSend = formData;
      }
      
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/me`,
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setUser(response.data.user || response.data);
      setActiveModal(null);
      setFormData({});
      
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const renderForm = () => {
    const formProps = {
      user,
      formData,
      setFormData,
      onSave: handleSave,
      onCancel: () => setActiveModal(null),
      saving,
      styles
    };

    switch (activeModal) {
      case 'personal':
        return <PersonalInfoForm {...formProps} />;
      case 'travelPreferences':
        return <TravelPreferencesForm {...formProps} />;
      case 'accommodationPreferences':
        return <AccommodationForm {...formProps} />;
      case 'groupDetails':
        return <GroupDetailsForm {...formProps} />;
      case 'budget':
        return <BudgetForm {...formProps} />;
      case 'foodPreferences':
        return <FoodPreferencesForm {...formProps} />;
      case 'mustDoActivities':
        return <MustDoActivitiesForm {...formProps} />;
      case 'privacySettings':
        return <PrivacySettingsForm {...formProps} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className={`${styles.alert} ${styles.alertDanger}`}>{error}</div>
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion();
  const sectionProps = { user, onEdit: handleEditClick, styles };

  return (
    <div className={styles.profileContainer}>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <div className={styles.profileHeaderContent}>
                <h1 className={styles.profileTitle}>My Profile</h1>
                <p className={styles.profileSubtitle}>
                  Personalize your experience and manage your travel preferences
                </p>
              </div>
            </div>
            <div className="col-lg-5">
              <div className={styles.profileHeaderCard}>
                <div className="row align-items-center">
                  <div className="col-auto">
                    <div className={styles.profileAvatar}>
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className={styles.profileImage}
                        />
                      ) : (
                        <span>{user?.name ? getInitials(user.name) : "U"}</span>
                      )}
                    </div>
                  </div>
                  <div className="col">
                    <h2 className={styles.profileName}>
                      {user?.name || "Welcome Back"}
                    </h2>
                    <p className={styles.profileMeta}>
                      {user?.role === "business-manager"
                        ? "Business Manager"
                        : user?.role === "admin"
                        ? "Administrator"
                        : "Traveler"}
                    </p>
                    <div className={styles.loyaltyPoints}>
                      <i className={`fas fa-star ${styles.loyaltyIcon}`}></i>
                      <span className={styles.loyaltyValue}>
                        {user?.loyaltyPoints || 0} points
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.completionContainer}>
                  <div className={styles.completionHeader}>
                    <span className={styles.completionTitle}>Profile Completion</span>
                    <span className={styles.completionPercentage}>{profileCompletion}%</span>
                  </div>
                  <div className={styles.completionBar}>
                    <div 
                      className={styles.completionProgress}
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className={styles.profileContent}>
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <div className={styles.profileNav}>
                <ul className={styles.navList}>
                  {[
                    { id: 'personal', icon: 'fa-user', label: 'Personal Info' },
                    { id: 'preferences', icon: 'fa-heart', label: 'Travel Preferences' },
                    { id: 'accommodation', icon: 'fa-bed', label: 'Accommodation' },
                    { id: 'group', icon: 'fa-users', label: 'Group Details' },
                    { id: 'budget', icon: 'fa-dollar-sign', label: 'Budget' },
                    { id: 'food', icon: 'fa-utensils', label: 'Food Preferences' },
                    { id: 'privacy', icon: 'fa-shield-alt', label: 'Privacy Settings' },
                  ].map((tab) => (
                    <li
                      key={tab.id}
                      className={`${styles.navItem} ${activeTab === tab.id ? styles.active : ""}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <i className={`fas ${tab.icon} ${styles.navIcon}`}></i>
                      <span className={styles.navText}>{tab.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-lg-9">
              <div className={styles.profileContentCard}>
                {activeTab === "personal" && <PersonalInfoSection {...sectionProps} />}
                {activeTab === "preferences" && <TravelPreferencesSection {...sectionProps} />}
                {activeTab === "accommodation" && <AccommodationSection {...sectionProps} />}
                {activeTab === "group" && <GroupDetailsSection {...sectionProps} />}
                {activeTab === "budget" && <BudgetSection {...sectionProps} />}
                {activeTab === "food" && <FoodPreferencesSection {...sectionProps} />}
                {activeTab === "privacy" && <PrivacySection {...sectionProps} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <EditModal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        title={`Edit ${activeModal?.replace(/([A-Z])/g, ' $1').trim()}`}
      >
        {renderForm()}
      </EditModal>
    </div>
  );
}