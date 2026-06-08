"use client"

/**
 * useOrders.ts
 *
 * Single hook for fetching and managing the current user's orders.
 * Replaces:
 *   - loadOrders() + loadingUserOrders state in profile/page.tsx
 *   - The fetch + setState pattern in OrdersScreen
 *   - The prefetchOrders() in page.tsx
 *
 * Integrates with useAuth so pages don't need to pass a userId prop.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  fetchUserOrders,
  groupOrdersByPayment,
  filterAndSortOrders,
  invalidateUserOrders,
  type Order,
  type OrderGroup,
} from '@/services/orderService'
import { buildStatusMap, type OrderStatus } from '@/services/statusService'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseOrdersOptions {
  /** Automatically fetch when userId becomes available. Default: true */
  autoFetch?: boolean
  /** Cache duration in ms. Default: 0 (always fresh) */
  cacheMs?: number
}

export interface UseOrdersReturn {
  // Data
  orders: Order[]
  groups: OrderGroup[]
  statusMap: Record<string, OrderStatus>
  totalCount: number

  // UI state
  loading: boolean
  error: string | null
  authMissing: boolean

  // Filter/sort state — manage locally so the hook owns this
  searchQuery: string
  setSearchQuery: (q: string) => void
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'
  setSortBy: (s: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc') => void
  filteredOrders: Order[]

  // Actions
  refresh: () => Promise<void>
  invalidate: () => Promise<void>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const { autoFetch = true, cacheMs = 0 } = options

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authMissing, setAuthMissing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<UseOrdersReturn['sortBy']>('date_desc')
  const mountedRef = useRef(true)

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetch = useCallback(async (force = true) => {
    if (!mountedRef.current) return
    setLoading(true)
    setError(null)
    setAuthMissing(false)

    const result = await fetchUserOrders({ force, cacheMs })

    if (!mountedRef.current) return

    // fetchUserOrders returns empty array (not error) when not signed in
    // Distinguish auth-missing from empty-orders by checking if userId resolved
    if (result.orders.length === 0 && !result.error) {
      // Check if auth is the reason
      const { getCurrentUserId } = await import('@/services/userService')
      const uid = await getCurrentUserId()
      if (!uid) {
        setAuthMissing(true)
        setOrders([])
        setLoading(false)
        return
      }
    }

    if (result.error) {
      setError(result.error)
      setOrders([])
    } else {
      setOrders(result.orders)
    }
    setLoading(false)
  }, [cacheMs])

  // ── Auto-fetch on mount ───────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true
    if (autoFetch) fetch()
    return () => { mountedRef.current = false }
  }, [autoFetch, fetch])

  // ── Derived ───────────────────────────────────────────────────────────────

  const groups = useMemo(() => groupOrdersByPayment(orders), [orders])
  const statusMap = useMemo(() => buildStatusMap(orders), [orders])
  const filteredOrders = useMemo(
    () => filterAndSortOrders(orders, searchQuery, sortBy),
    [orders, searchQuery, sortBy]
  )

  // ── Actions ───────────────────────────────────────────────────────────────

  const refresh = useCallback(() => fetch(true), [fetch])

  const invalidate = useCallback(async () => {
    await invalidateUserOrders()
    await fetch(true)
  }, [fetch])

  // ── Return ────────────────────────────────────────────────────────────────

  return useMemo(() => ({
    orders,
    groups,
    statusMap,
    totalCount: orders.length,
    loading,
    error,
    authMissing,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filteredOrders,
    refresh,
    invalidate,
  }), [
    orders, groups, statusMap, loading, error, authMissing,
    searchQuery, sortBy, filteredOrders, refresh, invalidate,
  ])
}
