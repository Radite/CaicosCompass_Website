// src/app/profile/sections/PaymentMethodsSection.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../profile.module.css";
import { AddPaymentMethodModal } from "../components/AddPaymentMethodModal";
import { EditPaymentMethodModal } from "../components/EditPaymentMethodModal";

interface PaymentMethod {
  _id: string;
  type: "card" | "bank_account";
  display: string;
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  nickname?: string;
  isDefault: boolean;
  savedAt: string;
  usageCount: number;
}

interface SetupIntentResponse {
  clientSecret: string;
  setupIntentId: string;
}

export const PaymentMethodsSection: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  // Fetch payment methods on component mount
  useEffect(() => {
    if (token) {
      fetchPaymentMethods();
    }
  }, [token]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/payment-methods`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentMethods(response.data.paymentMethods || []);
      setError("");
    } catch (err: any) {
      console.error("Error fetching payment methods:", err);
      setError(err.response?.data?.message || "Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const isDuplicateCard = (stripePaymentMethodId: string, newLast4: string, newBrand?: string): boolean => {
    return paymentMethods.some((method) => {
      if (method.type === "card" && newBrand) {
        return method.last4 === newLast4 && method.brand === newBrand;
      }
      return false;
    });
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!window.confirm("Are you sure you want to delete this payment method?")) {
      return;
    }

    try {
      setDeleting(paymentMethodId);
      const response = await axios.delete(
        `${apiUrl}/api/payment-methods/${paymentMethodId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Only update UI if deletion was successful
      if (response.status === 200) {
        setPaymentMethods(
          paymentMethods.filter((method) => method._id !== paymentMethodId)
        );
        setError("");
      }
    } catch (err: any) {
      console.error("Error deleting payment method:", err);
      setError(err.response?.data?.message || "Failed to delete payment method");
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      setSaving(true);
      await axios.patch(
        `${apiUrl}/api/payment-methods/${paymentMethodId}`,
        { isDefault: true },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      const updated = paymentMethods.map((method) => ({
        ...method,
        isDefault: method._id === paymentMethodId,
      }));
      setPaymentMethods(updated);
      setError("");
    } catch (err: any) {
      console.error("Error setting default payment method:", err);
      setError(err.response?.data?.message || "Failed to set default payment method");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (method: PaymentMethod) => {
    setEditingMethod(method);
    setShowEditModal(true);
  };

  const handleUpdatePaymentMethod = async (nickname: string) => {
    if (!editingMethod) return;

    try {
      setSaving(true);
      await axios.patch(
        `${apiUrl}/api/payment-methods/${editingMethod._id}`,
        { nickname },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      const updated = paymentMethods.map((method) =>
        method._id === editingMethod._id ? { ...method, nickname } : method
      );
      setPaymentMethods(updated);
      setShowEditModal(false);
      setEditingMethod(null);
      setError("");
    } catch (err: any) {
      console.error("Error updating payment method:", err);
      setError(err.response?.data?.message || "Failed to update payment method");
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentMethodAdded = (newMethod: PaymentMethod) => {
    // Check for duplicates before adding
    if (newMethod.type === "card" && isDuplicateCard("", newMethod.last4, newMethod.brand)) {
      setError("This card is already saved. Please use a different card.");
      return;
    }

    setPaymentMethods([...paymentMethods, newMethod]);
    setShowAddModal(false);
    setError("");
  };

  const renderPaymentMethodCard = (method: PaymentMethod) => {
    const isCard = method.type === "card";
    const cardIcon = isCard
      ? method.brand === "visa"
        ? "fab fa-cc-visa"
        : method.brand === "mastercard"
        ? "fab fa-cc-mastercard"
        : method.brand === "amex"
        ? "fab fa-cc-amex"
        : "fas fa-credit-card"
      : "fas fa-university";

    return (
      <div key={method._id} className={styles.paymentMethodCard}>
        <div className={styles.paymentMethodContent}>
          <div className={styles.paymentMethodIcon}>
            <i className={cardIcon}></i>
          </div>
          <div className={styles.paymentMethodDetails}>
            <div className={styles.paymentMethodHeader}>
              <h4 className={styles.paymentMethodName}>
                {method.nickname || method.display}
              </h4>
              {method.isDefault && (
                <span className={styles.defaultBadge}>Default</span>
              )}
            </div>
            <p className={styles.paymentMethodDisplay}>{method.display}</p>
            <div className={styles.paymentMethodMeta}>
              <span className={styles.metaItem}>
                <i className="fas fa-history"></i>
                Used {method.usageCount} time{method.usageCount !== 1 ? "s" : ""}
              </span>
              {isCard && method.expiryMonth && method.expiryYear && (
                <span className={styles.metaItem}>
                  <i className="fas fa-calendar-alt"></i>
                  Expires {method.expiryMonth}/{method.expiryYear}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.paymentMethodActions}>
          {!method.isDefault && (
            <button
              className={styles.actionButton}
              onClick={() => handleSetDefault(method._id)}
              disabled={saving}
              title="Set as default payment method"
            >
              <i className="fas fa-star"></i>
              Set Default
            </button>
          )}
          <button
            className={styles.actionButton}
            onClick={() => handleEditClick(method)}
            title="Edit payment method"
          >
            <i className="fas fa-edit"></i>
            Edit
          </button>
          <button
            className={`${styles.actionButton} ${styles.dangerButton}`}
            onClick={() => handleDeletePaymentMethod(method._id)}
            disabled={deleting === method._id}
            title="Delete payment method"
          >
            <i className="fas fa-trash"></i>
            {deleting === method._id ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Payment Methods</h3>
        <p className={styles.sectionDescription}>
          Add and manage your payment methods for secure bookings
        </p>
      </div>

      {error && (
        <div className={`${styles.alert} ${styles.alertDanger}`}>
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading payment methods...</p>
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyStateIcon}>
            <i className="fas fa-credit-card"></i>
          </div>
          <h4 className={styles.emptyStateTitle}>No Payment Methods</h4>
          <p className={styles.emptyStateDescription}>
            Add a payment method to get started with bookings on Turks Explorer
          </p>
          <button
            className={styles.btnPrimary}
            onClick={() => setShowAddModal(true)}
          >
            <i className="fas fa-plus"></i>
            Add Payment Method
          </button>
        </div>
      ) : (
        <>
          <div className={styles.paymentMethodsList}>
            {paymentMethods.map(renderPaymentMethodCard)}
          </div>

          <div className={styles.addMoreContainer}>
            <button
              className={styles.btnSecondary}
              onClick={() => setShowAddModal(true)}
            >
              <i className="fas fa-plus"></i>
              Add Another Payment Method
            </button>
          </div>
        </>
      )}

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPaymentMethodAdded={handlePaymentMethodAdded}
        token={token!}
        apiUrl={apiUrl}
      />

      {/* Edit Payment Method Modal */}
      {editingMethod && (
        <EditPaymentMethodModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingMethod(null);
          }}
          paymentMethod={editingMethod}
          onUpdate={handleUpdatePaymentMethod}
          saving={saving}
        />
      )}
    </div>
  );
};