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
interface CustomClosure { 
  date: string | { $date: string } | Date; 
  reason?: string; 
  _id?: string; 
}
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
  ageRestrictions: { minAge: number; maxAge?: number; };
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

function safeDecode(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch (error) {
    console.error("Error parsing spa item:", error);
    return str;
  }
}

// Calendar Component for Service Booking
interface ServiceCalendarProps {
  availableSlots: AvailableSlot[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

const ServiceCalendar: React.FC<ServiceCalendarProps> = ({ availableSlots, selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };
  
  const getLastDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };
  
  const getDaysInMonth = () => {
    const firstDay = getFirstDayOfMonth(currentMonth);
    const lastDay = getLastDayOfMonth(currentMonth);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const dateString = currentDate.toISOString().split('T')[0];
      const isCurrentMonth = currentDate.getMonth() === currentMonth.getMonth();
      const isAvailable = availableSlots.some(slot => slot.date === dateString);
      const isToday = dateString === new Date().toISOString().split('T')[0];
      const isSelected = dateString === selectedDate;
      
      days.push({
        date: new Date(currentDate),
        dateString,
        isCurrentMonth,
        isAvailable,
        isToday,
        isSelected,
        day: currentDate.getDate()
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    const today = new Date();
    const maxFutureMonth = new Date(today.getFullYear(), today.getMonth() + 6, 1); // 6 months ahead
    
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
      // Don't go before current month
      if (newMonth >= new Date(today.getFullYear(), today.getMonth(), 1)) {
        setCurrentMonth(newMonth);
      }
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
      // Don't go beyond 6 months in the future
      if (newMonth <= maxFutureMonth) {
        setCurrentMonth(newMonth);
      }
    }
  };
  
  const days = getDaysInMonth();
  
  return (
    <div style={{
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      padding: '15px',
      backgroundColor: '#fff',
      marginTop: '15px',
      marginBottom: '20px'
    }}>
      {/* Calendar Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <button
          onClick={() => navigateMonth('prev')}
          disabled={currentMonth <= new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
          style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            padding: '8px 12px',
            cursor: currentMonth <= new Date(new Date().getFullYear(), new Date().getMonth(), 1) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            color: currentMonth <= new Date(new Date().getFullYear(), new Date().getMonth(), 1) ? '#adb5bd' : '#495057',
            opacity: currentMonth <= new Date(new Date().getFullYear(), new Date().getMonth(), 1) ? 0.6 : 1
          }}
        >
          ← Prev
        </button>
        
        <h4 style={{
          margin: 0,
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#495057'
        }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h4>
        
        <button
          onClick={() => navigateMonth('next')}
          disabled={currentMonth >= new Date(new Date().getFullYear(), new Date().getMonth() + 6, 1)}
          style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            padding: '8px 12px',
            cursor: currentMonth >= new Date(new Date().getFullYear(), new Date().getMonth() + 6, 1) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            color: currentMonth >= new Date(new Date().getFullYear(), new Date().getMonth() + 6, 1) ? '#adb5bd' : '#495057',
            opacity: currentMonth >= new Date(new Date().getFullYear(), new Date().getMonth() + 6, 1) ? 0.6 : 1
          }}
        >
          Next →
        </button>
      </div>
      
      {/* Days of Week Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px',
        marginBottom: '5px'
      }}>
        {daysOfWeek.map(day => (
          <div key={day} style={{
            padding: '8px 4px',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: '#6c757d'
          }}>
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px'
      }}>
        {days.map((day, index) => {
          const slotsForDay = availableSlots.find(slot => slot.date === day.dateString);
          const timeSlotCount = slotsForDay?.timeSlots.length || 0;
          
          return (
            <button
              key={index}
              onClick={() => day.isAvailable && day.isCurrentMonth ? onDateSelect(day.dateString) : null}
              disabled={!day.isAvailable || !day.isCurrentMonth}
              title={
                day.isAvailable && day.isCurrentMonth ? 
                `${timeSlotCount} time slot${timeSlotCount !== 1 ? 's' : ''} available` : 
                day.isCurrentMonth ? 'No appointments available' : ''
              }
              style={{
                padding: '10px 4px',
                border: 'none',
                borderRadius: '6px',
                cursor: day.isAvailable && day.isCurrentMonth ? 'pointer' : 'not-allowed',
                fontSize: '0.9rem',
                fontWeight: day.isToday ? '700' : '500',
                backgroundColor: 
                  day.isSelected ? '#0C54CF' :
                  day.isToday ? '#e3f2fd' :
                  day.isAvailable && day.isCurrentMonth ? '#f8f9fa' :
                  !day.isCurrentMonth ? 'transparent' :
                  '#f1f3f4',
                color:
                  day.isSelected ? 'white' :
                  day.isToday ? '#0C54CF' :
                  day.isAvailable && day.isCurrentMonth ? '#495057' :
                  !day.isCurrentMonth ? '#dee2e6' :
                  '#adb5bd',
                border: day.isToday && !day.isSelected ? '2px solid #0C54CF' : '1px solid transparent',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                if (day.isAvailable && day.isCurrentMonth && !day.isSelected) {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseOut={(e) => {
                if (day.isAvailable && day.isCurrentMonth && !day.isSelected) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {day.day}
              {day.isAvailable && day.isCurrentMonth && (
                <>
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: day.isSelected ? 'white' : '#28a745'
                  }} />
                  {timeSlotCount > 1 && (
                    <div style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      fontSize: '0.6rem',
                      backgroundColor: day.isSelected ? 'rgba(255,255,255,0.3)' : '#28a745',
                      color: day.isSelected ? 'white' : 'white',
                      borderRadius: '8px',
                      padding: '1px 3px',
                      lineHeight: '1',
                      minWidth: '12px',
                      textAlign: 'center'
                    }}>
                      {timeSlotCount}
                    </div>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '15px',
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        fontSize: '0.8rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#28a745'
          }} />
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#0C54CF'
          }} />
          <span>Selected</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#adb5bd'
          }} />
          <span>Unavailable</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '6px',
            backgroundColor: '#28a745',
            color: 'white',
            fontSize: '0.6rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700'
          }}>3</div>
          <span>Time slots</span>
        </div>
      </div>
    </div>
  );
};

export default function WellnessSpaDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<SpaItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [selectedAvailabilityFilter, setSelectedAvailabilityFilter] = useState<string>("all");
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [currentModalIndex, setCurrentModalIndex] = useState<number>(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hostEmail, setHostEmail] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  // Generate available slots from weekly availability - updated to show ongoing weekly schedule
  const generateAvailableSlots = (weeklyAvailability?: WeeklyDay[], dateExceptions?: DateException[], customClosures?: CustomClosure[]) => {
    if (!weeklyAvailability || weeklyAvailability.length === 0) return [];
    
    const slots = [];
    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Generate dates for the next 6 months (approximately 180 days)
    for (let i = 0; i < 180; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = days[date.getDay()];
      const schedule = weeklyAvailability.find(day => day.day === dayName && day.isAvailable);
      
      if (schedule && schedule.timeSlots.length > 0) {
        const dateString = date.toISOString().split('T')[0];
        
        // Check if this date is excluded by date exceptions
        const isExcludedByException = dateExceptions?.some(ex => {
          const exceptionDateString = ex.date.includes('T') ? ex.date.split('T')[0] : ex.date;
          return exceptionDateString === dateString && !ex.isAvailable;
        });
        
        // Check if this date is excluded by custom closures
        const isExcludedByClosure = customClosures?.some(closure => {
          let closureDateString: string;
          if (typeof closure.date === 'string') {
            closureDateString = closure.date.includes('T') ? closure.date.split('T')[0] : closure.date;
          } else if (closure.date && typeof closure.date === 'object' && '$date' in closure.date) {
            // Handle MongoDB date format
            closureDateString = new Date(closure.date.$date).toISOString().split('T')[0];
          } else {
            closureDateString = new Date(closure.date).toISOString().split('T')[0];
          }
          return closureDateString === dateString;
        });
        
        if (!isExcludedByException && !isExcludedByClosure) {
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
        parsed = JSON.parse(safeDecode(itemParam));
      }

      // Process services
      if (parsed.servicesOffered) {
        parsed.servicesOffered = parsed.servicesOffered.map(service => {
          if (!service.availableSlots && service.weeklyAvailability) {
            return { 
              ...service, 
              availableSlots: generateAvailableSlots(service.weeklyAvailability, service.dateExceptions, parsed.customClosures)
            };
          }
          return service;
        });
      }
      
      setItem(parsed);
      const mainImage = parsed.images.find((img) => img.isMain)?.url;
      setSelectedImage(mainImage || parsed.images[0]?.url || null);
      
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

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!modalImage) return;
      
      if (e.key === 'Escape') {
        closeImageModal();
      } else if (e.key === 'ArrowLeft') {
        navigateModal('prev');
      } else if (e.key === 'ArrowRight') {
        navigateModal('next');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [modalImage, currentModalIndex, modalImages]);

  if (loading) return <div className={styles.container}>Loading wellness spa details...</div>;

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>{error}</div>
        <button onClick={() => router.back()} className={styles.backButton}>
          Back
        </button>
      </div>
    );
  }

  if (!item) return <div className={styles.container}>No spa details found</div>;

  // Filter services based on category and availability
  const filteredServices = item.servicesOffered.filter(service => {
    // Category filter
    const categoryMatch = selectedTab === "all" || 
      service.category.toLowerCase() === selectedTab.toLowerCase();
    
    // Availability filter
    let availabilityMatch = true;
    if (selectedAvailabilityFilter !== "all") {
      const hasSlots = service.availableSlots && service.availableSlots.length > 0;
      availabilityMatch = selectedAvailabilityFilter === "available" ? hasSlots : !hasSlots;
    }
    
    return categoryMatch && availabilityMatch;
  });

  // Get unique categories for service tabs
  const categories = [
    "all",
    ...new Set(item.servicesOffered.map((service) => service.category.toLowerCase())),
  ];

  // Get availability counts
  const availabilityCounts = {
    all: item.servicesOffered.length,
    available: item.servicesOffered.filter(s => s.availableSlots && s.availableSlots.length > 0).length,
    unavailable: item.servicesOffered.filter(s => !s.availableSlots || s.availableSlots.length === 0).length
  };

  // Check if spa is currently open
  const getCurrentDayHours = () => {
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return item.openingHours.find(hours => hours.day === currentDay);
  };

  const todayHours = getCurrentDayHours();

  // Format date for TCI timezone
  const formatDate = (dateInput: string | Date) => {
    let dateString: string;
    
    if (dateInput instanceof Date) {
      dateString = dateInput.toISOString();
    } else if (typeof dateInput === 'string') {
      dateString = dateInput;
    } else {
      return 'Invalid Date';
    }
    
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    
    return localDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatLongDate = (dateInput: string | Date | { $date: string }) => {
    let dateString: string;
    
    if (dateInput instanceof Date) {
      dateString = dateInput.toISOString();
    } else if (typeof dateInput === 'string') {
      dateString = dateInput;
    } else if (dateInput && typeof dateInput === 'object' && '$date' in dateInput) {
      // Handle MongoDB date format
      dateString = dateInput.$date;
    } else {
      return 'Invalid Date';
    }
    
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    
    return localDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  };

  // Modal functions
  const openImageModal = (imageUrl: string, allImages: string[] = []) => {
    setModalImage(imageUrl);
    setModalImages(allImages.length > 0 ? allImages : [imageUrl]);
    setCurrentModalIndex(allImages.findIndex(img => img === imageUrl) || 0);
  };

  const closeImageModal = () => {
    setModalImage(null);
    setModalImages([]);
    setCurrentModalIndex(0);
  };

  const navigateModal = (direction: 'prev' | 'next') => {
    if (modalImages.length <= 1) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentModalIndex === 0 ? modalImages.length - 1 : currentModalIndex - 1;
    } else {
      newIndex = currentModalIndex === modalImages.length - 1 ? 0 : currentModalIndex + 1;
    }
    
    setCurrentModalIndex(newIndex);
    setModalImage(modalImages[newIndex]);
  };

  // Booking functions
  const handleInquireNow = (program: WellnessProgram) => {
    const subject = `Inquiry about ${program.title} at ${item.name}`;
    const body = `Hello,\n\nI'm interested in the ${program.title} wellness program at ${item.name} (${program.durationDays} days, $${program.price}).\n\nCould you please provide me with more information?\n\nThank you.`;
    const email = hostEmail || "contact@wellnessspa.com";
    
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const handleBookNow = (serviceId: string, timeSlot: TimeSlot) => {
    const service = item.servicesOffered.find(s => s._id === serviceId);
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

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        Back
      </button>

      {/* Status info above image */}
      {(todayHours || item.ageRestrictions.minAge > 0 || item.servicesOffered.length > 0) && (
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '15px',
          flexWrap: 'wrap'
        }}>
          {todayHours && (
            <div style={{
              background: '#0C54CF',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              🕐 Today: {todayHours.openTime} - {todayHours.closeTime}
            </div>
          )}
          {item.ageRestrictions.minAge > 0 && (
            <div style={{
              background: '#6f42c1',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              👥 Ages {item.ageRestrictions.minAge}{item.ageRestrictions.maxAge ? ` - ${item.ageRestrictions.maxAge}` : '+'}
            </div>
          )}
          {item.servicesOffered.length > 0 && (() => {
            const availableCount = item.servicesOffered.filter(s => s.availableSlots && s.availableSlots.length > 0).length;
            const totalServices = item.servicesOffered.length;
            const availabilityPercentage = Math.round((availableCount / totalServices) * 100);
            
            return (
              <div style={{
                background: availabilityPercentage > 50 ? '#28a745' : availabilityPercentage > 0 ? '#ffc107' : '#dc3545',
                color: 'white',
                padding: '8px 15px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                💆 {availableCount}/{totalServices} Services Available ({availabilityPercentage}%)
              </div>
            );
          })()}
        </div>
      )}

      <div className={styles.heroSection}>
        <div className={styles.mainImageContainer}>
          <img
            src={selectedImage || item.images[0]?.url || "https://via.placeholder.com/400x300?text=No+Image"}
            alt={item.name}
            className={styles.mainImage}
            onClick={() => openImageModal(
              selectedImage || item.images[0]?.url || "", 
              item.images.map(img => img.url)
            )}
            style={{ cursor: 'pointer' }}
          />
          
          <div className={styles.imageThumbnails}>
            {item.images.map((img, index) => (
              <img
                key={index}
                src={img.url}
                alt={`${item.name} thumbnail ${index + 1}`}
                className={`${styles.thumbnailImage} ${
                  img.url === selectedImage ? styles.activeThumbnail : ""
                }`}
                onClick={() => setSelectedImage(img.url)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.title}>{item.name}</h1>
          <p className={styles.description}>{item.description}</p>

          <div className={styles.infoBox}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>📍 Location:</span>
              <span>{item.location}, {item.island}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>🧖 Spa Type:</span>
              <span>{item.spaType}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>👥 Age Requirements:</span>
              <span>Ages {item.ageRestrictions.minAge}{item.ageRestrictions.maxAge ? ` - ${item.ageRestrictions.maxAge}` : '+'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>💳 Payment:</span>
              <span>{item.paymentOptions.join(", ")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Use simple div layout instead of CSS grid */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Sidebar */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>🕐 Operating Hours</h2>
            {item.openingHours.map((hour, index) => {
              const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === hour.day;
              return (
                <div 
                  key={index} 
                  className={styles.hourRow}
                  style={isToday ? {
                    background: 'rgba(12, 84, 207, 0.1)',
                    borderLeft: '3px solid #0C54CF',
                    paddingLeft: '15px',
                    fontWeight: '600'
                  } : {}}
                >
                  <span className={styles.day} style={isToday ? { color: '#0C54CF' } : {}}>
                    {hour.day}
                  </span>
                  <span className={styles.time}>
                    {hour.openTime} - {hour.closeTime}
                  </span>
                </div>
              );
            })}
          </div>

          {item.customClosures && item.customClosures.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>📅 Special Closures</h2>
              {item.customClosures.map((closure, index) => (
                <div key={index} className={styles.closure}>
                  <p className={styles.closureDate}>
                    {formatLongDate(closure.date)}
                  </p>
                  <p className={styles.closureReason}>{closure.reason}</p>
                </div>
              ))}
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>📋 Cancellation Policy</h2>
            <p className={styles.policyText}>{item.cancellationPolicy}</p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>📍 Location & Map</h2>
            <div className={styles.locationInfo}>
              <p><strong>{item.location}</strong></p>
              <p>{item.island}</p>
              <p className={styles.coordinates}>
                📌 {item.coordinates.latitude.toFixed(6)}, {item.coordinates.longitude.toFixed(6)}
              </p>
              <div className={styles.mapContainer}>
                <iframe
                  src={`https://maps.google.com/maps?q=${item.coordinates.latitude},${item.coordinates.longitude}&z=15&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: "10px" }}
                  allowFullScreen
                  loading="lazy"
                  title="Spa Location Map"
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: '2', minWidth: '400px' }}>
          <div className={styles.servicesSection}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 className={styles.sectionTitle}>💆 Services & Treatments</h2>
              <div style={{
                background: '#e9ecef',
                color: '#495057',
                padding: '8px 15px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
              </div>
            </div>

            {/* Availability Filter */}
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ 
                margin: '0 0 10px 0', 
                fontSize: '1rem',
                color: '#495057',
                fontWeight: '600'
              }}>
                📅 Filter by Availability:
              </h4>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '15px'
              }}>
                <button
                  onClick={() => setSelectedAvailabilityFilter("all")}
                  style={{
                    background: selectedAvailabilityFilter === "all" ? '#0C54CF' : '#f8f9fa',
                    color: selectedAvailabilityFilter === "all" ? 'white' : '#495057',
                    border: '1px solid #dee2e6',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  All ({availabilityCounts.all})
                </button>
                <button
                  onClick={() => setSelectedAvailabilityFilter("available")}
                  style={{
                    background: selectedAvailabilityFilter === "available" ? '#28a745' : '#f8f9fa',
                    color: selectedAvailabilityFilter === "available" ? 'white' : '#495057',
                    border: '1px solid #dee2e6',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ✅ Available ({availabilityCounts.available})
                </button>
                <button
                  onClick={() => setSelectedAvailabilityFilter("unavailable")}
                  style={{
                    background: selectedAvailabilityFilter === "unavailable" ? '#dc3545' : '#f8f9fa',
                    color: selectedAvailabilityFilter === "unavailable" ? 'white' : '#495057',
                    border: '1px solid #dee2e6',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ❌ Unavailable ({availabilityCounts.unavailable})
                </button>
              </div>
            </div>

            {/* Service category tabs */}
            {categories.length > 1 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  margin: '0 0 10px 0', 
                  fontSize: '1rem',
                  color: '#495057',
                  fontWeight: '600'
                }}>
                  🏷️ Filter by Category:
                </h4>
                <div className={styles.servicesTabs}>
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`${styles.serviceTab} ${
                        selectedTab === category ? styles.activeTab : ""
                      }`}
                      onClick={() => setSelectedTab(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active filters display */}
            {(selectedTab !== "all" || selectedAvailabilityFilter !== "all") && (
              <div style={{
                background: '#f8f9fa',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ 
                    fontSize: '0.9rem', 
                    color: '#495057',
                    fontWeight: '600' 
                  }}>
                    🔍 Active Filters:
                  </span>
                  {selectedTab !== "all" && (
                    <span style={{
                      background: '#0C54CF',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      Category: {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
                    </span>
                  )}
                  {selectedAvailabilityFilter !== "all" && (
                    <span style={{
                      background: selectedAvailabilityFilter === "available" ? '#28a745' : '#dc3545',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      Status: {selectedAvailabilityFilter.charAt(0).toUpperCase() + selectedAvailabilityFilter.slice(1)}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedTab("all");
                      setSelectedAvailabilityFilter("all");
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#6c757d',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}

            {/* Display filtered services */}
            {filteredServices.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '2px dashed #dee2e6'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>
                  {selectedAvailabilityFilter === "unavailable" ? "❌" : 
                   selectedAvailabilityFilter === "available" ? "✅" : "🔍"}
                </div>
                <h3 style={{ color: '#495057', marginBottom: '10px' }}>
                  {selectedAvailabilityFilter === "unavailable" ? "No unavailable services" :
                   selectedAvailabilityFilter === "available" ? "No available services" :
                   "No services found"}
                </h3>
                <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                  {selectedTab !== "all" && selectedAvailabilityFilter !== "all" 
                    ? `No ${selectedAvailabilityFilter} services in the ${selectedTab} category.`
                    : selectedTab !== "all" 
                    ? `No services available in the ${selectedTab} category.`
                    : selectedAvailabilityFilter !== "all"
                    ? `No ${selectedAvailabilityFilter} services available.`
                    : "No services are offered at this spa."
                  }
                </p>
                {(selectedTab !== "all" || selectedAvailabilityFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSelectedTab("all");
                      setSelectedAvailabilityFilter("all");
                    }}
                    style={{
                      background: '#0C54CF',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}
                  >
                    🔄 Show All Services
                  </button>
                )}
              </div>
            ) : (
              filteredServices.map((service) => {
                const hasDiscount = service.discountedPrice && service.discountedPrice < service.price;
                const savingsAmount = hasDiscount ? service.price - service.discountedPrice! : 0;
                const isAvailable = service.availableSlots && service.availableSlots.length > 0;
                
                return (
                  <div key={service._id} className={styles.serviceDetails}>
                    <div className={styles.serviceHeader}>
                      <div>
                        <h3 className={styles.serviceName}>{service.name}</h3>
                        <p className={styles.serviceCategory}>💆 {service.category} • {service.duration} mins</p>
                      </div>
                      <div className={styles.serviceMeta}>
                        <div className={styles.serviceAvailability} style={{
                          color: isAvailable ? '#28a745' : '#dc3545'
                        }}>
                          {isAvailable ? '✅ Available' : '❌ Unavailable'}
                        </div>
                        <div className={styles.servicePrice}>
                          {hasDiscount ? (
                            <>
                              <span className={styles.discountedPrice}>
                                ${service.discountedPrice}
                              </span>
                              <span className={styles.originalPrice}>
                                ${service.price}
                              </span>
                              <div style={{
                                fontSize: '0.8rem',
                                color: '#28a745',
                                fontWeight: '600',
                                marginTop: '4px'
                              }}>
                                💰 Save ${savingsAmount.toFixed(2)}
                              </div>
                            </>
                          ) : (
                            <span>${service.price}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className={styles.serviceDescription}>
                      {service.description}
                    </p>

                    {service.images && service.images.length > 0 && (
                      <div className={styles.serviceImages}>
                        {service.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img.url}
                            alt={`${service.name} ${idx + 1}`}
                            className={styles.serviceImage}
                            onClick={() => openImageModal(img.url, service.images.map(i => i.url))}
                            style={{ cursor: 'pointer' }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Booking Section */}
                    {isAvailable && (
                      <div className={styles.bookingSection}>
                        <h4 className={styles.bookingTitle}>Select a Date</h4>
                        
                        {/* Quick Date Buttons */}
                        {service.availableSlots && service.availableSlots.length > 0 && (
                          <div className={styles.quickDates} style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '8px',
                            marginBottom: '15px',
                            padding: '10px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '6px',
                            border: '1px solid #e9ecef'
                          }}>
                            <span style={{ fontSize: '0.9rem', color: '#6c757d', marginRight: '5px', fontWeight: '600' }}>Quick Select:</span>
                            {service.availableSlots.slice(0, 4).map((slot, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setSelectedDate(slot.date);
                                  setSelectedService(service._id);
                                }}
                                style={{
                                  background: selectedDate === slot.date && selectedService === service._id ? '#0C54CF' : 'white',
                                  color: selectedDate === slot.date && selectedService === service._id ? 'white' : '#495057',
                                  border: '1px solid #dee2e6',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                  if (!(selectedDate === slot.date && selectedService === service._id)) {
                                    e.currentTarget.style.backgroundColor = '#e9ecef';
                                  }
                                }}
                                onMouseOut={(e) => {
                                  if (!(selectedDate === slot.date && selectedService === service._id)) {
                                    e.currentTarget.style.backgroundColor = 'white';
                                  }
                                }}
                              >
                                {formatShortDate(slot.date)}
                              </button>
                            ))}
                            {service.availableSlots.length > 4 && (
                              <span style={{ fontSize: '0.8rem', color: '#6c757d', fontStyle: 'italic' }}>
                                +{service.availableSlots.length - 4} more dates in calendar
                              </span>
                            )}
                          </div>
                        )}

                        {/* Calendar Component */}
                        <div style={{
                          marginBottom: '10px'
                        }}>
                          <p style={{
                            fontSize: '0.9rem',
                            color: '#6c757d',
                            margin: '0 0 10px 0',
                            textAlign: 'center'
                          }}>
                            📅 Browse available dates for the next 6 months based on weekly schedule
                          </p>
                        </div>
                        <ServiceCalendar 
                          availableSlots={service.availableSlots || []}
                          selectedDate={selectedService === service._id ? selectedDate : null}
                          onDateSelect={(date) => {
                            setSelectedDate(date);
                            setSelectedService(service._id);
                          }}
                        />

                        {selectedDate && selectedService === service._id && (
                          <>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '10px'
                            }}>
                              <h4 className={styles.bookingTitle} style={{ margin: 0 }}>Select a Time</h4>
                              <div style={{
                                fontSize: '0.8rem',
                                color: '#6c757d',
                                background: '#f8f9fa',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                border: '1px solid #e9ecef'
                              }}>
                                {service.availableSlots?.find(slot => slot.date === selectedDate)?.timeSlots.length || 0} slots available
                              </div>
                            </div>
                            <div className={styles.timeSelector}>
                              {service.availableSlots?.find(slot => slot.date === selectedDate)?.timeSlots.map((timeSlot, index) => (
                                <button
                                  key={index}
                                  className={styles.timeButton}
                                  onClick={() => handleBookNow(service._id, timeSlot)}
                                >
                                  {timeSlot.startTime} - {timeSlot.endTime}
                                </button>
                              )) || <p className={styles.noAvailability}>No available times for selected date</p>}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Service Action Button */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '15px',
                      padding: '12px',
                      background: !isAvailable ? '#ffebee' : '#f8f9fa',
                      borderRadius: '8px',
                      border: !isAvailable ? '1px solid #ffcdd2' : '1px solid #e9ecef'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: isAvailable ? '#28a745' : '#dc3545',
                          fontWeight: '600' 
                        }}>
                          {isAvailable ? '✅ Available for Booking' : '❌ Currently Unavailable'}
                        </div>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: '#6c757d',
                          marginTop: '2px'
                        }}>
                          {isAvailable ? `${service.availableSlots?.length || 0} time slots available` : 'Check back later for availability'}
                        </div>
                      </div>
                      
                      <button
                        style={{
                          background: !isAvailable ? '#6c757d' : '#0C54CF',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '6px',
                          cursor: !isAvailable ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          opacity: !isAvailable ? 0.6 : 1,
                          transition: 'all 0.2s ease'
                        }}
                        disabled={!isAvailable}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedService(service._id);
                            // Scroll to booking section
                            const element = document.querySelector(`[data-service-id="${service._id}"]`);
                            element?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        {!isAvailable ? '❌ Unavailable' : '📅 Book Now'}
                      </button>
                    </div>

                    {hasDiscount && isAvailable && (
                      <div style={{
                        background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        marginTop: '15px',
                        fontWeight: '600',
                        textAlign: 'center',
                        fontSize: '0.95rem'
                      }}>
                        🔥 Limited Time: {Math.round((savingsAmount / service.price) * 100)}% OFF!
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Wellness Programs */}
          {item.wellnessPrograms.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>🌿 Wellness Programs</h2>
              <div className={styles.programsGrid}>
                {item.wellnessPrograms.map((program, index) => (
                  <div key={index} className={styles.programCard}>
                    <h3 className={styles.programTitle}>{program.title}</h3>
                    <p className={styles.programDescription}>{program.description}</p>
                    <div className={styles.programMeta}>
                      <span className={styles.programDuration}>
                        📅 {program.durationDays} days
                      </span>
                      <span className={styles.programPrice}>
                        💰 ${program.price}
                      </span>
                    </div>
                    <button 
                      className={styles.inquireButton}
                      onClick={() => handleInquireNow(program)}
                    >
                      📧 Inquire Now
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
                <span className={styles.confirmationValue}>{formatShortDate(bookingDetails.date)}</span>
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

      {/* Image Modal */}
      {modalImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={closeImageModal}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeImageModal}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
              }}
            >
              ✕
            </button>

            {/* Navigation buttons */}
            {modalImages.length > 1 && (
              <>
                <button
                  onClick={() => navigateModal('prev')}
                  style={{
                    position: 'absolute',
                    left: '-60px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: 'white',
                    fontSize: '20px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={() => navigateModal('next')}
                  style={{
                    position: 'absolute',
                    right: '-60px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: 'white',
                    fontSize: '20px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  ›
                </button>
              </>
            )}

            {/* Main image */}
            <img
              src={modalImage}
              alt="Service image"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
              }}
            />

            {/* Image counter */}
            {modalImages.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '-40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {currentModalIndex + 1} of {modalImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}