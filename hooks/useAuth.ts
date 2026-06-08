"use client"

/**
 * useAuth.ts
 *
 * Single auth hook for all pages and components.
 * Replaces the 3-stage auth init (init() + onAuthStateChange + safety timeout)
 * that was copy-pasted into profile/page.tsx with race conditions.
 *
 * Wraps userService so no component ever calls supabase.auth directly.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import {
  getAuthState,
  signInWithGoogle,
  signOut,
  upsertProfileFromSession,
  resolveDisplayName,
  getUserProfile,
} from '@/services/userService'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseAuthReturn {
  // State
  isAuthenticated: boolean
  user: User | null
  userId: string | null
  email: string | null
  displayName: string
  loading: boolean       // true while the initial session check is in flight
  authChecked: boolean   // true once we know whether the user is signed in or not

  // Actions
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>

  // For components that need to trigger a display name refresh
  refreshDisplayName: () => Promise<void>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const mountedRef = useRef(true)

  // ── Helpers ──────────────────────────────────────────────────────────────

  const applySession = useCallback((u: User | null) => {
    if (!mountedRef.current) return
    setUser(u)
    setAuthChecked(true)
    setLoading(false)
  }, [])

  const refreshDisplayName = useCallback(async () => {
    const { user: currentUser } = await getAuthState()
    if (!currentUser || !mountedRef.current) return
    const profile = await getUserProfile(currentUser.id, currentUser.email ?? null)
    const name = resolveDisplayName(profile, currentUser)
    if (mountedRef.current) setDisplayName(name)
  }, [])

  // ── Init ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true

    // Safety net: if auth never resolves (network hiccup), unblock UI after 5s
    const safety = setTimeout(() => {
      if (!mountedRef.current) return
      setAuthChecked(true)
      setLoading(false)
    }, 5000)

    // Synchronous session check on mount
    let initDone = false
    ;(async () => {
      try {
        const { user: u } = await getAuthState()
        if (!mountedRef.current) return
        initDone = true
        clearTimeout(safety)
        applySession(u)
        if (u) {
          await upsertProfileFromSession(u)
          await refreshDisplayName()
        }
      } catch {
        if (!mountedRef.current) return
        clearTimeout(safety)
        applySession(null)
      }
    })()

    // Supabase auth state listener — handles tab-in token refresh, sign-in, sign-out
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return
      const u = session?.user ?? null
      // Always clear loading regardless of whether init() already ran
      clearTimeout(safety)
      applySession(u)

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && u) {
        if (!initDone) await upsertProfileFromSession(u)
        await refreshDisplayName()
      }
      if (event === 'SIGNED_OUT') {
        setDisplayName('')
      }
    })

    return () => {
      mountedRef.current = false
      clearTimeout(safety)
      try { listener.subscription.unsubscribe() } catch {}
    }
  }, [applySession, refreshDisplayName])

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleSignInWithGoogle = useCallback(async () => {
    const { error } = await signInWithGoogle()
    if (error) console.error('[useAuth] Google sign-in failed:', error)
  }, [])

  const handleSignOut = useCallback(async () => {
    const { error } = await signOut()
    if (error) console.error('[useAuth] Sign-out failed:', error)
    if (mountedRef.current) {
      setUser(null)
      setDisplayName('')
      setAuthChecked(true)
      setLoading(false)
    }
  }, [])

  // ── Return ───────────────────────────────────────────────────────────────

  return useMemo(() => ({
    isAuthenticated: !!user,
    user,
    userId: user?.id ?? null,
    email: user?.email ?? null,
    displayName,
    loading,
    authChecked,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    refreshDisplayName,
  }), [user, displayName, loading, authChecked, handleSignInWithGoogle, handleSignOut, refreshDisplayName])
}
