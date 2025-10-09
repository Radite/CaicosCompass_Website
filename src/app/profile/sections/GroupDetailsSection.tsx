// src/app/profile/sections/GroupDetailsSection.tsx
"use client";

import React from "react";
import { SectionProps, FormProps } from "../types";

export const GroupDetailsSection: React.FC<SectionProps> = ({ user, onEdit, styles }) => {
  return (
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
            onClick={() => onEdit('groupDetails', user?.groupDetails || {})}
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
            onClick={() => onEdit('groupDetails', user?.groupDetails || {})}
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
            onClick={() => onEdit('groupDetails', user?.groupDetails || {})}
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
            onClick={() => onEdit('groupDetails', user?.groupDetails || {})}
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
            onClick={() => onEdit('groupDetails', user?.groupDetails || {})}
          >
            {user?.groupDetails?.dietaryRestrictions?.length ? 'Edit' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const GroupDetailsForm: React.FC<FormProps> = ({ 
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