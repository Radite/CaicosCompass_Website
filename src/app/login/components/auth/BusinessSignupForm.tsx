import React, { useState } from "react";
import styles from "@/app/login/login.module.css";
import OwnerInfoSection from "../../components/business/OwnerInfoSection";
import BusinessInfoSection from "../../components/business/BusinessInfoSection";
import BusinessAddressSection from "../../components/business/BusinessAddressSection";
import DocumentUploadSection from "../../components/business/DocumentUploadSection";
import ServicesSelector from "../../components/business/ServicesSelector";
import { registerBusiness } from "../services/authService";

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

  const handleBusinessDataChange = (field, value) => {
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
    
    setLoading(true);
    
    try {
      const result = await registerBusiness({
        // Personal info
        name: businessData.ownerName.trim(),
        email: businessData.ownerEmail.toLowerCase().trim(),
        password: businessData.ownerPassword.trim(),
        phoneNumber: businessData.ownerPhone.trim(),
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
          businessPhone: businessData.businessPhone.trim(),
          businessDescription: businessData.businessDescription.trim(),
          businessWebsite: businessData.businessWebsite.trim(),
          servicesOffered: businessData.servicesOffered,
          documents: documents,
          isApproved: false
        }
      });
      
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
      console.error("Business signup error:", error);
      showMessage(
        'Registration Error',
        error.message || "An error occurred during business registration.",
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

      <div className={styles.businessNote}>
        <p><strong>Note:</strong> Your business application will be reviewed by our team within 24-48 hours. You will receive an email notification once approved.</p>
      </div>
      
      <button
        type="submit"
        className={styles.submitButton}
        disabled={loading}
      >
        {loading ? "Submitting Application..." : "Submit Business Application"}
      </button>
    </form>
  );
}