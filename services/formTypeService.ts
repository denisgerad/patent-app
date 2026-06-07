/**
 * formTypeService.ts
 *
 * Single source of truth for form type resolution and URL building.
 * Replaces 51 scattered instances across profile/page.tsx, checkout-modal,
 * FormClient, and OrdersScreen.
 *
 * Built on top of components/utils/resolve-form-type.ts (which stays as-is)
 * and adds URL building and label resolution.
 */

import { resolveFormTypeFromOrderLike } from '@/components/utils/resolve-form-type'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FormTypeKey =
  | 'patentability_search'
  | 'drafting'
  | 'provisional_filing'
  | 'complete_non_provisional_filing'
  | 'pct_filing'
  | 'ps_cs'
  | 'fer_response'
  | 'trademark'
  | 'copyrights'
  | 'design'
  | 'service-form'

// ─── Label map ────────────────────────────────────────────────────────────────

const FORM_TYPE_LABELS: Record<string, string> = {
  patentability_search: 'Patentability Search',
  drafting: 'Drafting',
  provisional_filing: 'Provisional Filing',
  complete_non_provisional_filing: 'Complete Non-Provisional Filing',
  pct_filing: 'PCT Filing',
  ps_cs: 'PS-CS',
  fer_response: 'FER Response',
  trademark: 'Trademark Registration',
  copyrights: 'Copyright Registration',
  design: 'Design Filing',
}

// Pricing key → form type key mapping
// Mirrors the JSON at app/data/service-pricing-to-form.json
const PRICING_KEY_TO_FORM_TYPE: Record<string, string> = {
  patentability_search: 'patentability_search',
  drafting: 'drafting',
  provisional_filing: 'provisional_filing',
  complete_non_provisional_filing: 'complete_non_provisional_filing',
  pct_filing: 'pct_filing',
  ps_cs: 'ps_cs',
  fer_response: 'fer_response',
  trademark: 'trademark',
  trademark_registration: 'trademark',
  copyrights: 'copyrights',
  copyright_registration: 'copyrights',
  design: 'design',
  design_filing: 'design',
}

// ─── Core resolution ──────────────────────────────────────────────────────────

/**
 * Resolve the canonical form type key from an order object.
 * Delegates to resolve-form-type.ts for the priority chain logic.
 */
export function resolveFormType(order: any): string {
  return resolveFormTypeFromOrderLike(order)
}

/**
 * Map a pricing key to a form type key.
 * Returns null if the key is not recognised.
 */
export function pricingKeyToFormType(pricingKey: string | null | undefined): string | null {
  if (!pricingKey) return null
  const k = pricingKey.trim().toLowerCase()
  return PRICING_KEY_TO_FORM_TYPE[k] ?? null
}

/**
 * Get the human-readable label for a form type key.
 * Returns null for unknown keys.
 */
export function getFormTypeLabel(formTypeKey: string | null | undefined): string | null {
  if (!formTypeKey) return null
  return FORM_TYPE_LABELS[formTypeKey] ?? null
}

/**
 * Resolve the best form type key from an order, trying all available fields.
 * This is the main entry point used by profile/page.tsx and checkout-modal.
 *
 * Priority:
 * 1. order.type (if canonical)
 * 2. service_pricing_key → PRICING_KEY_TO_FORM_TYPE
 * 3. payments.type
 * 4. services.name → CANONICAL_MAP (via resolveFormTypeFromOrderLike)
 */
export function resolveOrderFormType(order: any): string | null {
  if (!order) return null

  // 1. Direct type field
  if (order.type && FORM_TYPE_LABELS[order.type]) return order.type

  // 2. Pricing key mapping
  if (order.service_pricing_key) {
    const mapped = pricingKeyToFormType(order.service_pricing_key)
    if (mapped) return mapped
  }

  // 3. Payment type
  const paymentType = order.payments?.type ?? order.payment_type
  if (paymentType && FORM_TYPE_LABELS[paymentType]) return paymentType

  // 4. Full resolve chain
  const resolved = resolveFormTypeFromOrderLike(order)
  if (resolved && resolved !== 'service-form') return resolved

  return null
}

// ─── URL building ─────────────────────────────────────────────────────────────

export interface FormUrlOptions {
  orderId: number | string
  formType: string
  pricingKey?: string | null
  origin?: string
}

/**
 * Build the URL for opening a form for a specific order.
 * Single place to construct this URL — no more inline template strings.
 */
export function buildFormUrl(options: FormUrlOptions): string {
  const { orderId, formType, pricingKey, origin } = options
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '')
  const params = new URLSearchParams()
  if (pricingKey) params.set('pricing_key', pricingKey)
  params.set('type', formType)
  params.set('order_id', String(orderId))
  return `${base}/forms?${params.toString()}`
}

/**
 * Build the form URL directly from an order object.
 * Returns null if the form type cannot be resolved.
 */
export function buildFormUrlForOrder(order: any, origin?: string): string | null {
  const formType = resolveOrderFormType(order)
  if (!formType) return null

  return buildFormUrl({
    orderId: order.id,
    formType,
    pricingKey: order.service_pricing_key ?? null,
    origin,
  })
}

/**
 * Build form URLs for multiple orders (for multi-tab open).
 * Filters out orders where the form type cannot be resolved.
 */
export function buildFormUrlsForOrders(orders: any[], origin?: string): string[] {
  return orders
    .map(o => buildFormUrlForOrder(o, origin))
    .filter((url): url is string => url !== null)
}
