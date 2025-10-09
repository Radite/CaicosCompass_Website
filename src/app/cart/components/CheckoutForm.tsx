"use client";

import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import styles from '../paymentpage.module.css';

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // This is a failsafe; the form button will be disabled until Stripe.js is loaded.
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // First, trigger form validation and wallet collection by calling elements.submit()
    const { error: submitError } = await elements.submit();
    if (submitError) {
      // Show validation errors to the customer
      setErrorMessage(submitError.message || 'An error occurred. Please check your details.');
      setIsLoading(false);
      return;
    }

    // After validation, confirm the payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // This is the URL where the user will be redirected after payment.
        return_url: `${window.location.origin}/confirmation`,
      },
    });

    // This part of the code will only be reached if an immediate error occurs during
    // payment confirmation, like a network failure. Otherwise, the user is redirected.
    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setErrorMessage(error.message || 'Please check your card details.');
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }

    // The loading state is only turned off here if an error occurs.
    // On success, the user is redirected away from this page.
    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className={styles.paymentForm}>
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className={styles.payButton}
      >
        <span id="button-text">
          {isLoading ? <div className={styles.spinner} /> : "Pay Now"}
        </span>
      </button>

      {/* Show error messages to the user */}
      {errorMessage && (
        <div id="payment-message" className={styles.paymentMessage} role="alert">
          {errorMessage}
        </div>
      )}
    </form>
  );
}