'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaWifi, FaSwimmingPool, FaUmbrellaBeach, FaUtensils, FaCar, FaTv, FaSnowflake } from 'react-icons/fa';
import { GiBarbecue } from 'react-icons/gi';
import { MdPets, MdSelfImprovement, MdKitchen, MdLocalLaundryService, MdWork } from 'react-icons/md';
import { IoMdTime } from 'react-icons/io';
import styles from './staydetails.module.css';
import { useAuth } from '../contexts/AuthContext'; // Import auth context
import { useCart } from '../contexts/CartContext'; // Add this import

interface Stay {
  _id: string;
  name: string;
  description?: string;
  stayDescription?: string;
  location: string;
  island: string;
  images: {
    url: string;
    isMain?: boolean;
    _id?: string;
  }[];
  stayImages?: string[];
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  amenities: {
    hotTub: boolean;
    ac: boolean;
    pool: boolean;
    wifi: boolean;
    freeParking: boolean;
    beachfront: boolean;
    kitchen: boolean;
    washer: boolean;
    dryer: boolean;
    heating: boolean;
    dedicatedWorkspace: boolean;
    tv: boolean;
    hairDryer: boolean;
    iron: boolean;
    evCharger: boolean;
    crib: boolean;
    kingBed: boolean;
    gym: boolean;
    bbqGrill: boolean;
    breakfast: boolean;
    indoorFireplace: boolean;
    smokingAllowed: boolean;
    smokeAlarm: boolean;
    carbonMonoxideAlarm: boolean;
  };
  bookingOptions: {
    instantBook: boolean;
    selfCheckIn: boolean;
    allowPets: boolean;
  };
  tags: {
    isLuxe: boolean;
    isGuestFavorite: boolean;
  };
  policies: {
    checkInTime: string;
    checkOutTime: string;
    cancellationPolicy: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: string;
  propertyType?: string;
  unavailableDates: Array<{
    startDate: string;
    endDate: string;
  }>;
}

export default function StayDetails() {
  const { addToCart } = useCart(); // Add cart functionality
const [addingToCart, setAddingToCart] = useState(false);
const [addedToCart, setAddedToCart] = useState(false);
const [toast, setToast] = useState<{
  show: boolean;
  message: string;
  type: 'success' | 'error';
} | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Get auth state
  const id = searchParams.get('id');
  
  const [stay, setStay] = useState<Stay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<{
    checkIn: Date | null;
    checkOut: Date | null;
  }>({
    checkIn: null,
    checkOut: null,
  });
  const [guestCount, setGuestCount] = useState(1);

  const showToast = (message: string, type: 'success' | 'error') => {
  setToast({ show: true, message, type });
  setTimeout(() => {
    setToast(null);
  }, 3000);
};
  // Read URL parameters for dates and guests
  useEffect(() => {
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');
    const guestsParam = searchParams.get('guests');

    // Pre-fill dates from URL parameters
    if (checkInParam) {
      setSelectedDates(prev => ({
        ...prev,
        checkIn: new Date(checkInParam)
      }));
    }
    
    if (checkOutParam) {
      setSelectedDates(prev => ({
        ...prev,
        checkOut: new Date(checkOutParam)
      }));
    }

    // Pre-fill guest count from URL parameters
    if (guestsParam) {
      const guests = parseInt(guestsParam, 10);
      if (!isNaN(guests) && guests > 0) {
        setGuestCount(guests);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!id) return;

    const fetchStayDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/services/type/stays/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stay details');
        }
        const data = await response.json();
        setStay(data);
      } catch (err) {
        setError('Error fetching stay details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStayDetails();
  }, [id]);

  const getAmenityIcon = (amenityKey: string) => {
    switch (amenityKey) {
      case 'pool':
        return <FaSwimmingPool className={styles.amenityIcon} />;
      case 'bbqGrill':
        return <GiBarbecue className={styles.amenityIcon} />;
      case 'beachfront':
        return <FaUmbrellaBeach className={styles.amenityIcon} />;
      case 'wifi':
        return <FaWifi className={styles.amenityIcon} />;
      case 'freeParking':
        return <FaCar className={styles.amenityIcon} />;
      case 'kitchen':
        return <MdKitchen className={styles.amenityIcon} />;
      case 'washer':
      case 'dryer':
        return <MdLocalLaundryService className={styles.amenityIcon} />;
      case 'tv':
        return <FaTv className={styles.amenityIcon} />;
      case 'ac':
        return <FaSnowflake className={styles.amenityIcon} />;
      case 'dedicatedWorkspace':
        return <MdWork className={styles.amenityIcon} />;
      default:
        return <FaWifi className={styles.amenityIcon} />;
    }
  };

  const getAmenityDisplayName = (amenityKey: string) => {
    const displayNames: { [key: string]: string } = {
      hotTub: 'Hot Tub',
      ac: 'Air Conditioning',
      pool: 'Swimming Pool',
      wifi: 'WiFi',
      freeParking: 'Free Parking',
      beachfront: 'Beachfront',
      kitchen: 'Kitchen',
      washer: 'Washer',
      dryer: 'Dryer',
      heating: 'Heating',
      dedicatedWorkspace: 'Dedicated Workspace',
      tv: 'TV',
      hairDryer: 'Hair Dryer',
      iron: 'Iron',
      evCharger: 'EV Charger',
      crib: 'Crib',
      kingBed: 'King Bed',
      gym: 'Gym',
      bbqGrill: 'BBQ Grill',
      breakfast: 'Breakfast',
      indoorFireplace: 'Indoor Fireplace',
      smokingAllowed: 'Smoking Allowed',
      smokeAlarm: 'Smoke Alarm',
      carbonMonoxideAlarm: 'Carbon Monoxide Alarm'
    };
    return displayNames[amenityKey] || amenityKey;
  };

  const calculateTotalPrice = () => {
    if (!stay || !selectedDates.checkIn || !selectedDates.checkOut) return 0;
    
    const diffTime = Math.abs(selectedDates.checkOut.getTime() - selectedDates.checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Base price for nights
    const nightsTotal = stay.pricePerNight * diffDays;
    // Add cleaning fee and service fee
    const cleaningFee = 100;
    const serviceFee = 50;
    
    return nightsTotal + cleaningFee + serviceFee;
  };

  const calculateNights = () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return 0;
    const diffTime = Math.abs(selectedDates.checkOut.getTime() - selectedDates.checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getAvailableAmenities = () => {
    if (!stay?.amenities) return [];
    return Object.entries(stay.amenities)
      .filter(([key, value]) => value === true)
      .map(([key]) => key);
  };

  // Helper function to format date for input
  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // Handle Add to Cart button click
const handleAddToCart = async () => {
  // Check if user is logged in
  if (!user) {
    alert('Please log in to add items to your cart');
    router.push('/login?redirect=/stay-details?id=' + id);
    return;
  }

  // Validation
  if (!selectedDates.checkIn || !selectedDates.checkOut) {
    showToast('Please select both check-in and check-out dates.', 'error');
    return;
  }

  if (selectedDates.checkIn >= selectedDates.checkOut) {
    showToast('Check-out date must be after check-in date.', 'error');
    return;
  }

  if (!stay) {
    showToast('Stay information not available.', 'error');
    return;
  }

  setAddingToCart(true);

  const cartItemData = {
    serviceId: stay._id,
    serviceType: 'Stay',
    category: 'stay',
    selectedDate: selectedDates.checkIn.toISOString().split('T')[0],
    checkOutDate: selectedDates.checkOut.toISOString().split('T')[0],
    serviceName: stay.name,
    numPeople: guestCount,
    totalPrice: calculateTotalPrice(),
    priceBreakdown: {
      basePrice: stay.pricePerNight * calculateNights(),
      fees: 100, // cleaning fee
      taxes: 50, // service fee
      discounts: 0
    },
    notes: `${stay.name} - ${calculateNights()} nights in ${stay.location}, ${stay.island}`
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
  // Handle Reserve button click
// Enhanced handleReserve function with debugging
const handleReserve = () => {
  console.log('=== RESERVE BUTTON CLICKED ===');
  
  // Validation
  if (!selectedDates.checkIn || !selectedDates.checkOut) {
    alert('Please select both check-in and check-out dates.');
    return;
  }

  if (selectedDates.checkIn >= selectedDates.checkOut) {
    alert('Check-out date must be after check-in date.');
    return;
  }

  if (!stay) {
    alert('Stay information not available.');
    return;
  }

  console.log('All validations passed');
  console.log('User:', user);
  console.log('Stay:', stay._id);
  console.log('Selected dates:', selectedDates);
  console.log('Guest count:', guestCount);

  // Create booking data for stay
  const bookingData = {
    // Essential info for the booking record
    serviceType: 'Stay',
    category: 'stay', // Add this - your backend expects this field
    stay: stay._id,
    user: user ? user._id : null,
    guestName: user ? `${user.firstName} ${user.lastName}` : null,
    guestEmail: user ? user.email : null,
    startDate: selectedDates.checkIn.toISOString().split('T')[0],
    endDate: selectedDates.checkOut.toISOString().split('T')[0],
    numOfPeople: guestCount,
    totalPrice: calculateTotalPrice(),

    // Display info for the payment page
    stayName: stay.name,
    pricePerNight: stay.pricePerNight,
    nights: calculateNights(),
    cleaningFee: 100,
    serviceFee: 50,
    mainImage: stay.images?.[0]?.url || stay.stayImages?.[0] || '',
    location: stay.location,
    island: stay.island,
    
    // Contact info if user is logged in
    contactInfo: user ? {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || ''
    } : {}
  };

  console.log('Booking data created:', bookingData);
  console.log('Booking data size:', JSON.stringify(bookingData).length, 'characters');

  try {
    // Clear any existing booking data first
    sessionStorage.removeItem('pendingBooking');
    console.log('Cleared existing sessionStorage data');
    
    // Store the booking data in sessionStorage
    const bookingDataString = JSON.stringify(bookingData);
    sessionStorage.setItem('pendingBooking', bookingDataString);
    console.log('Data stored in sessionStorage');
    
    // Verify it was stored correctly
    const retrievedData = sessionStorage.getItem('pendingBooking');
    console.log('Data retrieved from sessionStorage:', retrievedData ? 'SUCCESS' : 'FAILED');
    
    if (retrievedData) {
      const parsedData = JSON.parse(retrievedData);
      console.log('Parsed data matches:', JSON.stringify(parsedData) === JSON.stringify(bookingData));
    }
    
    console.log('Navigating to payment page...');
    
    // Navigate to payment page
    router.push('/stay-checkout');
  } catch (error) {
    console.error('Error in handleReserve:', error);
    alert('An error occurred while preparing your booking. Please try again.');
  }
};

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${styles.loadingSpinner}`}></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${styles.loadingSpinner}`}></div>
      </div>
    );
  }

  if (error || !stay) {
    return (
      <div className={styles.errorContainer}>
        <h2 className={styles.errorTitle}>Oops!</h2>
        <p className={styles.errorMessage}>{error || 'Stay not found'}</p>
      </div>
    );
  }

  const availableAmenities = getAvailableAmenities();

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{stay.name}</h1>
        <div className={styles.location}>
          <span className="font-semibold">{stay.location}, {stay.island}</span>
          {stay.tags.isLuxe && <span className={`${styles.badge} ${styles.badgeLuxe}`}>LUXE</span>}
          {stay.tags.isGuestFavorite && <span className={`${styles.badge} ${styles.badgeFavorite}`}>Guest Favorite</span>}
        </div>
      </div>

      {/* Images */}
      <div className={styles.imageContainer}>
        {stay.images && stay.images.length > 0 ? (
          <img 
            src={stay.images[0].url} 
            alt={stay.name} 
            className={styles.image}
          />
        ) : stay.stayImages && stay.stayImages.length > 0 ? (
          <img 
            src={stay.stayImages[0]} 
            alt={stay.name} 
            className={styles.image}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <span className="text-gray-500">No image available</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={styles.contentGrid}>
        {/* Left Column */}
        <div>
          {/* Host Info */}
          <div className={`${styles.hostSection} ${styles.sectionDivider}`}>
            <div className={styles.hostInfo}>
              <h2>{stay.propertyType || stay.type} hosted by Property Manager</h2>
              <p>{stay.maxGuests} guests • {stay.bedrooms} bedrooms • {stay.bathrooms} bathrooms • {stay.beds} beds</p>
            </div>
            <div className={styles.hostAvatar}>
              <span>👤</span>
            </div>
          </div>

          {/* Description */}
          <div className={styles.sectionDivider}>
            <h2 className={styles.sectionTitle}>About this place</h2>
            <p className={styles.description}>
              {stay.stayDescription || stay.description || 'No description available.'}
            </p>
          </div>

          {/* Amenities */}
          {availableAmenities.length > 0 && (
            <div className={styles.sectionDivider}>
              <h2 className={styles.sectionTitle}>What this place offers</h2>
              <div className={styles.amenitiesGrid}>
                {availableAmenities.map((amenityKey) => (
                  <div key={amenityKey} className={styles.amenityItem}>
                    {getAmenityIcon(amenityKey)}
                    <span>{getAmenityDisplayName(amenityKey)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking Options */}
          <div className={styles.sectionDivider}>
            <h2 className={styles.sectionTitle}>Booking Options</h2>
            <div className={styles.optionsGrid}>
              <div className={styles.optionItem}>
                {stay.bookingOptions.instantBook ? 
                  <span className={styles.availableOption}>✓ Instant Book Available</span> : 
                  <span className={styles.unavailableOption}>× Instant Book Not Available</span>}
              </div>
              <div className={styles.optionItem}>
                {stay.bookingOptions.selfCheckIn ? 
                  <div className="flex items-center gap-2">
                    <MdSelfImprovement className={styles.amenityIcon} />
                    <span>Self Check-In Available</span>
                  </div> : 
                  <span className={styles.unavailableOption}>× Self Check-In Not Available</span>}
              </div>
              <div className={styles.optionItem}>
                {stay.bookingOptions.allowPets ? 
                  <div className="flex items-center gap-2">
                    <MdPets className={styles.amenityIcon} />
                    <span>Pets Allowed</span>
                  </div> : 
                  <span className={styles.unavailableOption}>× No Pets Allowed</span>}
              </div>
            </div>
          </div>

          {/* Policies */}
          <div>
            <h2 className={styles.sectionTitle}>Things to know</h2>
            <div className={styles.policiesGrid}>
              <div className={styles.policySection}>
                <h3>House rules</h3>
                <div className={styles.policyItem}>
                  <IoMdTime />
                  <span>Check-in: {stay.policies.checkInTime}</span>
                </div>
                <div className={styles.policyItem}>
                  <IoMdTime />
                  <span>Checkout: {stay.policies.checkOutTime}</span>
                </div>
              </div>
              <div className={styles.policySection}>
                <h3>Cancellation policy</h3>
                <p>{stay.policies.cancellationPolicy}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Booking Widget */}
        <div>
          <div className={styles.bookingWidget}>
            <div className={styles.priceHeader}>
              <span className={styles.price}>${stay.pricePerNight}</span>
              <span className={styles.priceUnit}>/night</span>
            </div>

            {/* Date Pickers - Now pre-filled with URL parameters */}
            <div className={styles.datePickerContainer}>
              <div className={styles.datePickerGrid}>
                <div className={styles.datePickerCell}>
                  <label className={styles.inputLabel}>CHECK-IN</label>
                  <input 
                    type="date" 
                    className={styles.dateInput}
                    value={formatDateForInput(selectedDates.checkIn)}
                    onChange={(e) => setSelectedDates({
                      ...selectedDates,
                      checkIn: e.target.value ? new Date(e.target.value) : null
                    })}
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  />
                </div>
                <div className={styles.datePickerCell}>
                  <label className={styles.inputLabel}>CHECKOUT</label>
                  <input 
                    type="date" 
                    className={styles.dateInput}
                    value={formatDateForInput(selectedDates.checkOut)}
                    onChange={(e) => setSelectedDates({
                      ...selectedDates,
                      checkOut: e.target.value ? new Date(e.target.value) : null
                    })}
                    min={selectedDates.checkIn ? 
                      new Date(selectedDates.checkIn.getTime() + 86400000).toISOString().split('T')[0] : 
                      new Date().toISOString().split('T')[0]} // At least 1 day after check-in
                  />
                </div>
              </div>
              <div className={styles.guestCell}>
                <label className={styles.inputLabel}>GUESTS</label>
                <select 
                  className={styles.guestSelect}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                >
                  {Array.from({ length: stay.maxGuests }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'guest' : 'guests'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

{/* Buttons Container */}
<div style={{ 
  display: 'flex', 
  gap: '10px', 
  marginTop: '20px' 
}}>
  <button 
    className={styles.reserveButton}
    onClick={handleAddToCart}
    disabled={!selectedDates.checkIn || !selectedDates.checkOut || addingToCart || addedToCart}
    style={{ 
      flex: 1,
      opacity: (!selectedDates.checkIn || !selectedDates.checkOut || addingToCart || addedToCart) ? 0.6 : 1,
      cursor: (!selectedDates.checkIn || !selectedDates.checkOut || addingToCart || addedToCart) ? 'not-allowed' : 'pointer',
      background: addedToCart ? '#28a745' : 'white',
      color: addedToCart ? 'white' : '#0C54CF',
      border: `2px solid ${addedToCart ? '#28a745' : '#0C54CF'}`
    }}
  >
    {addedToCart ? '✓ Added to Cart' : addingToCart ? 'Adding...' : '🛒 Add to Cart'}
  </button>
  
  <button 
    className={styles.reserveButton}
    onClick={handleReserve}
    disabled={!selectedDates.checkIn || !selectedDates.checkOut}
    style={{ 
      flex: 1,
      opacity: (!selectedDates.checkIn || !selectedDates.checkOut) ? 0.6 : 1,
      cursor: (!selectedDates.checkIn || !selectedDates.checkOut) ? 'not-allowed' : 'pointer'
    }}
  >
    {(!selectedDates.checkIn || !selectedDates.checkOut) ? 'Select Dates' : 'Reserve Now'}
  </button>
</div>

            {selectedDates.checkIn && selectedDates.checkOut && (
              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span className={styles.priceLink}>
                    ${stay.pricePerNight} x {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}
                  </span>
                  <span>${stay.pricePerNight * calculateNights()}</span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.priceLink}>Cleaning fee</span>
                  <span>$100</span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.priceLink}>Service fee</span>
                  <span>$50</span>
                </div>
                <div className={styles.priceDivider}></div>
                <div className={styles.totalRow}>
                  <span>Total</span>
                  <span>${calculateTotalPrice()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
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