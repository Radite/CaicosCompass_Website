'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { FaWifi, FaSwimmingPool, FaUmbrellaBeach, FaUtensils } from 'react-icons/fa';
import { GiBarbecue } from 'react-icons/gi';
import { MdPets, MdSelfImprovement } from 'react-icons/md';
import { IoMdTime } from 'react-icons/io';
import styles from './staydetails.module.css';

interface Room {
  _id: string;
  name: string;
  pricePerNight: number;
  maxGuests: number;
  bedType: string;
  bathrooms: number;
  bedrooms: number;
  images: string[];
}

interface Stay {
  _id: string;
  name: string;
  description: string;
  location: string;
  island: string;
  images: {
    url: string;
    isMain: boolean;
    _id: string;
  }[];
  pricePerNight: number;
  maxGuests: number;
  rooms: Room[];
  amenities: string[];
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
  unavailableDates: string[];
}

export default function StayDetails() {
  const searchParams = useSearchParams();
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

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'Private Pool':
        return <FaSwimmingPool className={styles.amenityIcon} />;
      case 'BBQ Grill':
        return <GiBarbecue className={styles.amenityIcon} />;
      case 'Ocean View':
        return <FaUmbrellaBeach className={styles.amenityIcon} />;
      default:
        return <FaWifi className={styles.amenityIcon} />;
    }
  };

  const calculateTotalPrice = () => {
    if (!stay || !selectedDates.checkIn || !selectedDates.checkOut) return 0;
    
    const diffTime = Math.abs(selectedDates.checkOut.getTime() - selectedDates.checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return stay.pricePerNight * diffDays;
  };

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
              <h2>{stay.type} hosted by Property Manager</h2>
              <p>{stay.maxGuests} guests • {stay.rooms.reduce((acc, room) => acc + room.bedrooms, 0)} bedrooms • {stay.rooms.reduce((acc, room) => acc + room.bathrooms, 0)} bathrooms</p>
            </div>
            <div className={styles.hostAvatar}>
              <span>👤</span>
            </div>
          </div>

          {/* Description */}
          <div className={styles.sectionDivider}>
            <h2 className={styles.sectionTitle}>About this place</h2>
            <p className={styles.description}>{stay.description}</p>
          </div>

          {/* Rooms */}
          <div className={styles.sectionDivider}>
            <h2 className={styles.sectionTitle}>Rooms</h2>
            <div className={styles.roomsGrid}>
              {stay.rooms.map((room) => (
                <div key={room._id} className={styles.roomCard}>
                  <h3>{room.name}</h3>
                  <p>{room.bedType} bed • {room.maxGuests} guests</p>
                  <p>${room.pricePerNight} per night</p>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className={styles.sectionDivider}>
            <h2 className={styles.sectionTitle}>What this place offers</h2>
            <div className={styles.amenitiesGrid}>
              {stay.amenities.map((amenity, index) => (
                <div key={index} className={styles.amenityItem}>
                  {getAmenityIcon(amenity)}
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

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
              <span className={styles.priceUnit}>night</span>
            </div>

            {/* Date Pickers */}
            <div className={styles.datePickerContainer}>
              <div className={styles.datePickerGrid}>
                <div className={styles.datePickerCell}>
                  <label className={styles.inputLabel}>CHECK-IN</label>
                  <input 
                    type="date" 
                    className={styles.dateInput}
                    onChange={(e) => setSelectedDates({
                      ...selectedDates,
                      checkIn: e.target.value ? new Date(e.target.value) : null
                    })}
                  />
                </div>
                <div className={styles.datePickerCell}>
                  <label className={styles.inputLabel}>CHECKOUT</label>
                  <input 
                    type="date" 
                    className={styles.dateInput}
                    onChange={(e) => setSelectedDates({
                      ...selectedDates,
                      checkOut: e.target.value ? new Date(e.target.value) : null
                    })}
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

            <button className={styles.reserveButton}>
              Reserve
            </button>

            {selectedDates.checkIn && selectedDates.checkOut && (
              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span className={styles.priceLink}>
                    ${stay.pricePerNight} x {Math.ceil(Math.abs((selectedDates.checkOut.getTime() - selectedDates.checkIn.getTime()) / (1000 * 60 * 60 * 24)))} nights
                  </span>
                  <span>${calculateTotalPrice()}</span>
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
                  <span>${calculateTotalPrice() + 150}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}