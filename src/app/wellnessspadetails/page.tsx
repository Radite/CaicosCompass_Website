"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./wellnessspadetails.module.css";

// Simplified interfaces
interface Image { url: string; isMain?: boolean; }
interface TimeSlot { startTime: string; endTime: string; _id?: string; }
interface AvailableSlot { date: string; timeSlots: TimeSlot[]; _id?: string; }
interface WeeklyDay { day: string; isAvailable: boolean; timeSlots: TimeSlot[]; _id?: string; }
interface DateException { date: string; isAvailable: boolean; _id?: string; }
interface Service {
  _id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  discountedPrice?: number;
  category: string;
  availableSlots?: AvailableSlot[];
  images: Image[];
  weeklyAvailability?: WeeklyDay[];
  dateExceptions?: DateException[];
}
interface OpeningHour { day: string; openTime: string; closeTime: string; _id?: string; }
interface CustomClosure { date: string; reason?: string; _id?: string; }
interface WellnessProgram { title: string; description?: string; durationDays: number; price: number; _id?: string; }
interface SpaItem {
  _id: string;
  name: string;
  description: string;
  location: string;
  coordinates: { latitude: number; longitude: number; };
  images: Image[];
  island: string;
  spaType: string;
  servicesOffered: Service[];
  ageRestrictions: { minAge: number; maxAge: number; };
  openingHours: OpeningHour[];
  customClosures?: CustomClosure[];
  wellnessPrograms: WellnessProgram[];
  cancellationPolicy: string;
  paymentOptions: string[];
  hostId?: string;
}
interface BookingDetails {
  serviceId: string;
  serviceName: string;
  date: string;
  timeSlot: TimeSlot;
  price: number;
  discountedPrice?: number;
}

export default function WellnessSpaDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<SpaItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hostEmail, setHostEmail] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  // Generate available slots from weekly availability
  const generateAvailableSlots = (weeklyAvailability?: WeeklyDay[], dateExceptions?: DateException[]) => {
    if (!weeklyAvailability) return [];
    
    const slots = [];
    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = days[date.getDay()];
      const schedule = weeklyAvailability.find(day => day.day === dayName);
      
      if (schedule?.isAvailable) {
        const dateString = date.toISOString().split('T')[0];
        const isException = dateExceptions?.some(ex => 
          new Date(ex.date).toISOString().split('T')[0] === dateString && !ex.isAvailable
        );
        
        if (!isException) {
          slots.push({
            date: dateString,
            timeSlots: schedule.timeSlots.map(slot => ({
              startTime: slot.startTime,
              endTime: slot.endTime
            }))
          });
        }
      }
    }
    return slots;
  };

  // Fetch host's email
  const fetchHostEmail = async (hostId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${hostId}/email`);
      if (response.ok) {
        const data = await response.json();
        setHostEmail(data.email);
      }
    } catch (error) {
      console.error('Error fetching host email:', error);
    }
  };

  useEffect(() => {
    const itemParam = searchParams.get("item");
    if (!itemParam) {
      setLoading(false);
      setError("No spa information provided");
      return;
    }

    try {
      // Parse the item data
      let parsed: SpaItem;
      try {
        parsed = JSON.parse(itemParam);
      } catch {
        parsed = JSON.parse(decodeURIComponent(itemParam));
      }

      // Process services
      if (parsed.servicesOffered) {
        parsed.servicesOffered = parsed.servicesOffered.map(service => {
          if (!service.availableSlots && service.weeklyAvailability) {
            return { 
              ...service, 
              availableSlots: generateAvailableSlots(service.weeklyAvailability, service.dateExceptions)
            };
          }
          return service;
        });
      }
      
      setItem(parsed);
      if (parsed.servicesOffered?.length > 0) {
        setSelectedService(parsed.servicesOffered[0]._id);
      }
      
      // Fetch host email
      if (parsed.hostId) {
        fetchHostEmail(parsed.hostId);
      } else {
        fetchHostEmail("6789cf36bd1c2a7c2ef540a7");
      }
    } catch (error) {
      console.error("Error parsing wellness spa item:", error);
      setError("Unable to load spa details. Invalid data format.");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  };

  const getSelectedService = () => item?.servicesOffered.find(s => s._id === selectedService);
  const getAvailableDates = () => getSelectedService()?.availableSlots?.map(slot => slot.date) || [];
  const getTimeSlots = () => {
    const service = getSelectedService();
    if (!service || !selectedDate) return [];
    return service.availableSlots?.find(slot => slot.date === selectedDate)?.timeSlots || [];
  };

  // Handle user interactions
  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedDate(null);
  };

  const handleInquireNow = (program: WellnessProgram) => {
    if (!item) return;
    
    const subject = `Inquiry about ${program.title} at ${item.name}`;
    const body = `Hello,\n\nI'm interested in the ${program.title} wellness program at ${item.name} (${program.durationDays} days, $${program.price}).\n\nCould you please provide me with more information?\n\nThank you.`;
    const email = hostEmail || "contact@wellnessspa.com";
    
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const handleBookNow = (serviceId: string, timeSlot: TimeSlot) => {
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

  const handleProceedToPayment = () => {
    if (!bookingDetails || !item) return;
    
    const bookingInfo = encodeURIComponent(JSON.stringify({
      spaId: item._id,
      spaName: item.name,
      ...bookingDetails
    }));
    
    router.push(`/payment?booking=${bookingInfo}`);
  };

  if (loading) return <div className={styles.container}>Loading wellness spa details...</div>;

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

  if (!item) return <div className={styles.container}>No spa details found</div>;

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        <span className={styles.backIcon}>←</span> Back
      </button>

      {/* Hero Section */}
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
            <div className={styles.infoItem}><span className={styles.infoIcon}>📍</span>{item.location}, {item.island}</div>
            <div className={styles.infoItem}><span className={styles.infoIcon}>🧖</span>{item.spaType}</div>
            <div className={styles.infoItem}><span className={styles.infoIcon}>💳</span>{item.paymentOptions.join(", ")}</div>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>⚠️</span>
              Ages {item.ageRestrictions.minAge}{item.ageRestrictions.maxAge ? ` - ${item.ageRestrictions.maxAge}` : '+'}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        {/* Sidebar */}
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

          {item.customClosures?.length > 0 && (
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

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Services Section */}
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

                {/* Booking Section */}
                <div className={styles.bookingSection}>
                  <h4 className={styles.bookingTitle}>Select a Date</h4>
                  <div className={styles.dateSelector}>
                    {getAvailableDates().length > 0 ? (
                      getAvailableDates().map((date, index) => (
                        <button
                          key={index}
                          className={`${styles.dateButton} ${selectedDate === date ? styles.selectedDate : ''}`}
                          onClick={() => setSelectedDate(date)}
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

          {/* Wellness Programs */}
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
                        <span className={styles.metaIcon}>📅</span> {program.durationDays} days
                      </span>
                      <span className={styles.programPrice}>
                        <span className={styles.metaIcon}>💰</span> ${program.price}
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
                onClick={() => setShowConfirmation(false)}
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