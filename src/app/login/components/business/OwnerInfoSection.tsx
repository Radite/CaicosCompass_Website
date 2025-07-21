import React from "react";
import styles from "@/app/login/login.module.css";

export default function OwnerInfoSection({ businessData, onChange }) {
  return (
    <>
      <div className={styles.sectionTitle}>Owner Information</div>
      
      <div className={styles.formRow}>
        <div className={styles.inputGroup}>
          <label>Owner Name *</label>
          <input
            type="text"
            placeholder="Your full name"
            value={businessData.ownerName}
            onChange={(e) => onChange('ownerName', e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="Your phone number"
            value={businessData.ownerPhone}
            onChange={(e) => onChange('ownerPhone', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>Email Address *</label>
        <input
          type="email"
          placeholder="Your email address"
          value={businessData.ownerEmail}
          onChange={(e) => onChange('ownerEmail', e.target.value)}
          required
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.inputGroup}>
          <label>Password *</label>
          <input
            type="password"
            placeholder="Create a password"
            value={businessData.ownerPassword}
            onChange={(e) => onChange('ownerPassword', e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Confirm Password *</label>
          <input
            type="password"
            placeholder="Confirm password"
            value={businessData.confirmPassword}
            onChange={(e) => onChange('confirmPassword', e.target.value)}
            required
          />
        </div>
      </div>
    </>
  );
}