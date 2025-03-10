"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./profile.module.css";

// Interface matching your user model structure
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  role: string;
  travelPreferences?: {
    style: string[];
    preferredDestinations: string[];
    activities: string[];
    transportation: string;
  };
  accommodationPreferences?: {
    type: string;
    amenities: string[];
    location: string;
    accommodationFor: string[];
    numberOfKids: number;
  };
  foodPreferences?: {
    cuisines: string[];
    diningStyle: string;
  };
  mustDoActivities?: string[];
  privacySettings?: {
    profileVisibility: string;
    shareActivity: boolean;
  };
  loyaltyPoints: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
  
    axios
      .get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setUser(res.data); // Updated to use res.data directly instead of res.data.user
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load profile.");
        setLoading(false);
      });
  }, []);
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getActionLabel = (value?: string | string[] | boolean) => {
    if (Array.isArray(value)) {
      return value.length > 0 ? "Edit" : "Add";
    }
    return value ? "Edit" : "Add";
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
                    {user?.loyaltyPoints !== undefined && (
                      <div className={styles.loyaltyPoints}>
                        <span className={styles.loyaltyIcon}>
                          <i className="fas fa-award"></i>
                        </span>
                        <span className={styles.loyaltyValue}>
                          {user.loyaltyPoints} Loyalty Points
                        </span>
                      </div>
                    )}
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
            {/* Left Sidebar Navigation */}
            <div className="col-lg-3">
              <div className={styles.profileNav}>
                <ul className={styles.navList}>
                  <li 
                    className={`${styles.navItem} ${activeTab === "personal" ? styles.active : ""}`}
                    onClick={() => setActiveTab("personal")}
                  >
                    <span className={styles.navIcon}>
                      <i className="fas fa-user"></i>
                    </span>
                    <span className={styles.navText}>Personal Information</span>
                  </li>
                  <li 
                    className={`${styles.navItem} ${activeTab === "travel" ? styles.active : ""}`}
                    onClick={() => setActiveTab("travel")}
                  >
                    <span className={styles.navIcon}>
                      <i className="fas fa-plane"></i>
                    </span>
                    <span className={styles.navText}>Travel Preferences</span>
                  </li>
                  <li 
                    className={`${styles.navItem} ${activeTab === "accommodation" ? styles.active : ""}`}
                    onClick={() => setActiveTab("accommodation")}
                  >
                    <span className={styles.navIcon}>
                      <i className="fas fa-bed"></i>
                    </span>
                    <span className={styles.navText}>Accommodation</span>
                  </li>
                  <li 
                    className={`${styles.navItem} ${activeTab === "dining" ? styles.active : ""}`}
                    onClick={() => setActiveTab("dining")}
                  >
                    <span className={styles.navIcon}>
                      <i className="fas fa-utensils"></i>
                    </span>
                    <span className={styles.navText}>Dining Preferences</span>
                  </li>
                  <li 
                    className={`${styles.navItem} ${activeTab === "activities" ? styles.active : ""}`}
                    onClick={() => setActiveTab("activities")}
                  >
                    <span className={styles.navIcon}>
                      <i className="fas fa-hiking"></i>
                    </span>
                    <span className={styles.navText}>Activities</span>
                  </li>
                  <li 
                    className={`${styles.navItem} ${activeTab === "payment" ? styles.active : ""}`}
                    onClick={() => setActiveTab("payment")}
                  >
                    <span className={styles.navIcon}>
                      <i className="fas fa-credit-card"></i>
                    </span>
                    <span className={styles.navText}>Payment Methods</span>
                  </li>
                  <li 
                    className={`${styles.navItem} ${activeTab === "security" ? styles.active : ""}`}
                    onClick={() => setActiveTab("security")}
                  >
                    <span className={styles.navIcon}>
                      <i className="fas fa-shield-alt"></i>
                    </span>
                    <span className={styles.navText}>Security</span>
                  </li>
                  <li 
                    className={`${styles.navItem} ${activeTab === "privacy" ? styles.active : ""}`}
                    onClick={() => setActiveTab("privacy")}
                  >
                    <span className={styles.navIcon}>
                      <i className="fas fa-lock"></i>
                    </span>
                    <span className={styles.navText}>Privacy</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Content Panel */}
            <div className="col-lg-9">
              <div className={styles.profileContentCard}>
                {/* Personal Information Tab */}
                {activeTab === "personal" && (
                  <div>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Personal Information</h3>
                      <p className={styles.sectionDescription}>
                        Manage and edit your personal details
                      </p>
                    </div>

                    <div className={styles.profileInfoList}>
                      <div className={styles.profileInfoItem}>
                        <div className="infoContent">
                          <div className={styles.infoIcon}>
                            <i className="fas fa-user"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <h4 className={styles.infoLabel}>Full Name</h4>
                            <p className={styles.infoValue}>{user?.name || "Not provided"}</p>
                          </div>
                        </div>
                        <a href="#" className={styles.editButton}>
                          {getActionLabel(user?.name)}
                        </a>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className="infoContent">
                          <div className={styles.infoIcon}>
                            <i className="fas fa-envelope"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <h4 className={styles.infoLabel}>Email Address</h4>
                            <p className={styles.infoValue}>{user?.email || "Not provided"}</p>
                          </div>
                        </div>
                        <a href="#" className={styles.editButton}>
                          {getActionLabel(user?.email)}
                        </a>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className="infoContent">
                          <div className={styles.infoIcon}>
                            <i className="fas fa-phone"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <h4 className={styles.infoLabel}>Phone Number</h4>
                            <p className={styles.infoValue}>{user?.phoneNumber || "Not provided"}</p>
                          </div>
                        </div>
                        <a href="#" className={styles.editButton}>
                          {getActionLabel(user?.phoneNumber)}
                        </a>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className="infoContent">
                          <div className={styles.infoIcon}>
                            <i className="fas fa-birthday-cake"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <h4 className={styles.infoLabel}>Date of Birth</h4>
                            <p className={styles.infoValue}>{user?.dateOfBirth || "Not provided"}</p>
                          </div>
                        </div>
                        <a href="#" className={styles.editButton}>
                          {getActionLabel(user?.dateOfBirth)}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Travel Preferences Tab */}
                {activeTab === "travel" && (
                  <div>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Travel Preferences</h3>
                      <p className={styles.sectionDescription}>
                        Customize your travel experience
                      </p>
                    </div>

                    <div className={styles.profileInfoList}>
                      <div className={styles.profileInfoItem}>
                        <div className="infoContent">
                          <div className={styles.infoIcon}>
                            <i className="fas fa-star"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <h4 className={styles.infoLabel}>Travel Style</h4>
                            <p className={styles.infoValue}>
                              {user?.travelPreferences?.style?.length 
                                ? user.travelPreferences.style.join(", ") 
                                : "Not specified"}
                            </p>
                          </div>
                        </div>
                        <a href="#" className={styles.editButton}>
                          {getActionLabel(user?.travelPreferences?.style)}
                        </a>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className="infoContent">
                          <div className={styles.infoIcon}>
                            <i className="fas fa-map-marker-alt"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <h4 className={styles.infoLabel}>Preferred Destinations</h4>
                            <p className={styles.infoValue}>
                              {user?.travelPreferences?.preferredDestinations?.length 
                                ? user.travelPreferences.preferredDestinations.join(", ") 
                                : "Not specified"}
                            </p>
                          </div>
                        </div>
                        <a href="#" className={styles.editButton}>
                          {getActionLabel(user?.travelPreferences?.preferredDestinations)}
                        </a>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className="infoContent">
                          <div className={styles.infoIcon}>
                            <i className="fas fa-car"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <h4 className={styles.infoLabel}>Preferred Transportation</h4>
                            <p className={styles.infoValue}>
                              {user?.travelPreferences?.transportation || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <a href="#" className={styles.editButton}>
                          {getActionLabel(user?.travelPreferences?.transportation)}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Accommodation Tab */}
                {activeTab === "accommodation" && (
                  <div>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Accommodation Preferences</h3>
                      <p className={styles.sectionDescription}>
                        Set your accommodation preferences for better recommendations
                      </p>
                    </div>

                    <div className={styles.profileInfoList}>
                      <div className={styles.profileInfoItem}>
                        <div className="infoContent">
                          <div className={styles.infoIcon}>
                            <i className="fas fa-building"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <h4 className={styles.infoLabel}>Accommodation Type</h4>
                            <p className={styles.infoValue}>
                              {user?.accommodationPreferences?.type || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <a href="#" className={styles.editButton}>
                          {getActionLabel(user?.accommodationPreferences?.type)}
                        </a>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className="infoContent">
                          <div className={styles.infoIcon}>
                            <i className="fas fa-map-pin"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <h4 className={styles.infoLabel}>Preferred Location</h4>
                            <p className={styles.infoValue}>
                              {user?.accommodationPreferences?.location || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <a href="#" className={styles.editButton}>
                          {getActionLabel(user?.accommodationPreferences?.location)}
                        </a>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className="infoContent">
                          <div className={styles.infoIcon}>
                            <i className="fas fa-users"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <h4 className={styles.infoLabel}>Traveling With</h4>
                            <p className={styles.infoValue}>
                              {user?.accommodationPreferences?.accommodationFor?.length 
                                ? user.accommodationPreferences.accommodationFor.join(", ") 
                                : "Not specified"}
                            </p>
                          </div>
                        </div>
                        <a href="#" className={styles.editButton}>
                          {getActionLabel(user?.accommodationPreferences?.accommodationFor)}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dining Preferences Tab */}
                {activeTab === "dining" && (
                  <div>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Dining Preferences</h3>
                      <p className={styles.sectionDescription}>
                        Set your culinary preferences
                      </p>
                    </div>

                    <div className={styles.profileInfoList}>
                      <div className={styles.profileInfoItem}>
                        <div className="infoContent">
                          <div className={styles.infoIcon}>
                            <i className="fas fa-utensils"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <h4 className={styles.infoLabel}>Preferred Cuisines</h4>
                            <p className={styles.infoValue}>
                              {user?.foodPreferences?.cuisines?.length 
                                ? user.foodPreferences.cuisines.join(", ") 
                                : "Not specified"}
                            </p>
                          </div>
                        </div>
                        <a href="#" className={styles.editButton}>
                          {getActionLabel(user?.foodPreferences?.cuisines)}
                        </a>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className="infoContent">
                          <div className={styles.infoIcon}>
                            <i className="fas fa-concierge-bell"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <h4 className={styles.infoLabel}>Dining Style</h4>
                            <p className={styles.infoValue}>
                              {user?.foodPreferences?.diningStyle || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <a href="#" className={styles.editButton}>
                          {getActionLabel(user?.foodPreferences?.diningStyle)}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activities Tab */}
                {activeTab === "activities" && (
                  <div>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Activities Preferences</h3>
                      <p className={styles.sectionDescription}>
                        Your favorite activities and must-do experiences
                      </p>
                    </div>

                    <div className={styles.profileInfoList}>
                      <div className={styles.profileInfoItem}>
                        <div className="infoContent">
                          <div className={styles.infoIcon}>
                            <i className="fas fa-hiking"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <h4 className={styles.infoLabel}>Preferred Activities</h4>
                            <p className={styles.infoValue}>
                              {user?.travelPreferences?.activities?.length 
                                ? user.travelPreferences.activities.join(", ") 
                                : "Not specified"}
                            </p>
                          </div>
                        </div>
                        <a href="#" className={styles.editButton}>
                          {getActionLabel(user?.travelPreferences?.activities)}
                        </a>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className="infoContent">
                          <div className={styles.infoIcon}>
                            <i className="fas fa-clipboard-list"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <h4 className={styles.infoLabel}>Must-Do Activities</h4>
                            <p className={styles.infoValue}>
                              {user?.mustDoActivities?.length 
                                ? user.mustDoActivities.join(", ") 
                                : "Not specified"}
                            </p>
                          </div>
                        </div>
                        <a href="#" className={styles.editButton}>
                          {getActionLabel(user?.mustDoActivities)}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === "privacy" && (
                  <div>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Privacy Settings</h3>
                      <p className={styles.sectionDescription}>
                        Manage your privacy and data sharing preferences
                      </p>
                    </div>

                    <div className={styles.profileInfoList}>
                      <div className={styles.profileInfoItem}>
                        <div className="infoContent">
                          <div className={styles.infoIcon}>
                            <i className="fas fa-eye"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <h4 className={styles.infoLabel}>Profile Visibility</h4>
                            <p className={styles.infoValue}>
                              {user?.privacySettings?.profileVisibility || "Public"}
                            </p>
                          </div>
                        </div>
                        <a href="#" className={styles.editButton}>
                          {getActionLabel(user?.privacySettings?.profileVisibility)}
                        </a>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className="infoContent">
                          <div className={styles.infoIcon}>
                            <i className="fas fa-share-alt"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <h4 className={styles.infoLabel}>Activity Sharing</h4>
                            <p className={styles.infoValue}>
                              {user?.privacySettings?.shareActivity ? "Enabled" : "Disabled"}
                            </p>
                          </div>
                        </div>
                        <a href="#" className={styles.editButton}>
                          Edit
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other tabs would be implemented similarly */}
                {(activeTab === "payment" || activeTab === "security") && (
                  <div className={styles.comingSoonContainer}>
                    <div className={styles.comingSoonIcon}>
                      <i className="fas fa-clock"></i>
                    </div>
                    <h3 className={styles.comingSoonTitle}>Coming Soon</h3>
                    <p className={styles.comingSoonText}>
                      We're working hard to bring you this feature. Please check back later.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}