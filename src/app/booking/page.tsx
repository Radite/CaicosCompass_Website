"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./bookingpage.module.css";
import { FaMapMarkerAlt, FaStar, FaInfoCircle, FaCalendarAlt, FaClock, FaUsers, FaArrowLeft, FaRegCreditCard } from 'react-icons/fa';

// --- Type Definitions ---
interface Image {
  url: string;
  isMain?: boolean;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  maxPeople: number;
}

interface Availability {
  day: string;
  timeSlots: TimeSlot[];
}

interface Option {
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

interface Activity {
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

// --- BookingPage Component ---
export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [availableTimeslots, setAvailableTimeslots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [numPeople, setNumPeople] = useState<number>(1);
  const [multiUser, setMultiUser] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);

  // Parse the activity from the URL query parameter.
  useEffect(() => {
    const activityParam = searchParams.get("activity");
    if (activityParam) {
      try {
        const parsedActivity: Activity = JSON.parse(decodeURIComponent(activityParam));
        setActivity(parsedActivity);
        
        // Collect all images from activity and options
        const mainImages = parsedActivity.images?.map(img => img.url) || [];
        setAllImages(mainImages);
        
        // If the activity has options, default to the first one.
        if (parsedActivity.options && parsedActivity.options.length > 0) {
          setSelectedOption(parsedActivity.options[0]);
        }
      } catch (err) {
        console.error("Error parsing activity:", err);
      }
    }
  }, [searchParams]);

  // Update images when selected option changes
  useEffect(() => {
    if (activity) {
      const mainImages = activity.images?.map(img => img.url) || [];
      const optionImages = selectedOption?.images?.map(img => img.url) || [];
      setAllImages([...mainImages, ...optionImages]);
      setCurrentImageIndex(0); // Reset to first image when option changes
    }
  }, [selectedOption, activity]);

  // Helper: get available timeslots based on the selected date and option (or overall activity)
  const getAvailableTimeslots = (): TimeSlot[] => {
    const availabilityArray =
      selectedOption?.availability || activity?.availability || [];
    const selectedDay = new Date(selectedDate).toLocaleDateString("en-US", {
      weekday: "long",
    });
    const dayAvailability = availabilityArray.find(
      (avail) => avail.day === selectedDay
    );
    return dayAvailability ? dayAvailability.timeSlots : [];
  };

  useEffect(() => {
    const times = getAvailableTimeslots();
    setAvailableTimeslots(times);
    setSelectedTime(null); // Reset timeslot when date or option changes.
  }, [selectedDate, selectedOption, activity]);

  const handleOptionChange = (optionId: string) => {
    if (activity?.options) {
      const option = activity.options.find((opt) => opt._id === optionId) || null;
      setSelectedOption(option);
    }
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    if (!activity?.reviews || activity.reviews.length === 0) return null;
    const sum = activity.reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / activity.reviews.length).toFixed(1);
  };

  const averageRating = calculateAverageRating();

  const handleContinue = () => {
    if (!selectedTime) {
      alert("Please select a time slot.");
      return;
    }
    const pricePerUnit = selectedOption ? selectedOption.cost : activity?.price || 0;
    const totalPrice = pricePerUnit * numPeople;
    const bookingData = {
      activityId: activity?._id,
      optionId: selectedOption?._id || null,
      date: selectedDate,
      timeSlot: selectedTime,
      numPeople,
      multiUser,
      totalPrice,
      // ... include additional booking fields as needed
    };
    // Pass the bookingData as a JSON-encoded query parameter to PaymentPage
    const queryParam = encodeURIComponent(JSON.stringify(bookingData));
    router.push(`/payment?booking=${queryParam}`);
  };

  // Get the minimum date (today) for date picker
  const today = new Date().toISOString().split('T')[0];

  // Navigate back to previous page
  const navigateBack = () => {
    router.back();
  };

