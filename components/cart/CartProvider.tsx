'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Product, CartItem } from '@/types';

// ─── Mínimo de items para pedir ───
export const MIN_ITEMS = 1;

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  addBundleItem: (payload: {
    product: Product;
    quantity: number;
    displayName: string;
    unitPrice: number;
    bundleLabel: string;
  }) => void;
  removeItem: (productId: string) => void;
  getQuantity: (productId: string) => number;
  totalItems: number;
  totalPrice: number;
  isMinimumMet: boolean;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: product.price }];
    });
  }, []);

  const addBundleItem = useCallback(
    ({
      product,
      quantity,
      displayName,
      unitPrice,
      bundleLabel,
    }: {
      product: Product;
      quantity: number;
      displayName: string;
      unitPrice: number;
      bundleLabel: string;
    }) => {
      const bundleKey = `${product.id}:${bundleLabel}:${displayName}`;
      setItems((prev) => {
        const existing = prev.find((i) => i.cartKey === bundleKey);
        if (existing) {
          return prev.map((i) =>
            i.cartKey === bundleKey ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [
          ...prev,
          { cartKey: bundleKey, product, displayName, unitPrice, quantity, bundleLabel },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === productId && !i.bundleLabel);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((i) => !(i.product.id === productId && !i.bundleLabel));
      }
      return prev.map((i) =>
        i.product.id === productId && !i.bundleLabel ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  }, []);

  const getQuantity = useCallback(
    (productId: string) =>
      items
        .filter((i) => i.product.id === productId && !i.bundleLabel)
        .reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + (i.unitPrice ?? i.product.price) * i.quantity, 0);
  const isMinimumMet = totalItems >= MIN_ITEMS;

  const clearCart = useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addBundleItem,
        removeItem,
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
