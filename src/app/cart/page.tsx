"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Trash2, Calendar, Clock, MapPin, Users, 
  ShoppingBag, AlertCircle, ArrowRight 
} from 'lucide-react';
import styles from './cart.module.css';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, loading, error, removeFromCart, clearCart, refreshCart } = useCart();

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/cart');
    }
  }, [user, router]);

  useEffect(() => {
    refreshCart();
  }, []);

  const handleRemoveItem = async (itemId: string) => {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
      const success = await removeFromCart(itemId);
      if (success) {
        console.log('Item removed successfully');
      }
    }
  };

  const handleClearCart = async () => {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      const success = await clearCart();
      if (success) {
        console.log('Cart cleared successfully');
      }
    }
  };

  const handleCheckout = () => {
    if (cart && cart.items.length > 0) {
      router.push('/cart-checkout');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getServiceImage = (item: any) => {
    const service = item.service;
    if (!service) return '/placeholder-image.jpg';
    
    if (service.images && service.images.length > 0) {
      return service.images.find((img: any) => img.isMain)?.url || service.images[0]?.url;
    }
    if (service.mainImage) return service.mainImage;
    if (service.stayImages && service.stayImages.length > 0) return service.stayImages[0];
    
    return '/placeholder-image.jpg';
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} />
        <h2>Error Loading Cart</h2>
        <p>{error}</p>
        <button onClick={refreshCart} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <ShoppingBag size={64} />
        <h1>Your Cart is Empty</h1>
        <p>Start exploring and add experiences to your cart!</p>
        <button onClick={() => router.push('/')} className={styles.exploreButton}>
          Explore Services
        </button>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartHeader}>
        <h1>Your Cart</h1>
        <p>{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</p>
      </div>

      <div className={styles.cartContent}>
        {/* Cart Items */}
        <div className={styles.cartItems}>
          {cart.items.map((item) => (
            <div key={item._id} className={styles.cartItem}>
              <div className={styles.itemImage}>
                <img 
                  src={getServiceImage(item)} 
                  alt={item.service?.name || 'Service'}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.jpg';
                  }}
                />
              </div>

              <div className={styles.itemDetails}>
                <div className={styles.itemHeader}>
                  <h3>{item.service?.name || 'Service'}</h3>
                  <span className={styles.serviceType}>{item.serviceType}</span>
                </div>

                <div className={styles.itemInfo}>
                  {item.service?.location && (
                    <div className={styles.infoItem}>
                      <MapPin size={16} />
                      <span>{item.service.location}</span>
                    </div>
                  )}

                  {item.selectedDate && (
                    <div className={styles.infoItem}>
                      <Calendar size={16} />
                      <span>{formatDate(item.selectedDate)}</span>
                    </div>
                  )}

                  {item.startDate && item.endDate && (
                    <div className={styles.infoItem}>
                      <Calendar size={16} />
                      <span>
                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                      </span>
                    </div>
                  )}

                  {item.selectedTime && (
                    <div className={styles.infoItem}>
                      <Clock size={16} />
                      <span>{item.selectedTime}</span>
                    </div>
                  )}

                  {item.numPeople && (
                    <div className={styles.infoItem}>
                      <Users size={16} />
                      <span>{item.numPeople} {item.numPeople > 1 ? 'guests' : 'guest'}</span>
                    </div>
                  )}

                  {item.option && (
                    <div className={styles.infoItem}>
                      <span className={styles.optionBadge}>{item.option.title}</span>
                    </div>
                  )}

                  {item.pickupLocation && (
                    <div className={styles.infoItem}>
                      <MapPin size={16} />
                      <span>Pickup: {item.pickupLocation}</span>
                    </div>
                  )}

                  {item.dropoffLocation && (
                    <div className={styles.infoItem}>
                      <MapPin size={16} />
                      <span>Drop-off: {item.dropoffLocation}</span>
                    </div>
                  )}
                </div>

                {item.notes && (
                  <div className={styles.itemNotes}>
                    <strong>Notes:</strong> {item.notes}
                  </div>
                )}
              </div>

              <div className={styles.itemActions}>
                <div className={styles.itemPrice}>
                  ${item.totalPrice.toFixed(2)}
                </div>
                <button 
                  onClick={() => handleRemoveItem(item._id)}
                  className={styles.removeButton}
                  title="Remove from cart"
                >
                  <Trash2 size={18} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className={styles.cartSummary}>
          <h2>Order Summary</h2>
          
          <div className={styles.summaryDetails}>
            <div className={styles.summaryRow}>
              <span>Subtotal ({cart.items.length} items)</span>
              <span>${cart.totalCartPrice.toFixed(2)}</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>Service Fees</span>
              <span>Calculated at checkout</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Taxes</span>
              <span>Calculated at checkout</span>
            </div>

            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Estimated Total</span>
              <span>${cart.totalCartPrice.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            className={styles.checkoutButton}
          >
            Proceed to Checkout
            <ArrowRight size={20} />
          </button>

          <button 
            onClick={handleClearCart}
            className={styles.clearCartButton}
          >
            Clear Cart
          </button>

          <div className={styles.securityBadge}>
            <AlertCircle size={16} />
            <span>Secure checkout with SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}