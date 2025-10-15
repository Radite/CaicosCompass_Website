import React, { useState } from "react";
import styles from "@/app/login/login.module.css";
import OwnerInfoSection from "../../components/business/OwnerInfoSection";
import BusinessInfoSection from "../../components/business/BusinessInfoSection";
import BusinessAddressSection from "../../components/business/BusinessAddressSection";
import DocumentUploadSection from "../../components/business/DocumentUploadSection";
import ServicesSelector from "../../components/business/ServicesSelector";
import { registerBusiness } from "../services/authService";

// Ensure phone format matches backend validation: +countrycode phonenumber (with space)
const ensurePhoneFormat = (phone) => {
  if (!phone) return '';
  
  // If already has space, return as-is
  if (/^\+\d{1,4}\s.+$/.test(phone)) {
    console.log('✅ Phone already formatted correctly:', phone);
    return phone;
  }
  
  // Add space after country code
  const match = phone.match(/^(\+\d{1,4})(\d+)$/);
  if (match) {
    const formatted = `${match[1]} ${match[2]}`;
    console.log('🔧 Reformatted phone:', phone, '→', formatted);
    return formatted;
  }
  
  console.log('⚠️ Phone format unexpected:', phone);
  return phone;
};

export default function BusinessSignupForm({ 
  loading, 
  setLoading, 
  showMessage, 
  closeMessageBox,
  toggleForms,
  setIsBusinessSignup 
}) {
  const [businessData, setBusinessData] = useState({
    // Personal info
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    confirmPassword: "",
    ownerPhone: "",
    
    // Business info
    businessName: "",
    businessType: "",
    businessLicense: "",
    businessPhone: "",
    businessDescription: "",
    businessWebsite: "",
    servicesOffered: [],
    
    // Address
    street: "",
    city: "",
    island: "",
    postalCode: ""
  });

  const [documents, setDocuments] = useState([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleBusinessDataChange = (field, value) => {
    console.log(`📝 [BusinessForm] Field "${field}" changed to:`, value);
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceToggle = (service) => {
    setBusinessData(prev => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter(s => s !== service)
        : [...prev.servicesOffered, service]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 [SUBMIT] Full businessData:', businessData);
    console.log('🚀 [SUBMIT] ownerPhone:', businessData.ownerPhone);
    console.log('🚀 [SUBMIT] businessPhone:', businessData.businessPhone);
    console.log('🚀 [SUBMIT] agreedToTerms:', agreedToTerms);
    
    // Validation
    const required = [
      'ownerName', 'ownerEmail', 'ownerPassword', 'confirmPassword',
      'businessName', 'businessType', 'businessPhone', 'businessDescription',
      'street', 'city', 'island'
    ];
    
    for (let field of required) {
      if (!businessData[field]) {
        showMessage(
          'Missing Information',
          `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          'warning'
        );
        return;
      }
    }
    
    if (businessData.ownerPassword !== businessData.confirmPassword) {
      showMessage(
        'Password Mismatch',
        'Passwords do not match. Please check and try again.',
        'error'
      );
      return;
    }
    
    if (businessData.servicesOffered.length === 0) {
      showMessage(
        'Services Required',
        'Please select at least one service you offer.',
        'warning'
      );
      return;
    }

    if (!agreedToTerms) {
      showMessage(
        'Agreement Required',
        'Please read and agree to the Vendor Terms & Conditions to continue.',
        'warning'
      );
      return;
    }
    
    setLoading(true);
    
    try {
      const payload = {
        // Personal info
        name: businessData.ownerName.trim(),
        email: businessData.ownerEmail.toLowerCase().trim(),
        password: businessData.ownerPassword.trim(),
        phoneNumber: ensurePhoneFormat(businessData.businessPhone), // ✅ Format phone with space
        role: "business-manager",
        
        // Business profile
        businessProfile: {
          businessName: businessData.businessName.trim(),
          businessType: businessData.businessType,
          businessLicense: businessData.businessLicense.trim(),
          businessAddress: {
            street: businessData.street.trim(),
            city: businessData.city.trim(),
            island: businessData.island,
            postalCode: businessData.postalCode.trim()
          },
          businessPhone: ensurePhoneFormat(businessData.businessPhone), // ✅ Format phone with space
          businessDescription: businessData.businessDescription.trim(),
          businessWebsite: businessData.businessWebsite.trim(),
          servicesOffered: businessData.servicesOffered,
          documents: documents,
          isApproved: false
        }
      };
      
      console.log('📤 [PAYLOAD] Sending to backend:', JSON.stringify(payload, null, 2));
      
      const result = await registerBusiness(payload);
      
      if (result.success) {
        showMessage(
          'Application Submitted Successfully! 🎉',
          'Your business application has been submitted and will be reviewed by our team within 24-48 hours. You will receive an email notification once approved.',
          'success',
          {
            confirmText: 'Continue to Login',
            onConfirm: () => {
              toggleForms();
              setIsBusinessSignup(false);
              closeMessageBox();
            }
          }
        );
      } else {
        showMessage(
          'Registration Failed',
          result.message || 'Business registration failed. Please try again.',
          'error'
        );
      }
    } catch (error) {
      console.error("❌ Business signup error:", error);
      console.error("❌ Error response:", error.response?.data);
      showMessage(
        'Registration Error',
        error.response?.data?.message || error.message || "An error occurred during business registration.",
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.businessForm}>
      <OwnerInfoSection 
        businessData={businessData}
        onChange={handleBusinessDataChange}
      />

      <BusinessInfoSection 
        businessData={businessData}
        onChange={handleBusinessDataChange}
      />

      <ServicesSelector 
        selectedServices={businessData.servicesOffered}
        onToggle={handleServiceToggle}
      />

      <BusinessAddressSection 
        businessData={businessData}
        onChange={handleBusinessDataChange}
      />

      <DocumentUploadSection 
        documents={documents}
        setDocuments={setDocuments}
        showMessage={showMessage}
      />

      {/* Vendor Agreement Section with Hyperlink */}
      <div className={styles.agreementSection}>
        <div className={styles.agreementBox}>
          <h4>📋 Vendor Agreement</h4>
          <p className={styles.agreementSummary}>
            By submitting this application, you agree to:
          </p>
          <ul className={styles.agreementList}>
            <li>Platform commission of <strong>15% per transaction</strong></li>
            <li>Bi-weekly payment processing to your bank account</li>
            <li>Compliance with platform policies and terms</li>
            <li>Accurate listing information and availability</li>
          </ul>
        </div>

        <div className={styles.agreementCheckbox}>
          <label>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              required
            />
            <span>
              I have read and agree to the{" "}
              <a 
                href="/vendor-agreement" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.termsLink}
              >
                Vendor Terms & Conditions
              </a>{" "}
              and acknowledge the 15% commission rate on all transactions. *
            </span>
          </label>
        </div>
      </div>

      <div className={styles.businessNote}>
        <p><strong>Note:</strong> Your business application will be reviewed by our team within 24-48 hours. You will receive an email notification once approved.</p>
      </div>
      
      <button
        type="submit"
        className={styles.submitButton}
        disabled={loading || !agreedToTerms}
      >
        {loading ? "Submitting Application..." : "Submit Business Application"}
      </button>
    </form>
  );
}