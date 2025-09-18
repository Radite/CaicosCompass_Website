"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaMapMarkerAlt, FaStar, FaRegCreditCard, FaClock } from 'react-icons/fa';
import styles from "./bookingpage.module.css";

// Types
import { TimeSlot, BookingData } from "./types";
import { useAuth } from "../contexts/AuthContext"; // 1. Import your auth hook

// Components
import BackButton from "./components/ui/BackButton";
import InfoItem from "./components/ui/InfoItem";
import ImageGallery from "./components/BookingPage/ImageGallery";
import BookingForm from "./components/BookingPage/BookingForm";
import BookingSummary from "./components/BookingPage/BookingSummary";

// Hooks & Utils
import { useAvailability } from "./hooks/useAvailability";
import { useActivityParser } from "./hooks/useActivityParser";
import { calculateAverageRating, calculateTotalPrice } from "./utils/bookingUtils";

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [numPeople, setNumPeople] = useState<number>(1);
  const [multiUser, setMultiUser] = useState<boolean>(false);

  const { activity, selectedOption, allImages, handleOptionChange } = useActivityParser(searchParams);
  const { availableTimeslots, selectedTime, setSelectedTime } = useAvailability(activity, selectedOption, selectedDate);
  const averageRating = calculateAverageRating(activity);

  const { user, loading: authLoading } = useAuth();

  // Calculate totalPrice here, in the parent component
  const totalPrice = calculateTotalPrice(selectedOption, activity, numPeople);

  const handleContinue = () => {
    if (!selectedTime) {
      alert("Please select a time slot.");
      return;
    }
    
    const pricePerUnit = selectedOption ? selectedOption.cost : activity?.price || 0;
    
    const bookingData: BookingData = {
            // --- 3. ADD THE USER ID HERE ---
      user: user ? user.id : null, // Add the user's ID if they exist
      

      activityId: activity?._id,
      activityName: activity?.name,
      optionId: selectedOption?._id || null,
      option: selectedOption,
      date: selectedDate,
      time: `${selectedTime.startTime} - ${selectedTime.endTime}`,
      timeSlot: selectedTime,
      numPeople,
      multiUser,
      totalPrice: totalPrice, // Use the authoritative totalPrice
      price: pricePerUnit,
      basePrice: pricePerUnit,
      serviceType: activity?.serviceType || 'Activity',
      category: activity?.category || 'General', 
      duration: selectedOption?.duration || activity?.duration,
      location: activity?.location,
      island: activity?.island,
      difficulty: activity?.difficulty,
      ageRestrictions: activity?.ageRestrictions,
      groupSizeLimit: activity?.groupSizeLimit,
      inclusions: selectedOption?.inclusions || activity?.inclusions,
      exclusions: selectedOption?.exclusions || activity?.exclusions,
      description: selectedOption?.description || activity?.description,
      discountedPrice: activity?.discountedPrice,
      pricingType: activity?.pricingType
    };
    console.log("--- 1. [Booking Page] Creating Initial Booking Data ---");
  console.log(JSON.stringify(bookingData, null, 2));
    const queryParam = encodeURIComponent(JSON.stringify(bookingData));
    router.push(`/payment?booking=${queryParam}&type=activity`);
  };

    // --- FIX #2: Show a loading indicator until authentication is ready ---
  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        {/* You can use a dedicated Spinner component here */}
        <h2>Loading Your Session...</h2>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      <BackButton />
      
      <div className={styles.heroSection}>
        <ImageGallery 
          images={allImages} 
          altText={activity?.name || "Activity"} 
        />
        
        <div className={styles.heroContent}>
          <h2 className={styles.title}>
            {selectedOption ? selectedOption.title : activity?.name}
          </h2>
          
          <div className={styles.infoBox}>
            <InfoItem 
              icon={<FaMapMarkerAlt />} 
              text={`${activity?.location} - ${activity?.island}`} 
            />
            
            {averageRating && (
              <InfoItem 
                icon={<FaStar />} 
                text={`${averageRating} stars (${activity?.reviews?.length} reviews)`} 
              />
            )}
            
            {activity?.duration && (
              <InfoItem 
                icon={<FaClock />} 
                text={activity.duration} 
              />
            )}
            
            <InfoItem 
              icon={<FaRegCreditCard />} 
              text={`From $${selectedOption
                ? selectedOption.cost
                : activity?.discountedPrice || activity?.price}${activity?.pricingType === 'per_person' ? ' per person' : ''}`}
              className={styles.priceText} 
            />
          </div>
          
          <p className={styles.description}>
            {selectedOption?.description || activity?.description}
          </p>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.sidebarSection}>
          <BookingSummary 
            activity={activity}
            selectedOption={selectedOption}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            numPeople={numPeople}
            onContinue={handleContinue}
            totalPrice={totalPrice} // Pass totalPrice down as a prop
          />
        </div>

        <BookingForm 
          activity={activity}
          selectedOption={selectedOption}
          selectedDate={selectedDate}
          availableTimeslots={availableTimeslots}
          selectedTime={selectedTime}
          numPeople={numPeople}
          multiUser={multiUser}
          onOptionChange={handleOptionChange}
          onDateChange={setSelectedDate}
          onTimeSelect={setSelectedTime}
          setNumPeople={setNumPeople}
          setMultiUser={setMultiUser}
        />
      </div>
    </div>
  );
}