"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface BookingDetails {
  spaId: string;
  spaName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  price: number;
  discountedPrice?: number;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    savePaymentInfo: false,
    agreeToTerms: false,
  });
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [cardType, setCardType] = useState("");

  useEffect(() => {
    const bookingParam = searchParams.get("booking");
    if (bookingParam) {
      try {
        const parsedBooking = JSON.parse(decodeURIComponent(bookingParam));
        setBooking(parsedBooking);
        setError(null);
      } catch (error) {
        console.error("Error parsing booking data:", error);
        setError("Unable to load booking details. Invalid data format.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setError("No booking information provided");
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Detect card type
    if (name === "cardNumber") {
      detectCardType(value);
    }
  };

  const detectCardType = (cardNumber: string) => {
    const cleanNumber = cardNumber.replace(/\s+/g, "");
    
    if (/^4\d{0,15}/.test(cleanNumber)) {
      setCardType("visa");
    } else if (/^5[1-5]\d{0,14}/.test(cleanNumber)) {
      setCardType("mastercard");
    } else if (/^3[47]\d{0,13}/.test(cleanNumber)) {
      setCardType("amex");
    } else if (/^6(?:011|5\d{0,2})\d{0,12}/.test(cleanNumber)) {
      setCardType("discover");
    } else {
      setCardType("");
    }
  };

  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\s+/g, "");
    const groups = [];
    
    for (let i = 0; i < cleanValue.length; i += 4) {
      groups.push(cleanValue.substring(i, i + 4));
    }
    
    return groups.join(" ");
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target;
    value = value.replace(/\D/g, ""); // Remove non-digits
    
    if (value.length > 16) {
      value = value.slice(0, 16);
    }
    
    const formattedValue = formatCardNumber(value);
    setFormData({
      ...formData,
      cardNumber: formattedValue,
    });
    
    detectCardType(value);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target;
    value = value.replace(/\D/g, ""); // Remove non-digits
    
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    
    if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    
    setFormData({
      ...formData,
      expiryDate: value,
    });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target;
    value = value.replace(/\D/g, ""); // Remove non-digits
    
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    
    setFormData({
      ...formData,
      cvv: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically process the payment through your payment gateway
    // For this example, we'll just simulate success and redirect to confirmation
    
    // Create a booking reference number
    const bookingReference = `BK${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Redirect to confirmation page with booking details
    const confirmationData = {
      reference: bookingReference,
      booking,
      customer: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone
      },
      paymentMethod
    };
    
    // Encode the confirmation data for the URL
    const encodedData = encodeURIComponent(JSON.stringify(confirmationData));
    router.push(`/booking-confirmation?data=${encodedData}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loadingContainer">
        <div className="spinner"></div>
        <h2>Loading payment details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="errorContainer">
        <div className="errorIcon">⚠️</div>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => router.back()} className="returnButton">
          Return to previous page
        </button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="errorContainer">
        <div className="errorIcon">⚠️</div>
        <h2>No Booking Found</h2>
        <p>We couldn't find any booking details to process.</p>
        <button onClick={() => router.push("/")} className="returnButton">
          Return to homepage
        </button>
      </div>
    );
  }

  const servicePrice = booking.discountedPrice || booking.price;
  const taxAmount = servicePrice * 0.1; // 10% tax
  const totalAmount = servicePrice + taxAmount;

  return (
    <div className="container">
      <button onClick={() => router.back()} className="backButton">
        <span className="backIcon">←</span> Back
      </button>
      
      <div className="pageTitle">
        <h1>Complete Your Booking</h1>
        <p>Please provide your details to complete your wellness experience booking.</p>
      </div>
      
      <div className="contentWrapper">
        <div className="paymentForm">
          <form onSubmit={handleSubmit}>
            <div className="formSection">
              <h2 className="sectionTitle">
                <span className="sectionIcon">👤</span>
                Personal Information
              </h2>
              <p className="sectionDescription">
                Please provide your contact details for booking confirmation.
              </p>
              
              <div className="formRow">
                <div className="formGroup">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="input"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="formGroup">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="input"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="formRow">
                <div className="formGroup">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="input"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="formGroup">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="input"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="formGroup">
                <label htmlFor="specialRequests">Special Requests (Optional)</label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  className="textarea"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  placeholder="Any special requirements or health considerations..."
                ></textarea>
              </div>
            </div>
            
            <div className="formSection">
              <h2 className="sectionTitle">
                <span className="sectionIcon">💳</span>
                Payment Method
              </h2>
              <p className="sectionDescription">
                Select your preferred payment method for the booking.
              </p>
              
              <div className="paymentMethods">
                <div 
                  className={`paymentMethodButton ${paymentMethod === 'creditCard' ? 'selectedPaymentMethod' : ''}`}
                  onClick={() => setPaymentMethod('creditCard')}
                >
                  <span className="paymentIcon">💳</span>
                  <span>Credit Card</span>
                </div>
                <div 
                  className={`paymentMethodButton ${paymentMethod === 'bankTransfer' ? 'selectedPaymentMethod' : ''}`}
                  onClick={() => setPaymentMethod('bankTransfer')}
                >
                  <span className="paymentIcon">🏦</span>
                  <span>Bank Transfer</span>
                </div>
                <div 
                  className={`paymentMethodButton ${paymentMethod === 'cash' ? 'selectedPaymentMethod' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <span className="paymentIcon">💵</span>
                  <span>Pay on Arrival</span>
                </div>
              </div>
              
              {paymentMethod === 'creditCard' && (
                <div className="cardDetailsSection">
                  <div className="formRow">
                    <div className="formGroup">
                      <label htmlFor="cardName">Name on Card</label>
                      <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        className="input"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="formGroup">
                      <label htmlFor="cardNumber">Card Number</label>
                      <div className="cardNumberInputWrapper">
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          className="input"
                          value={formData.cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="XXXX XXXX XXXX XXXX"
                          required
                        />
                        {cardType && (
                          <span className={`cardTypeIcon ${cardType}`}>
                            {cardType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="formRow">
                    <div className="formGroup">
                      <label htmlFor="expiryDate">Expiry Date</label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        className="input"
                        value={formData.expiryDate}
                        onChange={handleExpiryDateChange}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="formGroup">
                      <label htmlFor="cvv">CVV</label>
                      <input
                        type="password"
                        id="cvv"
                        name="cvv"
                        className="input"
                        value={formData.cvv}
                        onChange={handleCvvChange}
                        placeholder="XXX"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="checkboxGroup">
                    <input
                      type="checkbox"
                      id="savePaymentInfo"
                      name="savePaymentInfo"
                      className="checkbox"
                      checked={formData.savePaymentInfo}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="savePaymentInfo">Save card information for future bookings</label>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'bankTransfer' && (
                <div className="transferInfo">
                  <p>Please use the following details to complete your bank transfer:</p>
                  <p><strong>Bank:</strong> Island Bank Ltd.</p>
                  <p><strong>Account Name:</strong> {booking.spaName}</p>
                  <p><strong>Account Number:</strong> 8562-9471-2035</p>
                  <p><strong>Reference:</strong> Please use your name as a reference</p>
                  <p>Once your payment is confirmed, we will secure your booking.</p>
                </div>
              )}
              
              {paymentMethod === 'cash' && (
                <div className="cashInfo">
                  <p>You have selected to pay on arrival. Please note:</p>
                  <p>• You will need to arrive 15 minutes before your scheduled appointment time</p>
                  <p>• We accept cash, credit cards, and digital payments on-site</p>
                  <p>• Your booking is not confirmed until we receive a 20% deposit</p>
                </div>
              )}
            </div>
            
            <div className="formSection">
              <div className="securePayment">
                <span className="secureIcon">🔒</span>
                <span>Your payment information is encrypted and secure</span>
              </div>
              
              <div className="termsAgreement">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  className="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="agreeToTerms">
                  I agree to the <a href="#">terms and conditions</a> and the <a href="#">cancellation policy</a> of {booking.spaName}. I acknowledge that my booking is subject to the spa's availability and confirmation.
                </label>
              </div>
              
              <button 
                type="submit" 
                className="submitButton"
                disabled={!formData.agreeToTerms}
              >
                {paymentMethod === 'creditCard' ? 'Pay Now & Confirm Booking' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="bookingSummary">
          <div className="summaryCard">
            <div className="summaryTitle">Booking Summary</div>
            <div className="summaryContent">
              <h3 className="activityName">{booking.serviceName}</h3>
              <div className="summaryDetail">
                <span className="summaryIcon">🏝️</span>
                <span>{booking.spaName}</span>
              </div>
              <div className="summaryDetail">
                <span className="summaryIcon">📅</span>
                <span>{formatDate(booking.date)}</span>
              </div>
              <div className="summaryDetail">
                <span className="summaryIcon">⏰</span>
                <span>{booking.timeSlot.startTime} - {booking.timeSlot.endTime}</span>
              </div>
              
              <div className="divider"></div>
              
              <div className="priceSummary">
                <div className="priceRow">
                  <span>Service Fee</span>
                  <span>${booking.discountedPrice || booking.price}</span>
                </div>
                {booking.discountedPrice && (
                  <div className="priceRow">
                    <span>Discount</span>
                    <span>-${(booking.price - booking.discountedPrice).toFixed(2)}</span>
                  </div>
                )}
                <div className="priceRow">
                  <span>Taxes (10%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="divider"></div>
                <div className="priceRow totalPrice">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="cancellationNote">
                <span className="infoIcon">ℹ️</span>
                <span>Free cancellation up to 24 hours before your booked time. After that, a 50% fee applies.</span>
              </div>
            </div>
          </div>
          
          <div className="supportInfo">
            <h3>Need Help?</h3>
            <p>Our customer support team is available 24/7:</p>
            <p>📞 +1 (555) 123-4567</p>
            <p>✉️ support@islandwellness.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}