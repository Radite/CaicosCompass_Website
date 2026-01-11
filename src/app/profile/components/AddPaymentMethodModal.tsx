// src/app/profile/components/AddPaymentMethodModal.tsx
"use client";

import React, { useState } from "react";
import axios from "axios";
import styles from "../profile.module.css";

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentMethodAdded: (method: any) => void;
  token: string;
  apiUrl: string;
  existingMethods?: Array<{ type: string; last4: string; bankName?: string }>;
}

declare global {
  interface Window {
    Stripe: any;
  }
}

export const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onPaymentMethodAdded,
  token,
  apiUrl,
  existingMethods = [],
}) => {
  const [step, setStep] = useState<"method-type" | "payment-form">("method-type");
  const [methodType, setMethodType] = useState<"card" | "bank_account" | null>(null);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [stripeElements, setStripeElements] = useState<any>(null);
  const [stripe, setStripe] = useState<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);

  // Initialize Stripe on component mount
  React.useEffect(() => {
    if (isOpen && !stripe) {
      loadStripe();
    }
  }, [isOpen]);

  const loadStripe = async () => {
    try {
      if (window.Stripe) {
        const stripeInstance = window.Stripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        );
        setStripe(stripeInstance);
        const elementsInstance = stripeInstance.elements();
        setStripeElements(elementsInstance);
      } else {
        setError("Stripe library failed to load. Please refresh and try again.");
      }
    } catch (err) {
      console.error("Error loading Stripe:", err);
      setError("Failed to initialize payment form");
    }
  };

  const handleMethodTypeSelect = (type: "card" | "bank_account") => {
    setMethodType(type);
    setError("");
    setSuccess(false);
    setStep("payment-form");
    setTimeout(() => {
      mountStripeElement(type);
    }, 100);
  };

  const checkForDuplicateCard = (cardDetails: any): boolean => {
    const last4 = cardDetails.last4;
    const brand = cardDetails.brand?.toLowerCase();

    return existingMethods.some((method) => {
      if (method.type !== "card") return false;
      return method.last4 === last4 && method.brand?.toLowerCase() === brand;
    });
  };

  const mountStripeElement = (type: "card" | "bank_account") => {
    if (!stripeElements) return;

    const existingElement = document.getElementById("stripe-element");
    if (existingElement) {
      existingElement.innerHTML = "";
    }

    try {
      if (type === "card") {
        const cardEl = stripeElements.create("card", {
          style: {
            base: {
              fontSize: "16px",
              fontFamily: "inherit",
              color: "#424770",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
          hidePostalCode: false,
        });
        cardEl.mount("#stripe-element");
        setCardElement(cardEl);

        // Handle card element errors
        cardEl.on("change", (event: any) => {
          if (event.error) {
            setError(event.error.message);
          } else {
            setError("");
          }
        });
      } else {
        const ibanEl = stripeElements.create("iban", {
          supportedCountries: ["SEPA"],
          placeholderCountry: "DE",
          style: {
            base: {
              fontSize: "16px",
              fontFamily: "inherit",
              color: "#424770",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
        });
        ibanEl.mount("#stripe-element");
        setCardElement(ibanEl);

        ibanEl.on("change", (event: any) => {
          if (event.error) {
            setError(event.error.message);
          } else {
            setError("");
          }
        });
      }
    } catch (err) {
      console.error("Error mounting Stripe element:", err);
      setError("Failed to load payment form");
    }
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !cardElement) {
      setError("Payment form is not ready. Please try again.");
      return;
    }

    if (!nickname.trim()) {
      setError("Please enter a nickname for this payment method");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Step 1: Create setup intent
      const setupIntentResponse = await axios.post(
        `${apiUrl}/api/payment-methods/setup-intent`,
        { type: methodType },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { clientSecret } = setupIntentResponse.data;

      // Step 2: Create payment method first
      const paymentMethodResult = await stripe.createPaymentMethod({
        type: methodType === "card" ? "card" : "sepa_debit",
        ...(methodType === "card"
          ? { card: cardElement }
          : { sepa_debit: cardElement }),
        billing_details: {
          name: nickname,
        },
      });

      if (paymentMethodResult.error) {
        setError(paymentMethodResult.error.message);
        setLoading(false);
        return;
      }

      // Check for duplicate cards before confirming
      const cardDetails = paymentMethodResult.paymentMethod.card;
      if (methodType === "card" && checkForDuplicateCard(cardDetails)) {
        setError("This card is already saved. Please use a different card.");
        setLoading(false);
        return;
      }

      // Step 3: Confirm setup intent with payment method ID
      const confirmResult = await stripe.confirmSetupIntent(clientSecret, {
        payment_method: paymentMethodResult.paymentMethod.id,
      });

      if (confirmResult.error) {
        setError(confirmResult.error.message);
        setLoading(false);
        return;
      }

      if (
        confirmResult.setupIntent.status === "succeeded" ||
        confirmResult.setupIntent.status === "processing"
      ) {
        // Step 4: Confirm on backend
        const confirmResponse = await axios.post(
          `${apiUrl}/api/payment-methods/confirm`,
          {
            setupIntentId: confirmResult.setupIntent.id,
            nickname,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Success state
        setSuccess(true);
        onPaymentMethodAdded(confirmResponse.data.paymentMethod);

        // Reset after brief delay
        setTimeout(() => {
          setStep("method-type");
          setMethodType(null);
          setNickname("");
          setCardElement(null);
          setSuccess(false);
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error("Error adding payment method:", err);
      setError(
        err.response?.data?.message ||
          "Failed to add payment method. Please try again."
      );
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add Payment Method</h2>
          <button
            className={styles.modalCloseButton}
            onClick={onClose}
            disabled={loading || success}
            aria-label="Close modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ padding: "0 1.75rem", paddingTop: "1.5rem" }}>
            <div className={`${styles.alert} ${styles.alertDanger}`}>
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div style={{ padding: "0 1.75rem", paddingTop: "1.5rem" }}>
            <div className={`${styles.alert} ${styles.alertSuccess}`}>
              <i className="fas fa-check-circle"></i>
              <span>Payment method added successfully!</span>
            </div>
          </div>
        )}

        {/* Step 1: Method Type Selection */}
        {step === "method-type" ? (
          <div className={styles.methodTypeSelection}>
            <p className={styles.methodTypeDescription}>
              Select the type of payment method you want to add:
            </p>

            <div className={styles.methodTypeOptions}>
              {/* Card Option */}
              <button
                className={styles.methodTypeButton}
                onClick={() => handleMethodTypeSelect("card")}
                disabled={loading}
                type="button"
              >
                <div className={styles.methodTypeIcon}>
                  <i className="fas fa-credit-card"></i>
                </div>
                <div className={styles.methodTypeLabel}>
                  <h4>Credit/Debit Card</h4>
                  <p>Visa, Mastercard, American Express, Discover</p>
                </div>
                <i className="fas fa-arrow-right"></i>
              </button>

              {/* Bank Account Option */}
              <button
                className={styles.methodTypeButton}
                onClick={() => handleMethodTypeSelect("bank_account")}
                disabled={loading}
                type="button"
              >
                <div className={styles.methodTypeIcon}>
                  <i className="fas fa-university"></i>
                </div>
                <div className={styles.methodTypeLabel}>
                  <h4>Bank Account (SEPA)</h4>
                  <p>Direct bank transfers from EU/EEA countries</p>
                </div>
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Payment Form */
          <form onSubmit={handleAddPaymentMethod} className={styles.paymentForm}>
            {/* Nickname Input */}
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-tag" style={{ marginRight: "0.5rem", color: "#667eea" }}></i>
                Nickname
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., My Visa, Work Card"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={loading || success}
                maxLength={50}
                required
                autoFocus
              />
              <small className="form-text text-muted">
                A friendly name to identify this payment method
              </small>
            </div>

            {/* Stripe Element */}
            <div className="mb-3">
              <label className="form-label">
                <i
                  className={`fas ${
                    methodType === "card"
                      ? "fa-credit-card"
                      : "fa-university"
                  }`}
                  style={{ marginRight: "0.5rem", color: "#667eea" }}
                ></i>
                {methodType === "card" ? "Card Details" : "Bank Account Details"}
              </label>
              <div
                id="stripe-element"
                className={styles.stripeElement}
                style={{
                  border: "2px solid #e9ecef",
                  borderRadius: "0.5rem",
                  padding: "0.875rem 1rem",
                  minHeight: "44px",
                }}
              />
            </div>

            {/* Security Badge */}
            <div className={styles.securityInfo}>
              <i className="fas fa-lock"></i>
              <span>Your payment information is securely processed by Stripe</span>
            </div>

            {/* Form Actions */}
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => {
                  setStep("method-type");
                  setMethodType(null);
                  setError("");
                  setNickname("");
                }}
                disabled={loading || success}
              >
                <i className="fas fa-arrow-left"></i>
                Back
              </button>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={loading || success || !nickname.trim()}
              >
                {success ? (
                  <>
                    <i className="fas fa-check"></i>
                    Added!
                  </>
                ) : loading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Adding...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus"></i>
                    Add Payment Method
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};