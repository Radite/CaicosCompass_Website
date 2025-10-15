import React from "react";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import styles from "@/app/login/login.module.css";
import { BUSINESS_TYPES } from "../constants/authConstants";

// Format phone number to match backend validation: +countrycode phonenumber (with space)
const formatPhoneForBackend = (phoneValue) => {
  console.log('📱 [formatPhoneForBackend] Input:', JSON.stringify(phoneValue), 'Type:', typeof phoneValue);
  
  if (!phoneValue) {
    console.log('📱 [formatPhoneForBackend] Empty value, returning empty string');
    return '';
  }
  
  // Extract country code and number
  const match = phoneValue.match(/^(\+\d{1,4})(\d+)$/);
  console.log('📱 [formatPhoneForBackend] Regex match result:', match);
  
  if (match) {
    const formatted = `${match[1]} ${match[2]}`; // Add space between country code and number
    console.log('📱 [formatPhoneForBackend] ✅ Formatted output:', JSON.stringify(formatted));
    console.log('📱 [formatPhoneForBackend] ✅ Regex test on output:', /^\+\d{1,4}\s.+$/.test(formatted));
    return formatted;
  }
  
  console.log('📱 [formatPhoneForBackend] ❌ No match, returning original value:', phoneValue);
  return phoneValue;
};

export default function BusinessInfoSection({ businessData, onChange }) {
  const handlePhoneChange = (value) => {
    console.log('☎️ [handlePhoneChange] Raw value from PhoneInput:', JSON.stringify(value));
    console.log('☎️ [handlePhoneChange] Value type:', typeof value);
    
    const formattedPhone = formatPhoneForBackend(value);
    console.log('☎️ [handlePhoneChange] Formatted phone:', JSON.stringify(formattedPhone));
    console.log('☎️ [handlePhoneChange] Backend regex test:', /^\+\d{1,4}\s.+$/.test(formattedPhone));
    
    onChange('businessPhone', formattedPhone);
    console.log('☎️ [handlePhoneChange] ✅ Sent to onChange');
  };

  // Log current businessPhone value
  React.useEffect(() => {
    console.log('🔍 [BusinessInfoSection] Current businessPhone in state:', JSON.stringify(businessData.businessPhone));
    console.log('🔍 [BusinessInfoSection] Backend regex test on current value:', /^\+\d{1,4}\s.+$/.test(businessData.businessPhone));
  }, [businessData.businessPhone]);

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
          <PhoneInput
            international
            defaultCountry="TC"
            value={businessData.businessPhone?.replace(/^(\+\d{1,4})\s/, '$1') || ''}
            onChange={handlePhoneChange}
            placeholder="Enter phone number"
            required
          />
          <small style={{color: '#666', fontSize: '11px', marginTop: '4px', display: 'block'}}>
            Current: {businessData.businessPhone || 'empty'} | Valid: {/^\+\d{1,4}\s.+$/.test(businessData.businessPhone) ? '✅' : '❌'}
          </small>
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