// src/app/profile/sections/TravelPreferencesSection.tsx
"use client";

import React from "react";
import { SectionProps, FormProps } from "../types";

export const TravelPreferencesSection: React.FC<SectionProps> = ({ user, onEdit, styles }) => {
  return (
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
            onClick={() => onEdit('travelPreferences', user?.travelPreferences || {})}
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
            onClick={() => onEdit('travelPreferences', user?.travelPreferences || {})}
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
            onClick={() => onEdit('travelPreferences', user?.travelPreferences || {})}
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
            onClick={() => onEdit('travelPreferences', user?.travelPreferences || {})}
          >
            {user?.travelPreferences?.transportation ? 'Edit' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const TravelPreferencesForm: React.FC<FormProps> = ({ 
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