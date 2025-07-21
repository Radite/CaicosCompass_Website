import React from "react";
import styles from "@/app/login/login.module.css";
import { SERVICE_OPTIONS } from "../constants/authConstants";

export default function ServicesSelector({ selectedServices, onToggle }) {
  return (
    <div className={styles.inputGroup}>
      <label>Services You Offer *</label>
      <div className={styles.checkboxGroup}>
        {SERVICE_OPTIONS.map(service => (
          <label key={service} className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={selectedServices.includes(service)}
              onChange={() => onToggle(service)}
            />
            <span>{service.charAt(0).toUpperCase() + service.slice(1)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}