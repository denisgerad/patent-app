/**
 * orderService.ts
 *
 * Single point of access for all order data operations.
 * Wraps lib/orders.ts (which handles the actual Supabase queries and caching)
 * and integrates with userService for auth.
 *
 * Pages and hooks must never query the orders table directly.
 */

import { supabase } from '@/lib/supabase'
import { fetchOrdersMerged, invalidateOrdersCache } from '@/lib/orders'
import { getCurrentUserId } from './userService'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Order {
  id: number | string
  created_at: string
  service_id: number | null
  category_id: number | null
  payment_id: number | null
  type: string | null
  amount: number | null
  responsible: string | null
  workflow_status: string | null
  require_info_message: string | null
  require_info_reply: string | null
  // Joined
  services: { id: number; name: string } | null
  categories: { id: number; name: string } | null
  payments: {
    id: number
    razorpay_order_id: string | null
    razorpay_payment_id: string | null
    payment_method: string | null
    total_amount: number | null
    payment_status: string | null
    payment_date: string | null
    type: string | null
  } | null
  // Form completion
  filled_fields: number | null
  total_fields: number | null
  form_core_complete: boolean | null
  form_confirmed: boolean
  form_values: Record<string, any> | null
  service_pricing_key?: string | null
  user?: any
}

export interface FetchOrdersResult {
  orders: Order[]
  error: string | null
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

/**
 * Fetch all orders for the currently signed-in user.
 * Returns empty array (not an error) if user is not signed in.
 */
export async function fetchUserOrders(options?: {
  force?: boolean
  cacheMs?: number
}): Promise<FetchOrdersResult> {
  const userId = await getCurrentUserId()
  if (!userId) return { orders: [], error: null }

  const result = await fetchOrdersMerged(supabase as any, userId, {
    includeProfile: false,
    cacheMs: options?.cacheMs ?? 0,
    force: options?.force ?? true,
  })

  return {
    orders: result.orders as Order[],
    error: result.error,
  }
}

/**
 * Fetch orders for a specific user id.
 * Used by admin screens and server-side API routes.
 */
export async function fetchOrdersForUser(
  userId: string,
  options?: { force?: boolean; cacheMs?: number }
): Promise<FetchOrdersResult> {
  const result = await fetchOrdersMerged(supabase as any, userId, {
    includeProfile: false,
    cacheMs: options?.cacheMs ?? 0,
    force: options?.force ?? true,
  })

  return {
    orders: result.orders as Order[],
    error: result.error,
  }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Invalidate the in-memory order cache for the current user.
 * Call this after any order mutation (payment, status update).
 */
export async function invalidateUserOrders(): Promise<void> {
  const userId = await getCurrentUserId()
  if (userId) invalidateOrdersCache(userId)
}

// ─── Grouping helpers ─────────────────────────────────────────────────────────

export interface OrderGroup {
  key: string
  paymentId: string | null
  rows: Order[]
  payment: Order['payments']
  paymentDate: string | null
  totalAmount: number
}

/**
 * Group a flat order list by payment_id.
 * Orders without a payment_id become singleton groups.
 */
export function groupOrdersByPayment(orders: Order[]): OrderGroup[] {
  const map = new Map<string, Order[]>()

  for (const o of orders) {
    const key = o.payment_id ? String(o.payment_id) : `nopay-${o.id}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(o)
  }

  return Array.from(map.entries()).map(([key, rows]) => {
    const payment = rows[0]?.payments ?? null
    return {
      key,
      paymentId: payment?.razorpay_payment_id ?? (payment?.id ? String(payment.id) : null),
      rows,
      payment,
      paymentDate: payment?.payment_date ?? rows[0]?.created_at ?? null,
      totalAmount: Number(payment?.total_amount ?? 0),
    }
  })
}

/**
 * Filter and sort orders locally (no network call).
 */
export function filterAndSortOrders(
  orders: Order[],
  query: string,
  sort: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'
): Order[] {
  const q = query.trim().toLowerCase()

  const filtered = q
    ? orders.filter(o => {
        const cat = (o.categories?.name ?? '').toLowerCase()
        const svc = (o.services?.name ?? '').toLowerCase()
        const amt = String(o.payments?.total_amount ?? '')
        return cat.includes(q) || svc.includes(q) || amt.includes(q)
      })
    : orders

  return [...filtered].sort((a, b) => {
    if (sort === 'amount_desc')
      return (Number(b.payments?.total_amount ?? 0)) - (Number(a.payments?.total_amount ?? 0))
    if (sort === 'amount_asc')
      return (Number(a.payments?.total_amount ?? 0)) - (Number(b.payments?.total_amount ?? 0))
    const ad = new Date(a.created_at).getTime()
    const bd = new Date(b.created_at).getTime()
    return sort === 'date_asc' ? ad - bd : bd - ad
  })
}
