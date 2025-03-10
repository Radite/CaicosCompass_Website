"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./wellnessspadetails.module.css";

interface Image {
  url: string;
  isMain?: boolean;
}

interface AvailableTimeSlot {
  startTime: string;
  endTime: string;
  _id?: string;
}

interface AvailableSlot {
  date: string;
  timeSlots: AvailableTimeSlot[];
  _id?: string;
}

interface WeeklyAvailability {
  day: string;
  isAvailable: boolean;
  timeSlots: AvailableTimeSlot[];
  _id?: string;
}

interface DateException {
  date: string;
  isAvailable: boolean;
  _id?: string;
}

interface ServiceOffered {
  _id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  discountedPrice?: number;
  category: string;
  availableSlots?: AvailableSlot[];
  images: Image[];
  weeklyAvailability?: WeeklyAvailability[];
  dateExceptions?: DateException[];
}

interface OpeningHour {
  day: string;
  openTime: string;
  closeTime: string;
  _id?: string;
}

interface CustomClosure {
  date: string;
  reason?: string;
  _id?: string;
}

interface WellnessProgram {
  title: string;
  description?: string;
  durationDays: number;
  price: number;
  _id?: string;
}

interface WellnessSpaItem {
  _id: string;
  name: string;
  description: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  images: Image[];
  island: string;
  spaType: string;
  servicesOffered: ServiceOffered[];
  ageRestrictions: {
    minAge: number;
    maxAge: number;
  };
  openingHours: OpeningHour[];
  customClosures?: CustomClosure[];
  wellnessPrograms: WellnessProgram[];
  cancellationPolicy: string;
  paymentOptions: string[];
  hostId?: string; // Added hostId field
}

// New interface for booking confirmation
interface BookingConfirmation {
  serviceId: string;
  serviceName: string;
  date: string;
  timeSlot: AvailableTimeSlot;
  price: number;
  discountedPrice?: number;
}