  // Handle image navigation
  const showNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const showPrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
    );
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className={styles.container}>
      <button onClick={navigateBack} className={styles.backButton}>
        <FaArrowLeft className={styles.backIcon} /> Back to Activities
      </button>
      
      <div className={styles.heroSection}>
        <div className={styles.mainImageContainer}>
          {allImages.length > 0 ? (
            <>
              <img 
                src={allImages[currentImageIndex]} 
                alt={activity?.name || "Activity"} 
                className={styles.mainImage} 
              />
              {allImages.length > 1 && (
                <div className={styles.imageThumbnails}>
                  {allImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className={`${styles.thumbnailImage} ${index === currentImageIndex ? styles.activeThumbnail : ''}`}
                      onClick={() => selectImage(index)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <img 
              src="https://via.placeholder.com/800x500?text=Activity" 
              alt="Activity placeholder" 
              className={styles.mainImage} 
            />
          )}
        </div>
        
        <div className={styles.heroContent}>
          <h2 className={styles.title}>
            {selectedOption ? selectedOption.title : activity?.name}
          </h2>
          
          <div className={styles.infoBox}>
            <div className={styles.infoItem}>
              <FaMapMarkerAlt className={styles.infoIcon} style={{ color: '#D4AF37' }} />
              <span>{activity?.location} - {activity?.island}</span>
            </div>
            
            {averageRating && (
              <div className={styles.infoItem}>
                <FaStar className={styles.infoIcon} style={{ color: '#D4AF37' }} />
                <span>{averageRating} stars ({activity?.reviews?.length} reviews)</span>
              </div>
            )}
            
            {activity?.duration && (
              <div className={styles.infoItem}>
                <FaClock className={styles.infoIcon} style={{ color: '#D4AF37' }} />
                <span>{activity.duration}</span>
              </div>
            )}
            
            <div className={styles.infoItem}>
              <FaRegCreditCard className={styles.infoIcon} style={{ color: '#D4AF37' }} />
              <span className={styles.priceText}>
                From ${selectedOption
                  ? selectedOption.cost
                  : activity?.discountedPrice || activity?.price}
                {activity?.pricingType === 'per_person' && ' per person'}
              </span>
            </div>
          </div>
          
          <p className={styles.description}>{selectedOption?.description || activity?.description}</p>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.sidebarSection}>
          <div className={styles.bookingSection}>
            <h3 className={styles.bookingTitle}>Booking Summary</h3>
            
            {selectedOption && (
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Package:</span>
                <span className={styles.summaryValue}>{selectedOption.title}</span>
              </div>
            )}
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Date:</span>
              <span className={styles.summaryValue}>{formatDate(selectedDate)}</span>
            </div>
            
            {selectedTime && (
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Time:</span>
                <span className={styles.summaryValue}>{selectedTime.startTime} - {selectedTime.endTime}</span>
              </div>
            )}
            
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Guests:</span>
              <span className={styles.summaryValue}>{numPeople}</span>
            </div>
            
            <div className={styles.summaryTotal}>
              <span className={styles.totalLabel}>Total Price:</span>
              <span className={styles.totalPrice}>
                ${(
                  (selectedOption ? selectedOption.cost : activity?.price || 0) *
                  numPeople
                ).toFixed(2)}
              </span>
            </div>
            
            <button 
              onClick={handleContinue} 
              className={styles.continueButton}
              disabled={!selectedTime}
            >
              Continue to Payment
            </button>
            
            <div className={styles.tipContainer}>
              <p className={styles.tipText}>
                <FaInfoCircle style={{ marginRight: '8px' }} />
                Secure your booking with our easy payment process. Cancellations are free up to 48 hours before your experience.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.mainContent}>
          {/* Options Section */}
          {activity?.options && activity.options.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Experience Options</h3>
              <div className={styles.servicesTabs}>
                {activity.options.map((opt) => (
                  <button
                    key={opt._id}
                    className={`${styles.serviceTab} ${
                      selectedOption && selectedOption._id === opt._id
                        ? styles.activeTab
                        : ""
                    }`}
                    onClick={() => handleOptionChange(opt._id)}
                  >
                    {opt.title}
                  </button>
                ))}
              </div>
              
              {selectedOption && (
                <div className={styles.optionDetails}>
                  <p className={styles.optionDescription}>
                    {selectedOption.description || "Experience our carefully crafted package designed to provide you with the ultimate relaxation and enjoyment."}
                  </p>
                  <div className={styles.optionMeta}>
                    <div className={styles.optionPrice}>
                      <span className={styles.priceLabel}>Price:</span> ${selectedOption.cost} 
                      {activity.pricingType === 'per_person' && ' per person'}
                    </div>
                    <div className={styles.optionCapacity}>
                      <span className={styles.capacityLabel}>Maximum Group Size:</span> {selectedOption.maxPeople} people
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Date Selection */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FaCalendarAlt style={{ marginRight: '10px' }} />
              Select Date
            </h3>
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={styles.dateInput}
            />
            
            <div className={styles.upcomingDates}>
              <div className={styles.dateSelector}>
                {[0, 1, 2, 3, 4].map((dayOffset) => {
                  const date = new Date();
                  date.setDate(date.getDate() + dayOffset);
                  const dateString = date.toISOString().split("T")[0];
                  return (
                    <button
                      key={dateString}
                      className={`${styles.dateButton} ${
                        selectedDate === dateString ? styles.selectedDate : ""
                      }`}
                      onClick={() => setSelectedDate(dateString)}
                    >
                      {date.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FaClock style={{ marginRight: '10px' }} />
              Select Time Slot
            </h3>
            {availableTimeslots.length > 0 ? (
              <div className={styles.timeslotGrid}>
                {availableTimeslots.map((time, index) => (
                  <button
                    key={index}
                    className={`${styles.timeslotButton} ${
                      selectedTime === time ? styles.selectedTimeslot : ""
                    }`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time.startTime} - {time.endTime}
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.noTimesText}>
                <FaInfoCircle style={{ marginRight: '8px' }} />
                No times available for {formatDate(selectedDate)}. Please try another date.
              </div>
            )}
          </div>

          {/* Number of People */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FaUsers style={{ marginRight: '10px' }} />
              Guest Information
            </h3>
            
            <label className={styles.label}>
              Number of Guests {selectedOption && `(Max: ${selectedOption.maxPeople})`}
            </label>
            <div className={styles.numPeopleContainer}>
              <button
                onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                className={styles.numButton}
                aria-label="Decrease number of people"
              >
                -
              </button>
              <input
                type="number"
                value={numPeople}
                min="1"
                max={selectedOption?.maxPeople || Infinity}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value) || 1;
                  const maxAllowed = selectedOption?.maxPeople || Infinity;
                  if (newValue > maxAllowed) {
                    alert(`Cannot book for more than ${maxAllowed} people.`);
                    setNumPeople(maxAllowed);
                  } else {
                    setNumPeople(newValue);
                  }
                }}
                className={styles.numInput}
              />
              <button
                onClick={() => {
                  const maxAllowed = selectedOption?.maxPeople || Infinity;
                  if (numPeople < maxAllowed) {
                    setNumPeople(numPeople + 1);
                  } else {
                    alert(`Cannot book for more than ${maxAllowed} people.`);
                  }
                }}
                className={styles.numButton}
                aria-label="Increase number of people"
              >
                +
              </button>
            </div>
            
            {selectedOption?.maxPeople && selectedOption.maxPeople > 1 && (
              <div className={styles.tipContainer}>
                <p className={styles.tipText}>
                  <FaInfoCircle style={{ marginRight: '8px' }} />
                  For groups larger than {Math.floor(selectedOption.maxPeople * 0.7)}, please contact us directly for special rates and availability.
                </p>
              </div>
            )}

            {/* Multi-User Reservation Toggle */}
            <div className={styles.guestOption}>
              <label className={styles.label}>Shared Experience</label>
              <div className={styles.toggleContainer}>
                <button
                  className={`${styles.toggleButton} ${
                    multiUser ? styles.toggleButtonSelected : ""
                  }`}
                  onClick={() => setMultiUser(true)}
                >
                  Yes
                </button>
                <button
                  className={`${styles.toggleButton} ${
                    !multiUser ? styles.toggleButtonSelected : ""
                  }`}
                  onClick={() => setMultiUser(false)}
                >
                  No
                </button>
              </div>
              
              <div className={styles.tipContainer}>
                <p className={styles.tipText}>
                  <FaInfoCircle style={{ marginRight: '8px' }} />
                  Select "Yes" if you're open to sharing this experience with other guests. This option may offer reduced rates.
                </p>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Cancellation Policy</h3>
            <p className={styles.policyText}>
              • Free cancellation up to 48 hours before your experience<br />
              • 50% refund for cancellations between 24-48 hours before scheduled time<br />
              • No refunds for cancellations less than 24 hours before scheduled time<br />
              • Rescheduling is possible subject to availability (at least 24 hours notice required)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}