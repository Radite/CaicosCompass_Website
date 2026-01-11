import React from 'react';
import { FaCalendarAlt, FaClock, FaUsers, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';

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
  referralCodeApplied?: boolean;
  referralDiscount?: number;
  finalTotal?: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({ 
  items, 
  totals, 
  onRemoveItem, 
  guestName,
  referralCodeApplied = false,
  referralDiscount = 0,
  finalTotal
}) => {
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

  const actualFinalTotal = finalTotal !== undefined ? finalTotal : totals.total;

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '24px',
        borderBottom: '1px solid #e9ecef'
      }}>
        <h2 style={{
          margin: '0 0 8px 0',
          fontSize: '24px',
          fontWeight: '700',
          color: '#212529'
        }}>
          Order Summary
        </h2>
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#6c757d'
        }}>
          {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      {/* Items List */}
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          {items.map((item, index) => (
            <div 
              key={item._id || index} 
              style={{
                display: 'flex',
                gap: '16px',
                paddingBottom: '20px',
                marginBottom: '20px',
                borderBottom: index !== items.length - 1 ? '1px solid #e9ecef' : 'none'
              }}
            >
              {/* Item Icon */}
              <div style={{
                fontSize: '32px',
                minWidth: '40px',
                textAlign: 'center'
              }}>
                {getServiceTypeIcon(item.serviceType)}
              </div>

              {/* Item Details */}
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#212529'
                  }}>
                    {item.serviceName}
                  </h4>
                  <span style={{
                    fontSize: '13px',
                    color: '#6c757d',
                    backgroundColor: '#f0f0f0',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    {item.category}
                  </span>
                </div>

                {/* Booking Details Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '12px',
                  fontSize: '13px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#495057' }}>
                    <FaCalendarAlt size={14} style={{ color: '#0d6efd' }} />
                    <span>
                      {formatDate(item.selectedDate)}
                      {item.checkOutDate && <br />}
                      {item.checkOutDate && `to ${formatDate(item.checkOutDate)}`}
                    </span>
                  </div>

                  {(item.selectedTime || item.timeSlot) && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#495057' }}>
                      <FaClock size={14} style={{ color: '#0d6efd' }} />
                      <span>
                        {item.timeSlot 
                          ? `${item.timeSlot.startTime} - ${item.timeSlot.endTime}`
                          : item.selectedTime
                        }
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#495057' }}>
                    <FaUsers size={14} style={{ color: '#0d6efd' }} />
                    <span>{item.numPeople} {item.numPeople === 1 ? 'guest' : 'guests'}</span>
                  </div>
                </div>

                {item.notes && (
                  <div style={{
                    fontSize: '13px',
                    color: '#6c757d',
                    padding: '8px 12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    marginBottom: '12px',
                    borderLeft: '3px solid #0d6efd'
                  }}>
                    <strong>Note:</strong> {item.notes}
                  </div>
                )}

                {/* Price Breakdown for Item */}
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>Base Price:</span>
                    <span style={{ fontWeight: '600' }}>${item.priceBreakdown.basePrice.toFixed(2)}</span>
                  </div>
                  {item.priceBreakdown.fees > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#666' }}>
                      <span>Service Fees:</span>
                      <span>${item.priceBreakdown.fees.toFixed(2)}</span>
                    </div>
                  )}
                  {item.priceBreakdown.taxes > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#666' }}>
                      <span>Taxes:</span>
                      <span>${item.priceBreakdown.taxes.toFixed(2)}</span>
                    </div>
                  )}
                  {item.priceBreakdown.discounts > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#28a745' }}>
                      <span>Item Discount:</span>
                      <span style={{ fontWeight: '600' }}>-${item.priceBreakdown.discounts.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #e9ecef',
                    paddingTop: '8px',
                    marginTop: '8px',
                    fontWeight: '700',
                    color: '#212529'
                  }}>
                    <span>Item Total:</span>
                    <span>${item.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemoveItem(item._id)}
                style={{
                  minWidth: '40px',
                  height: '40px',
                  border: 'none',
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  fontSize: '16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffc107';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff3cd';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Remove from cart"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Breakdown Section */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '24px',
        borderTop: '1px solid #e9ecef'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: '700',
          color: '#212529',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Cost Breakdown
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          fontSize: '15px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#495057' }}>
            <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'}):</span>
            <span>${totals.subtotal.toFixed(2)}</span>
          </div>

          {totals.fees > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>Service Fees:</span>
              <span>+${totals.fees.toFixed(2)}</span>
            </div>
          )}

          {totals.taxes > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
              <span>Estimated Taxes:</span>
              <span>+${totals.taxes.toFixed(2)}</span>
            </div>
          )}

          {totals.discounts > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#28a745', fontWeight: '600' }}>
              <span>Discount:</span>
              <span>-${totals.discounts.toFixed(2)}</span>
            </div>
          )}

          {referralCodeApplied && referralDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#17a2b8', fontWeight: '600' }}>
              <span>🎁 Referral Discount (2.5%):</span>
              <span>-${referralDiscount.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Grand Total */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '2px solid #dee2e6',
          borderBottom: '2px solid #dee2e6',
          paddingTop: '16px',
          paddingBottom: '16px',
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '6px',
          marginTop: '16px'
        }}>
          <span style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#212529'
          }}>
            Total Amount Due:
          </span>
          <span style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#0d6efd'
          }}>
            ${actualFinalTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Security Footer */}
      <div style={{
        backgroundColor: '#e7f3ff',
        padding: '12px 24px',
        borderTop: '1px solid #b3d9ff',
        fontSize: '13px',
        color: '#004085',
        textAlign: 'center'
      }}>
        🔒 Secure checkout with SSL encryption
      </div>
    </div>
  );
};

export default CartSummary;