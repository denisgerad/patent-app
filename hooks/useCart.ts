"use client"

/**
 * useCart.ts
 *
 * Single reactive hook for cart state.
 * Replaces the 22 direct localStorage.setItem('cart_items_v1', ...) calls
 * scattered across app/page.tsx.
 *
 * Designed as a drop-in replacement for the existing cartItems useState
 * pattern — same shape, same persistence, no behaviour change.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  loadCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  getCartTotal,
  getCartCount,
  isServiceInCart,
  type CartItem,
} from '@/services/cartService'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseCartReturn {
  // State
  items: CartItem[]
  total: number
  count: number
  hasItems: boolean

  // Queries
  isInCart: (serviceId: number | string) => boolean

  // Mutations — each returns the new items array (for components that need it)
  add: (item: CartItem) => void
  remove: (itemId: string) => void
  update: (itemId: string, patch: Partial<CartItem>) => void
  clear: () => void
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>([])

  // Load from localStorage on mount (client only)
  useEffect(() => {
    setItems(loadCart())
  }, [])

  // ── Mutations ─────────────────────────────────────────────────────────────

  const add = useCallback((item: CartItem) => {
    setItems(prev => addToCart(prev, item))
  }, [])

  const remove = useCallback((itemId: string) => {
    setItems(prev => removeFromCart(prev, itemId))
  }, [])

  const update = useCallback((itemId: string, patch: Partial<CartItem>) => {
    setItems(prev => updateCartItem(prev, itemId, patch))
  }, [])

  const clear = useCallback(() => {
    setItems(clearCart())
  }, [])

  // ── Queries ───────────────────────────────────────────────────────────────

  const isInCart = useCallback(
    (serviceId: number | string) => isServiceInCart(items, serviceId),
    [items]
  )

  // ── Derived ───────────────────────────────────────────────────────────────

  const total = useMemo(() => getCartTotal(items), [items])
  const count = useMemo(() => getCartCount(items), [items])
  const hasItems = count > 0 && total > 0

  // ── Return ────────────────────────────────────────────────────────────────

  return useMemo(() => ({
    items,
    total,
    count,
    hasItems,
    isInCart,
    add,
    remove,
    update,
    clear,
  }), [items, total, count, hasItems, isInCart, add, remove, update, clear])
}
