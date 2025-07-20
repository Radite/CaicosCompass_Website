// src/app/profile/page.tsx - Enhanced Complete Profile Page
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
    roomRequirements?: {
      numberOfRooms: number;
      bedType: string;
    };
    includeGuestsInActivities: boolean;
  };
  groupDetails?: {
    adults: number;
    children: number;
    pets: boolean;
    accessibilityNeeds: string[];
    dietaryRestrictions: string[];
  };
  budget?: {
    total: number;
    allocation?: {
      accommodation: number;
      food: number;
      activities: number;
      transportation: number;
    };
  };
  foodPreferences?: {
    cuisines: string[];
    diningStyle: string;
  };
  mustDoActivities?: string[];
  fitnessLevel?: string;
  healthConcerns?: string[];
  seasonalPreferences?: string[];
  shoppingPreferences?: string[];
  lengthOfStay?: number;
  customization?: {
    pace: string[];
    durationPerDestination: number;
    specialOccasions: string[];
  };
  environmentalPreferences?: {
    sustainability: boolean;
    supportLocal: boolean;
  };
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
      user.mustDoActivities?.length,
      user.groupDetails?.adults,
      user.budget?.total
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
      const updateData = { [activeModal as string]: formData };
      
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/me`,
        updateData,
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
          value={formData.dateOfBirth || user?.dateOfBirth?.split('T')[0] || ''}
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
          style={{ height: '120px' }}
          value={formData.style || user?.travelPreferences?.style || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            setFormData({...formData, style: values});
          }}
        >
          <option value="budget">Budget</option>
          <option value="mid-range">Mid-range</option>
          <option value="luxury">Luxury</option>
        </select>
        <small className="text-muted">Hold Ctrl/Cmd to select multiple</small>
      </div>
      
      <div className="mb-3">
        <label className="form-label">Preferred Destinations</label>
        <select 
          multiple 
          className="form-control"
          style={{ height: '120px' }}
          value={formData.preferredDestinations || user?.travelPreferences?.preferredDestinations || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            setFormData({...formData, preferredDestinations: values});
          }}
        >
          <option value="Providenciales">Providenciales</option>
          <option value="Grand Turk">Grand Turk</option>
          <option value="North Caicos & Middle Caicos">North Caicos & Middle Caicos</option>
          <option value="South Caicos">South Caicos</option>
          <option value="Salt Cay">Salt Cay</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Preferred Activities</label>
        <select 
          multiple 
          className="form-control"
          style={{ height: '150px' }}
          value={formData.activities || user?.travelPreferences?.activities || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            setFormData({...formData, activities: values});
          }}
        >
          <option value="outdoor">Outdoor</option>
          <option value="watersports">Water Sports</option>
          <option value="snorkeling">Snorkeling</option>
          <option value="diving">Diving</option>
          <option value="sightseeing">Sightseeing</option>
          <option value="hiking">Hiking</option>
          <option value="cycling">Cycling</option>
          <option value="kayaking">Kayaking</option>
          <option value="fishing">Fishing</option>
          <option value="boating">Boating</option>
          <option value="cultural">Cultural</option>
          <option value="shopping">Shopping</option>
          <option value="nightlife">Nightlife</option>
          <option value="golf">Golf</option>
          <option value="spa">Spa</option>
          <option value="adventure">Adventure</option>
          <option value="wildlife">Wildlife</option>
          <option value="sailing">Sailing</option>
          <option value="yachting">Yachting</option>
          <option value="eco-tourism">Eco-tourism</option>
          <option value="photography">Photography</option>
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
          <option value="car rentals">Car Rentals</option>
          <option value="public transport">Public Transport</option>
          <option value="walking">Walking</option>
          <option value="taxis">Taxis</option>
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
          <option value="hostel">Hostel</option>
          <option value="camping">Camping</option>
          <option value="Airbnb">Airbnb</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Preferred Location</label>
        <select 
          className="form-control"
          value={formData.location || user?.accommodationPreferences?.location || ''}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
        >
          <option value="">Select Location</option>
          <option value="city center">City Center</option>
          <option value="secluded">Secluded</option>
          <option value="near the beach">Near the Beach</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Accommodation For</label>
        <select 
          multiple 
          className="form-control"
          style={{ height: '120px' }}
          value={formData.accommodationFor || user?.accommodationPreferences?.accommodationFor || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            setFormData({...formData, accommodationFor: values});
          }}
        >
          <option value="couple">Couple</option>
          <option value="single">Single</option>
          <option value="family">Family</option>
          <option value="with kids">With Kids</option>
          <option value="toddler">Toddler</option>
          <option value="pets">Pets</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Number of Kids</label>
        <input
          type="number"
          className="form-control"
          min="0"
          value={formData.numberOfKids ?? user?.accommodationPreferences?.numberOfKids ?? 0}
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

  const renderGroupDetailsForm = () => (
    <div>
      <div className="mb-3">
        <label className="form-label">Number of Adults</label>
        <input
          type="number"
          className="form-control"
          min="1"
          value={formData.adults ?? user?.groupDetails?.adults ?? 1}
          onChange={(e) => setFormData({...formData, adults: parseInt(e.target.value)})}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Number of Children</label>
        <input
          type="number"
          className="form-control"
          min="0"
          value={formData.children ?? user?.groupDetails?.children ?? 0}
          onChange={(e) => setFormData({...formData, children: parseInt(e.target.value)})}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Pets</label>
        <select 
          className="form-control"
          value={formData.pets ?? user?.groupDetails?.pets ?? false}
          onChange={(e) => setFormData({...formData, pets: e.target.value === 'true'})}
        >
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Accessibility Needs</label>
        <select 
          multiple 
          className="form-control"
          style={{ height: '120px' }}
          value={formData.accessibilityNeeds || user?.groupDetails?.accessibilityNeeds || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            setFormData({...formData, accessibilityNeeds: values});
          }}
        >
          <option value="wheelchair accessible">Wheelchair Accessible</option>
          <option value="visual assistance">Visual Assistance</option>
          <option value="hearing assistance">Hearing Assistance</option>
          <option value="cognitive support">Cognitive Support</option>
          <option value="none">None</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Dietary Restrictions</label>
        <select 
          multiple 
          className="form-control"
          style={{ height: '120px' }}
          value={formData.dietaryRestrictions || user?.groupDetails?.dietaryRestrictions || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            setFormData({...formData, dietaryRestrictions: values});
          }}
        >
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="gluten-free">Gluten-free</option>
          <option value="dairy-free">Dairy-free</option>
          <option value="nut-free">Nut-free</option>
          <option value="halal">Halal</option>
          <option value="kosher">Kosher</option>
          <option value="low-carb">Low-carb</option>
          <option value="low-sodium">Low-sodium</option>
          <option value="none">None</option>
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

  const renderBudgetForm = () => (
    <div>
      <div className="mb-3">
        <label className="form-label">Total Budget ($)</label>
        <input
          type="number"
          className="form-control"
          min="0"
          value={formData.total ?? user?.budget?.total ?? 0}
          onChange={(e) => setFormData({...formData, total: parseFloat(e.target.value)})}
        />
      </div>

      <h5>Budget Allocation (%)</h5>
      <div className="mb-3">
        <label className="form-label">Accommodation</label>
        <input
          type="number"
          className="form-control"
          min="0"
          max="100"
          value={formData.allocation?.accommodation ?? user?.budget?.allocation?.accommodation ?? 0}
          onChange={(e) => setFormData({
            ...formData, 
            allocation: {
              ...formData.allocation,
              accommodation: parseFloat(e.target.value)
            }
          })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Food</label>
        <input
          type="number"
          className="form-control"
          min="0"
          max="100"
          value={formData.allocation?.food ?? user?.budget?.allocation?.food ?? 0}
          onChange={(e) => setFormData({
            ...formData, 
            allocation: {
              ...formData.allocation,
              food: parseFloat(e.target.value)
            }
          })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Activities</label>
        <input
          type="number"
          className="form-control"
          min="0"
          max="100"
          value={formData.allocation?.activities ?? user?.budget?.allocation?.activities ?? 0}
          onChange={(e) => setFormData({
            ...formData, 
            allocation: {
              ...formData.allocation,
              activities: parseFloat(e.target.value)
            }
          })}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Transportation</label>
        <input
          type="number"
          className="form-control"
          min="0"
          max="100"
          value={formData.allocation?.transportation ?? user?.budget?.allocation?.transportation ?? 0}
          onChange={(e) => setFormData({
            ...formData, 
            allocation: {
              ...formData.allocation,
              transportation: parseFloat(e.target.value)
            }
          })}
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

  const renderFoodPreferencesForm = () => (
    <div>
      <div className="mb-3">
        <label className="form-label">Preferred Cuisines</label>
        <select 
          multiple 
          className="form-control"
          style={{ height: '150px' }}
          value={formData.cuisines || user?.foodPreferences?.cuisines || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            setFormData({...formData, cuisines: values});
          }}
        >
          <option value="American">American</option>
          <option value="Italian">Italian</option>
          <option value="Mexican">Mexican</option>
          <option value="Chinese">Chinese</option>
          <option value="Japanese">Japanese</option>
          <option value="Thai">Thai</option>
          <option value="Indian">Indian</option>
          <option value="French">French</option>
          <option value="Mediterranean">Mediterranean</option>
          <option value="Caribbean">Caribbean</option>
          <option value="Lebanese">Lebanese</option>
          <option value="Greek">Greek</option>
          <option value="Spanish">Spanish</option>
          <option value="Korean">Korean</option>
          <option value="Vietnamese">Vietnamese</option>
          <option value="Turkish">Turkish</option>
          <option value="Fusion">Fusion</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Dining Style</label>
        <select 
          className="form-control"
          value={formData.diningStyle || user?.foodPreferences?.diningStyle || ''}
          onChange={(e) => setFormData({...formData, diningStyle: e.target.value})}
        >
          <option value="">Select Style</option>
          <option value="fine dining">Fine Dining</option>
          <option value="street food">Street Food</option>
          <option value="casual">Casual</option>
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

  const renderMustDoActivitiesForm = () => (
    <div>
      <div className="mb-3">
        <label className="form-label">Must Do Activities</label>
        <select 
          multiple 
          className="form-control"
          style={{ height: '200px' }}
          value={formData || user?.mustDoActivities || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            setFormData(values);
          }}
        >
          <option value="go to the beach">Go to the Beach</option>
          <option value="visit a historical site">Visit a Historical Site</option>
          <option value="snorkeling">Snorkeling</option>
          <option value="diving">Diving</option>
          <option value="explore local culture">Explore Local Culture</option>
          <option value="hiking">Hiking</option>
          <option value="sightseeing">Sightseeing</option>
          <option value="shopping">Shopping</option>
          <option value="food tour">Food Tour</option>
          <option value="boat ride">Boat Ride</option>
          <option value="nature walk">Nature Walk</option>
          <option value="museum visit">Museum Visit</option>
          <option value="attend a festival">Attend a Festival</option>
          <option value="wine tasting">Wine Tasting</option>
          <option value="local market tour">Local Market Tour</option>
          <option value="island hopping">Island Hopping</option>
          <option value="sunset cruise">Sunset Cruise</option>
          <option value="kayaking">Kayaking</option>
          <option value="camping">Camping</option>
        </select>
        <small className="text-muted">Hold Ctrl/Cmd to select multiple activities</small>
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

  const renderPrivacySettingsForm = () => (
    <div>
      <div className="mb-3">
        <label className="form-label">Profile Visibility</label>
        <select 
          className="form-control"
          value={formData.profileVisibility || user?.privacySettings?.profileVisibility || 'public'}
          onChange={(e) => setFormData({...formData, profileVisibility: e.target.value})}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="friends-only">Friends Only</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Share Activity</label>
        <select 
          className="form-control"
          value={formData.shareActivity ?? user?.privacySettings?.shareActivity ?? true}
          onChange={(e) => setFormData({...formData, shareActivity: e.target.value === 'true'})}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
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
                      activeTab === "group" ? styles.active : ""
                    }`}
                    onClick={() => setActiveTab("group")}
                  >
                    <i className={`fas fa-users ${styles.navIcon}`}></i>
                    <span className={styles.navText}>Group Details</span>
                  </li>
                  <li
                    className={`${styles.navItem} ${
                      activeTab === "budget" ? styles.active : ""
                    }`}
                    onClick={() => setActiveTab("budget")}
                  >
                    <i className={`fas fa-dollar-sign ${styles.navIcon}`}></i>
                    <span className={styles.navText}>Budget</span>
                  </li>
                  <li
                    className={`${styles.navItem} ${
                      activeTab === "food" ? styles.active : ""
                    }`}
                    onClick={() => setActiveTab("food")}
                  >
                    <i className={`fas fa-utensils ${styles.navIcon}`}></i>
                    <span className={styles.navText}>Food Preferences</span>
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
                          onClick={() => handleEditClick('travelPreferences', user?.travelPreferences || {})}
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
                            <p className={styles.infoLabel}>Preferred Destinations</p>
                            <p className={styles.infoValue}>
                              {user?.travelPreferences?.preferredDestinations?.join(", ") || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('travelPreferences', user?.travelPreferences || {})}
                        >
                          {user?.travelPreferences?.preferredDestinations?.length ? 'Edit' : 'Add'}
                        </button>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-hiking"></i>
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
                          onClick={() => handleEditClick('travelPreferences', user?.travelPreferences || {})}
                        >
                          {user?.travelPreferences?.activities?.length ? 'Edit' : 'Add'}
                        </button>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-car"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Preferred Transportation</p>
                            <p className={styles.infoValue}>
                              {user?.travelPreferences?.transportation || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('travelPreferences', user?.travelPreferences || {})}
                        >
                          {user?.travelPreferences?.transportation ? 'Edit' : 'Add'}
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
                          onClick={() => handleEditClick('accommodationPreferences', user?.accommodationPreferences || {})}
                        >
                          {user?.accommodationPreferences?.type ? 'Edit' : 'Add'}
                        </button>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-map-marker-alt"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Preferred Location</p>
                            <p className={styles.infoValue}>
                              {user?.accommodationPreferences?.location || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('accommodationPreferences', user?.accommodationPreferences || {})}
                        >
                          {user?.accommodationPreferences?.location ? 'Edit' : 'Add'}
                        </button>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-users"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Accommodation For</p>
                            <p className={styles.infoValue}>
                              {user?.accommodationPreferences?.accommodationFor?.join(", ") || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('accommodationPreferences', user?.accommodationPreferences || {})}
                        >
                          {user?.accommodationPreferences?.accommodationFor?.length ? 'Edit' : 'Add'}
                        </button>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-child"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Number of Kids</p>
                            <p className={styles.infoValue}>
                              {user?.accommodationPreferences?.numberOfKids ?? "Not specified"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('accommodationPreferences', user?.accommodationPreferences || {})}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "group" && (
                  <div>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Group Details</h3>
                      <p className={styles.sectionDescription}>
                        Information about your travel group and special needs
                      </p>
                    </div>

                    <div className={styles.profileInfoList}>
                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-user"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Adults</p>
                            <p className={styles.infoValue}>
                              {user?.groupDetails?.adults ?? 1}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('groupDetails', user?.groupDetails || {})}
                        >
                          Edit
                        </button>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-child"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Children</p>
                            <p className={styles.infoValue}>
                              {user?.groupDetails?.children ?? 0}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('groupDetails', user?.groupDetails || {})}
                        >
                          Edit
                        </button>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-paw"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Pets</p>
                            <p className={styles.infoValue}>
                              {user?.groupDetails?.pets ? "Yes" : "No"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('groupDetails', user?.groupDetails || {})}
                        >
                          Edit
                        </button>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-wheelchair"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Accessibility Needs</p>
                            <p className={styles.infoValue}>
                              {user?.groupDetails?.accessibilityNeeds?.join(", ") || "None"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('groupDetails', user?.groupDetails || {})}
                        >
                          {user?.groupDetails?.accessibilityNeeds?.length ? 'Edit' : 'Add'}
                        </button>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-utensils"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Dietary Restrictions</p>
                            <p className={styles.infoValue}>
                              {user?.groupDetails?.dietaryRestrictions?.join(", ") || "None"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('groupDetails', user?.groupDetails || {})}
                        >
                          {user?.groupDetails?.dietaryRestrictions?.length ? 'Edit' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "budget" && (
                  <div>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Budget Information</h3>
                      <p className={styles.sectionDescription}>
                        Set your budget and allocation preferences
                      </p>
                    </div>

                    <div className={styles.profileInfoList}>
                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-dollar-sign"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Total Budget</p>
                            <p className={styles.infoValue}>
                              ${user?.budget?.total || "Not set"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('budget', user?.budget || {})}
                        >
                          {user?.budget?.total ? 'Edit' : 'Add'}
                        </button>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-chart-pie"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Budget Allocation</p>
                            <p className={styles.infoValue}>
                              {user?.budget?.allocation ? 
                                `Accommodation: ${user.budget.allocation.accommodation || 0}%, Food: ${user.budget.allocation.food || 0}%, Activities: ${user.budget.allocation.activities || 0}%, Transport: ${user.budget.allocation.transportation || 0}%` 
                                : "Not set"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('budget', user?.budget || {})}
                        >
                          {user?.budget?.allocation ? 'Edit' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "food" && (
                  <div>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>Food Preferences</h3>
                      <p className={styles.sectionDescription}>
                        Tell us about your culinary preferences and dining style
                      </p>
                    </div>

                    <div className={styles.profileInfoList}>
                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-utensils"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Preferred Cuisines</p>
                            <p className={styles.infoValue}>
                              {user?.foodPreferences?.cuisines?.join(", ") || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('foodPreferences', user?.foodPreferences || {})}
                        >
                          {user?.foodPreferences?.cuisines?.length ? 'Edit' : 'Add'}
                        </button>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-wine-glass"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Dining Style</p>
                            <p className={styles.infoValue}>
                              {user?.foodPreferences?.diningStyle || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('foodPreferences', user?.foodPreferences || {})}
                        >
                          {user?.foodPreferences?.diningStyle ? 'Edit' : 'Add'}
                        </button>
                      </div>

                      <div className={styles.profileInfoItem}>
                        <div className={styles.infoContent}>
                          <div className={styles.infoIcon}>
                            <i className="fas fa-list"></i>
                          </div>
                          <div className={styles.infoDetails}>
                            <p className={styles.infoLabel}>Must Do Activities</p>
                            <p className={styles.infoValue}>
                              {user?.mustDoActivities?.join(", ") || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('mustDoActivities', user?.mustDoActivities || [])}
                        >
                          {user?.mustDoActivities?.length ? 'Edit' : 'Add'}
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
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('privacySettings', user?.privacySettings || {})}
                        >
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
                        <button 
                          className={styles.editButton}
                          onClick={() => handleEditClick('privacySettings', user?.privacySettings || {})}
                        >
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

      <EditModal
        isOpen={activeModal === 'groupDetails'}
        onClose={() => setActiveModal(null)}
        title="Edit Group Details"
      >
        {renderGroupDetailsForm()}
      </EditModal>

      <EditModal
        isOpen={activeModal === 'budget'}
        onClose={() => setActiveModal(null)}
        title="Edit Budget Information"
      >
        {renderBudgetForm()}
      </EditModal>

      <EditModal
        isOpen={activeModal === 'foodPreferences'}
        onClose={() => setActiveModal(null)}
        title="Edit Food Preferences"
      >
        {renderFoodPreferencesForm()}
      </EditModal>

      <EditModal
        isOpen={activeModal === 'mustDoActivities'}
        onClose={() => setActiveModal(null)}
        title="Edit Must Do Activities"
      >
        {renderMustDoActivitiesForm()}
      </EditModal>

      <EditModal
        isOpen={activeModal === 'privacySettings'}
        onClose={() => setActiveModal(null)}
        title="Edit Privacy Settings"
      >
        {renderPrivacySettingsForm()}
      </EditModal>
    </div>
  );
}