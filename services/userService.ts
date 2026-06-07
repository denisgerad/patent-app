/**
 * userService.ts
 *
 * Single source of truth for authentication and user profile operations.
 * All pages and components must use this service — never call supabase.auth directly.
 *
 * Wraps the existing useAuthProfile hook logic into plain async functions
 * so they can be used outside React (e.g. in other services, API routes, tests).
 */

import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  company: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
}

export interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
}

export interface ProfileUpdatePayload {
  first_name?: string | null
  last_name?: string | null
  company?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Get the current auth session and user.
 * Use this instead of supabase.auth.getSession() directly.
 */
export async function getAuthState(): Promise<AuthState> {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('[userService] getSession error:', error.message)
      return { user: null, session: null, isAuthenticated: false }
    }
    return {
      user: data.session?.user ?? null,
      session: data.session ?? null,
      isAuthenticated: !!data.session,
    }
  } catch (e) {
    console.error('[userService] getAuthState failed:', e)
    return { user: null, session: null, isAuthenticated: false }
  }
}

/**
 * Get just the authenticated user id. Returns null if not signed in.
 * Convenience wrapper used by most services.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { user } = await getAuthState()
  return user?.id ?? null
}

/**
 * Sign in with Google OAuth.
 */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    })
    return { error: error?.message ?? null }
  } catch (e: any) {
    return { error: e?.message ?? 'Google sign-in failed' }
  }
}

/**
 * Sign out the current user.
 * Handles Safari deferred logout pattern.
 */
export async function signOut(): Promise<{ error: string | null }> {
  const isSafari =
    typeof navigator !== 'undefined' &&
    /safari/i.test(navigator.userAgent) &&
    !/chrome|chromium|android/i.test(navigator.userAgent)

  if (isSafari) {
    try { localStorage.setItem('pending_logout', '1') } catch {}
    try {
      window.location.replace(window.location.origin + '/')
    } catch {
      window.location.href = '/'
    }
    return { error: null }
  }

  try {
    const { error } = await supabase.auth.signOut()
    return { error: error?.message ?? null }
  } catch (e: any) {
    return { error: e?.message ?? 'Sign-out failed' }
  }
}

// ─── User Profile ─────────────────────────────────────────────────────────────

/**
 * Fetch the user profile row from the users table.
 * Falls back to session email if no DB row exists yet.
 */
export async function getUserProfile(userId: string, email: string | null): Promise<UserProfile | null> {
  try {
    // Try by id first
    const { data: byId, error: errById } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, company, phone, address, city, state, country')
      .eq('id', userId)
      .maybeSingle()

    if (!errById && byId) return byId as UserProfile

    // Fallback: fetch by email
    if (email) {
      const { data: byEmail } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, company, phone, address, city, state, country')
        .eq('email', email)
        .maybeSingle()
      if (byEmail) return byEmail as UserProfile
    }

    // No row yet — return minimal object with email so the page can still render
    return {
      id: userId,
      email,
      first_name: null,
      last_name: null,
      company: null,
      phone: null,
      address: null,
      city: null,
      state: null,
      country: null,
    }
  } catch (e) {
    console.error('[userService] getUserProfile failed:', e)
    return null
  }
}

/**
 * Save (upsert) a user profile row.
 * Returns the saved profile or an error message.
 */
export async function saveUserProfile(
  userId: string,
  email: string | null,
  payload: ProfileUpdatePayload
): Promise<{ profile: UserProfile | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        { id: userId, email, ...payload },
        { onConflict: 'id' }
      )
      .select('id, email, first_name, last_name, company, phone, address, city, state, country')
      .single()

    if (error) return { profile: null, error: error.message }
    return { profile: data as UserProfile, error: null }
  } catch (e: any) {
    return { profile: null, error: e?.message ?? 'Save failed' }
  }
}

/**
 * Upsert user profile from the OAuth session metadata.
 * Called after SIGNED_IN to ensure DB row exists.
 */
export async function upsertProfileFromSession(user: User): Promise<void> {
  try {
    const meta = user.user_metadata || {}
    const full = (meta.full_name as string) || (meta.name as string) || ''
    const given = (meta.given_name as string) || ''
    const family = (meta.family_name as string) || ''

    let firstName = given
    let lastName = family
    if (!firstName && !lastName && full) {
      const parts = full.split(' ')
      firstName = parts[0] || ''
      lastName = parts.slice(1).join(' ') || ''
    }

    await supabase.from('users').upsert(
      [{ id: user.id, email: user.email ?? null, first_name: firstName || null, last_name: lastName || null }],
      { onConflict: 'id' }
    )
  } catch (e) {
    console.error('[userService] upsertProfileFromSession failed:', e)
  }
}

/**
 * Resolve a display name for the user.
 * Priority: DB first_name/last_name → metadata name → email prefix.
 */
export function resolveDisplayName(
  profile: UserProfile | null,
  user: User | null
): string {
  if (profile) {
    const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
    if (name) return name
  }
  if (user) {
    const meta = user.user_metadata || {}
    const name =
      [meta.given_name, meta.family_name].filter(Boolean).join(' ') ||
      (meta.full_name as string) ||
      (meta.name as string) ||
      ''
    if (name) return name
    if (user.email) return user.email.split('@')[0]
  }
  return ''
}
