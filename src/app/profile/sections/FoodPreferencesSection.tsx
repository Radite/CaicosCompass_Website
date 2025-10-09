// src/app/profile/sections/FoodPreferencesSection.tsx
"use client";

import React from "react";
import { SectionProps, FormProps } from "../types";

export const FoodPreferencesSection: React.FC<SectionProps> = ({ user, onEdit, styles }) => {
  return (
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
            onClick={() => onEdit('foodPreferences', user?.foodPreferences || {})}
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
            onClick={() => onEdit('foodPreferences', user?.foodPreferences || {})}
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
            onClick={() => onEdit('mustDoActivities', user?.mustDoActivities || [])}
          >
            {user?.mustDoActivities?.length ? 'Edit' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const FoodPreferencesForm: React.FC<FormProps> = ({ 
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

export const MustDoActivitiesForm: React.FC<FormProps> = ({ 
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

