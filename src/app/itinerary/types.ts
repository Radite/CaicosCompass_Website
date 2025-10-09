// src/app/itinerary/types.ts

// Represents the populated service details attached to a booking
export interface ServiceDetails {
  name: string;
  location: string;
  mainImage?: string; // URL of the main image
}

// Represents the main Booking object, reflecting the Mongoose schema
export interface Booking {
  _id: string;
  category: 'activity' | 'stay' | 'transportation' | 'dining' | 'spa';
  status: 'confirmed' | 'pending' | 'canceled';
  
  // Populated service data from the backend
  serviceDetails: ServiceDetails;

  // Dates & Times
  date?: string; // For activity, transportation, dining, spa
  time?: string; // For activity, transportation, dining, spa
  startDate?: string; // For stay
  endDate?: string; // For stay

  // Guest & Participant Info
  numOfPeople: number;
  guestName?: string;
  guestEmail?: string;
  contactInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };

  // Category-specific fields
  pickupLocation?: string;
  dropoffLocation?: string;
  serviceName?: string; // For Spa bookings

  // Payment Details
  paymentDetails: {
    totalAmount: number;
    amountPaid: number;
    remainingBalance: number;
    paymentMethod?: 'card' | 'cash' | 'transfer';
  };
  
  // Additional Info
  requirements?: {
    specialNotes?: string;
  };
  
  createdAt: string;
}

// Props for the BookingCard component
export interface BookingCardProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
  onCancel: (bookingId: string) => void;
  isUpcoming: (booking: Booking) => boolean;
}

// Props for the BookingDetailsModal component
export interface BookingDetailsModalProps {
  booking: Booking | null;
  onClose: () => void;
  onDownloadPDF: (booking: Booking) => void;
}