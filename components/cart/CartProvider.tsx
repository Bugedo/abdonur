'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Product, CartItem } from '@/types';

// ─── Mínimo de items para pedir ───
export const MIN_ITEMS = 1;

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  addConfiguredCombo: (payload: {
    product: Product;
    displayName: string;
    comboDetail: string;
  }) => void;
  removeItem: (productId: string) => void;
  removeLineItem: (payload: { productId: string; cartKey?: string }) => void;
  getQuantity: (productId: string) => number;
  totalItems: number;
  totalPrice: number;
  isMinimumMet: boolean;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const params = useParams<{ id?: string }>();
  const cartStorageKey = `abdonur_cart_${params?.id ?? 'default'}`;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(cartStorageKey);
      if (!raw) {
        setItems([]);
        setHydrated(true);
        return;
      }
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, [cartStorageKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
  }, [items, cartStorageKey, hydrated]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && !i.comboDetail);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && !i.comboDetail ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, cartKey: product.id }];
    });
  }, []);

  const addConfiguredCombo = useCallback(
    ({ product, displayName, comboDetail }: { product: Product; displayName: string; comboDetail: string }) => {
      setItems((prev) => [
        ...prev,
        {
          product,
          quantity: 1,
          unitPrice: product.price,
          displayName,
          comboDetail,
          cartKey: `${product.id}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        },
      ]);
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const normalItem = prev.find((i) => i.product.id === productId && !i.comboDetail);
      if (normalItem) {
        if (normalItem.quantity <= 1) {
          return prev.filter((i) => !(i.product.id === productId && !i.comboDetail));
        }
        return prev.map((i) =>
          i.product.id === productId && !i.comboDetail ? { ...i, quantity: i.quantity - 1 } : i
        );
      }

      const comboIndex = [...prev].reverse().findIndex((i) => i.product.id === productId && !!i.comboDetail);
      if (comboIndex === -1) return prev;
      const realIndex = prev.length - 1 - comboIndex;
      return prev.filter((_, index) => index !== realIndex);
    });
  }, []);

  const removeLineItem = useCallback(({ productId, cartKey }: { productId: string; cartKey?: string }) => {
    setItems((prev) => {
      if (cartKey) {
        return prev.filter((item) => item.cartKey !== cartKey);
      }
      return prev.filter((item) => item.product.id !== productId);
    });
  }, []);

  const getQuantity = useCallback(
    (productId: string) =>
      items
        .filter((i) => i.product.id === productId)
        .reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + (i.unitPrice ?? i.product.price) * i.quantity, 0);
  const isMinimumMet = totalItems >= MIN_ITEMS;

  const clearCart = useCallback(() => {
    setItems([]);
    window.localStorage.removeItem(cartStorageKey);
  }, [cartStorageKey]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addConfiguredCombo,
        removeItem,
        removeLineItem,
        getQuantity,
        totalItems,
        totalPrice,
        isMinimumMet,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
