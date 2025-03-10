"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./transportationdetails.module.css";
import { FaArrowLeft, FaCar, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";

interface Location {
  locationName: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface RentalDetails {
  make?: string;
  model?: string;
  year?: number;
  fuelType?: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission?: 'Automatic' | 'Manual';
  dailyMileageLimit?: number;
  excessMileageCharge?: number;
}

interface TransportationItem {
  _id: string;
  category: string;
  pricingModel: string;
  basePrice: number;
  flatPrice?: number;
  perMilePrice?: number;
  perHourPrice?: number;
  perDayPrice?: number;
  capacity?: number;
  amenities?: string[];
  locationsServed?: Location[];
  rentalDetails?: RentalDetails;
  contactDetails: {
    phone: string;
    email?: string;
    website?: string;
  };
  longTermDiscounts?: Array<{
    duration: 'weekly' | 'monthly';
    discountPercentage: number;
  }>;
}

export default function TransportationDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<TransportationItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Booking state
  const [pickupLocation, setPickupLocation] = useState<string>('');
  const [dropoffLocation, setDropoffLocation] = useState<string>('');
  const [pickupDateTime, setPickupDateTime] = useState<string>('');
  const [dropoffDateTime, setDropoffDateTime] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [rentalDuration, setRentalDuration] = useState<number>(0);
  const [durationDays, setDurationDays] = useState<number>(0);
  const [durationHours, setDurationHours] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [discountApplied, setDiscountApplied] = useState<string>('');

  useEffect(() => {
    const itemParam = searchParams.get("item");
    if (itemParam) {
      try {
        const parsed: TransportationItem = JSON.parse(decodeURIComponent(itemParam));
        setItem(parsed);
        // Set default start date as today
        const today = new Date();
        const formattedDate = today.toISOString().slice(0, 16);
        setPickupDateTime(formattedDate);
        
        // Set default return date as tomorrow for rentals
        if (parsed.category.includes('Rental')) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          setDropoffDateTime(tomorrow.toISOString().slice(0, 16));
        }
      } catch (error) {
        console.error("Error parsing transportation item:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [searchParams]);

  // For ground transport with per-mile pricing, simulate distance calculation
  const calculateDistance = (pickup: string, dropoff: string) => {
    // This would ideally use a maps API, but for demo we'll use a simple simulation
    const locations = {
      "Airport": { lat: 22.3, lng: 114.2 },
      "Downtown": { lat: 22.28, lng: 114.17 },
      "Hotel Zone": { lat: 22.29, lng: 114.19 },
      "Beach Area": { lat: 22.27, lng: 114.21 },
      "Shopping District": { lat: 22.31, lng: 114.18 }
    };
    
    // Calculate simulated distance if we have both locations
    if (pickup in locations && dropoff in locations) {
      const p = locations[pickup as keyof typeof locations];
      const d = locations[dropoff as keyof typeof locations];
      
      // Simple Euclidean distance * 100 to get realistic km values
      const dist = Math.sqrt(
        Math.pow(p.lat - d.lat, 2) + Math.pow(p.lng - d.lng, 2)
      ) * 100;
      
      return parseFloat(dist.toFixed(1));
    }
    
    return 10; // Default distance if locations don't match our predefined set
  };

  useEffect(() => {
    // Calculate rental duration and total price when dates change
    if (pickupDateTime && dropoffDateTime && item) {
      const pickup = new Date(pickupDateTime);
      const dropoff = new Date(dropoffDateTime);
      
      if (dropoff <= pickup) {
        return; // Invalid date range
      }
      
      // Calculate duration
      const durationMs = dropoff.getTime() - pickup.getTime();
      const hours = durationMs / (1000 * 60 * 60);
      const days = hours / 24;

      setDurationHours(Math.ceil(hours));
      setDurationDays(Math.ceil(days));
      setRentalDuration(hours);

      // Calculate distance for per-mile pricing models
      if (pickupLocation && dropoffLocation && 
          (item.pricingModel === 'per-mile' || item.category === 'Taxi' || 
           item.category === 'Airport Transfer' || item.category === 'Private VIP Transport')) {
        const dist = calculateDistance(pickupLocation, dropoffLocation);
        setDistance(dist);
      }

      // Calculate price based on transportation category and pricing model
      calculateTotalPrice(item, days, hours);
    }
  }, [item, pickupDateTime, dropoffDateTime, pickupLocation, dropoffLocation]);

  const calculateTotalPrice = (item: TransportationItem, days: number, hours: number) => {
    let calculatedPrice = 0;
    let appliedDiscount = '';

    switch(item.pricingModel) {
      case 'per-day':
        // For car, jeep, scooter rentals
        calculatedPrice = (item.perDayPrice || item.basePrice) * Math.ceil(days);
        
        // Apply long-term discounts
        if (item.longTermDiscounts) {
          const weeklyDiscount = item.longTermDiscounts.find(d => d.duration === 'weekly');
          const monthlyDiscount = item.longTermDiscounts.find(d => d.duration === 'monthly');
          
          if (days >= 30 && monthlyDiscount) {
            calculatedPrice *= (1 - monthlyDiscount.discountPercentage / 100);
            appliedDiscount = `${monthlyDiscount.discountPercentage}% monthly discount`;
          } else if (days >= 7 && weeklyDiscount) {
            calculatedPrice *= (1 - weeklyDiscount.discountPercentage / 100);
            appliedDiscount = `${weeklyDiscount.discountPercentage}% weekly discount`;
          }
        }
        break;
      
      case 'per-hour':
        // For hourly services
        calculatedPrice = (item.perHourPrice || item.basePrice) * Math.ceil(hours);
        break;
      
      case 'per-mile':
        // For distance-based pricing like taxis
        if (distance > 0 && item.perMilePrice) {
          calculatedPrice = item.basePrice + (item.perMilePrice * distance);
        } else {
          calculatedPrice = item.basePrice;
        }
        break;
      
      case 'flat':
      case 'per-trip':
        // For fixed-price transfers and services
        calculatedPrice = item.flatPrice || item.basePrice;
        break;
      
      default:
        calculatedPrice = item.basePrice;
    }

    setTotalPrice(calculatedPrice);
    setDiscountApplied(appliedDiscount);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <div></div><div></div><div></div><div></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>Transportation details not found</h2>
          <button onClick={() => router.back()} className={styles.backButton}>
            <FaArrowLeft /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const isRental = ['Car Rental', 'Jeep & 4x4 Rental', 'Scooter & Moped Rental'].includes(item.category);
  const isTransfer = ['Taxi', 'Airport Transfer', 'Private VIP Transport'].includes(item.category);

  const renderBookingForm = () => {
    if (isRental) {
      return (
        <div className={styles.bookingSection}>
          <h2 className={styles.sectionTitle}>Rental Booking</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FaMapMarkerAlt /> Pickup Location
            </label>
            <select 
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className={styles.formSelect}
            >
              <option value="">Select Pickup Location</option>
              {item.locationsServed?.map((loc, index) => (
                <option key={index} value={loc.locationName}>
                  {loc.locationName}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FaMapMarkerAlt /> Return Location
            </label>
            <select 
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
              className={styles.formSelect}
            >
              <option value="">Select Return Location</option>
              <option value={pickupLocation}>Same as pickup</option>
              {item.locationsServed?.map((loc, index) => (
                <option key={index} value={loc.locationName}>
                  {loc.locationName}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.dateTimeContainer}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FaCalendarAlt /> Pickup Date & Time
              </label>
              <input 
                type="datetime-local" 
                value={pickupDateTime}
                onChange={(e) => setPickupDateTime(e.target.value)}
                className={styles.formInput}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FaCalendarAlt /> Return Date & Time
              </label>
              <input 
                type="datetime-local" 
                value={dropoffDateTime}
                onChange={(e) => setDropoffDateTime(e.target.value)}
                className={styles.formInput}
                min={pickupDateTime} 
              />
            </div>
          </div>
          
          {durationDays > 0 && (
            <div className={styles.durationDisplay}>
              <p>Rental Duration: {durationDays} {durationDays === 1 ? 'day' : 'days'}</p>
            </div>
          )}
        </div>
      );
    } else if (isTransfer) {
      return (
        <div className={styles.bookingSection}>
          <h2 className={styles.sectionTitle}>Transport Booking</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FaMapMarkerAlt /> Pickup Location
            </label>
            <select
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className={styles.formSelect}
            >
              <option value="">Select Pickup Location</option>
              <option value="Airport">Airport</option>
              <option value="Downtown">Downtown</option>
              <option value="Hotel Zone">Hotel Zone</option>
              <option value="Beach Area">Beach Area</option>
              <option value="Shopping District">Shopping District</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FaMapMarkerAlt /> Dropoff Location
            </label>
            <select
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
              className={styles.formSelect}
            >
              <option value="">Select Dropoff Location</option>
              <option value="Airport">Airport</option>
              <option value="Downtown">Downtown</option>
              <option value="Hotel Zone">Hotel Zone</option>
              <option value="Beach Area">Beach Area</option>
              <option value="Shopping District">Shopping District</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <FaCalendarAlt /> Pickup Date & Time
            </label>
            <input 
              type="datetime-local" 
              value={pickupDateTime}
              onChange={(e) => setPickupDateTime(e.target.value)}
              className={styles.formInput}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          
          {distance > 0 && (
            <div className={styles.distanceDisplay}>
              <p>Estimated Distance: {distance} km</p>
            </div>
          )}
        </div>
      );
    } else {
      // For other transportation types (ferry, flight)
      return (
        <div className={styles.bookingSection}>
          <h2 className={styles.sectionTitle}>Booking</h2>
          <p className={styles.noticeText}>
            Please contact us directly to book this type of transportation.
          </p>
          <div className={styles.contactInfo}>
            <p>Phone: {item.contactDetails.phone}</p>
            {item.contactDetails.email && <p>Email: {item.contactDetails.email}</p>}
          </div>
        </div>
      );
    }
  };

  const renderPricingDetails = () => {
    return (
      <div className={styles.pricingCard}>
        <h2 className={styles.sectionTitle}>
          <FaMoneyBillWave /> Pricing Details
        </h2>
        
        <div className={styles.priceDetails}>
          {item.pricingModel === 'per-day' && (
            <div className={styles.priceRow}>
              <span>Daily Rate:</span>
              <span>${item.perDayPrice || item.basePrice}</span>
            </div>
          )}
          
          {item.pricingModel === 'per-hour' && (
            <div className={styles.priceRow}>
              <span>Hourly Rate:</span>
              <span>${item.perHourPrice || item.basePrice}</span>
            </div>
          )}
          
          {item.pricingModel === 'per-mile' && (
            <>
              <div className={styles.priceRow}>
                <span>Base Fare:</span>
                <span>${item.basePrice}</span>
              </div>
              <div className={styles.priceRow}>
                <span>Per Kilometer:</span>
                <span>${item.perMilePrice}</span>
              </div>
            </>
          )}
          
          {item.pricingModel === 'flat' && (
            <div className={styles.priceRow}>
              <span>Flat Rate:</span>
              <span>${item.flatPrice || item.basePrice}</span>
            </div>
          )}
          
          {discountApplied && (
            <div className={styles.discountRow}>
              <span>Discount:</span>
              <span>{discountApplied}</span>
            </div>
          )}
          
          <div className={styles.totalPriceRow}>
            <span>Total Price:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>
        
        <button className={styles.bookNowButton}>
          Book Now
        </button>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        <FaArrowLeft /> Back
      </button>

      <div className={styles.heroSection}>
        <div className={styles.mainImageContainer}>
          <img 
            src={`/api/placeholder/800/400`} 
            alt={item.category} 
            className={styles.mainImage}
          />
        </div>
        
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{item.category}</h1>
          <div className={styles.infoBox}>
            {item.rentalDetails?.make && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Vehicle</span>
                <span>{item.rentalDetails.make} {item.rentalDetails.model} {item.rentalDetails.year}</span>
              </div>
            )}
            
            {item.capacity && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Capacity</span>
                <span>{item.capacity} people</span>
              </div>
            )}
            
            {item.pricingModel === 'per-day' && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Daily Rate</span>
                <span>${item.perDayPrice || item.basePrice}</span>
              </div>
            )}
            
            {item.pricingModel === 'flat' && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Flat Rate</span>
                <span>${item.flatPrice || item.basePrice}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          {renderBookingForm()}
          
          {item.rentalDetails && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <FaCar /> Vehicle Details
              </h2>
              <div className={styles.vehicleSpecs}>
                {item.rentalDetails.make && (
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Make:</span>
                    <span>{item.rentalDetails.make}</span>
                  </div>
                )}
                
                {item.rentalDetails.model && (
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Model:</span>
                    <span>{item.rentalDetails.model}</span>
                  </div>
                )}
                
                {item.rentalDetails.year && (
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Year:</span>
                    <span>{item.rentalDetails.year}</span>
                  </div>
                )}
                
                {item.rentalDetails.fuelType && (
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Fuel Type:</span>
                    <span>{item.rentalDetails.fuelType}</span>
                  </div>
                )}
                
                {item.rentalDetails.transmission && (
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Transmission:</span>
                    <span>{item.rentalDetails.transmission}</span>
                  </div>
                )}
                
                {item.rentalDetails.dailyMileageLimit && (
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Daily Mileage Limit:</span>
                    <span>{item.rentalDetails.dailyMileageLimit} km</span>
                  </div>
                )}
                
                {item.rentalDetails.excessMileageCharge && (
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Excess Mileage Charge:</span>
                    <span>${item.rentalDetails.excessMileageCharge}/km</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {item.amenities && item.amenities.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Amenities</h2>
              <div className={styles.amenitiesList}>
                {item.amenities.map((amenity, index) => (
                  <div key={index} className={styles.amenityTag}>{amenity}</div>
                ))}
              </div>
            </div>
          )}
          
          {item.locationsServed && item.locationsServed.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Locations Served</h2>
              <div className={styles.locationsList}>
                {item.locationsServed.map((location, index) => (
                  <div key={index} className={styles.locationItem}>
                    {location.locationName}
                  </div>
                ))}
              </div>
              <div className={styles.mapContainer}>
                <div className={styles.mapPlaceholder}>
                  <div className={styles.mapOverlay}>Interactive Map Available</div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.sidebarSection}>
          {renderPricingDetails()}
          
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Details</h2>
            <div className={styles.contactDetails}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Phone:</span>
                <span className={styles.contactValue}>{item.contactDetails.phone}</span>
              </div>
              
              {item.contactDetails.email && (
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Email:</span>
                  <span className={styles.contactValue}>{item.contactDetails.email}</span>
                </div>
              )}
              
              {item.contactDetails.website && (
                <div className={styles.contactItem}>
                  <span className={styles.contactLabel}>Website:</span>
                  <span className={styles.contactValue}>{item.contactDetails.website}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}