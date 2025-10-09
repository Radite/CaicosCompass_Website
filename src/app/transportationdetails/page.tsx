// Updated Transportation Details Page - Car Rental Style
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import styles from "./transportationdetails.module.css";
import { 
  FaArrowLeft, 
  FaCar, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaMoneyBillWave,
  FaStar,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaClock,
  FaUsers,
  FaShieldAlt,
  FaTags,
  FaRoute,
  FaGift,
  FaGasPump,
  FaCog,
  FaSnowflake,
  FaWifi,
  FaBluetooth,
  FaCheck,
  FaInfoCircle
} from "react-icons/fa";

// ... (keep all the existing interfaces but focus on Fleet interface)

export default function TransportationDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  // Booking state
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupDateTime, setPickupDateTime] = useState('');
  const [dropoffDateTime, setDropoffDateTime] = useState('');
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [rentalDays, setRentalDays] = useState(1);

  // Vehicle categories for filtering
  const [selectedCategory, setSelectedCategory] = useState('All');
  const vehicleCategories = ['All', 'Economy', 'Compact', 'Mid-size', 'Full-size', 'Premium', 'Luxury', 'SUV', '4x4'];

  useEffect(() => {
    const itemId = searchParams.get("id");
    if (itemId) {
      fetchTransportationDetails(itemId);
    }
  }, [searchParams]);

  const fetchTransportationDetails = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/services/type/transportations/${id}`);
      setItem(response.data);
      
      // Set default dates
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setPickupDateTime(now.toISOString().slice(0, 16));
      setDropoffDateTime(tomorrow.toISOString().slice(0, 16));
      
      // Auto-select first available vehicle
      if (response.data.fleet?.length > 0) {
        const available = response.data.fleet.find(v => v.status === 'available');
        if (available) setSelectedVehicle(available);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRentalDays = () => {
    if (pickupDateTime && dropoffDateTime) {
      const pickup = new Date(pickupDateTime);
      const dropoff = new Date(dropoffDateTime);
      const diffTime = Math.abs(dropoff - pickup);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setRentalDays(Math.max(1, diffDays));
      return Math.max(1, diffDays);
    }
    return 1;
  };

  useEffect(() => {
    const days = calculateRentalDays();
    if (selectedVehicle) {
      const basePrice = (selectedVehicle.priceOverride || item?.perDayPrice || item?.basePrice || 0) * days;
      const extrasTotal = selectedExtras.reduce((sum, extra) => sum + (extra.price * (extra.perDay ? days : 1)), 0);
      setTotalPrice(basePrice + extrasTotal);
    }
  }, [selectedVehicle, pickupDateTime, dropoffDateTime, selectedExtras, item]);

  const getVehicleImage = (vehicle) => {
    if (vehicle.images?.length > 0) {
      return vehicle.images.find(img => img.isMain)?.url || vehicle.images[0].url;
    }
    return `/images/vehicles/${vehicle.category.toLowerCase()}-default.jpg`;
  };

  const getAmenityIcon = (amenity) => {
    const iconMap = {
      'air conditioning': FaSnowflake,
      'bluetooth': FaBluetooth,
      'wifi': FaWifi,
      'automatic': FaCog,
      'gps': FaRoute,
      'usb': FaBluetooth
    };
    return iconMap[amenity.toLowerCase()] || FaCheck;
  };

  const filteredVehicles = item?.fleet?.filter(vehicle => 
    (selectedCategory === 'All' || vehicle.category === selectedCategory) &&
    vehicle.status === 'available'
  ) || [];

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading available vehicles...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>Rental service not found</h2>
          <button onClick={() => router.back()} className={styles.backButton}>
            <FaArrowLeft /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        <FaArrowLeft /> Back to Transportation
      </button>

      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.companyInfo}>
          <h1 className={styles.companyName}>{item.vendor?.businessProfile?.businessName || item.vendor?.name}</h1>
          <div className={styles.companyDetails}>
            <div className={styles.rating}>
              <FaStar /> {(item.performanceMetrics?.averageRating || 4.2).toFixed(1)}
              <span>({item.performanceMetrics?.totalReviews || item.reviews?.length || 0} reviews)</span>
            </div>
            <div className={styles.location}>
              <FaMapMarkerAlt /> {item.location}, {item.island}
            </div>
          </div>
        </div>

        {/* Rental Details Form */}
        <div className={styles.rentalDetailsCard}>
          <h3>Rental Details</h3>
          <div className={styles.rentalForm}>
            <div className={styles.locationRow}>
              <div className={styles.formGroup}>
                <label><FaMapMarkerAlt /> Pick-up Location</label>
                <select value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)}>
                  <option value="">Select location</option>
                  {item.presetLocations?.map((loc, idx) => (
                    <option key={idx} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label><FaMapMarkerAlt /> Drop-off Location</label>
                <select value={dropoffLocation} onChange={(e) => setDropoffLocation(e.target.value)}>
                  <option value="">Select location</option>
                  <option value={pickupLocation}>Same as pick-up</option>
                  {item.presetLocations?.map((loc, idx) => (
                    <option key={idx} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.dateRow}>
              <div className={styles.formGroup}>
                <label><FaCalendarAlt /> Pick-up Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={pickupDateTime}
                  onChange={(e) => setPickupDateTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div className={styles.formGroup}>
                <label><FaCalendarAlt /> Drop-off Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={dropoffDateTime}
                  onChange={(e) => setDropoffDateTime(e.target.value)}
                  min={pickupDateTime}
                />
              </div>
            </div>

            <div className={styles.rentalSummary}>
              <span className={styles.rentalDays}>{rentalDays} day{rentalDays > 1 ? 's' : ''}</span>
              {selectedVehicle && (
                <span className={styles.totalPrice}>Total: ${totalPrice.toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Vehicle Categories Filter */}
        <div className={styles.categoryFilter}>
          <h3>Vehicle Categories</h3>
          <div className={styles.categoryTabs}>
            {vehicleCategories.map(category => (
              <button
                key={category}
                className={`${styles.categoryTab} ${selectedCategory === category ? styles.active : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Selection Grid */}
        <div className={styles.vehicleGrid}>
          {filteredVehicles.map((vehicle) => (
            <div 
              key={vehicle.vehicleId}
              className={`${styles.vehicleCard} ${selectedVehicle?.vehicleId === vehicle.vehicleId ? styles.selected : ''}`}
            >
              {/* Vehicle Image */}
              <div className={styles.vehicleImageContainer}>
                <img 
                  src={getVehicleImage(vehicle)}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className={styles.vehicleImage}
                  onError={(e) => {
                    e.target.src = '/images/default-car.jpg';
                  }}
                />
                <div className={styles.vehicleCategory}>{vehicle.category}</div>
              </div>

              {/* Vehicle Details */}
              <div className={styles.vehicleDetails}>
                <div className={styles.vehicleHeader}>
                  <h3 className={styles.vehicleName}>
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <span className={styles.vehicleYear}>({vehicle.year})</span>
                </div>

                {/* Vehicle Specs */}
                <div className={styles.vehicleSpecs}>
                  <div className={styles.specItem}>
                    <FaUsers /> {vehicle.capacity} passengers
                  </div>
                  <div className={styles.specItem}>
                    <FaGasPump /> {vehicle.fuelType}
                  </div>
                  <div className={styles.specItem}>
                    <FaCog /> {vehicle.transmission}
                  </div>
                </div>

                {/* Vehicle Features */}
                <div className={styles.vehicleFeatures}>
                  {vehicle.amenities?.slice(0, 4).map((amenity, idx) => {
                    const IconComponent = getAmenityIcon(amenity);
                    return (
                      <div key={idx} className={styles.featureItem}>
                        <IconComponent className={styles.featureIcon} />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Pricing */}
                <div className={styles.vehiclePricing}>
                  <div className={styles.dailyRate}>
                    <span className={styles.priceLabel}>Per day</span>
                    <span className={styles.price}>
                      ${vehicle.priceOverride || item.perDayPrice || item.basePrice}
                    </span>
                  </div>
                  <div className={styles.totalCost}>
                    <span className={styles.totalLabel}>Total ({rentalDays} days)</span>
                    <span className={styles.totalPrice}>
                      ${((vehicle.priceOverride || item.perDayPrice || item.basePrice) * rentalDays).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Select Button */}
                <button 
                  className={`${styles.selectVehicleBtn} ${selectedVehicle?.vehicleId === vehicle.vehicleId ? styles.selected : ''}`}
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  {selectedVehicle?.vehicleId === vehicle.vehicleId ? 'Selected' : 'Select Vehicle'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Vehicle Summary */}
        {selectedVehicle && (
          <div className={styles.selectedVehicleSummary}>
            <h3>Selected Vehicle</h3>
            <div className={styles.summaryCard}>
              <img 
                src={getVehicleImage(selectedVehicle)}
                alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                className={styles.summaryImage}
              />
              <div className={styles.summaryDetails}>
                <h4>{selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})</h4>
                <p>{selectedVehicle.category} • {selectedVehicle.capacity} passengers</p>
                <div className={styles.summaryPricing}>
                  <span>${selectedVehicle.priceOverride || item.perDayPrice || item.basePrice}/day × {rentalDays} days</span>
                  <strong>${((selectedVehicle.priceOverride || item.perDayPrice || item.basePrice) * rentalDays).toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extras & Add-ons */}
        {item.rentalDetails?.additionalServices && (
          <div className={styles.extrasSection}>
            <h3>Extras & Add-ons</h3>
            <div className={styles.extrasGrid}>
              {item.rentalDetails.additionalServices.map((extra, idx) => (
                <label key={idx} className={styles.extraOption}>
                  <input 
                    type="checkbox"
                    checked={selectedExtras.some(e => e.name === extra.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedExtras([...selectedExtras, extra]);
                      } else {
                        setSelectedExtras(selectedExtras.filter(e => e.name !== extra.name));
                      }
                    }}
                  />
                  <div className={styles.extraInfo}>
                    <span className={styles.extraName}>{extra.name}</span>
                    <span className={styles.extraPrice}>
                      ${extra.price} {extra.perDay ? '/day' : ''}
                    </span>
                    <span className={styles.extraDescription}>{extra.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Booking Summary */}
        {selectedVehicle && (
          <div className={styles.bookingSummary}>
            <h3>Booking Summary</h3>
            <div className={styles.summaryBreakdown}>
              <div className={styles.summaryRow}>
                <span>Vehicle rental ({rentalDays} days)</span>
                <span>${((selectedVehicle.priceOverride || item.perDayPrice || item.basePrice) * rentalDays).toFixed(2)}</span>
              </div>
              {selectedExtras.map((extra, idx) => (
                <div key={idx} className={styles.summaryRow}>
                  <span>{extra.name} {extra.perDay ? `(${rentalDays} days)` : ''}</span>
                  <span>${(extra.price * (extra.perDay ? rentalDays : 1)).toFixed(2)}</span>
                </div>
              ))}
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <button className={styles.bookNowBtn}>
              <FaCar /> Reserve Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}