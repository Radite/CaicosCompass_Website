// src/app/payment/page.tsx - Complete Frontend Payment Integration
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import styles from "./paymentpage.module.css";
import { 
  FaLock, 
  FaCheck, 
  FaInfoCircle, 
  FaCalendarAlt, 
  FaClock, 
  FaUsers,
  FaArrowLeft,
  FaCreditCard,
  FaSpinner
} from 'react-icons/fa';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Card element options
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      padding: '12px',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false,
};

// Main Payment Page Component
export default function PaymentPage() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
}

// Payment Form Component
function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const searchParams = useSearchParams();
  const router = useRouter();

  // State management
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [bookingType, setBookingType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Form data
  const [contact, setContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Load booking data on component mount
  useEffect(() => {
    const bookingParam = searchParams.get("booking");
    const typeParam = searchParams.get("type");

    if (bookingParam && typeParam) {
      try {
        const parsedBooking = JSON.parse(decodeURIComponent(bookingParam));
        setBookingData(parsedBooking);
        setBookingType(typeParam);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing booking data:", error);
        setBookingError("Invalid booking data");
        setLoading(false);
      }
    } else {
      setBookingError("No booking data found");
      setLoading(false);
    }
  }, [searchParams]);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error("Stripe has not loaded yet");
      return;
    }

    if (!agreeToTerms) {
      setBookingError("Please agree to the terms and conditions");
      return;
    }

    setIsSubmitting(true);
    setBookingError("");

    try {
      // Get user token
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      if (paymentMethod === "card") {
        await processCardPayment(token);
      } else {
        await processAlternativePayment(token);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setBookingError("Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Process card payment with Stripe
  const processCardPayment = async (token) => {
    const cardElement = elements.getElement(CardElement);

    // Create payment intent
    const paymentIntentResponse = await fetch("/api/payments/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: calculateTotalAmount(),
        currency: "usd",
        metadata: {
          bookingType,
          serviceId: getServiceId(),
          optionId: bookingData.optionId,
          date: bookingData.date,
          time: bookingData.timeSlot ? `${bookingData.timeSlot.startTime} - ${bookingData.timeSlot.endTime}` : null,
          numPeople: bookingData.numPeople || bookingData.numGuests,
          pickupLocation: bookingData.pickupLocation,
          dropoffLocation: bookingData.dropoffLocation,
          roomId: bookingData.roomId,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate
        }
      }),
    });

    if (!paymentIntentResponse.ok) {
      throw new Error("Failed to create payment intent");
    }

    const { clientSecret, paymentIntentId } = await paymentIntentResponse.json();

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: `${contact.firstName} ${contact.lastName}`,
          email: contact.email,
          phone: contact.phone,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (paymentIntent.status === "succeeded") {
      // Create booking after successful payment
      await createBooking(token, paymentIntentId);
    }
  };

  // Process alternative payment methods
  const processAlternativePayment = async (token) => {
    // For alternative payment methods, create booking without immediate payment
    const bookingResponse = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...createBookingData(),
        paymentMethod,
        status: paymentMethod === "cash" ? "pending" : "awaiting_payment",
      }),
    });

    if (!bookingResponse.ok) {
      throw new Error("Failed to create booking");
    }

    const booking = await bookingResponse.json();
    setConfirmationNumber(booking._id.toString().slice(-8));
    setBookingComplete(true);
  };

  // Create booking after successful payment
  const createBooking = async (token, paymentIntentId) => {
    const bookingResponse = await fetch("/api/payments/confirm-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        paymentIntentId,
        bookingData: createBookingData(),
      }),
    });

    if (!bookingResponse.ok) {
      throw new Error("Failed to create booking");
    }

    const { booking } = await bookingResponse.json();
    setConfirmationNumber(booking._id.toString().slice(-8));
    setBookingComplete(true);
  };

  // Create booking data object
  const createBookingData = () => {
    const baseData = {
      category: bookingType,
      contactInfo: contact,
      requirements: { specialNotes: specialRequirements },
      paymentDetails: {
        totalAmount: calculateTotalAmount(),
        amountPaid: paymentMethod === "card" ? calculateTotalAmount() : 0,
        remainingBalance: paymentMethod === "card" ? 0 : calculateTotalAmount(),
        paymentMethod,
      },
    };

    // Add service-specific data
    switch (bookingType) {
      case "activity":
        return {
          ...baseData,
          activity: getServiceId(),
          option: bookingData.optionId,
          date: bookingData.date,
          time: bookingData.timeSlot ? `${bookingData.timeSlot.startTime} - ${bookingData.timeSlot.endTime}` : null,
          numOfPeople: bookingData.numPeople,
          multiUser: bookingData.multiUser || false,
        };
      case "stay":
        return {
          ...baseData,
          stay: getServiceId(),
          room: bookingData.roomId,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          numOfPeople: bookingData.numGuests,
        };
      case "dining":
        return {
          ...baseData,
          dining: getServiceId(),
          date: bookingData.date,
          time: bookingData.timeSlot ? `${bookingData.timeSlot.startTime} - ${bookingData.timeSlot.endTime}` : null,
          numOfPeople: bookingData.numPeople,
        };
      case "transportation":
        return {
          ...baseData,
          transportation: getServiceId(),
          date: bookingData.date,
          time: bookingData.time,
          pickupLocation: bookingData.pickupLocation,
          dropoffLocation: bookingData.dropoffLocation,
          numOfPeople: bookingData.numPeople,
        };
      default:
        return baseData;
    }
  };

  // Helper functions
  const calculateTotalAmount = () => {
    if (bookingType === "activity") {
      return bookingData?.totalPrice || 0;
    }
    return bookingData?.discountedPrice || bookingData?.price || 0;
  };

  const getServiceId = () => {
    return bookingData?.activityId || bookingData?.spaId || bookingData?.serviceId || bookingData?.id;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCardType = (number) => {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(number)) return type;
    }
    return "unknown";
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <p>Loading payment details...</p>
      </div>
    );
  }

  // Error state
  if (bookingError && !bookingData) {
    return (
      <div className={styles.errorContainer}>
        <FaInfoCircle className={styles.errorIcon} />
        <h2>Something went wrong</h2>
        <p>{bookingError}</p>
        <button onClick={() => router.push("/")} className={styles.returnButton}>
          Return to Home
        </button>
      </div>
    );
  }

  // Success state
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
              Confirmation Number: <strong>#{confirmationNumber}</strong>
            </p>
            <div className={styles.confirmationInfo}>
              <div className={styles.infoItem}>
                <FaCalendarAlt className={styles.infoIcon} />
                <span>{formatDate(bookingData.date || bookingData.startDate)}</span>
              </div>
              {bookingData.timeSlot && (
                <div className={styles.infoItem}>
                  <FaClock className={styles.infoIcon} />
                  <span>
                    {bookingData.timeSlot.startTime} - {bookingData.timeSlot.endTime}
                  </span>
                </div>
              )}
              {bookingData.numPeople && (
                <div className={styles.infoItem}>
                  <FaUsers className={styles.infoIcon} />
                  <span>
                    {bookingData.numPeople} {bookingData.numPeople === 1 ? "Guest" : "Guests"}
                  </span>
                </div>
              )}
            </div>
            <p className={styles.emailConfirmation}>
              A confirmation email has been sent to {contact.email}
            </p>
            <div className={styles.totalAmount}>
              <span>Total: ${calculateTotalAmount().toFixed(2)}</span>
            </div>
          </div>
          <div className={styles.confirmationActions}>
            <button onClick={() => router.push("/bookings")} className={styles.viewBookingsButton}>
              View My Bookings
            </button>
            <button onClick={() => router.push("/")} className={styles.continueExploringButton}>
              Continue Exploring
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main payment form
  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        <FaArrowLeft /> Back
      </button>

      <div className={styles.paymentWrapper}>
        {/* Payment Form */}
        <div className={styles.paymentForm}>
          <h1 className={styles.pageTitle}>Complete Your Booking</h1>

          {bookingError && (
            <div className={styles.errorAlert}>
              <FaInfoCircle />
              <span>{bookingError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Contact Information */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Contact Information</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    value={contact.firstName}
                    onChange={(e) => setContact({...contact, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    value={contact.lastName}
                    onChange={(e) => setContact({...contact, lastName: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={contact.email}
                    onChange={(e) => setContact({...contact, email: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={contact.phone}
                    onChange={(e) => setContact({...contact, phone: e.target.value})}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Special Requirements */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Special Requirements</h3>
              <div className={styles.formGroup}>
                <label htmlFor="specialRequirements">
                  Any special requests or requirements? (Optional)
                </label>
                <textarea
                  id="specialRequirements"
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="Dietary restrictions, accessibility needs, celebration details, etc."
                  rows={3}
                />
              </div>
            </section>

            {/* Payment Method */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <FaCreditCard /> Payment Method
              </h3>
              
              <div className={styles.paymentMethods}>
                <label className={styles.paymentMethodOption}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Credit/Debit Card</span>
                </label>
                <label className={styles.paymentMethodOption}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="transfer"
                    checked={paymentMethod === "transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Bank Transfer</span>
                </label>
                <label className={styles.paymentMethodOption}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Pay on Arrival</span>
                </label>
              </div>

              {/* Stripe Card Element */}
              {paymentMethod === "card" && (
                <div className={styles.cardElementContainer}>
                  <label>Card Details</label>
                  <div className={styles.cardElement}>
                    <CardElement options={cardElementOptions} />
                  </div>
                </div>
              )}

              {/* Alternative payment info */}
              {paymentMethod === "transfer" && (
                <div className={styles.transferInfo}>
                  <p>Select this option to receive bank transfer details after booking confirmation.</p>
                  <p>Your booking will be confirmed once payment is received.</p>
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className={styles.cashInfo}>
                  <p>Pay the full amount in cash upon arrival.</p>
                  <p>Your booking will be reserved, but please arrive 15 minutes early to process payment.</p>
                </div>
              )}
            </section>

            {/* Security Notice */}
            <div className={styles.securePayment}>
              <FaLock className={styles.secureIcon} />
              <span>Secure Payment - Your payment information is encrypted and secure</span>
            </div>

            {/* Terms Agreement */}
            <div className={styles.termsAgreement}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  required
                />
                <span className={styles.checkboxText}>
                  I agree to the <a href="/terms" target="_blank">Terms & Conditions</a> and{" "}
                  <a href="/privacy" target="_blank">Privacy Policy</a>, and acknowledge the{" "}
                  <a href="/cancellation" target="_blank">Cancellation Policy</a>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className={styles.submitButton} 
              disabled={isSubmitting || !stripe}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className={styles.buttonSpinner} />
                  Processing...
                </>
              ) : (
                <>
                  Complete Booking - ${calculateTotalAmount().toFixed(2)}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Booking Summary Sidebar */}
        <div className={styles.bookingSummary}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Booking Summary</h2>
            <div className={styles.summaryContent}>
              {bookingType === "activity" ? (
                <>
                  <h3 className={styles.serviceName}>
                    {bookingData?.option?.title || bookingData?.activityName}
                  </h3>
                  <div className={styles.summaryDetails}>
                    <div className={styles.summaryItem}>
                      <FaCalendarAlt />
                      <span>{formatDate(bookingData.date)}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <FaClock />
                      <span>
                        {bookingData.timeSlot.startTime} - {bookingData.timeSlot.endTime}
                      </span>
                    </div>
                    <div className={styles.summaryItem}>
                      <FaUsers />
                      <span>{bookingData.numPeople} guests</span>
                    </div>
                  </div>
                </>
              ) : bookingType === "stay" ? (
                <>
                  <h3 className={styles.serviceName}>{bookingData?.roomName}</h3>
                  <div className={styles.summaryDetails}>
                    <div className={styles.summaryItem}>
                      <FaCalendarAlt />
                      <span>
                        {formatDate(bookingData.startDate)} - {formatDate(bookingData.endDate)}
                      </span>
                    </div>
                    <div className={styles.summaryItem}>
                      <FaUsers />
                      <span>{bookingData.numGuests} guests</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className={styles.serviceName}>{bookingData?.serviceName}</h3>
                  <div className={styles.summaryDetails}>
                    <div className={styles.summaryItem}>
                      <FaCalendarAlt />
                      <span>{formatDate(bookingData.date)}</span>
                    </div>
                    {bookingData.timeSlot && (
                      <div className={styles.summaryItem}>
                        <FaClock />
                        <span>
                          {bookingData.timeSlot.startTime} - {bookingData.timeSlot.endTime}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className={styles.pricingBreakdown}>
                <div className={styles.priceItem}>
                  <span>Service Price</span>
                  <span>${(bookingData?.price || bookingData?.basePrice || 0).toFixed(2)}</span>
                </div>
                {bookingData?.discount && (
                  <div className={styles.priceItem}>
                    <span>Discount</span>
                    <span>-${bookingData.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className={styles.totalPrice}>
                  <span>Total</span>
                  <span>${calculateTotalAmount().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}