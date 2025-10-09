// src/app/profile/sections/PersonalInfoSection.tsx
"use client";

import React from "react";
import { SectionProps, FormProps } from "../types";

export const PersonalInfoSection: React.FC<SectionProps> = ({ user, onEdit, styles }) => {
  return (
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
            onClick={() => onEdit('personal', {
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
            onClick={() => onEdit('personal', {
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
            onClick={() => onEdit('personal', {
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
  );
};

export const PersonalInfoForm: React.FC<FormProps> = ({ 
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