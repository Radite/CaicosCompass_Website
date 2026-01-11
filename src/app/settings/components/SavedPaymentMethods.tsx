// src/app/settings/components/SavedPaymentMethods.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import styles from '../settings.module.css';
import paymentStyles from './savedPaymentMethods.module.css';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentMethodInfo {
  _id: string;
  type: 'card' | 'bank_account';
  display: string;
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  nickname: string | null;
  isDefault: boolean;
  usageCount: number;
  lastUsedAt: string | null;
  savedAt: string;
}

/**
 * Setup Intent Form - For adding new payment methods
 */
function SetupIntentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [setupIntentId, setSetupIntentId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Step 1: Create setup intent
  const handleCreateSetupIntent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment-methods/setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create setup intent');
      }

      const data = await response.json();
      setSetupIntentId(data.setupIntentId);
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create setup intent');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Confirm payment method after user enters card
  const handleConfirmPaymentMethod = async () => {
    if (!stripe || !elements || !setupIntentId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate form
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'Please check your payment details');
        setIsLoading(false);
        return;
      }

      // Confirm setup intent
      const { error: confirmError } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/settings/payment-methods`
        }
      });

      if (confirmError) {
        setError(confirmError.message || 'Failed to confirm payment method');
        setIsLoading(false);
        return;
      }

      // Notify backend to save the payment method
      const response = await fetch('/api/payment-methods/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setupIntentId,
          nickname: nickname || null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save payment method');
      }

      // Reset form
      setNickname('');
      setSetupIntentId(null);
      setClientSecret(null);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save payment method');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={paymentStyles.setupForm}>
      <h3 className={paymentStyles.formTitle}>Add New Payment Method</h3>

      {!clientSecret ? (
        <div>
          <button
            onClick={handleCreateSetupIntent}
            disabled={isLoading}
            className={paymentStyles.primaryButton}
          >
            {isLoading ? 'Loading...' : 'Add Payment Method'}
          </button>
        </div>
      ) : (
        <div className={paymentStyles.setupContent}>
          <div className={paymentStyles.formGroup}>
            <label>Nickname (optional)</label>
            <input
              type="text"
              placeholder="e.g., My Visa, Work Card"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={paymentStyles.input}
            />
          </div>

          <div className={paymentStyles.cardElementContainer}>
            <PaymentElement options={{ layout: 'tabs' }} />
          </div>

          {error && <div className={paymentStyles.error}>{error}</div>}

          <div className={paymentStyles.formActions}>
            <button
              onClick={handleConfirmPaymentMethod}
              disabled={isLoading || !stripe || !elements}
              className={paymentStyles.primaryButton}
            >
              {isLoading ? 'Saving...' : 'Save Payment Method'}
            </button>
            <button
              onClick={() => {
                setSetupIntentId(null);
                setClientSecret(null);
                setError(null);
              }}
              className={paymentStyles.secondaryButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Payment Methods List - Display and manage saved methods
 */
function PaymentMethodsList() {
  const [methods, setMethods] = useState<PaymentMethodInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNickname, setEditNickname] = useState('');

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment-methods', {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch payment methods');
      }

      const data = await response.json();
      setMethods(data.paymentMethods || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // Update payment method
  const handleUpdate = async (methodId: string, isDefault: boolean) => {
    try {
      const response = await fetch(`/api/payment-methods/${methodId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: editNickname || null,
          isDefault
        })
      });

      if (!response.ok) throw new Error('Failed to update');

      setEditingId(null);
      setEditNickname('');
      await fetchPaymentMethods();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  // Delete payment method
  const handleDelete = async (methodId: string) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/payment-methods/${methodId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to delete');

      await fetchPaymentMethods();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (isLoading) {
    return <div className={paymentStyles.loading}>Loading payment methods...</div>;
  }

  if (error) {
    return <div className={paymentStyles.error}>{error}</div>;
  }

  if (methods.length === 0) {
    return <div className={paymentStyles.empty}>No saved payment methods yet.</div>;
  }

  return (
    <div className={paymentStyles.methodsList}>
      <h3 className={paymentStyles.sectionTitle}>Your Payment Methods</h3>

      {methods.map((method) => (
        <div key={method._id} className={paymentStyles.methodCard}>
          <div className={paymentStyles.methodHeader}>
            <div className={paymentStyles.methodInfo}>
              <h4 className={paymentStyles.methodDisplay}>{method.display}</h4>
              {method.nickname && (
                <p className={paymentStyles.nickname}>{method.nickname}</p>
              )}
              {method.isDefault && (
                <span className={paymentStyles.defaultBadge}>DEFAULT</span>
              )}
            </div>
            <div className={paymentStyles.methodActions}>
              {editingId === method._id ? (
                <div className={paymentStyles.editMode}>
                  <input
                    type="text"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    placeholder="Nickname (optional)"
                    className={paymentStyles.nicknameInput}
                  />
                  <button
                    onClick={() => handleUpdate(method._id, method.isDefault)}
                    className={paymentStyles.saveButton}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className={paymentStyles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditingId(method._id);
                      setEditNickname(method.nickname || '');
                    }}
                    className={paymentStyles.editButton}
                  >
                    Edit
                  </button>
                  {!method.isDefault && (
                    <button
                      onClick={() => handleUpdate(method._id, true)}
                      className={paymentStyles.defaultButton}
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(method._id)}
                    className={paymentStyles.deleteButton}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          <div className={paymentStyles.methodDetails}>
            <p>Used {method.usageCount} time{method.usageCount !== 1 ? 's' : ''}</p>
            {method.lastUsedAt && (
              <p>Last used: {new Date(method.lastUsedAt).toLocaleDateString()}</p>
            )}
            <p>Saved: {new Date(method.savedAt).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Main Component - Saved Payment Methods Settings Page
 */
export default function SavedPaymentMethods() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className={paymentStyles.container}>
      <h2 className={paymentStyles.pageTitle}>Payment Methods</h2>

      <div className={paymentStyles.section}>
        <Elements
          stripe={stripePromise}
          options={{
            mode: 'setup',
            currency: 'usd'
          }}
        >
          <SetupIntentForm
            onSuccess={() => setRefreshKey(prev => prev + 1)}
          />
        </Elements>
      </div>

      <div className={paymentStyles.section}>
        <PaymentMethodsList key={refreshKey} />
      </div>
    </div>
  );
}
