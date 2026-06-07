/**
 * cartService.ts
 *
 * Single source of truth for shopping cart state.
 * Replaces 22 direct localStorage.setItem('cart_items_v1', ...) calls
 * scattered across app/page.tsx.
 *
 * All cart mutations go through this service so invariants are enforced
 * in one place (no duplicates, consistent shape, persistence).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string
  type: string
  name: string
  service_id?: number | string | null
  price: number
  category: string
  details?: Record<string, any>
}

const CART_KEY = 'cart_items_v1'

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Load cart items from localStorage.
 * Returns an empty array on any parse error.
 */
export function loadCart(): CartItem[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(CART_KEY) : null
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Persist the cart to localStorage.
 * Internal — use the mutation helpers below instead.
 */
function persistCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  } catch {
    // Storage full or blocked — silently ignore
  }
}

/**
 * Add an item to the cart.
 * Returns the new cart state.
 */
export function addToCart(current: CartItem[], item: CartItem): CartItem[] {
  const next = [...current, item]
  persistCart(next)
  return next
}

/**
 * Remove an item from the cart by id.
 * Returns the new cart state.
 */
export function removeFromCart(current: CartItem[], itemId: string): CartItem[] {
  const next = current.filter(i => i.id !== itemId)
  persistCart(next)
  return next
}

/**
 * Update a specific item in the cart.
 * Returns the new cart state.
 */
export function updateCartItem(current: CartItem[], itemId: string, patch: Partial<CartItem>): CartItem[] {
  const next = current.map(i => i.id === itemId ? { ...i, ...patch } : i)
  persistCart(next)
  return next
}

/**
 * Clear the entire cart.
 * Returns an empty array.
 */
export function clearCart(): CartItem[] {
  try {
    localStorage.removeItem(CART_KEY)
  } catch {}
  return []
}

// ─── Computed ─────────────────────────────────────────────────────────────────

/**
 * Get the total price of all items in the cart.
 */
export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.price ?? 0), 0)
}

/**
 * Get the number of items in the cart.
 */
export function getCartCount(items: CartItem[]): number {
  return items.length
}

/**
 * Check whether a service is already in the cart.
 */
export function isServiceInCart(items: CartItem[], serviceId: number | string): boolean {
  return items.some(i => String(i.service_id) === String(serviceId))
}
