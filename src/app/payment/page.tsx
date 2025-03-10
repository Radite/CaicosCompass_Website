"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./paymentpage.module.css";
import { 
  FaArrowLeft, 
  FaLock, 
  FaCreditCard, 
  FaUserPlus, 
  FaCalendarAlt, 
  FaClock, 
  FaUsers, 
  FaInfoCircle,
  FaCheck,
  FaSearch
} from 'react-icons/fa';

// Card type detection
const getCardType = (cardNumber) => {
  const cardPatterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
  };

  for (const [type, pattern] of Object.entries(cardPatterns)) {
    if (pattern.test(cardNumber.replace(/\s+/g, ''))) {
      return type;
    }
  }
  return 'unknown';
};

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Booking data state
  const [bookingData, setBookingData] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingZip, setBillingZip] = useState('');
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  
  // User info state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  
  // Shared booking state
  const [sharedUsers, setSharedUsers] = useState([]);
  const [usernameSearch, setUsernameSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Booking status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [confirmationNumber, setConfirmationNumber] = useState('');

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format card expiry date
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  // Load booking data from URL
  useEffect(() => {
    const bookingParam = searchParams.get("booking");
    if (bookingParam) {
      try {
        const parsedBooking = JSON.parse(decodeURIComponent(bookingParam));
        setBookingData(parsedBooking);
        
        // Simulate fetching activity details using activityId
        // In a real app, you would fetch this from your API
        setTimeout(() => {
          setActivity({
            _id: parsedBooking.activityId,
            name: "Activity Name", // This would come from your API
            option: parsedBooking.optionId ? { 
              _id: parsedBooking.optionId,
              title: "Option Title" // This would come from your API
            } : null
          });
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error("Error parsing booking data:", err);
        setBookingError("Invalid booking data. Please try again.");
        setLoading(false);
      }
    } else {
      setBookingError("No booking data found. Please select an activity first.");
      setLoading(false);
    }
  }, [searchParams]);

  // Format the date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Handle username search
  const handleUsernameSearch = (e) => {
    e.preventDefault();
    if (!usernameSearch.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call to search for users
    // In a real app, this would be an API request
    setTimeout(() => {
      // Mock results
      const mockResults = [
        { _id: '1', username: usernameSearch, fullName: 'John Doe' },
        { _id: '2', username: `${usernameSearch}2`, fullName: 'Jane Smith' },
        { _id: '3', username: `${usernameSearch}_alt`, fullName: 'Alex Johnson' }
      ];
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 800);
  };

  // Add user to shared booking
  const addUserToBooking = (user) => {
    if (sharedUsers.some(u => u._id === user._id)) {
      return; // User already added
    }
    
    setSharedUsers([...sharedUsers, user]);
    setSearchResults([]);
    setUsernameSearch('');
  };

  // Remove user from shared booking
  const removeUserFromBooking = (userId) => {
    setSharedUsers(sharedUsers.filter(user => user._id !== userId));
  };

  // Navigate back to activity selection
  const navigateBack = () => {
    router.back();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData) {
      setBookingError("No booking data available");
      return;
    }
    
    setIsSubmitting(true);
    
    // Create the booking object based on the MongoDB schema
    const booking = {
      user: "current_user_id", // Would come from authentication context
      participants: sharedUsers.map(user => user._id),
      status: "pending",
      category: "activity",
      activity: bookingData.activityId,
      option: bookingData.optionId,
      numOfPeople: bookingData.numPeople,
      multiUser: bookingData.multiUser,
      date: bookingData.date,
      time: `${bookingData.timeSlot.startTime} - ${bookingData.timeSlot.endTime}`,
      paymentDetails: {
        totalAmount: bookingData.totalPrice,
        amountPaid: bookingData.totalPrice,
        payees: [
          {
            user: "current_user_id", // Would come from authentication context
            amount: bookingData.totalPrice,
            status: "paid",
            paymentMethod: paymentMethod,
          },
        ],
      },
      requirements: {
        specialNotes: specialRequirements,
      }
    };

    // Simulate API call to create booking
    // In a real app, this would be a POST request to your API
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a random confirmation number
      const randomConfirmation = Math.random().toString(36).substring(2, 10).toUpperCase();
      setConfirmationNumber(randomConfirmation);
      
      console.log("Booking created:", booking);
      setBookingComplete(true);
    } catch (error) {
      console.error("Error creating booking:", error);
      setBookingError("Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine card type for showing appropriate icon
  const cardType = getCardType(cardNumber);

  // Render loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading payment details...</p>
      </div>
    );
  }

  // Render error state
  if (bookingError && !bookingData) {
    return (
      <div className={styles.errorContainer}>
        <FaInfoCircle className={styles.errorIcon} />
        <h2>Something went wrong</h2>
        <p>{bookingError}</p>
        <button 
          onClick={() => router.push('/activities')}
          className={styles.returnButton}
        >
          Return to Activities
        </button>
      </div>
    );
  }

  // Render booking confirmation
  if (bookingComplete) {
    return (
      <div className={styles.confirmationContainer}>
        <div className={styles.confirmationBox}>
          <div className={styles.confirmationHeader}>
            <FaCheck className={styles.confirmationIcon} />
            <h2>Booking Confirmed!</h2>
          </div>
          
          <div className={styles.confirmationDetails}>
            <p className={styles.confirmationNumber}>
              Confirmation Number: <strong>{confirmationNumber}</strong>
            </p>
            
            <div className={styles.confirmationInfo}>
              <div className={styles.infoItem}>
                <FaCalendarAlt className={styles.infoIcon} />
                <span>{formatDate(bookingData.date)}</span>
              </div>
              
              <div className={styles.infoItem}>
                <FaClock className={styles.infoIcon} />
                <span>{bookingData.timeSlot.startTime} - {bookingData.timeSlot.endTime}</span>
              </div>
              
              <div className={styles.infoItem}>
                <FaUsers className={styles.infoIcon} />
                <span>{bookingData.numPeople} {bookingData.numPeople === 1 ? 'Guest' : 'Guests'}</span>
              </div>
            </div>
            
            <p className={styles.emailConfirmation}>
              A confirmation email has been sent to {email}
            </p>
            
            <div className={styles.totalAmount}>
              <span>Total Paid:</span>
              <span className={styles.amountValue}>${bookingData.totalPrice.toFixed(2)}</span>
            </div>
          </div>
          
          <div className={styles.confirmationActions}>
            <button 
              onClick={() => router.push('/dashboard')}
              className={styles.primaryButton}
            >
              Go to My Bookings
            </button>
            
            <button 
              onClick={() => router.push('/activities')}
              className={styles.secondaryButton}
            >
              Browse More Activities
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main payment form
  return (
    <div className={styles.container}>
      <button onClick={navigateBack} className={styles.backButton}>
        <FaArrowLeft className={styles.backIcon} /> Back to Booking
      </button>
      
      <div className={styles.pageTitle}>
        <h1>Complete Your Booking</h1>
        <p>Secure your experience with our easy payment process</p>
      </div>
      
      <div className={styles.contentWrapper}>
        <div className={styles.paymentForm}>
          <form onSubmit={handleSubmit}>
            {/* Contact Information Section */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Contact Information</h2>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
            
            {/* Shared Experience Section - Only show if multiUser is true */}
            {bookingData && bookingData.multiUser && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                  <FaUserPlus className={styles.sectionIcon} />
                  Add Participants
                </h2>
                <p className={styles.sectionDescription}>
                  Share this experience with others by adding them to your booking
                </p>
                
                <div className={styles.userSearchContainer}>
                  <div className={styles.userSearchForm}>
                    <input
                      type="text"
                      placeholder="Search by username"
                      value={usernameSearch}
                      onChange={(e) => setUsernameSearch(e.target.value)}
                      className={styles.userSearchInput}
                    />
                    <button 
                      type="button" 
                      onClick={handleUsernameSearch}
                      className={styles.userSearchButton}
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <div className={styles.miniSpinner}></div>
                      ) : (
                        <FaSearch />
                      )}
                    </button>
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className={styles.searchResults}>
                      {searchResults.map(user => (
                        <div 
                          key={user._id} 
                          className={styles.userResult}
                          onClick={() => addUserToBooking(user)}
                        >
                          <div className={styles.userAvatar}>
                            {user.fullName.charAt(0)}
                          </div>
                          <div className={styles.userInfo}>
                            <div className={styles.userName}>{user.fullName}</div>
                            <div className={styles.userUsername}>@{user.username}</div>
                          </div>
                          <button 
                            type="button"
                            className={styles.addUserButton}
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {sharedUsers.length > 0 && (
                    <div className={styles.selectedUsers}>
                      <h3>Participants ({sharedUsers.length})</h3>
                      {sharedUsers.map(user => (
                        <div key={user._id} className={styles.selectedUser}>
                          <div className={styles.userAvatar}>
                            {user.fullName.charAt(0)}
                          </div>
                          <div className={styles.userInfo}>
                            <div className={styles.userName}>{user.fullName}</div>
                            <div className={styles.userUsername}>@{user.username}</div>
                          </div>
                          <button 
                            type="button"
                            className={styles.removeUserButton}
                            onClick={() => removeUserFromBooking(user._id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Special Requirements Section */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Special Requirements</h2>
              <div className={styles.formGroup}>
                <label htmlFor="specialRequirements">Special Requests or Notes</label>
                <textarea
                  id="specialRequirements"
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  className={styles.textarea}
                  placeholder="Any dietary requirements, accessibility needs, or other special requests..."
                  rows={3}
                />
              </div>
            </div>
            
            {/* Payment Method Section */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>
                <FaLock className={styles.sectionIcon} />
                Payment Method
              </h2>
              
              <div className={styles.paymentMethods}>
                <button
                  type="button"
                  className={`${styles.paymentMethodButton} ${paymentMethod === 'card' ? styles.selectedPaymentMethod : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <FaCreditCard />
                  <span>Credit Card</span>
                </button>
                
                <button
                  type="button"
                  className={`${styles.paymentMethodButton} ${paymentMethod === 'transfer' ? styles.selectedPaymentMethod : ''}`}
                  onClick={() => setPaymentMethod('transfer')}
                >
                  <span className={styles.paymentIcon}>🏦</span>
                  <span>Bank Transfer</span>
                </button>
                
                <button
                  type="button"
                  className={`${styles.paymentMethodButton} ${paymentMethod === 'cash' ? styles.selectedPaymentMethod : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <span className={styles.paymentIcon}>💵</span>
                  <span>Pay on Arrival</span>
                </button>
              </div>
              
              {paymentMethod === 'card' && (
                <div className={styles.cardDetailsSection}>
                  <div className={styles.formGroup}>
                    <label htmlFor="cardholderName">Cardholder Name *</label>
                    <input
                      type="text"
                      id="cardholderName"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      required={paymentMethod === 'card'}
                      className={styles.input}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="cardNumber">Card Number *</label>
                    <div className={styles.cardNumberInputWrapper}>
                      <input
                        type="text"
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        required={paymentMethod === 'card'}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={styles.input}
                      />
                      {cardType !== 'unknown' && (
                        <div className={`${styles.cardTypeIcon} ${styles[cardType]}`}>
                          {cardType}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="cardExpiry">Expiry Date *</label>
                      <input
                        type="text"
                        id="cardExpiry"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        required={paymentMethod === 'card'}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={styles.input}
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="cardCvc">CVC/CVV *</label>
                      <input
                        type="text"
                        id="cardCvc"
                        value={cardCvc}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setCardCvc(val);
                        }}
                        required={paymentMethod === 'card'}
                        placeholder="123"
                        maxLength={4}
                        className={styles.input}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="billingAddress">Billing Address *</label>
                      <input
                        type="text"
                        id="billingAddress"
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        required={paymentMethod === 'card'}
                        className={styles.input}
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="billingZip">Zip/Postal Code *</label>
                      <input
                        type="text"
                        id="billingZip"
                        value={billingZip}
                        onChange={(e) => setBillingZip(e.target.value)}
                        required={paymentMethod === 'card'}
                        className={styles.input}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      id="savePaymentInfo"
                      checked={savePaymentInfo}
                      onChange={(e) => setSavePaymentInfo(e.target.checked)}
                      className={styles.checkbox}
                    />
                    <label htmlFor="savePaymentInfo">
                      Save payment information for future bookings
                    </label>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'transfer' && (
                <div className={styles.transferInfo}>
                  <p>Select this option to receive bank transfer details after booking confirmation.</p>
                  <p>Your booking will be confirmed once payment is received.</p>
                </div>
              )}
              
              {paymentMethod === 'cash' && (
                <div className={styles.cashInfo}>
                  <p>Pay the full amount in cash upon arrival at the activity.</p>
                  <p>Your booking will be reserved, but please arrive 15 minutes early to process payment.</p>
                </div>
              )}
            </div>
            
            <div className={styles.securePayment}>
              <FaLock className={styles.secureIcon} />
              <span>Secure Payment - Your payment information is encrypted and secure</span>
            </div>
            
            <div className={styles.termsAgreement}>
              <input
                type="checkbox"
                id="termsAgreement"
                required
                className={styles.checkbox}
              />
              <label htmlFor="termsAgreement">
                I agree to the <a href="/terms">Terms & Conditions</a> and <a href="/privacy">Privacy Policy</a>, and acknowledge the <a href="/cancellation">Cancellation Policy</a>
              </label>
            </div>
            
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className={styles.miniSpinner}></div>
                  Processing...
                </>
              ) : (
                <>
                  Complete Booking - ${bookingData?.totalPrice.toFixed(2)}
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className={styles.bookingSummary}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Booking Summary</h2>
            
            <div className={styles.summaryContent}>
              <h3 className={styles.activityName}>
                {activity?.option ? activity.option.title : activity?.name || "Selected Activity"}
              </h3>
              
              <div className={styles.summaryDetail}>
                <FaCalendarAlt className={styles.summaryIcon} />
                <span>{formatDate(bookingData?.date)}</span>
              </div>
              
              <div className={styles.summaryDetail}>
                <FaClock className={styles.summaryIcon} />
                <span>
                  {bookingData?.timeSlot.startTime} - {bookingData?.timeSlot.endTime}
                </span>
              </div>
              
              <div className={styles.summaryDetail}>
                <FaUsers className={styles.summaryIcon} />
                <span>
                  {bookingData?.numPeople} {bookingData?.numPeople === 1 ? 'Guest' : 'Guests'}
                </span>
              </div>
              
              {bookingData?.multiUser && (
                <div className={styles.summaryTag}>
                  <span>Shared Experience</span>
                </div>
              )}
              
              <div className={styles.divider}></div>
              
              <div className={styles.priceSummary}>
                <div className={styles.priceRow}>
                  <span>Price per person</span>
                  <span>${(bookingData?.totalPrice / bookingData?.numPeople).toFixed(2)}</span>
                </div>
                
                <div className={styles.priceRow}>
                  <span>Number of guests</span>
                  <span>× {bookingData?.numPeople}</span>
                </div>
                
                <div className={styles.divider}></div>
                
                <div className={`${styles.priceRow} ${styles.totalPrice}`}>
                  <span>Total</span>
                  <span>${bookingData?.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <div className={styles.cancellationNote}>
                <FaInfoCircle className={styles.infoIcon} />
                <p>Free cancellation up to 48 hours before your experience</p>
              </div>
            </div>
          </div>
          
          <div className={styles.supportInfo}>
            <h3>Need assistance?</h3>
            <p>Our support team is available 24/7</p>
            <p>Call: +1 (555) 123-4567</p>
            <p>Email: support@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}