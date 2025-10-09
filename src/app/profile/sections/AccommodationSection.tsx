// src/app/profile/sections/AccommodationSection.tsx
"use client";

import React from "react";
import { SectionProps, FormProps } from "../types";

export const AccommodationSection: React.FC<SectionProps> = ({ user, onEdit, styles }) => {
  return (
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
            onClick={() => onEdit('accommodationPreferences', user?.accommodationPreferences || {})}
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
            onClick={() => onEdit('accommodationPreferences', user?.accommodationPreferences || {})}
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
            onClick={() => onEdit('accommodationPreferences', user?.accommodationPreferences || {})}
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
            onClick={() => onEdit('accommodationPreferences', user?.accommodationPreferences || {})}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export const AccommodationForm: React.FC<FormProps> = ({ 
  user, 
  formData, 
  setFormData, 
  onSave, 
  onCancel, 
  saving, 
  styles 
}) => {
  return (
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
        <button className={styles.btnSecondary} onClick={onCancel}>
          Cancel
        </button>
        <button className={styles.btnPrimary} onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};