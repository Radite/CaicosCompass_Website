// src/app/profile/page.tsx - Complete Profile Page
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./profile.module.css";

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

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.modalCloseBtn} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
};

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
    
    const fields = [
      user.name,
      user.email,
      user.phoneNumber,
      user.dateOfBirth,
      user.travelPreferences?.style?.length,
      user.accommodationPreferences?.type,
      user.foodPreferences?.cuisines?.length,
      user.mustDoActivities?.length
    ];
    
    const completedFields = fields.filter(field => 
      field && (Array.isArray(field) ? field.length > 0 : true)
    ).length;
    
    return Math.round((completedFields / fields.length) * 100);
  };

  const handleEditClick = (section: string, currentData: any) => {
    setFormData(currentData || {});
    setActiveModal(section);
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("authToken");
    
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/me`,
        { [activeModal as string]: formData },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setUser(response.data);
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

  const renderPersonalInfoForm = () => (
    <div>
      <div className="mb-3">
        <label className="form-label">Full Name</label>
        <input
          type="text"
          className="form-control"
          value={formData.name || user?.name || ''}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Phone Number</label>
        <input
          type="tel"
          className="form-control"
          value={formData.phoneNumber || user?.phoneNumber || ''}
          onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Date of Birth</label>
        <input
          type="date"
          className="form-control"
          value={formData.dateOfBirth || user?.dateOfBirth || ''}
          onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
        />
      </div>
      <div className={styles.modalFooter}>
        <button className={styles.btnSecondary} onClick={() => setActiveModal(null)}>
          Cancel
        </button>
        <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderTravelPreferencesForm = () => (
    <div>
      <div className="mb-3">
        <label className="form-label">Travel Style</label>
        <select 
          multiple 
          className="form-control"
          value={formData.style || user?.travelPreferences?.style || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            setFormData({...formData, style: values});
          }}
        >
          <option value="adventure">Adventure</option>
          <option value="relaxation">Relaxation</option>
          <option value="cultural">Cultural</option>
          <option value="luxury">Luxury</option>
          <option value="budget">Budget</option>
          <option value="family">Family</option>
        </select>
        <small className="text-muted">Hold Ctrl/Cmd to select multiple</small>
      </div>
      <div className="mb-3">
        <label className="form-label">Preferred Activities</label>
        <select 
          multiple 
          className="form-control"
          value={formData.activities || user?.travelPreferences?.activities || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            setFormData({...formData, activities: values});
          }}
        >
          <option value="water sports">Water Sports</option>
          <option value="hiking">Hiking</option>
          <option value="diving">Diving</option>
          <option value="fishing">Fishing</option>
          <option value="sightseeing">Sightseeing</option>
          <option value="nightlife">Nightlife</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Preferred Transportation</label>
        <select 
          className="form-control"
          value={formData.transportation || user?.travelPreferences?.transportation || ''}
          onChange={(e) => setFormData({...formData, transportation: e.target.value})}
        >
          <option value="">Select Transportation</option>
          <option value="rental car">Rental Car</option>
          <option value="taxi">Taxi</option>
          <option value="public transport">Public Transport</option>
          <option value="walking">Walking</option>
          <option value="bicycle">Bicycle</option>
        </select>
      </div>
      <div className={styles.modalFooter}>
        <button className={styles.btnSecondary} onClick={() => setActiveModal(null)}>
          Cancel
        </button>
        <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderAccommodationPreferencesForm = () => (
    <div>
      <div className="mb-3">
        <label className="form-label">Accommodation Type</label>
        <select 
          className="form-control"
          value={formData.type || user?.accommodationPreferences?.type || ''}
          onChange={(e) => setFormData({...formData, type: e.target.value})}
        >
          <option value="">Select Type</option>
          <option value="hotel">Hotel</option>
          <option value="resort">Resort</option>
          <option value="villa">Villa</option>
          <option value="apartment">Apartment</option>
          <option value="guesthouse">Guesthouse</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Preferred Amenities</label>
        <select 
          multiple 
          className="form-control"
          value={formData.amenities || user?.accommodationPreferences?.amenities || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            setFormData({...formData, amenities: values});
          }}
        >
          <option value="pool">Pool</option>
          <option value="spa">Spa</option>
          <option value="gym">Gym</option>
          <option value="restaurant">Restaurant</option>
          <option value="bar">Bar</option>
          <option value="wifi">WiFi</option>
          <option value="parking">Parking</option>
          <option value="beach access">Beach Access</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Number of Kids</label>
        <input
          type="number"
          className="form-control"
          min="0"
          value={formData.numberOfKids || user?.accommodationPreferences?.numberOfKids || 0}
          onChange={(e) => setFormData({...formData, numberOfKids: parseInt(e.target.value)})}
        />
      </div>
      <div className={styles.modalFooter}>
        <button className={styles.btnSecondary} onClick={() => setActiveModal(null)}>
          Cancel
        </button>
        <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

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
                
                {/* Profile Completion */}
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
                  <li
                    className={`${styles.navItem} ${
                      activeTab === "personal" ? styles.active : ""
                    }`}
                    onClick={() => setActiveTab("personal")}
                  >
                    <i className={`fas fa-user ${styles.navIcon}`}></i>
                    <span className={styles.navText}>Personal Info</span>
                  </li>
                  <li
                    className={`${styles.navItem} ${
                      activeTab === "preferences" ? styles.active : ""
                    }`}
                    onClick={() => setActiveTab("preferences")}
                  >
                    <i className={`fas fa-heart ${styles.navIcon}`}></i>
                    <span className={styles.navText}>Travel Preferences</span>
                  </li>
                  <li
                    className={`${styles.navItem} ${
                      activeTab === "accommodation" ? styles.active : ""
                    }`}
                    onClick={() => setActiveTab("accommodation")}
                  >
                    <i className={`fas fa-bed ${styles.navIcon}`}></i>
                    <span className={styles.navText}>Accommodation</span>
                  </li>
                  <li
                    className={`${styles.navItem} ${
                      activeTab === "privacy" ? styles.active : ""
                    }`}
                    onClick={() => setActiveTab("privacy")}
                  >
                    <i className={`fas fa-shield-alt ${styles.navIcon}`}></i>
                    <span className={styles.navText}>Privacy Settings</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-9">
              <div className={styles.profileContentCard}>
                {activeTab === "personal" && (
                  <div>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Personal Information</h3>
                      <p className={styles.sectionDescription}>
                        Manage your personal details and contact information
                      </p>
                    </div>

                    <div className={styles.profileInfoList}>
                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-user"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Full Name</p>
                            <p className={styles.infoValue}>
                              {user?.name || "Not provided"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('personal', {
                            name: user?.name,
                            phoneNumber: user?.phoneNumber,
                            dateOfBirth: user?.dateOfBirth
                          })}
                        >
                          Edit
                        </button>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-envelope"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Email Address</p>
                            <p className={styles.infoValue}>
                              {user?.email || "Not provided"}
                            </p>
                          </div>
                        </div>
                        <span className={styles.editButton} style={{opacity: 0.5}}>
                          Verified
                        </span>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-phone"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Phone Number</p>
                            <p className={styles.infoValue}>
                              {user?.phoneNumber || "Not provided"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('personal', {
                            name: user?.name,
                            phoneNumber: user?.phoneNumber,
                            dateOfBirth: user?.dateOfBirth
                          })}
                        >
                          {user?.phoneNumber ? 'Edit' : 'Add'}
                        </button>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-calendar"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Date of Birth</p>
                            <p className={styles.infoValue}>
                              {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not provided"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('personal', {
                            name: user?.name,
                            phoneNumber: user?.phoneNumber,
                            dateOfBirth: user?.dateOfBirth
                          })}
                        >
                          {user?.dateOfBirth ? 'Edit' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "preferences" && (
                  <div>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Travel Preferences</h3>
                      <p className={styles.sectionDescription}>
                        Tell us about your travel style and interests
                      </p>
                    </div>

                    <div className={styles.profileInfoList}>
                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-suitcase"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Travel Style</p>
                            <p className={styles.infoValue}>
                              {user?.travelPreferences?.style?.join(", ") || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('travelPreferences', user?.travelPreferences)}
                        >
                          {user?.travelPreferences?.style?.length ? 'Edit' : 'Add'}
                        </button>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-map-marked-alt"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Preferred Activities</p>
                            <p className={styles.infoValue}>
                              {user?.travelPreferences?.activities?.join(", ") || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('travelPreferences', user?.travelPreferences)}
                        >
                          {user?.travelPreferences?.activities?.length ? 'Edit' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "accommodation" && (
                  <div>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Accommodation Preferences</h3>
                      <p className={styles.sectionDescription}>
                        Set your preferred accommodation type and amenities
                      </p>
                    </div>

                    <div className={styles.profileInfoList}>
                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-bed"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Accommodation Type</p>
                            <p className={styles.infoValue}>
                              {user?.accommodationPreferences?.type || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('accommodationPreferences', user?.accommodationPreferences)}
                        >
                          {user?.accommodationPreferences?.type ? 'Edit' : 'Add'}
                        </button>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-concierge-bell"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Preferred Amenities</p>
                            <p className={styles.infoValue}>
                              {user?.accommodationPreferences?.amenities?.join(", ") || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('accommodationPreferences', user?.accommodationPreferences)}
                        >
                          {user?.accommodationPreferences?.amenities?.length ? 'Edit' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "privacy" && (
                  <div>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Privacy Settings</h3>
                      <p className={styles.sectionDescription}>
                        Control your privacy and data sharing preferences
                      </p>
                    </div>

                    <div className={styles.profileInfoList}>
                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-eye"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Profile Visibility</p>
                            <p className={styles.infoValue}>
                              {user?.privacySettings?.profileVisibility || "Public"}
                            </p>
                          </div>
                        </div>
                        <button className={styles.editButton}>
                          Edit
                        </button>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-share"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Share Activity</p>
                            <p className={styles.infoValue}>
                              {user?.privacySettings?.shareActivity ? "Enabled" : "Disabled"}
                            </p>
                          </div>
                        </div>
                        <button className={styles.editButton}>
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modals */}
      <EditModal
        isOpen={activeModal === 'personal'}
        onClose={() => setActiveModal(null)}
        title="Edit Personal Information"
      >
        {renderPersonalInfoForm()}
      </EditModal>

      <EditModal
        isOpen={activeModal === 'travelPreferences'}
        onClose={() => setActiveModal(null)}
        title="Edit Travel Preferences"
      >
        {renderTravelPreferencesForm()}
      </EditModal>

      <EditModal
        isOpen={activeModal === 'accommodationPreferences'}
        onClose={() => setActiveModal(null)}
        title="Edit Accommodation Preferences"
      >
        {renderAccommodationPreferencesForm()}
      </EditModal>
    </div>
  );
}