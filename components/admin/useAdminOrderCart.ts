'use client';

import { useCallback, useMemo, useState } from 'react';
import { CartItem, Product } from '@/types';
import { ComboCartActions } from '@/components/menu/ComboProductCard';
import { ProductCartActions } from '@/components/ui/ProductCard';

function addProductItem(prev: CartItem[], product: Product): CartItem[] {
  const existing = prev.find((i) => i.product.id === product.id && !i.comboDetail);
  if (existing) {
    return prev.map((i) =>
      i.product.id === product.id && !i.comboDetail ? { ...i, quantity: i.quantity + 1 } : i
    );
  }
  return [...prev, { product, quantity: 1, cartKey: product.id }];
}

function addComboItem(
  prev: CartItem[],
  payload: { product: Product; displayName: string; comboDetail: string; unitPrice?: number }
): CartItem[] {
  return [
    ...prev,
    {
      product: payload.product,
      quantity: 1,
      unitPrice: payload.unitPrice ?? payload.product.price,
      displayName: payload.displayName,
      comboDetail: payload.comboDetail,
      cartKey: `${payload.product.id}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    },
  ];
}

function removeCartItem(prev: CartItem[], productId: string): CartItem[] {
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
}

export function useAdminOrderCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => addProductItem(prev, product));
  }, []);

  const addConfiguredCombo = useCallback(
    (payload: { product: Product; displayName: string; comboDetail: string; unitPrice?: number }) => {
      setItems((prev) => addComboItem(prev, payload));
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => removeCartItem(prev, productId));
  }, []);

  const getQuantity = useCallback(
    (productId: string) =>
      items.filter((i) => i.product.id === productId).reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const productCartActions: ProductCartActions = useMemo(
    () => ({ addItem, removeItem, getQuantity }),
    [addItem, removeItem, getQuantity]
  );

  const comboCartActions: ComboCartActions = useMemo(
    () => ({ addConfiguredCombo, removeItem, getQuantity }),
    [addConfiguredCombo, removeItem, getQuantity]
  );

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + (i.unitPrice ?? i.product.price) * i.quantity, 0);

  return {
    items,
    productCartActions,
    comboCartActions,
    totalItems,
    totalPrice,
  };
}
