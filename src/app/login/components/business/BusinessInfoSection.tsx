import React from "react";
import styles from "@/app/login/login.module.css";
import { BUSINESS_TYPES } from "../constants/authConstants";

export default function BusinessInfoSection({ businessData, onChange }) {
  return (
    <>
      <div className={styles.sectionTitle}>Business Information</div>
      
      <div className={styles.inputGroup}>
        <label>Business Name *</label>
        <input
          type="text"
          placeholder="e.g., Paradise Tours TC"
          value={businessData.businessName}
          onChange={(e) => onChange('businessName', e.target.value)}
          required
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.inputGroup}>
          <label>Business Type *</label>
          <select
            value={businessData.businessType}
            onChange={(e) => onChange('businessType', e.target.value)}
            required
          >
            <option value="">Select business type</option>
            {BUSINESS_TYPES.map(type => (
              <option key={type} value={type}>
                {type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>Business Phone *</label>
          <input
            type="tel"
            placeholder="Business phone number"
            value={businessData.businessPhone}
            onChange={(e) => onChange('businessPhone', e.target.value)}
            required
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>Business License</label>
        <input
          type="text"
          placeholder="Business license number (if applicable)"
          value={businessData.businessLicense}
          onChange={(e) => onChange('businessLicense', e.target.value)}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>Business Description *</label>
        <textarea
          placeholder="Describe your business and services..."
          value={businessData.businessDescription}
          onChange={(e) => onChange('businessDescription', e.target.value)}
          rows={3}
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <label>Website</label>
        <input
          type="url"
          placeholder="https://yourbusiness.com"
          value={businessData.businessWebsite}
          onChange={(e) => onChange('businessWebsite', e.target.value)}
        />
      </div>
    </>
  );
}