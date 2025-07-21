import React from "react";
import styles from "@/app/login/login.module.css";

export default function AccountTypeSelector({ isBusinessSignup, onToggle }) {
  return (
    <div className={styles.accountTypeSelector}>
      <h2 className={styles.formTitle}>Create Account</h2>
      <div className={styles.toggleButtons}>
        <button
          type="button"
          className={`${styles.toggleButton} ${!isBusinessSignup ? styles.active : ''}`}
          onClick={() => onToggle(false)}
        >
          Personal Account
        </button>
        <button
          type="button"
          className={`${styles.toggleButton} ${isBusinessSignup ? styles.active : ''}`}
          onClick={() => onToggle(true)}
        >
          Business Account
        </button>
      </div>
      <p className={styles.formSubtitle}>
        {isBusinessSignup 
          ? "Register your business to offer services on our platform"
          : "Begin your journey of luxury experiences"
        }
      </p>
    </div>
  );
}