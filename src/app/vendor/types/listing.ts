// types/listing.ts
export interface BaseService {
  name: string;
  description: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  images: Array<{
    url: string;
    isMain: boolean;
  }>;
  island: string;
  host?: string; // Changed from vendor to host to match your API
}

export interface Activity extends BaseService {
  serviceType: 'activities';
  price: number;
  discountedPrice?: number;
  pricingType: 'per hour' | 'per person' | 'per trip' | 'per day' | 'varies';
  options: Array<{
    title: string;
    cost: number;
    pricingType: 'per hour' | 'per person' | 'per trip' | 'per day' | 'varies';
    description?: string;
    location?: string;
    maxPeople: number;
    duration: number;
    availability: Array<{
      day: string;
      timeSlots: Array<{
        startTime: string;
        endTime: string;
        maxPeople: number;
      }>;
    }>;
    unavailableTimeSlots: Array<{
      date: Date;
      startTime: string;
      endTime: string;
    }>;
    customUnavailableDates: Array<{
      date: Date;
      reason?: string;
    }>;
    equipmentRequirements: Array<{
      equipmentName: string;
      provided: boolean;
    }>;
    images: Array<{
      url: string;
      isMain: boolean;
    }>;
  }>;
  category: 'Excursion' | 'Nature Trails' | 'Museums' | 'Water Sports' | 'Shopping' | 'Cultural Site';
  ageRestrictions: {
    minAge: number;
    maxAge?: number;
  };
  waivers: Array<{
    title: string;
    description?: string;
    url?: string;
  }>;
  cancellationPolicy?: string;
}

export interface Dining extends BaseService {
  serviceType: 'dining';
  cuisineTypes: Array<'Caribbean' | 'American' | 'Seafood' | 'Italian' | 'Mediterranean' | 'Indian' | 'Vegan' | 'Mexican' | 'Japanese' | 'Chinese' | 'French' | 'BBQ'>;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  menuItems: Array<{
    name: string;
    description?: string;
    category: 'Appetizers' | 'Main Courses' | 'Desserts' | 'Drinks';
    price: number;
    image?: string;
    sides: Array<{
      name: string;
      price: number;
    }>;
  }>;
  operatingHours: Array<{
    day: string;
    openTime: string;
    closeTime: string;
  }>;
}

export interface Shopping extends BaseService {
  serviceType: 'shoppings';
  storeType: 'Boutique' | 'Market' | 'Luxury Store' | 'Souvenir Shop' | 'Specialty Store';
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  products: Array<{
    name: string;
    description?: string;
    price: number;
    discountedPrice?: number;
    category: string;
    quantity?: number; // NEW: Add quantity field
    images: Array<{
      url: string;
      isMain: boolean;
    }>;
    availability: 'In Stock' | 'Limited' | 'Out of Stock';
  }>;
  openingHours: Array<{
    day: string;
    openTime: string;
    closeTime: string;
  }>;
  customClosures: CustomClosure[];
  paymentOptions: Array<'Cash' | 'Credit Card' | 'Mobile Payment' | 'Cryptocurrency'>;
  deliveryAvailable: boolean;
}

