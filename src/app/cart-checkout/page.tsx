"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import styles from './cartcheckout.module.css';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CheckoutForm from '../payment/components/CheckoutForm';
import CartSummary from './components/CartSummary';
import Spinner from '../payment/components/Spinner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CartItem {
  _id: string;
  serviceId: string;
  serviceType: string;
  category: string;
  serviceName: string;
  selectedDate: string;
  selectedTime?: string;
  checkOutDate?: string;
  timeSlot?: {
    startTime: string;
    endTime: string;
  };
  numPeople: number;
  totalPrice: number;
  priceBreakdown: {
    basePrice: number;
    fees: number;
    taxes: number;
    discounts: number;
  };
  notes?: string;
  optionId?: string;
}

function CartCheckoutContent() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading, error: cartError, clearCart, removeFromCart } = useCart();
  
  const cartItems = cart?.items || [];
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [checkoutChoice, setCheckoutChoice] = useState<'none' | 'signin' | 'guest'>('none');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isGuestInfoSubmitted, setIsGuestInfoSubmitted] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // ============================================================
  // REFERRAL CODE STATE
  // ============================================================
  const [referralCode, setReferralCode] = useState('');
  const [referralCodeApplied, setReferralCodeApplied] = useState(false);
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [referralPartner, setReferralPartner] = useState<any>(null);
  const [verifyingCode, setVerifyingCode] = useState(false);

  // Helper function moved UP to be accessible by useEffect
  const calculateTotals = useCallback(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.priceBreakdown.basePrice, 0);
    const fees = cartItems.reduce((sum, item) => sum + item.priceBreakdown.fees, 0);
    const taxes = cartItems.reduce((sum, item) => sum + item.priceBreakdown.taxes, 0);
    const discounts = cartItems.reduce((sum, item) => sum + item.priceBreakdown.discounts, 0);
    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    return { subtotal, fees, taxes, discounts, total };
  }, [cartItems]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ============================================================
  // VERIFY REFERRAL CODE
  // ============================================================
  const handleVerifyReferralCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!referralCode.trim()) {
      showToast('Please enter a referral code', 'error');
      return;
    }

    setVerifyingCode(true);
    
    try {
      const response = await fetch(
`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/referral/verify-code/${referralCode.toUpperCase().trim()}`,
        { method: 'GET' }
      );

      const data = await response.json();

      if (data.valid) {
        // Calculate discount (2.5% of total)
        const totals = calculateTotals();
        const discount = totals.total * 0.025; // 2.5% discount
        
        setReferralCodeApplied(true);
        setReferralDiscount(discount);
        setReferralPartner(data.data);
        
        showToast(`✓ Code applied! You save $${discount.toFixed(2)}`, 'success');
      } else {
        showToast(data.message || 'Invalid referral code', 'error');
        setReferralCodeApplied(false);
        setReferralDiscount(0);
        setReferralPartner(null);
      }
    } catch (err) {
      showToast('Error verifying referral code', 'error');
      console.error('Referral code verification error:', err);
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleRemoveReferralCode = () => {
    setReferralCode('');
    setReferralCodeApplied(false);
    setReferralDiscount(0);
    setReferralPartner(null);
    showToast('Referral code removed', 'success');
  };

  // Check if cart is empty
  useEffect(() => {
    if (!authLoading && cartItems.length === 0) {
      setError('Your cart is empty');
      setLoading(false);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, cartItems]);

  // Create payment intent when ready
  useEffect(() => {
    if (authLoading || cartLoading || clientSecret || cartItems.length === 0) {
      return;
    }

    const isReadyToPay = isAuthenticated || isGuestInfoSubmitted;

    if (isReadyToPay) {
      setLoading(true);

      const totals = calculateTotals();
      // Ensure we don't send negative values
      const finalTotal = Math.max(0, totals.total - referralDiscount);

      const cartData = {
        items: cartItems,
        user: isAuthenticated ? user._id : null,
        guestName: !isAuthenticated ? guestName : `${user?.firstName} ${user?.lastName}`,
        guestEmail: !isAuthenticated ? guestEmail : user?.email,
        contactInfo: {
          firstName: isAuthenticated ? user?.firstName : guestName.split(' ')[0] || '',
          lastName: isAuthenticated ? user?.lastName : guestName.split(' ').slice(1).join(' ') || '',
          email: isAuthenticated ? user?.email : guestEmail,
        },
        // ============================================================
        // ADD REFERRAL INFO TO PAYMENT INTENT
        // ============================================================
        referral: (referralCodeApplied && referralCode?.trim() && referralPartner) ? {
          code: referralCode.toUpperCase(),
          partnerId: referralPartner?.partnerId,
          partnerName: referralPartner?.partnerName,
          discountAmount: referralDiscount,
          commissionPercentage: referralPartner?.commissionPercentage || 5
        } : null
      };
      
      console.log('Client: Sending this data to server:', JSON.stringify(cartData, null, 2));

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
fetch(`${API_URL}/api/payments/create-cart-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartData),
      })
        .then(res => {
          if (!res.ok) return res.json().then(err => { throw new Error(err.error || 'Failed to create payment intent.') });
          return res.json();
        })
        .then(data => {
          if (data.error) throw new Error(data.error);
          setClientSecret(data.clientSecret);
          sessionStorage.setItem('cartPaymentIntentId', data.paymentIntentId);
          if (referralCodeApplied) {
            sessionStorage.setItem('referralCode', referralCode.toUpperCase());
            sessionStorage.setItem('referralPartner', referralPartner?.partnerId);
          }
        })
        .catch(err => {
          setError(err.message);
          showToast(err.message, 'error');
        })
        .finally(() => setLoading(false));
    }
  // Added missing dependencies: referralCode, calculateTotals
  }, [isAuthenticated, user, isGuestInfoSubmitted, guestName, guestEmail, authLoading, cartLoading, clientSecret, cartItems, referralCodeApplied, referralDiscount, referralPartner, referralCode, calculateTotals]);

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName && guestEmail) {
      setIsGuestInfoSubmitted(true);
    }
  };

  const handleSignInRedirect = () => {
    router.push(`/login?redirect=/cart-checkout`);
  };

  const handleContinueAsGuest = () => {
    setCheckoutChoice('guest');
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      showToast('Item removed from cart', 'success');
      
      if (cartItems.length === 1) {
        router.push('/cart');
      }
    } catch (error) {
      showToast('Failed to remove item', 'error');
    }
  };

  if (authLoading || cartLoading) {
    return <div className={styles.centered}><Spinner /></div>;
  }
  
  if (error || cartError) {
    return (
      <div className={styles.centered}>
        <p className={styles.errorText}>{error || cartError}</p>
        <button onClick={() => router.push('/cart')} className={styles.backButton}>
          Back to Cart
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className={styles.centered}>
        <p>Your cart is empty.</p>
        <button onClick={() => router.push('/')} className={styles.backButton}>
          Continue Shopping
        </button>
      </div>
    );
  }

  const totals = calculateTotals();
  const finalTotal = totals.total - referralDiscount;

  return (
    <div className={styles.container}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: toast.type === 'success' ? '#28a745' : '#dc3545',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            maxWidth: '500px',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>
            {toast.type === 'success' ? '✓' : '✕'}
          </span>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '0',
              lineHeight: '1',
              opacity: 0.8
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.recapSection}>
        <CartSummary 
          items={cartItems}
          totals={totals}
          onRemoveItem={handleRemoveItem}
          guestName={!isAuthenticated ? guestName : undefined}
          referralCodeApplied={referralCodeApplied}
          referralDiscount={referralDiscount}
          finalTotal={finalTotal}
          // IMPORTANT: If CartSummary uses referralCode, pass it here
          // referralCode={referralCode} 
        />

        {/* REFERRAL CODE SECTION */}
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px',
          marginTop: '20px'
        }}>
          <h4 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.1rem', fontWeight: '600' }}>
            Have a Referral Code?
          </h4>

          {!referralCodeApplied ? (
            <form onSubmit={handleVerifyReferralCode} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Enter referral code (e.g., TAXI12345)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                disabled={verifyingCode}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontFamily: 'monospace'
                }}
              />
              <button
                type="submit"
                disabled={verifyingCode || !referralCode.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: verifyingCode ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: verifyingCode ? 'wait' : 'pointer',
                  fontWeight: '600',
                  minWidth: '100px'
                }}
              >
                {verifyingCode ? <Spinner /> : 'APPLY'}
              </button>
            </form>
          ) : (
            <div style={{
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ color: '#155724', fontWeight: '600' }}>✓ Code applied!</span>
                <span style={{ color: '#155724', marginLeft: '10px' }}>
                  You save ${referralDiscount.toFixed(2)}
                </span>
                {referralPartner?.partnerName && (
                  <span style={{ color: '#666', marginLeft: '10px', fontSize: '0.9rem' }}>
                    Via {referralPartner.partnerName}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleRemoveReferralCode}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #c3e6cb',
                  color: '#155724',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.paymentSection}>
        {/* Choice screen for non-logged in users */}
        {!isAuthenticated && checkoutChoice === 'none' && (
          <div className={styles.checkoutChoiceContainer}>
            <h3 className={styles.checkoutTitle}>How would you like to checkout?</h3>
            {/* Sign In Option */}
            <div className={styles.choiceCard} onClick={handleSignInRedirect}>
              <div className={styles.choiceIcon}>👤</div>
              <div className={styles.choiceContent}>
                <h4>Sign in to your account</h4>
                <p>Access your saved information and booking history</p>
              </div>
              <button className={styles.choiceButton}>Sign In</button>
            </div>
            {/* Guest Checkout Option */}
            <div className={styles.choiceCard} onClick={handleContinueAsGuest}>
              <div className={styles.choiceIcon}>🛒</div>
              <div className={styles.choiceContent}>
                <h4>Continue as guest</h4>
                <p>Checkout quickly without creating an account</p>
              </div>
              <button className={styles.choiceButton}>Continue as Guest</button>
            </div>
          </div>
        )}

        {/* Guest form */}
        {!isAuthenticated && checkoutChoice === 'guest' && !clientSecret && (
          <div className={styles.guestCheckoutContainer}>
            <div className={styles.guestHeader}>
              <h4>Guest Checkout</h4>
              <p>Just need a few details to continue</p>
            </div>
            <form onSubmit={handleGuestSubmit} className={styles.guestForm}>
              <div className={styles.inputGroup}>
                <label htmlFor="guestName" className={styles.inputLabel}>Full Name *</label>
                <input
                  id="guestName"
                  type="text"
                  placeholder="Enter your full name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  className={styles.inputField}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="guestEmail" className={styles.inputLabel}>Email Address *</label>
                <input
                  id="guestEmail"
                  type="email"
                  placeholder="Enter your email address"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                  className={styles.inputField}
                />
              </div>
              <button type="submit" disabled={loading} className={styles.continueButton}>
                {loading ? <Spinner /> : 'Continue to Payment'}
              </button>
            </form>
            <div className={styles.signInPrompt}>
              <p>Already have an account?
                <button type="button" onClick={handleSignInRedirect} className={styles.signInLink}>
                  Sign in instead
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Payment form */}
        {clientSecret && (
          <div className={styles.paymentContainer}>
            <h4 className={styles.paymentTitle}>Complete Your Payment</h4>
            <p className={styles.paymentSubtitle}>
              You're booking {cartItems.length} {cartItems.length === 1 ? 'experience' : 'experiences'}
            </p>
            <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CartCheckoutPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><Spinner /></div>}>
      <CartCheckoutContent />
    </Suspense>
  );
}