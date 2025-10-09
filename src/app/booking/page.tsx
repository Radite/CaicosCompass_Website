"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaMapMarkerAlt, FaStar, FaRegCreditCard, FaClock } from 'react-icons/fa';
import styles from "./bookingpage.module.css";

// Types
import { TimeSlot, BookingData } from "./types";
import { useAuth } from "../contexts/AuthContext"; // 1. Import your auth hook
import { useCart } from "../contexts/CartContext"; // Add this import
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
const { addToCart } = useCart(); // Add cart functionality
const [addingToCart, setAddingToCart] = useState(false);
const [addedToCart, setAddedToCart] = useState(false);
const [toast, setToast] = useState<{
  show: boolean;
  message: string;
  type: 'success' | 'error';
} | null>(null);
const showToast = (message: string, type: 'success' | 'error') => {
  setToast({ show: true, message, type });
  setTimeout(() => {
    setToast(null);
  }, 3000);
};
  // Calculate totalPrice here, in the parent component
  const totalPrice = calculateTotalPrice(selectedOption, activity, numPeople);

  const handleAddToCart = async () => {
  // Check if user is logged in
  if (!user) {
    alert('Please log in to add items to your cart');
    router.push('/login?redirect=/bookingpage?activity=' + searchParams.get('activity'));
    return;
  }

  // Validation
  if (!selectedTime) {
    showToast('Please select a time slot.', 'error');
    return;
  }

  if (!activity) {
    showToast('Activity information not available.', 'error');
    return;
  }

  setAddingToCart(true);

  const cartItemData = {
    serviceId: activity._id,
    serviceType: activity.serviceType || 'Activity',
    category: activity.category || 'activity',
    selectedDate: selectedDate,
    selectedTime: `${selectedTime.startTime} - ${selectedTime.endTime}`,
    timeSlot: selectedTime,
    serviceName: selectedOption ? selectedOption.title : activity.name,
    optionId: selectedOption?._id || null,
    numPeople: numPeople,
    totalPrice: totalPrice,
    priceBreakdown: {
      basePrice: selectedOption ? selectedOption.cost : activity.price,
      fees: 0,
      taxes: 0,
      discounts: activity.discountedPrice ? (activity.price - activity.discountedPrice) : 0
    },
    notes: `${activity.name}${selectedOption ? ` - ${selectedOption.title}` : ''} in ${activity.location}, ${activity.island}`
  };

  try {
    const success = await addToCart(cartItemData);
    
    if (success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
      showToast('✓ Added to cart! Continue browsing or check your cart in the header.', 'success');
    } else {
      showToast('Failed to add to cart. Please try again.', 'error');
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    showToast('An error occurred while adding to cart.', 'error');
  } finally {
    setAddingToCart(false);
  }
};
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
  onAddToCart={handleAddToCart} // Add this prop
  addingToCart={addingToCart} // Add this prop
  addedToCart={addedToCart} // Add this prop
  totalPrice={totalPrice}
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
      
{/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: toast.type === 'success' ? '#28a745' : '#dc3545',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            maxWidth: '500px',
            animation: 'slideInRight 0.3s ease-out',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>
            {toast.type === 'success' ? '✓' : '✕'}
          </span>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '0',
              lineHeight: '1',
              opacity: 0.8
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}