export interface Stay extends BaseService {
  serviceType: 'stays';
  type: 'Villa' | 'Airbnb';
  propertyType?: 'House' | 'Apartment' | 'Guesthouse';
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  unavailableDates: Array<{
    startDate: Date;
    endDate: Date;
  }>;
  amenities: {
    hotTub: boolean;
    ac: boolean;
    pool: boolean;
    wifi: boolean;
    freeParking: boolean;
    beachfront: boolean;
    kitchen: boolean;
    washer: boolean;
    dryer: boolean;
    heating: boolean;
    dedicatedWorkspace: boolean;
    tv: boolean;
    hairDryer: boolean;
    iron: boolean;
    evCharger: boolean;
    crib: boolean;
    kingBed: boolean;
    gym: boolean;
    bbqGrill: boolean;
    breakfast: boolean;
    indoorFireplace: boolean;
    smokingAllowed: boolean;
    smokeAlarm: boolean;
    carbonMonoxideAlarm: boolean;
  };
  bookingOptions: {
    instantBook: boolean;
    selfCheckIn: boolean;
    allowPets: boolean;
  };
  tags: {
    isLuxe: boolean;
    isGuestFavorite: boolean;
  };
  policies: {
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: 'Flexible' | 'Moderate' | 'Strict' | 'Non-refundable';
  };
  stayImages: string[];
  stayDescription?: string;
  addressDetails: {
    address: string;
    city: string;
    state?: string;
    country: string;
    zipCode?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  discounts: {
    weekly: number;
    monthly: number;
    specials: Array<{
      title?: string;
      startDate: Date;
      endDate: Date;
      percentage: number;
    }>;
  };
}

export interface Transportation extends BaseService {
  serviceType: 'transportations';
  category: 'Car Rental' | 'Jeep & 4x4 Rental' | 'Scooter & Moped Rental' | 'Taxi' | 'Airport Transfer' | 'Private VIP Transport' | 'Ferry' | 'Flight';
  pricingModel: 'flat' | 'per-mile' | 'per-hour' | 'per-day' | 'age-based' | 'per-flight' | 'per-trip';
  basePrice: number;
  flatPrice?: number;
  perMilePrice?: number;
  perHourPrice?: number;
  perDayPrice?: number;
  longTermDiscounts: Array<{
    duration: 'weekly' | 'monthly';
    discountPercentage: number;
  }>;
  ageBasedPricing: Array<{
    minAge?: number;
    maxAge?: number;
    price: number;
  }>;
  capacity?: number;
  amenities: string[];
  specialConditions: {
    noSmoking: boolean;
    petFriendly: boolean;
    minAgeRequirement?: number;
    validLicenseRequired: boolean;
    securityDepositRequired: boolean;
  };
  availability: Array<{
    date: Date;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
  rentalDetails?: {
    make?: string;
    model?: string;
    year?: number;
    fuelType?: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
    transmission?: 'Automatic' | 'Manual';
    dailyMileageLimit?: number;
    excessMileageCharge?: number;
    insuranceIncluded: boolean;
    insuranceOptions: Array<{
      type: 'Basic' | 'Comprehensive' | 'Premium';
      price: number;
    }>;
  };
  driverDetails?: {
    name?: string;
    licenseNumber?: string;
    experience?: number;
    rating?: number;
    vehicleAssigned?: string;
  };
  ferryDetails?: {
    departureLocation?: string;
    arrivalLocation?: string;
    duration?: string;
    baggageLimits: Array<{
      weightLimit?: number;
      dimensionLimit?: string;
    }>;
    schedule: Array<{
      day: string;
      departureTime?: string;
      arrivalTime?: string;
    }>;
  };
  paymentOptions: {
    acceptedMethods: Array<'Cash' | 'Credit Card' | 'Debit Card' | 'Online Payment'>;
  };
  options: Array<{
    title: string;
    description?: string;
    price?: number;
    capacity?: number;
  }>;
  locationsServed: Array<{
    locationName?: string;
    coordinates: {
      latitude?: number;
      longitude?: number;
    };
  }>;
  cancellationPolicy: {
    refundable: boolean;
    cancellationFee?: number;
    advanceNoticeRequired?: string;
  };
  contactDetails: {
    phone: string;
    email?: string;
    website?: string;
  };
  promotions: Array<{
    description?: string;
    discountPercentage?: number;
    validUntil?: Date;
  }>;
}

export interface WellnessSpa extends BaseService {
  serviceType: 'wellnessspas';
  spaType: 'Resort Spa' | 'Day Spa' | 'Medical Spa' | 'Holistic Spa' | 'Wellness Retreat';
  servicesOffered: Array<{
    name: string;
    description?: string;
    duration: number;
    price: number;
    discountedPrice?: number;
    category?: 'Massage' | 'Facial' | 'Body Treatment' | 'Wellness Therapy' | 'Other';
    weeklyAvailability: Array<{
      day: string;
      timeSlots: Array<{
        startTime: string;
        endTime: string;
        maxBookings: number;
      }>;
      isAvailable: boolean;
    }>;
    dateExceptions: Array<{
      date: Date;
      isAvailable: boolean;
      timeSlots: Array<{
        startTime?: string;
        endTime?: string;
        maxBookings: number;
      }>;
      reason?: string;
    }>;
    images: Array<{
      url: string;
      isMain: boolean;
    }>;
  }>;
  ageRestrictions: {
    minAge: number;
    maxAge?: number;
  };
  openingHours: Array<{
    day: string;
    openTime: string;
    closeTime: string;
  }>;
  customClosures: Array<{
    date: Date;
    reason?: string;
  }>;
  wellnessPrograms: Array<{
    title: string;
    description?: string;
    durationDays: number;
    price: number;
  }>;
  cancellationPolicy?: string;
  paymentOptions: Array<'Cash' | 'Credit Card' | 'Mobile Payment' | 'Cryptocurrency'>;
}

export type ServiceListing = Activity | Dining | Shopping | Stay | Transportation | WellnessSpa;

export interface ListingFormProps {
  onNext: (data: Partial<ServiceListing>) => void;
  onPrev: () => void;
  initialData?: Partial<ServiceListing>;
  isLoading?: boolean;
}