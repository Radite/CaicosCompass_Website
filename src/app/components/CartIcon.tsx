"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import styles from './CartIcon.module.css';

export default function CartIcon() {
  const router = useRouter();
  const { user } = useAuth();
  const { itemCount } = useCart();

  const handleClick = () => {
    if (!user) {
      router.push('/login?redirect=/cart');
      return;
    }
    router.push('/cart');
  };

  // Only show for logged-in users
  if (!user) {
    return null;
  }

  return (
    <button 
      onClick={handleClick}
      className={styles.cartIcon}
      aria-label={`Cart with ${itemCount} items`}
    >
      <ShoppingCart size={24} />
      {itemCount > 0 && (
        <span className={styles.badge}>
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}