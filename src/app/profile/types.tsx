// src/app/profile/types.ts

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  role: string;
  travelPreferences?: {
    style: string[];
    preferredDestinations: string[];
    activities: string[];
    transportation: string;
  };
  accommodationPreferences?: {
    type: string;
    amenities: string[];
    location: string;
    accommodationFor: string[];
    numberOfKids: number;
    roomRequirements?: {
      numberOfRooms: number;
      bedType: string;
    };
    includeGuestsInActivities: boolean;
  };
  groupDetails?: {
    adults: number;
    children: number;
    pets: boolean;
    accessibilityNeeds: string[];
    dietaryRestrictions: string[];
  };
  budget?: {
    total: number;
    allocation?: {
      accommodation: number;
      food: number;
      activities: number;
      transportation: number;
    };
  };
  foodPreferences?: {
    cuisines: string[];
    diningStyle: string;
  };
  mustDoActivities?: string[];
  fitnessLevel?: string;
  healthConcerns?: string[];
  seasonalPreferences?: string[];
  shoppingPreferences?: string[];
  lengthOfStay?: number;
  customization?: {
    pace: string[];
    durationPerDestination: number;
    specialOccasions: string[];
  };
  environmentalPreferences?: {
    sustainability: boolean;
    supportLocal: boolean;
  };
  privacySettings?: {
    profileVisibility: string;
    shareActivity: boolean;
  };
  loyaltyPoints: number;
}

export interface SectionProps {
  user: UserProfile | null;
  onEdit: (section: string, data: any) => void;
  styles: any;
}

export interface FormProps {
  user: UserProfile | null;
  formData: any;
  setFormData: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  styles: any;
}