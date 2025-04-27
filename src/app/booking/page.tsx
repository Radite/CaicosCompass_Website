// page.tsx (updated with useActivityParser)
"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaMapMarkerAlt, FaStar, FaRegCreditCard, FaClock } from 'react-icons/fa';
import styles from "./bookingpage.module.css";

// Types
import { TimeSlot, BookingData } from "./types";

// Components
import BackButton from "./components/ui/BackButton";
import InfoItem from "./components/ui/InfoItem";
import ImageGallery from "./components/BookingPage/ImageGallery";
import BookingForm from "./components/BookingPage/BookingForm";
import BookingSummary from "./components/BookingPage/BookingSummary";

// Hooks & Utils
import { useAvailability } from "./hooks/useAvailability";
import { useActivityParser } from "./hooks/useActivityParser";
import { calculateAverageRating } from "./utils/bookingUtils";

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [numPeople, setNumPeople] = useState<number>(1);
  const [multiUser, setMultiUser] = useState<boolean>(false);

  // Custom hook for parsing activity from URL
  const { 
    activity, 
    selectedOption, 
    allImages, 
    handleOptionChange 
  } = useActivityParser(searchParams);

  // Custom hook for handling availability and timeslots
  const { 
    availableTimeslots, 
    selectedTime, 
    setSelectedTime 
  } = useAvailability(activity, selectedOption, selectedDate);

  const averageRating = calculateAverageRating(activity);

  const handleContinue = () => {
    if (!selectedTime) {
      alert("Please select a time slot.");
      return;
    }
    
    const pricePerUnit = selectedOption ? selectedOption.cost : activity?.price || 0;
    const totalPrice = pricePerUnit * numPeople;
    
    const bookingData: BookingData = {
      activityId: activity?._id,
      optionId: selectedOption?._id || null,
      date: selectedDate,
      timeSlot: selectedTime,
      numPeople,
      multiUser,
      totalPrice,
    };
    
    // Pass the bookingData as a JSON-encoded query parameter to PaymentPage
    const queryParam = encodeURIComponent(JSON.stringify(bookingData));
    router.push(`/payment?booking=${queryParam}`);
  };

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