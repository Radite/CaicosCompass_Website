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

interface ConfirmationData {
  reference: string;
  booking: BookingDetails;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  paymentMethod: string;
}

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataParam));
        setConfirmationData(parsedData);
        setError(null);
      } catch (error) {
        console.error("Error parsing confirmation data:", error);
        setError("Unable to load booking confirmation. Invalid data format.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setError("No confirmation information provided");
    }
  }, [searchParams]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDownloadReceipt = () => {
    // In a real application, this would generate a PDF receipt
    alert("Download receipt functionality would be implemented here");
  };

  const handleViewBookings = () => {
    router.push("/my-bookings");
  };

  if (loading) {
    return (
      <div className="loadingContainer">
        <div className="spinner"></div>
        <h2>Loading confirmation details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="errorContainer">
        <div className="errorIcon">⚠️</div>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => router.push("/")} className="returnButton">
          Return to homepage
        </button>
      </div>
    );
  }

  if (!confirmationData) {
    return (
      <div className="errorContainer">
        <div className="errorIcon">⚠️</div>
        <h2>No Confirmation Found</h2>
        <p>We couldn't find any confirmation details to display.</p>
        <button onClick={() => router.push("/")} className="returnButton">
          Return to homepage
        </button>
      </div>
    );
  }

  const { reference, booking, customer, paymentMethod } = confirmationData;
  const servicePrice = booking.discountedPrice || booking.price;
  const taxAmount = servicePrice * 0.1; // 10% tax
  const totalAmount = servicePrice + taxAmount;

  const getPaymentStatus = () => {
    switch (paymentMethod) {
      case 'creditCard':
        return "Paid in full";
      case 'bankTransfer':
        return "Awaiting transfer";
      case 'cash':
        return "Pay on arrival";
      default:
        return "Payment pending";
    }
  };

  return (
    <div className="confirmationContainer">
      <div className="confirmationBox">
        <div className="confirmationHeader">
          <div className="confirmationIcon">✓</div>
          <h2>Booking Confirmed</h2>
          <p>Thank you for booking your wellness experience!</p>
        </div>
        
        <div className="confirmationDetails">
          <div className="confirmationNumber">
            <strong>Booking Reference:</strong> {reference}
          </div>
          
          <div className="confirmationInfo">
            <div className="infoItem">
              <span className="infoIcon">🧖</span>
              <div>
                <strong>{booking.serviceName}</strong>
                <div>{booking.spaName}</div>
              </div>
            </div>
            
            <div className="infoItem">
              <span className="infoIcon">📅</span>
              <div>
                <strong>{formatDate(booking.date)}</strong>
                <div>{booking.timeSlot.startTime} - {booking.timeSlot.endTime}</div>
              </div>
            </div>
            
            <div className="infoItem">
              <span className="infoIcon">👤</span>
              <div>
                <strong>{customer.name}</strong>
                <div>{customer.email} • {customer.phone}</div>
              </div>
            </div>
            
            <div className="infoItem">
              <span className="infoIcon">💳</span>
              <div>
                <strong>{getPaymentStatus()}</strong>
                <div>{paymentMethod === 'creditCard' ? 'Credit Card' : 
                      paymentMethod === 'bankTransfer' ? 'Bank Transfer' : 'Pay on Arrival'}</div>
              </div>
            </div>
          </div>
          
          <div className="emailConfirmation">
            A confirmation email has been sent to {customer.email}
          </div>
          
          <div className="totalAmount">
            <span>Total Amount</span>
            <span className="amountValue">${totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="confirmationActions">
          <button className="primaryButton" onClick={handleDownloadReceipt}>
            Download Receipt
          </button>
          <button className="secondaryButton" onClick={handleViewBookings}>
            View My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}