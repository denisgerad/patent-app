"use client"

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchOrdersMerged } from '@/lib/orders'

export type OrdersScreenProps = Record<string, never>

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [authMissing, setAuthMissing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: sessionRes } = await supabase.auth.getSession()
      const userId = sessionRes?.session?.user?.id ?? null
      if (!userId) {
        setAuthMissing(true)
        setOrders([])
        return
      }
      setAuthMissing(false)
      const result = await fetchOrdersMerged(supabase as any, userId, {
        includeProfile: false,
        cacheMs: 0,
        force: true,
      })
      if (result.error) {
        setError(result.error)
        setOrders([])
      } else {
        setOrders(result.orders)
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Simple status helper
  const deriveStatus = (o: any): string => {
    try {
      const paymentSucceeded = !!(
        (o.payments && ((o.payments as any).payment_status === 'paid' || (o.payments as any).status === 'captured')) ||
        o.payment_status === 'paid'
      )
      if (!paymentSucceeded) return 'Payment Pending'
      const confirmed = !!o.form_confirmed
      if (!confirmed) return 'Details Required'
      const wf = (o.workflow_status || '').toLowerCase()
      if (wf === 'completed') return 'Completed'
      if (wf === 'require_info') return 'Details Required'
      if (wf === 'in_progress') return 'In Progress'
      const responsible = (o.responsible || o.assigned_to || '').trim()
      if (responsible) return 'Assigned'
      return 'Details Completed'
    } catch {
      return 'Payment Pending'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <h1 className="text-lg font-semibold">Your Orders</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 id="page-heading" tabIndex={-1} className="sr-only">Orders</h2>

        {/* Not signed in */}
        {!loading && authMissing && (
          <div className="rounded-lg border bg-white p-6 text-center">
            <p className="text-gray-600 mb-4">You are not signed in. Please sign in to view your orders.</p>
            <a href="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
              Go to Home
            </a>
          </div>
        )}

        {/* Error */}
        {!loading && !authMissing && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="text-red-700 text-sm mb-3">{error}</p>
            <button
              onClick={load}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-white rounded border" />
            ))}
          </div>
        )}

        {/* Orders table */}
        {!loading && !authMissing && !error && (
          <>
            {orders.length === 0 ? (
              <div className="rounded-lg border bg-white p-6 text-center text-gray-500 text-sm">
                No orders found.
              </div>
            ) : (
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-3 text-left text-sm font-medium text-gray-600">Category</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-600">Service</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-600">Status</th>
                        <th className="p-3 text-left text-sm font-medium text-gray-600">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((r: any) => (
                        <tr key={String(r.id)} className="border-t hover:bg-gray-50">
                          <td className="p-3 text-sm">{r?.categories?.name ?? 'N/A'}</td>
                          <td className="p-3 text-sm">{r?.services?.name ?? 'N/A'}</td>
                          <td className="p-3 text-sm">{deriveStatus(r)}</td>
                          <td className="p-3 text-sm">{r?.payments?.total_amount ?? 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
