"use client"

/**
 * useProfile.ts
 *
 * Hook for fetching and updating the current user's profile row.
 * Replaces the manual fetch-by-id → fallback-by-email → setProfile()
 * pattern inside profile/page.tsx init().
 *
 * Designed to work alongside useAuth — pass the userId and email
 * from useAuth so both hooks share the same auth state.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getUserProfile,
  saveUserProfile,
  resolveDisplayName,
  type UserProfile,
  type ProfileUpdatePayload,
} from '@/services/userService'
import type { User } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseProfileReturn {
  // Data
  profile: UserProfile | null
  displayName: string

  // UI state
  loading: boolean
  saving: boolean
  error: string | null
  saveError: string | null
  saveSuccess: boolean

  // Actions
  refresh: () => Promise<void>
  save: (payload: ProfileUpdatePayload) => Promise<boolean>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProfile(userId: string | null, email: string | null, user: User | null): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const mountedRef = useRef(true)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getUserProfile(userId, email)
      if (mountedRef.current) setProfile(data)
    } catch (e: any) {
      if (mountedRef.current) setError(e?.message ?? 'Failed to load profile')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [userId, email])

  // Fetch when userId becomes available
  useEffect(() => {
    mountedRef.current = true
    if (userId) fetch()
    return () => { mountedRef.current = false }
  }, [userId, fetch])

  // ── Save ───────────────────────────────────────────────────────────────────

  const save = useCallback(async (payload: ProfileUpdatePayload): Promise<boolean> => {
    if (!userId) return false
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const { profile: updated, error: err } = await saveUserProfile(userId, email, payload)
      if (!mountedRef.current) return false
      if (err) {
        setSaveError(err)
        return false
      }
      if (updated) setProfile(updated)
      setSaveSuccess(true)
      // Reset success flag after 3s
      setTimeout(() => {
        if (mountedRef.current) setSaveSuccess(false)
      }, 3000)
      return true
    } catch (e: any) {
      if (mountedRef.current) setSaveError(e?.message ?? 'Save failed')
      return false
    } finally {
      if (mountedRef.current) setSaving(false)
    }
  }, [userId, email])

  // ── Derived ────────────────────────────────────────────────────────────────

  const displayName = useMemo(
    () => resolveDisplayName(profile, user),
    [profile, user]
  )

  // ── Return ─────────────────────────────────────────────────────────────────

  return useMemo(() => ({
    profile,
    displayName,
    loading,
    saving,
    error,
    saveError,
    saveSuccess,
    refresh: fetch,
    save,
  }), [profile, displayName, loading, saving, error, saveError, saveSuccess, fetch, save])
}
