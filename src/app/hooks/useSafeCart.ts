"use client";

import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

/**
 * Safe version of useCart that doesn't throw if CartProvider is not available
 * Returns default values if context is not available
 */
export const useSafeCart = () => {
  try {
    const context = useContext(CartContext);
    if (context === undefined) {
      // CartProvider not available, return safe defaults
      return {
        cart: null,
        loading: false,
        error: null,
        itemCount: 0,
        addToCart: async () => false,
        removeFromCart: async () => false,
        updateCartItem: async () => false,
        clearCart: async () => false,
        refreshCart: async () => {},
      };
    }
    return context;
  } catch (error) {
    // Return safe defaults
    return {
      cart: null,
      loading: false,
      error: null,
      itemCount: 0,
      addToCart: async () => false,
      removeFromCart: async () => false,
      updateCartItem: async () => false,
      clearCart: async () => false,
      refreshCart: async () => {},
    };
  }
};