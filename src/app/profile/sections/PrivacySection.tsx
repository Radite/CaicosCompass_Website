// src/app/profile/sections/PrivacySection.tsx
import React from "react";
import { SectionProps, FormProps } from "../types";

export const PrivacySection: React.FC<SectionProps> = ({ user, onEdit, styles }) => {
  return (
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
            onClick={() => onEdit('privacySettings', user?.privacySettings || {})}
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
            onClick={() => onEdit('privacySettings', user?.privacySettings || {})}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export const PrivacySettingsForm: React.FC<FormProps> = ({ 
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