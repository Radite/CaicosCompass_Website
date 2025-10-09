"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface CartItem {
  _id: string;
  service: any;
  serviceType: string;
  category: string;
  option?: any;
  room?: any;
  selectedDate?: string;
  startDate?: string;
  endDate?: string;
  selectedTime?: string;
  timeSlot?: {
    startTime: string;
    endTime: string;
  };
  quantity: number;
  numPeople: number;
  totalPrice: number;
  priceBreakdown?: {
    basePrice: number;
    fees: number;
    taxes: number;
    discounts: number;
  };
  notes?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  serviceName?: string;
  status: string;
  reservedUntil?: string;
}

interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalCartPrice: number;
  itemCount?: number;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  addToCart: (item: any) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<boolean>;
  updateCartItem: (itemId: string, updates: any) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Export CartContext for useSafeCart hook
export { CartContext };

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const refreshCart = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setCart(null);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/cart`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setCart(response.data.cart);
        setError(null);
      }
    } catch (err: any) {
      console.error('Error fetching cart:', err);
      if (err.response?.status === 401) {
        setCart(null);
      } else {
        setError(err.response?.data?.message || 'Failed to load cart');
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: any): Promise<boolean> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/cart`,
        item,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setCart(response.data.cart);
        setError(null);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      setError(err.response?.data?.message || 'Failed to add item to cart');
      return false;
    }
  };

  const removeFromCart = async (itemId: string): Promise<boolean> => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/cart/${itemId}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setCart(response.data.cart);
        setError(null);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error removing from cart:', err);
      setError(err.response?.data?.message || 'Failed to remove item');
      return false;
    }
  };

  const updateCartItem = async (itemId: string, updates: any): Promise<boolean> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/cart/${itemId}`,
        updates,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setCart(response.data.cart);
        setError(null);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error updating cart item:', err);
      setError(err.response?.data?.message || 'Failed to update item');
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/cart`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setCart(response.data.cart);
        setError(null);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error clearing cart:', err);
      setError(err.response?.data?.message || 'Failed to clear cart');
      return false;
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const itemCount = cart?.items?.length || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        itemCount,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};