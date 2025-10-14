"use client";

import React, { useState, useEffect, Suspense } from 'react';
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
  // --- FIX 1: Correctly destructure from useCart ---
  // The cart data is in `cart`, not directly on the context.
  const { cart, loading: cartLoading, error: cartError, clearCart, removeFromCart } = useCart();
  
  // --- FIX 2: Safely access cart items ---
  // Use optional chaining and provide a fallback empty array to prevent errors.
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

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(null), 3000);
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
// Create payment intent when ready
  useEffect(() => {
    // --- FIX 3: Simplify loading and empty cart checks ---
    // Return early if cart is still loading, auth is loading, a client secret already exists, or the cart is empty.
    if (authLoading || cartLoading || clientSecret || cartItems.length === 0) {
      return;
    }

    const isReadyToPay = isAuthenticated || isGuestInfoSubmitted;

    if (isReadyToPay) {
      setLoading(true); // Start loading spinner for payment intent creation

      const cartData = {
        items: cartItems,
        user: isAuthenticated ? user._id : null,
        // Using optional chaining on `user` for extra safety
        guestName: !isAuthenticated ? guestName : `${user?.firstName} ${user?.lastName}`,
        guestEmail: !isAuthenticated ? guestEmail : user?.email,
        contactInfo: {
          firstName: isAuthenticated ? user?.firstName : guestName.split(' ')[0] || '',
          lastName: isAuthenticated ? user?.lastName : guestName.split(' ').slice(1).join(' ') || '',
          email: isAuthenticated ? user?.email : guestEmail,
        }
      };
      console.log('Client: Sending this data to server:', JSON.stringify(cartData, null, 2));


      fetch('http://localhost:5000/api/payments/create-cart-payment-intent', {
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
  // Store payment intent ID (not booking IDs since they don't exist yet)
  sessionStorage.setItem('cartPaymentIntentId', data.paymentIntentId);
})
        .catch(err => {
          setError(err.message);
          showToast(err.message, 'error');
        })
        .finally(() => setLoading(false)); // Stop loading spinner
    }
  }, [isAuthenticated, user, isGuestInfoSubmitted, guestName, guestEmail, authLoading, cartLoading, clientSecret, cartItems]); // Add cartLoading to dependency array

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
      
      // Check if cart is now empty
      if (cartItems.length === 1) {
        router.push('/cart');
      }
    } catch (error) {
      showToast('Failed to remove item', 'error');
    }
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.priceBreakdown.basePrice, 0);
    const fees = cartItems.reduce((sum, item) => sum + item.priceBreakdown.fees, 0);
    const taxes = cartItems.reduce((sum, item) => sum + item.priceBreakdown.taxes, 0);
    const discounts = cartItems.reduce((sum, item) => sum + item.priceBreakdown.discounts, 0);
    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    return { subtotal, fees, taxes, discounts, total };
  };

// --- FIX 4: Combine loading states ---
  if (authLoading || cartLoading) {
    return <div className={styles.centered}><Spinner /></div>;
  }
  
  // --- FIX 5: Combine error states ---
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
        />
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
                <ul className={styles.benefitsList}>
                  <li>Faster checkout</li>
                  <li>Order tracking</li>
                  <li>Exclusive member benefits</li>
                </ul>
              </div>
              <button className={styles.choiceButton}>Sign In</button>
            </div>

            {/* Guest Checkout Option */}
            <div className={styles.choiceCard} onClick={handleContinueAsGuest}>
              <div className={styles.choiceIcon}>🛒</div>
              <div className={styles.choiceContent}>
                <h4>Continue as guest</h4>
                <p>Checkout quickly without creating an account</p>
                <ul className={styles.benefitsList}>
                  <li>No account required</li>
                  <li>Quick and simple</li>
                  <li>Secure payment</li>
                </ul>
              </div>
              <button className={styles.choiceButton}>Continue as Guest</button>
            </div>

            <p className={styles.securityNote}>
              🔒 Your payment information is secure and encrypted
            </p>
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
                <small className={styles.emailNote}>
                  We'll send your booking confirmations to this email
                </small>
              </div>

              <button type="submit" disabled={loading} className={styles.continueButton}>
                {loading ? <Spinner /> : 'Continue to Payment'}
              </button>
            </form>

            <div className={styles.signInPrompt}>
              <p>Already have an account?
                <button
                  type="button"
                  onClick={handleSignInRedirect}
                  className={styles.signInLink}
                >
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