export default function WellnessSpaDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<WellnessSpaItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hostEmail, setHostEmail] = useState<string | null>(null);
  
  // New states for booking confirmation
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingConfirmation | null>(null);

  // Function to generate available slots from weekly availability
  const generateAvailableSlotsFromWeekly = (
    weeklyAvailability?: WeeklyAvailability[], 
    dateExceptions?: DateException[]
  ) => {
    if (!weeklyAvailability) return [];
    
    const availableSlots = [];
    const today = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Generate slots for the next 14 days
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = daysOfWeek[date.getDay()];
      const daySchedule = weeklyAvailability.find(day => day.day === dayName);
      
      if (daySchedule && daySchedule.isAvailable) {
        const dateString = date.toISOString().split('T')[0];
        
        // Check if this date is in exceptions list
        const isException = dateExceptions?.some(ex => 
          new Date(ex.date).toISOString().split('T')[0] === dateString && !ex.isAvailable
        );
        
        if (!isException) {
          availableSlots.push({
            date: dateString,
            timeSlots: daySchedule.timeSlots.map(slot => ({
              startTime: slot.startTime,
              endTime: slot.endTime
            }))
          });
        }
      }
    }
    
    return availableSlots;
  };

  // Function to fetch host's email
  const fetchHostEmail = async (hostId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${hostId}/email`);
      if (!response.ok) {
        throw new Error('Failed to fetch host email');
      }
      const data = await response.json();
      setHostEmail(data.email);
    } catch (error) {
      console.error('Error fetching host email:', error);
    }
  };

  useEffect(() => {
    const itemParam = searchParams.get("item");
    if (itemParam) {
      try {
        // Try parsing directly first
        let parsed: WellnessSpaItem;
        try {
          parsed = JSON.parse(itemParam);
        } catch (parseError) {
          // If direct parsing fails, try decoding first
          parsed = JSON.parse(decodeURIComponent(itemParam));
        }

        // Process services and generate slots before setting the item state
        if (parsed.servicesOffered) {
          parsed.servicesOffered = parsed.servicesOffered.map(service => {
            if (!service.availableSlots && service.weeklyAvailability) {
              const availableSlots = generateAvailableSlotsFromWeekly(
                service.weeklyAvailability,
                service.dateExceptions
              );
              return { ...service, availableSlots };
            }
            return service;
          });
        }
        
        setItem(parsed);
        if (parsed.servicesOffered && parsed.servicesOffered.length > 0) {
          setSelectedService(parsed.servicesOffered[0]._id);
        }
        
        // Fetch host email if hostId is available
        if (parsed.hostId) {
          fetchHostEmail(parsed.hostId);
        } else {
          // Use a default hostId if not provided in the data
          // This is temporary - in a real app, the hostId should be part of the spa data
          fetchHostEmail("6789cf36bd1c2a7c2ef540a7");
        }
        
        setError(null);
      } catch (error) {
        console.error("Error parsing wellness spa item:", error);
        setError("Unable to load spa details. Invalid data format.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setError("No spa information provided");
    }
  }, [searchParams]);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedDate(null);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  // Function to handle inquire button click
  const handleInquireNow = (program: WellnessProgram) => {
    if (!item) return;
    
    // Create subject line with program details
    const subject = `Inquiry about ${program.title} at ${item.name}`;
    
    // Create email body
    const body = `Hello,

I'm interested in the ${program.title} wellness program at ${item.name} (${program.durationDays} days, $${program.price}).

Could you please provide me with more information?

Thank you.`;
    
    // Determine the email to send to
    const email = hostEmail || "contact@wellnessspa.com"; // Fallback email if host email is not available
    
    // Open Gmail compose with pre-filled fields
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.open(gmailUrl, '_blank');
  };

  // Modified to show confirmation instead of alert
  const handleBookNow = (serviceId: string, timeSlot: AvailableTimeSlot) => {
    const service = item?.servicesOffered.find(s => s._id === serviceId);
    if (service && selectedDate) {
      setBookingDetails({
        serviceId,
        serviceName: service.name,
        date: selectedDate,
        timeSlot,
        price: service.price,
        discountedPrice: service.discountedPrice
      });
      setShowConfirmation(true);
    }
  };

  // New function to handle proceeding to payment
  const handleProceedToPayment = () => {
    if (!bookingDetails) return;
    
    // Here you would navigate to the payment page with booking details
    // For now, let's create a URL with encoded booking information
    const bookingInfo = encodeURIComponent(JSON.stringify({
      spaId: item?._id,
      spaName: item?.name,
      ...bookingDetails
    }));
    
    router.push(`/payment?booking=${bookingInfo}`);
  };

  // Close confirmation modal
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setBookingDetails(null);
  };

  if (loading) {
    return <div className={styles.container}>Loading wellness spa details...</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>{error}</div>
        <button onClick={() => router.back()} className={styles.backButton}>
          <span className={styles.backIcon}>←</span> Back
        </button>
      </div>
    );
  }

  if (!item) {
    return <div className={styles.container}>No spa details found</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSelectedService = () => {
    return item.servicesOffered.find(service => service._id === selectedService);
  };

  const getAvailableDates = () => {
    const service = getSelectedService();
    if (!service || !service.availableSlots) return [];
    return service.availableSlots.map(slot => slot.date);
  };

  const getTimeSlots = () => {
    const service = getSelectedService();
    if (!service || !selectedDate || !service.availableSlots) return [];
    const slot = service.availableSlots.find(slot => slot.date === selectedDate);
    return slot ? slot.timeSlots : [];
  };

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        <span className={styles.backIcon}>←</span> Back
      </button>

      <div className={styles.heroSection}>
        <div className={styles.mainImageContainer}>
          <img
            src={item.images[activeImageIndex]?.url || "https://via.placeholder.com/800x500"}
            alt={item.name}
            className={styles.mainImage}
          />
          <div className={styles.imageThumbnails}>
            {item.images.map((img, index) => (
              <img
                key={index}
                src={img.url}
                alt={`${item.name} thumbnail ${index + 1}`}
                className={`${styles.thumbnailImage} ${index === activeImageIndex ? styles.activeThumbnail : ''}`}
                onClick={() => setActiveImageIndex(index)}
              />
            ))}
          </div>
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.title}>{item.name}</h1>
          <p className={styles.description}>{item.description}</p>
          
          <div className={styles.infoBox}>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>📍</span>
              <span>{item.location}, {item.island}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>🧖</span>
              <span>{item.spaType}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>💳</span>
              <span>{item.paymentOptions.join(", ")}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>⚠️</span>
              <span>Ages {item.ageRestrictions.minAge}{item.ageRestrictions.maxAge ? ` - ${item.ageRestrictions.maxAge}` : '+'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.sidebarSection}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Operating Hours</h2>
            {item.openingHours.map((hour, index) => (
              <div key={index} className={styles.hourRow}>
                <span className={styles.day}>{hour.day}</span>
                <span className={styles.time}>{hour.openTime} - {hour.closeTime}</span>
              </div>
            ))}
          </div>

          {item.customClosures && item.customClosures.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Custom Closures</h2>
              {item.customClosures.map((closure, index) => (
                <div key={index} className={styles.closure}>
                  <div className={styles.closureDate}>{formatDate(closure.date)}</div>
                  <div className={styles.closureReason}>{closure.reason}</div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Cancellation Policy</h2>
            <p className={styles.policyText}>{item.cancellationPolicy}</p>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.servicesSection}>
            <h2 className={styles.sectionTitle}>Services</h2>
            <div className={styles.servicesTabs}>
              {item.servicesOffered.map((service) => (
                <button
                  key={service._id}
                  className={`${styles.serviceTab} ${selectedService === service._id ? styles.activeTab : ''}`}
                  onClick={() => handleServiceSelect(service._id)}
                >
                  {service.name}
                </button>
              ))}
            </div>

            {getSelectedService() && (
              <div className={styles.serviceDetails}>
                <div className={styles.serviceHeader}>
                  <div>
                    <h3 className={styles.serviceName}>{getSelectedService()?.name}</h3>
                    <p className={styles.serviceCategory}>{getSelectedService()?.category}</p>
                  </div>
                  <div className={styles.serviceMeta}>
                    <div className={styles.serviceDuration}>
                      <span className={styles.metaIcon}>⏱️</span>
                      {getSelectedService()?.duration} minutes
                    </div>
                    <div className={styles.servicePrice}>
                      {getSelectedService()?.discountedPrice ? (
                        <>
                          <span className={styles.discountedPrice}>${getSelectedService()?.discountedPrice}</span>
                          <span className={styles.originalPrice}>${getSelectedService()?.price}</span>
                        </>
                      ) : (
                        <span>${getSelectedService()?.price}</span>
                      )}
                    </div>
                  </div>
                </div>

                <p className={styles.serviceDescription}>{getSelectedService()?.description}</p>

                <div className={styles.serviceImages}>
                  {getSelectedService()?.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={`${getSelectedService()?.name} image ${idx + 1}`}
                      className={styles.serviceImage}
                    />
                  ))}
                </div>

                <div className={styles.bookingSection}>
                  <h4 className={styles.bookingTitle}>Select a Date</h4>
                  <div className={styles.dateSelector}>
                    {getAvailableDates().length > 0 ? (
                      getAvailableDates().map((date, index) => (
                        <button
                          key={index}
                          className={`${styles.dateButton} ${selectedDate === date ? styles.selectedDate : ''}`}
                          onClick={() => handleDateSelect(date)}
                        >
                          {formatDate(date)}
                        </button>
                      ))
                    ) : (
                      <p className={styles.noAvailability}>No available dates for this service</p>
                    )}
                  </div>

                  {selectedDate && (
                    <>
                      <h4 className={styles.bookingTitle}>Select a Time</h4>
                      <div className={styles.timeSelector}>
                        {getTimeSlots().length > 0 ? (
                          getTimeSlots().map((slot, index) => (
                            <button
                              key={index}
                              className={styles.timeButton}
                              onClick={() => handleBookNow(selectedService!, slot)}
                            >
                              {slot.startTime} - {slot.endTime}
                            </button>
                          ))
                        ) : (
                          <p className={styles.noAvailability}>No available times for selected date</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {item.wellnessPrograms.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Wellness Programs</h2>
              <div className={styles.programsGrid}>
                {item.wellnessPrograms.map((program, index) => (
                  <div key={index} className={styles.programCard}>
                    <h3 className={styles.programTitle}>{program.title}</h3>
                    <p className={styles.programDescription}>{program.description}</p>
                    <div className={styles.programMeta}>
                      <span className={styles.programDuration}>
                        <span className={styles.metaIcon}>📅</span>
                        {program.durationDays} days
                      </span>
                      <span className={styles.programPrice}>
                        <span className={styles.metaIcon}>💰</span>
                        ${program.price}
                      </span>
                    </div>
                    <button 
                      className={styles.inquireButton}
                      onClick={() => handleInquireNow(program)}
                    >
                      Inquire Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showConfirmation && bookingDetails && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmationModal}>
            <h3 className={styles.confirmationTitle}>Confirm Your Booking</h3>
            
            <div className={styles.confirmationDetails}>
              <div className={styles.confirmationRow}>
                <span className={styles.confirmationLabel}>Service:</span>
                <span className={styles.confirmationValue}>{bookingDetails.serviceName}</span>
              </div>
              <div className={styles.confirmationRow}>
                <span className={styles.confirmationLabel}>Date:</span>
                <span className={styles.confirmationValue}>{formatDate(bookingDetails.date)}</span>
              </div>
              <div className={styles.confirmationRow}>
                <span className={styles.confirmationLabel}>Time:</span>
                <span className={styles.confirmationValue}>
                  {bookingDetails.timeSlot.startTime} - {bookingDetails.timeSlot.endTime}
                </span>
              </div>
              <div className={styles.confirmationRow}>
                <span className={styles.confirmationLabel}>Price:</span>
                <span className={styles.confirmationValue}>
                  {bookingDetails.discountedPrice ? (
                    <>
                      <span className={styles.discountedPrice}>${bookingDetails.discountedPrice}</span>
                      <span className={styles.originalPrice}>${bookingDetails.price}</span>
                    </>
                  ) : (
                    <span>${bookingDetails.price}</span>
                  )}
                </span>
              </div>
            </div>
            
            <div className={styles.confirmationActions}>
              <button 
                className={styles.cancelButton}
                onClick={handleCloseConfirmation}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmButton}
                onClick={handleProceedToPayment}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}