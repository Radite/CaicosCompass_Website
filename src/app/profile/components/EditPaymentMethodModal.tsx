// src/app/profile/components/EditPaymentMethodModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import styles from "../profile.module.css";

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
}

interface EditPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethod;
  onUpdate: (nickname: string) => Promise<void>;
  saving: boolean;
}

export const EditPaymentMethodModal: React.FC<EditPaymentMethodModalProps> = ({
  isOpen,
  onClose,
  paymentMethod,
  onUpdate,
  saving,
}) => {
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    if (isOpen && paymentMethod) {
      setNickname(paymentMethod.nickname || "");
    }
  }, [isOpen, paymentMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      await onUpdate(nickname.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Edit Payment Method</h2>
          <button
            className={styles.modalCloseButton}
            onClick={onClose}
            disabled={saving}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Payment Method</label>
            <div className={styles.paymentMethodInfo}>
              <div className={styles.infoContent}>
                <i
                  className={
                    paymentMethod.type === "card"
                      ? "fas fa-credit-card"
                      : "fas fa-university"
                  }
                ></i>
                <span>{paymentMethod.display}</span>
              </div>
              {paymentMethod.isDefault && (
                <span className={styles.defaultBadge}>Default</span>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Nickname</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., My Visa, Work Card"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={saving}
            />
            <small className="form-text text-muted">
              A friendly name to identify this payment method
            </small>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={saving || !nickname.trim()}
            >
              {saving ? (
                <>
                  <span className={styles.spinner}></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};