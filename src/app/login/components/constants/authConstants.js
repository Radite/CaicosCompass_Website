export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const BUSINESS_TYPES = [
  "restaurant",
  "hotel-resort", 
  "villa-rental",
  "airbnb-host",
  "tour-operator",
  "transportation-service",
  "retail-shop",
  "wellness-spa",
  "other"
];

export const SERVICE_OPTIONS = [
  "dining",
  "stays", 
  "activities",
  "transportation",
  "shopping",
  "wellness-spa"
];

export const ISLANDS = [
  "Providenciales",
  "Grand Turk",
  "North Caicos",
  "Middle Caicos", 
  "South Caicos",
  "Salt Cay"
];

export const DOCUMENT_TYPES = [
  { value: "business-license", label: "Business License" },
  { value: "government-id", label: "Government-issued ID" },
  { value: "passport", label: "Passport" },
  { value: "insurance-certificate", label: "Insurance Certificate" },
  { value: "professional-certification", label: "Professional Certification" },
  { value: "tax-registration", label: "Tax Registration" },
  { value: "bank-statement", label: "Bank Statement" },
  { value: "utility-bill", label: "Utility Bill (Address Proof)" },
  { value: "trade-certificate", label: "Trade Certificate" },
  { value: "health-permit", label: "Health Permit" },
  { value: "tourism-license", label: "Tourism License" },
  { value: "other", label: "Other Document" }
];

export const USER_ROLES = {
  USER: 'user',
  BUSINESS_MANAGER: 'business-manager',
  ADMIN: 'admin'
};

export const REDIRECT_URLS = {
  ADMIN: '/admin/dashboard',
  BUSINESS_APPROVED: '/vendor/dashboard',
  BUSINESS_PENDING: '/vendor/pending-approval',
  USER: '/'
};