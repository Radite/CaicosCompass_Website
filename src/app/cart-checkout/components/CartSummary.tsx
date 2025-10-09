import React from 'react';
import { FaCalendarAlt, FaClock, FaUsers, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import styles from '../cartcheckout.module.css';

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
}

interface CartSummaryProps {
  items: CartItem[];
  totals: {
    subtotal: number;
    fees: number;
    taxes: number;
    discounts: number;
    total: number;
  };
  onRemoveItem: (itemId: string) => void;
  guestName?: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({ items, totals, onRemoveItem, guestName }) => {
  const displayName = guestName || 'Your';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'activity':
        return '🎯';
      case 'spa':
      case 'wellnessspa':
        return '💆';
      case 'stay':
        return '🏠';
      default:
        return '📦';
    }
  };

  return (
    <div className={styles.cartSummaryContainer}>
      <h3 className={styles.summaryTitle}>{displayName} Cart ({items.length} {items.length === 1 ? 'item' : 'items'})</h3>

      <div className={styles.cartItemsList}>
        {items.map((item, index) => (
          <div key={item._id || index} className={styles.cartItemCard}>
            <div className={styles.itemHeader}>
              <div className={styles.itemTitle}>
                <span className={styles.itemIcon}>{getServiceTypeIcon(item.serviceType)}</span>
                <div>
                  <h4>{item.serviceName}</h4>
                  <span className={styles.itemCategory}>{item.category}</span>
                </div>
              </div>
              <button
                onClick={() => onRemoveItem(item._id)}
                className={styles.removeButton}
                title="Remove from cart"
              >
                <FaTrash />
              </button>
            </div>

            <div className={styles.itemDetails}>
              <div className={styles.detailRow}>
                <FaCalendarAlt className={styles.detailIcon} />
                <span>
                  {formatDate(item.selectedDate)}
                  {item.checkOutDate && ` - ${formatDate(item.checkOutDate)}`}
                </span>
              </div>

              {(item.selectedTime || item.timeSlot) && (
                <div className={styles.detailRow}>
                  <FaClock className={styles.detailIcon} />
                  <span>
                    {item.timeSlot 
                      ? `${item.timeSlot.startTime} - ${item.timeSlot.endTime}`
                      : item.selectedTime
                    }
                  </span>
                </div>
              )}

              <div className={styles.detailRow}>
                <FaUsers className={styles.detailIcon} />
                <span>{item.numPeople} {item.numPeople === 1 ? 'person' : 'people'}</span>
              </div>

              {item.notes && (
                <div className={styles.detailRow}>
                  <FaMapMarkerAlt className={styles.detailIcon} />
                  <span className={styles.itemNotes}>{item.notes}</span>
                </div>
              )}
            </div>

            <div className={styles.itemPricing}>
              <div className={styles.priceRow}>
                <span>Base Price:</span>
                <span>${item.priceBreakdown.basePrice.toFixed(2)}</span>
              </div>
              {item.priceBreakdown.fees > 0 && (
                <div className={styles.priceRow}>
                  <span>Fees:</span>
                  <span>${item.priceBreakdown.fees.toFixed(2)}</span>
                </div>
              )}
              {item.priceBreakdown.taxes > 0 && (
                <div className={styles.priceRow}>
                  <span>Taxes:</span>
                  <span>${item.priceBreakdown.taxes.toFixed(2)}</span>
                </div>
              )}
              {item.priceBreakdown.discounts > 0 && (
                <div className={styles.priceRow} style={{ color: '#28a745' }}>
                  <span>Discount:</span>
                  <span>-${item.priceBreakdown.discounts.toFixed(2)}</span>
                </div>
              )}
              <div className={styles.itemTotal}>
                <span>Item Total:</span>
                <span>${item.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.cartTotals}>
        <div className={styles.totalRow}>
          <span>Subtotal:</span>
          <span>${totals.subtotal.toFixed(2)}</span>
        </div>
        {totals.fees > 0 && (
          <div className={styles.totalRow}>
            <span>Total Fees:</span>
            <span>${totals.fees.toFixed(2)}</span>
          </div>
        )}
        {totals.taxes > 0 && (
          <div className={styles.totalRow}>
            <span>Total Taxes:</span>
            <span>${totals.taxes.toFixed(2)}</span>
          </div>
        )}
        {totals.discounts > 0 && (
          <div className={styles.totalRow} style={{ color: '#28a745' }}>
            <span>Total Discounts:</span>
            <span>-${totals.discounts.toFixed(2)}</span>
          </div>
        )}
        <div className={styles.grandTotal}>
          <span>Grand Total:</span>
          <span>${totals.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;