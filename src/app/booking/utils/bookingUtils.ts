// utils/bookingUtils.ts
import { Activity, Option, TimeSlot, Availability } from "../types";

export const calculateAverageRating = (activity: Activity | null): string | null => {
  if (!activity?.reviews || activity.reviews.length === 0) return null;
  const sum = activity.reviews.reduce((total, review) => total + review.rating, 0);
  return (sum / activity.reviews.length).toFixed(1);
};

export const calculateTotalPrice = (
  selectedOption: Option | null, 
  activity: Activity | null, 
  numPeople: number
): number => {
  const pricePerUnit = selectedOption ? selectedOption.cost : activity?.price || 0;
  return pricePerUnit * numPeople;
};

export const getAvailableTimeslots = (
  selectedDate: string,
  selectedOption: Option | null,
  activity: Activity | null
): TimeSlot[] => {
  const availabilityArray = selectedOption?.availability || activity?.availability || [];
  const selectedDay = new Date(selectedDate).toLocaleDateString("en-US", {
    weekday: "long",
  });
  
  const dayAvailability = availabilityArray.find(
    (avail: Availability) => avail.day === selectedDay
  );
  
  return dayAvailability ? dayAvailability.timeSlots : [];
};