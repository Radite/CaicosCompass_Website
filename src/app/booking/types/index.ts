// types/index.ts
export interface Image {
  url: string;
  isMain?: boolean;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  maxPeople: number;
}

export interface Availability {
  day: string;
  timeSlots: TimeSlot[];
}

export interface Option {
  _id: string;
  title: string;
  cost: number;
  maxPeople: number;
  description?: string;
  images?: Image[];
  availability?: Availability[];
  unavailableTimeSlots?: { date: string; startTime: string; endTime: string }[];
  customUnavailableDates?: { date: string; reason?: string }[];
}

export interface Activity {
  _id: string;
  name: string;
  description: string;
  location: string;
  island: string;
  price: number;
  discountedPrice?: number;
  pricingType: string;
  availability?: Availability[];
  unavailableTimeSlots?: { date: string; startTime: string; endTime: string }[];
  customUnavailableDates?: { date: string; reason?: string }[];
  images?: Image[];
  category: string;
  options?: Option[];
  reviews?: { rating: number }[];
  duration?: string;
}

export interface BookingData {
  activityId?: string;
  optionId: string | null;
  date: string;
  timeSlot: TimeSlot;
  numPeople: number;
  multiUser: boolean;
  totalPrice: number;
}