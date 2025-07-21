// Validation utilities for auth forms

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return {
    isValid: password.length >= 8, // Basic validation
    isStrong: passwordRegex.test(password),
    errors: getPasswordErrors(password)
  };
};

const getPasswordErrors = (password) => {
  const errors = [];
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  return errors;
};

export const validatePhoneNumber = (phone) => {
  // Basic phone validation - adjust regex based on your requirements
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateBusinessData = (data) => {
  const errors = {};
  
  // Owner validation
  if (!data.ownerName?.trim()) errors.ownerName = "Owner name is required";
  if (!validateEmail(data.ownerEmail)) errors.ownerEmail = "Valid email is required";
  if (!validatePassword(data.ownerPassword).isValid) errors.ownerPassword = "Password must be at least 8 characters";
  if (data.ownerPassword !== data.confirmPassword) errors.confirmPassword = "Passwords do not match";
  
  // Business validation
  if (!data.businessName?.trim()) errors.businessName = "Business name is required";
  if (!data.businessType) errors.businessType = "Business type is required";
  if (!data.businessPhone?.trim()) errors.businessPhone = "Business phone is required";
  if (!data.businessDescription?.trim()) errors.businessDescription = "Business description is required";
  if (data.servicesOffered?.length === 0) errors.servicesOffered = "At least one service must be selected";
  
  // Address validation
  if (!data.street?.trim()) errors.street = "Street address is required";
  if (!data.city?.trim()) errors.city = "City is required";
  if (!data.island) errors.island = "Island selection is required";
  
  // Optional field validation
  if (data.businessWebsite && !isValidUrl(data.businessWebsite)) {
    errors.businessWebsite = "Please enter a valid website URL";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
};

// Format form data for submission
export const formatBusinessData = (data, documents) => {
  return {
    // Personal info
    name: data.ownerName.trim(),
    email: data.ownerEmail.toLowerCase().trim(),
    password: data.ownerPassword.trim(),
    phoneNumber: data.ownerPhone.trim(),
    role: "business-manager",
    
    // Business profile
    businessProfile: {
      businessName: data.businessName.trim(),
      businessType: data.businessType,
      businessLicense: data.businessLicense.trim(),
      businessAddress: {
        street: data.street.trim(),
        city: data.city.trim(),
        island: data.island,
        postalCode: data.postalCode.trim()
      },
      businessPhone: data.businessPhone.trim(),
      businessDescription: data.businessDescription.trim(),
      businessWebsite: data.businessWebsite.trim(),
      servicesOffered: data.servicesOffered,
      documents: documents,
      isApproved: false
    }
  };
};