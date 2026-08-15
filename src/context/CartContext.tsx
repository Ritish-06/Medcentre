'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export interface CartItemType {
  id: string;
  medicineId: string;
  pharmacyId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  availableStock: number;
  isExpired: boolean;
  isOutOfStock: boolean;
  isAvailable: boolean;
  medicine: {
    id: string;
    name: string;
    genericName: string;
    brandName: string;
    strength: string;
    dosageForm: string;
    category: string;
  };
  pharmacy: {
    id: string;
    name: string;
    address: string;
  };
}

interface CartContextType {
  cartId: string | null;
  items: CartItemType[];
  itemCount: number;
  totalAmount: number;
  loading: boolean;
  addToCart: (medicineId: string, pharmacyId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (cartItemId: string, newQuantity: number) => Promise<boolean>;
  removeFromCart: (cartItemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [cartId, setCartId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItemType[]>([]);
  const [itemCount, setItemCount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      const json = await res.json();
      if (json.success && json.data) {
        setCartId(json.data.cartId);
        setItems(json.data.items || []);
        setItemCount(json.data.itemCount || 0);
        setTotalAmount(json.data.totalAmount || 0);
      }
    } catch (e) {
      console.error('Failed to fetch cart', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [user, fetchCart]);

  const addToCart = async (
    medicineId: string,
    pharmacyId: string,
    quantity: number = 1
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineId, pharmacyId, quantity }),
      });
      const json = await res.json();

      if (!json.success) {
        showToast(json.error?.message || 'Failed to add item to cart', 'error');
        return false;
      }

      showToast(`Added to cart!`, 'success');
      await fetchCart();
      return true;
    } catch (e) {
      showToast('Network error adding to cart', 'error');
      return false;
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number): Promise<boolean> => {
    if (newQuantity <= 0) {
      return removeFromCart(cartItemId);
    }
    try {
      const res = await fetch(`/api/cart/items/${cartItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      const json = await res.json();

      if (!json.success) {
        showToast(json.error?.message || 'Failed to update quantity', 'error');
        return false;
      }

      await fetchCart();
      return true;
    } catch (e) {
      showToast('Network error updating quantity', 'error');
      return false;
    }
  };

  const removeFromCart = async (cartItemId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/cart/items/${cartItemId}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (!json.success) {
        showToast(json.error?.message || 'Failed to remove item', 'error');
        return false;
      }

      showToast('Item removed from cart', 'info');
      await fetchCart();
      return true;
    } catch (e) {
      showToast('Network error removing item', 'error');
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart', { method: 'DELETE' });
      const json = await res.json();

      if (!json.success) {
        showToast(json.error?.message || 'Failed to clear cart', 'error');
        return false;
      }

      showToast('Cart cleared', 'info');
      await fetchCart();
      return true;
    } catch (e) {
      showToast('Network error clearing cart', 'error');
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartId,
        items,
        itemCount,
        totalAmount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
