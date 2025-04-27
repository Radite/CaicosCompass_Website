"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./paymentpage.module.css";
import { FaArrowLeft, FaLock, FaCreditCard, FaUserPlus, FaCalendarAlt, FaClock, FaUsers, FaInfoCircle, FaCheck, FaSearch } from "react-icons/fa";

const getCardType = (num) => {
  const patterns = { visa: /^4/, mastercard: /^5[1-5]/, amex: /^3[47]/, discover: /^6(?:011|5)/ };
  for (let [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(num.replace(/\s+/g, ""))) return type;
  }
  return "unknown";
};

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State variables
  const [bookingData, setBookingData] = useState(null);
  const [bookingType, setBookingType] = useState(null); // 'activity' or 'spa'
  const [activity, setActivity] = useState(null);
  const [spaService, setSpaService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
    billingAddress: "",
    billingZip: "",
  });
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  const [contact, setContact] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [sharedUsers, setSharedUsers] = useState([]);
  const [usernameSearch, setUsernameSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [confirmationNumber, setConfirmationNumber] = useState("");

  // Formatting functions
  const formatCardNumber = (val) => {
    const digits = val.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    return digits.match(/\d{1,4}/g)?.join(" ") || val;
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    return digits.length >= 2 ? `${digits.substring(0, 2)}/${digits.substring(2, 4)}` : digits;
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // Handle data loading
  useEffect(() => {
    const bookingParam = searchParams.get("booking");
    if (bookingParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(bookingParam));
        setBookingData(parsed);
        
        // Determine booking type based on parameters
        if (parsed.activityId) {
          setBookingType("activity");
          // Mock fetching activity data
          setTimeout(() => {
            setActivity({
              _id: parsed.activityId,
              name: parsed.activityName || "Activity Name",
              option: parsed.optionId ? { _id: parsed.optionId, title: parsed.optionTitle || "Option Title" } : null,
            });
            setLoading(false);
          }, 500);
        } else if (parsed.spaId) {
          setBookingType("spa");
          // Set spa service data from the booking info
          setSpaService({
            _id: parsed.serviceId,
            name: parsed.serviceName,
            price: parsed.price,
            discountedPrice: parsed.discountedPrice,
            spaName: parsed.spaName,
            spaId: parsed.spaId
          });
          setLoading(false);
        } else {
          throw new Error("Unknown booking type");
        }
      } catch (err) {
        console.error(err);
        setBookingError("Invalid booking data. Please try again.");
        setLoading(false);
      }
    } else {
      setBookingError("No booking data found. Please select an activity or service first.");
      setLoading(false);
    }
  }, [searchParams]);

  // User search functions
  const handleUsernameSearch = (e) => {
    e.preventDefault();
    if (!usernameSearch.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setSearchResults([
        { _id: "1", username: usernameSearch, fullName: "John Doe" },
        { _id: "2", username: usernameSearch + "2", fullName: "Jane Smith" },
        { _id: "3", username: usernameSearch + "_alt", fullName: "Alex Johnson" },
      ]);
      setIsSearching(false);
    }, 800);
  };

  const addUser = (user) => {
    if (!sharedUsers.find((u) => u._id === user._id)) {
      setSharedUsers([...sharedUsers, user]);
      setSearchResults([]);
      setUsernameSearch("");
    }
  };

  const removeUser = (id) => setSharedUsers(sharedUsers.filter((u) => u._id !== id));
  const navigateBack = () => router.back();

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookingData) return setBookingError("No booking data available");
    setIsSubmitting(true);
    
    try {
      let booking;
      
      if (bookingType === "activity") {
        booking = {
          user: "current_user_id",
          participants: sharedUsers.map((u) => u._id),
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
                user: "current_user_id",
                amount: bookingData.totalPrice,
                status: "paid",
                paymentMethod,
              },
            ],
          },
          requirements: { specialNotes: specialRequirements },
        };
      } else if (bookingType === "spa") {
        booking = {
          user: "current_user_id",
          status: "pending",
          category: "spa",
          spa: bookingData.spaId,
          service: bookingData.serviceId,
          serviceName: bookingData.serviceName,
          date: bookingData.date,
          time: `${bookingData.timeSlot.startTime} - ${bookingData.timeSlot.endTime}`,
          paymentDetails: {
            totalAmount: bookingData.discountedPrice || bookingData.price,
            amountPaid: bookingData.discountedPrice || bookingData.price,
            payees: [
              {
                user: "current_user_id",
                amount: bookingData.discountedPrice || bookingData.price,
                status: "paid",
                paymentMethod,
              },
            ],
          },
          requirements: { specialNotes: specialRequirements },
          contactInfo: contact
        };
      }
      
      // Simulate API call
      await new Promise((res) => setTimeout(res, 1500));
      setConfirmationNumber(Math.random().toString(36).substr(2, 8).toUpperCase());
      console.log("Booking created:", booking);
      setBookingComplete(true);
    } catch (error) {
      console.error(error);
      setBookingError("Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Card type detection
  const cardType = getCardType(cardDetails.number);

  // Loading state
  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading payment details...</p>
      </div>
    );

  // Error state
  if (bookingError && !bookingData)
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

  // Booking confirmation state
  if (bookingComplete)
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
                <span>
                  {bookingData.timeSlot.startTime} - {bookingData.timeSlot.endTime}
                </span>
              </div>
              {bookingType === "activity" && (
                <div className={styles.infoItem}>
                  <FaUsers className={styles.infoIcon} />
                  <span>
                    {bookingData.numPeople} {bookingData.numPeople === 1 ? "Guest" : "Guests"}
                  </span>
                </div>
              )}
            </div>
            <p className={styles.emailConfirmation}>A confirmation email has been sent to {contact.email}</p>
            <div className={styles.totalAmount}>
              <span>Total Paid:</span>
              <span className={styles.amountValue}>
                ${bookingType === "activity" 
                  ? bookingData.totalPrice.toFixed(2) 
                  : (bookingData.discountedPrice || bookingData.price).toFixed(2)}
              </span>
            </div>
          </div>
          <div className={styles.confirmationActions}>
            <button onClick={() => router.push("/dashboard")} className={styles.primaryButton}>
              Go to My Bookings
            </button>
            <button onClick={() => router.push("/")} className={styles.secondaryButton}>
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );

  // Main payment form
  return (
    <div className={styles.container}>
      <button onClick={navigateBack} className={styles.backButton}>
        <FaArrowLeft className={styles.backIcon} /> Back
      </button>
      <div className={styles.pageTitle}>
        <h1>Complete Your Booking</h1>
        <p>Secure your {bookingType === "activity" ? "experience" : "wellness service"} with our easy payment process</p>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.paymentForm}>
          <form onSubmit={handleSubmit}>
            {/* Contact Information */}
            <section className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Contact Information</h2>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    value={contact.firstName}
                    onChange={(e) => setContact({ ...contact, firstName: e.target.value })}
                    required
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    value={contact.lastName}
                    onChange={(e) => setContact({ ...contact, lastName: e.target.value })}
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
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    required
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    required
                    className={styles.input}
                  />
                </div>
              </div>
            </section>

            {/* Participant selection for multi-user activities */}
            {bookingType === "activity" && bookingData?.multiUser && (
              <section className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                  <FaUserPlus className={styles.sectionIcon} /> Add Participants
                </h2>
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
                      {isSearching ? <div className={styles.miniSpinner}></div> : <FaSearch />}
                    </button>
                  </div>
                  {searchResults.length > 0 && (
                    <div className={styles.searchResults}>
                      {searchResults.map((user) => (
                        <div key={user._id} className={styles.userResult} onClick={() => addUser(user)}>
                          <div className={styles.userAvatar}>{user.fullName.charAt(0)}</div>
                          <div className={styles.userInfo}>
                          <div className={styles.userName}>{user.fullName}</div>
                            <div className={styles.userUsername}>@{user.username}</div>
                          </div>
                          <button type="button" className={styles.addUserButton}>
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {sharedUsers.length > 0 && (
                    <div className={styles.selectedUsers}>
                      <h3>Participants ({sharedUsers.length})</h3>
                      {sharedUsers.map((user) => (
                        <div key={user._id} className={styles.selectedUser}>
                          <div className={styles.userAvatar}>{user.fullName.charAt(0)}</div>
                          <div className={styles.userInfo}>
                            <div className={styles.userName}>{user.fullName}</div>
                            <div className={styles.userUsername}>@{user.username}</div>
                          </div>
                          <button type="button" className={styles.removeUserButton} onClick={() => removeUser(user._id)}>
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Special Requirements */}
            <section className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Special Requirements</h2>
              <div className={styles.formGroup}>
                <label htmlFor="specialRequirements">Special Requests or Notes</label>
                <textarea
                  id="specialRequirements"
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  className={styles.textarea}
                  placeholder={bookingType === "activity" 
                    ? "Any dietary requirements, accessibility needs, or other special requests..." 
                    : "Any health concerns, preferences, or special needs for your spa treatment..."}
                  rows={3}
                />
              </div>
            </section>

            {/* Payment Method */}
            <section className={styles.formSection}>
              <h2 className={styles.sectionTitle}>
                <FaLock className={styles.sectionIcon} /> Payment Method
              </h2>
              <div className={styles.paymentMethods}>
                <button
                  type="button"
                  className={`${styles.paymentMethodButton} ${paymentMethod === "card" ? styles.selectedPaymentMethod : ""}`}
                  onClick={() => setPaymentMethod("card")}
                >
                  <FaCreditCard />
                  <span>Credit Card</span>
                </button>
                <button
                  type="button"
                  className={`${styles.paymentMethodButton} ${paymentMethod === "transfer" ? styles.selectedPaymentMethod : ""}`}
                  onClick={() => setPaymentMethod("transfer")}
                >
                  <span className={styles.paymentIcon}>🏦</span>
                  <span>Bank Transfer</span>
                </button>
                <button
                  type="button"
                  className={`${styles.paymentMethodButton} ${paymentMethod === "cash" ? styles.selectedPaymentMethod : ""}`}
                  onClick={() => setPaymentMethod("cash")}
                >
                  <span className={styles.paymentIcon}>💵</span>
                  <span>Pay on Arrival</span>
                </button>
              </div>
              {paymentMethod === "card" && (
                <div className={styles.cardDetailsSection}>
                  <div className={styles.formGroup}>
                    <label htmlFor="cardholderName">Cardholder Name *</label>
                    <input
                      type="text"
                      id="cardholderName"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      required
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="cardNumber">Card Number *</label>
                    <div className={styles.cardNumberInputWrapper}>
                      <input
                        type="text"
                        id="cardNumber"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                        required
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={styles.input}
                      />
                      {cardType !== "unknown" && (
                        <div className={`${styles.cardTypeIcon} ${styles[cardType]}`}>{cardType}</div>
                      )}
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="cardExpiry">Expiry Date *</label>
                      <input
                        type="text"
                        id="cardExpiry"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                        required
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
                        value={cardDetails.cvc}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, "") })
                        }
                        required
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
                        value={cardDetails.billingAddress}
                        onChange={(e) => setCardDetails({ ...cardDetails, billingAddress: e.target.value })}
                        required
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="billingZip">Zip/Postal Code *</label>
                      <input
                        type="text"
                        id="billingZip"
                        value={cardDetails.billingZip}
                        onChange={(e) => setCardDetails({ ...cardDetails, billingZip: e.target.value })}
                        required
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
                    <label htmlFor="savePaymentInfo">Save payment information for future bookings</label>
                  </div>
                </div>
              )}
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
            <div className={styles.securePayment}>
              <FaLock className={styles.secureIcon} />
              <span>Secure Payment - Your payment information is encrypted and secure</span>
            </div>
            <div className={styles.termsAgreement}>
              <input type="checkbox" id="termsAgreement" required className={styles.checkbox} />
              <label htmlFor="termsAgreement">
                I agree to the <a href="/terms">Terms & Conditions</a> and <a href="/privacy">Privacy Policy</a>, and acknowledge the{" "}
                <a href="/cancellation">Cancellation Policy</a>
              </label>
            </div>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className={styles.miniSpinner}></div> Processing...
                </>
              ) : (
                <>Complete Booking - ${
                  bookingType === "activity"
                    ? bookingData?.totalPrice.toFixed(2)
                    : (bookingData?.discountedPrice || bookingData?.price).toFixed(2)
                }</>
              )}
            </button>
          </form>
        </div>
        
        {/* Summary sidebar */}
        <div className={styles.bookingSummary}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Booking Summary</h2>
            <div className={styles.summaryContent}>
              {bookingType === "activity" ? (
                // Activity booking summary
                <>
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
                      {bookingData?.numPeople} {bookingData?.numPeople === 1 ? "Guest" : "Guests"}
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
                </>
              ) : (
                // Spa booking summary
                <>
                  <h3 className={styles.activityName}>
                    {spaService?.name || "Selected Service"}
                  </h3>
                  <div className={styles.summarySubtitle}>
                    {spaService?.spaName || "Wellness Spa"}
                  </div>
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
                  <div className={styles.divider}></div>
                  <div className={styles.priceSummary}>
                    <div className={styles.priceRow}>
                      <span>Service price</span>
                      <span>${bookingData?.price.toFixed(2)}</span>
                    </div>
                    {bookingData?.discountedPrice && (
                      <div className={styles.priceRow}>
                        <span>Discount</span>
                        <span>-${(bookingData.price - bookingData.discountedPrice).toFixed(2)}</span>
                      </div>
                    )}
                    <div className={styles.divider}></div>
                    <div className={`${styles.priceRow} ${styles.totalPrice}`}>
                      <span>Total</span>
                      <span>${(bookingData?.discountedPrice || bookingData?.price).toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
              <div className={styles.cancellationNote}>
                <FaInfoCircle className={styles.infoIcon} />
                <p>Free cancellation up to 48 hours before your {bookingType === "activity" ? "experience" : "appointment"}</p>
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