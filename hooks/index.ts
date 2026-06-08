/**
 * hooks/index.ts
 *
 * Barrel export for all shared hooks.
 * Import from here: import { useAuth, useOrders, useProfile, useCart } from '@/hooks'
 */

export { useAuth } from './useAuth'
export type { UseAuthReturn } from './useAuth'

export { useOrders } from './useOrders'
export type { UseOrdersReturn, UseOrdersOptions } from './useOrders'

export { useProfile } from './useProfile'
export type { UseProfileReturn } from './useProfile'

export { useCart } from './useCart'
export type { UseCartReturn } from './useCart'
