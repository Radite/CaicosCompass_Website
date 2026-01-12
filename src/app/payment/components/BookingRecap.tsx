// /app/payment/components/BookingRecap.tsx
import React, { useState } from 'react';
import { BookingData } from '../../booking/types';
import styles from '../paymentpage.module.css';
import { FaCalendarAlt, FaClock, FaUsers, FaTag, FaTicketAlt } from 'react-icons/fa';

interface BookingRecapProps {
    data: BookingData;
    guestName?: string;
    onReferralCodeChange?: (code: string, discount: number) => void;
}

const BookingRecap: React.FC<BookingRecapProps> = ({ data, guestName, onReferralCodeChange }) => {
    const displayName = data.contactInfo?.firstName || guestName || 'Guest';
    
    // Referral code state
    const [referralInput, setReferralInput] = useState(''); // User typing
    const [referralCode, setReferralCode] = useState(''); // Applied code
    const [validCode, setValidCode] = useState(false);
    const [codeError, setCodeError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);

    // Handle APPLY button click
    const handleApplyCode = async () => {
        const trimmedCode = referralInput.toUpperCase().trim();
        
        if (!trimmedCode) {
            setCodeError('Please enter a referral code');
            return;
        }

        setCodeError('');
        setIsVerifying(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/referral/verify-code/${trimmedCode}`

            );
            const result = await response.json();

            if (result.valid) {
                setValidCode(true);
                setReferralCode(trimmedCode);
                
                // Calculate 2.5% discount
                const discount = (data.totalPrice * 2.5) / 100;
                setDiscountAmount(discount);
                setCodeError('');
                
                // Notify parent component
                if (onReferralCodeChange) {
                    onReferralCodeChange(trimmedCode, discount);
                }
                
                console.log(`✅ Valid referral code: ${trimmedCode}, Discount: $${discount.toFixed(2)}`);
            } else {
                setValidCode(false);
                setReferralCode('');
                setDiscountAmount(0);
                setCodeError('Referral code not found or not active');
                
                if (onReferralCodeChange) {
                    onReferralCodeChange('', 0);
                }
            }
        } catch (error) {
            console.error('Error verifying referral code:', error);
            setCodeError('Error verifying code. Please try again.');
            setValidCode(false);
            setReferralCode('');
            setDiscountAmount(0);
        } finally {
            setIsVerifying(false);
        }
    };

    // Handle remove code button
const handleRemoveCode = () => {
    setReferralInput('');
    setReferralCode('');
    setValidCode(false);
    setDiscountAmount(0);
    setCodeError('');
    
    if (onReferralCodeChange) {
        onReferralCodeChange('', 0);
    }
};
    // Allow Enter key to apply
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleApplyCode();
        }
    };

    const finalPrice = data.totalPrice - discountAmount;

    return (
        <div className={styles.recapContainer}>
            <h3>Booking Summary For: {displayName}</h3>
            <div className={styles.recapItem}>
                <p><strong>{data.activityName}</strong></p>
                {data.option && <p className={styles.recapOptionTitle}>{data.option.title}</p>}
            </div>
            <div className={styles.recapGrid}>
                <div className={styles.recapItem}><FaCalendarAlt /> <span>{new Date(data.date).toDateString()}</span></div>
                <div className={styles.recapItem}><FaClock /> <span>{data.timeSlot.startTime} - {data.timeSlot.endTime}</span></div>
                <div className={styles.recapItem}><FaUsers /> <span>{data.numPeople} Person(s)</span></div>
                <div className={styles.recapItem}><FaTag /> <span>${data.price.toFixed(2)} / person</span></div>
            </div>

            <hr className={styles.recapDivider} />

            {/* Referral Code Section */}
            <div className={styles.referralSection}>
                <label htmlFor="referralCode" className={styles.referralLabel}>
                    <FaTicketAlt /> Have a Referral Code?
                </label>
                
                {!validCode ? (
                    // Input mode - not applied yet
                    <div className={styles.referralInputGroup}>
                        <input
                            id="referralCode"
                            type="text"
                            placeholder="Enter referral code (e.g., ABC12345)"
                            value={referralInput}
                            onChange={(e) => {
                                setReferralInput(e.target.value);
                                setCodeError(''); // Clear error as user types
                            }}
                            onKeyPress={handleKeyPress}
                            disabled={isVerifying}
                            className={styles.referralInput}
                            maxLength={20}
                        />
                        <button
                            type="button"
                            onClick={handleApplyCode}
                            disabled={isVerifying || !referralInput.trim()}
                            className={styles.applyButton}
                        >
                            {isVerifying ? 'Checking...' : 'Apply'}
                        </button>
                    </div>
                ) : (
                    // Code applied - show success
                    <div className={styles.appliedCodeGroup}>
                        <div className={styles.appliedCodeDisplay}>
                            <span className={styles.appliedCode}>{referralCode}</span>
                            <span className={styles.checkmark}>✓</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemoveCode}
                            className={styles.removeButton}
                        >
                            Remove
                        </button>
                    </div>
                )}

                {/* Error Message - Shows when code is invalid */}
                {codeError && (
                    <div className={styles.errorAlert}>
                        <span className={styles.errorIcon}>❌</span>
                        <span className={styles.errorMessage}>{codeError}</span>
                    </div>
                )}

                {/* Success Message - Shows when code is valid */}
                {validCode && (
                    <div className={styles.successAlert}>
                        <span className={styles.successIcon}>✓</span>
                        <span className={styles.successMessage}>
                            Code applied! You save ${discountAmount.toFixed(2)}
                        </span>
                    </div>
                )}
            </div>

            <hr className={styles.recapDivider} />

            {/* Pricing Summary */}
            <div className={styles.pricingSummary}>
                <div className={styles.pricingRow}>
                    <span>Subtotal</span>
                    <span>${data.totalPrice.toFixed(2)}</span>
                </div>
                
                {discountAmount > 0 && (
                    <div className={`${styles.pricingRow} ${styles.discount}`}>
                        <span>Referral Discount (2.5%)</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                )}

                <div className={`${styles.pricingRow} ${styles.total}`}>
                    <strong>Total</strong>
                    <strong>${finalPrice.toFixed(2)}</strong>
                </div>

                {discountAmount > 0 && (
                    <p className={styles.discountNote}>
                        You're saving ${discountAmount.toFixed(2)} with this referral code!
                    </p>
                )}
            </div>
        </div>
    );
};

export default BookingRecap;