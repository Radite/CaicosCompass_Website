import React from "react";
import styles from "@/app/login/login.module.css";
import { ISLANDS } from "../constants/authConstants";

export default function BusinessAddressSection({ businessData, onChange }) {
  return (
    <>
      <div className={styles.sectionTitle}>Business Address</div>
      
      <div className={styles.inputGroup}>
        <label>Street Address *</label>
        <input
          type="text"
          placeholder="Street address"
          value={businessData.street}
          onChange={(e) => onChange('street', e.target.value)}
          required
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.inputGroup}>
          <label>City *</label>
          <input
            type="text"
            placeholder="City"
            value={businessData.city}
            onChange={(e) => onChange('city', e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Island *</label>
          <select
            value={businessData.island}
            onChange={(e) => onChange('island', e.target.value)}
            required
          >
            <option value="">Select island</option>
            {ISLANDS.map(island => (
              <option key={island} value={island}>{island}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>Postal Code</label>
        <input
          type="text"
          placeholder="Postal code"
          value={businessData.postalCode}
          onChange={(e) => onChange('postalCode', e.target.value)}
        />
      </div>
    </>
  );
}