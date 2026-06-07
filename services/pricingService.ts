/**
 * pricingService.ts
 *
 * Facade over the existing utils/pricing/ modules.
 * Provides a single entry point for all pricing operations so pages
 * never import from utils/pricing directly.
 *
 * The underlying utils/pricing/ files are well-structured and stay as-is —
 * this service just re-exports them under a stable API and adds the
 * fetch-rules-then-compute pattern that page.tsx inlines 84 times.
 */

import { supabase } from '@/lib/supabase'
import { ensureRulesCache, computePriceFromRules } from '@/utils/pricing'
import type { ApplicationType, PricingRule } from '@/utils/pricing'

import { computePatentabilityPrice } from '@/utils/pricing/services/patentabilitySearch'
import { computeDraftingPrice } from '@/utils/pricing/services/drafting'
import { computeFilingPrice } from '@/utils/pricing/services/patentFiling'
import { computeFerPrice, computeAllFerVariants } from '@/utils/pricing/services/fer'

// Re-export types so consumers only need to import from this service
export type { ApplicationType, PricingRule }

// ─── Rules fetching ───────────────────────────────────────────────────────────

/**
 * Fetch pricing rules for a service.
 * Results are cached per-session in localStorage (handled by ensureRulesCache).
 */
export async function fetchPricingRules(serviceId: number | string): Promise<PricingRule[]> {
  try {
    const { data, error } = await supabase
      .from('service_pricing_rules')
      .select('id, service_id, application_type, key, unit, amount')
      .eq('service_id', serviceId)

    if (error || !data) return []
    return data as PricingRule[]
  } catch {
    return []
  }
}

/**
 * Fetch all pricing rules (uses the shared localStorage cache).
 */
export async function fetchAllPricingRules(): Promise<PricingRule[]> {
  try {
    return await ensureRulesCache(supabase as any)
  } catch {
    return []
  }
}

// ─── Price computation ────────────────────────────────────────────────────────

export type {
  PatentabilityCommonInput,
  PatentabilityTurnaround,
  PatentabilitySearchType,
} from '@/utils/pricing/services/patentabilitySearch'

/**
 * Compute price from rules + selection object.
 * Low-level — prefer the domain-specific helpers below.
 */
export { computePriceFromRules }

// ─── Domain-specific helpers ──────────────────────────────────────────────────
// Re-export the per-service compute functions so pages only need one import.

export { computePatentabilityPrice }
export { computeDraftingPrice }
export { computeFilingPrice }
export { computeFerPrice, computeAllFerVariants }

// ─── Service pricing map ──────────────────────────────────────────────────────

/**
 * Fetch and cache a price for a specific service, keyed by title.
 * Used by page.tsx servicePricing state — replaces inline fetch + setState.
 */
export async function fetchServicePrice(
  serviceTitle: string,
  applicationType: ApplicationType = 'individual'
): Promise<number | null> {
  try {
    // Look up the service by name
    const { data: svc } = await supabase
      .from('services')
      .select('id')
      .ilike('name', serviceTitle.trim())
      .maybeSingle()

    if (!svc?.id) return null

    const rules = await fetchPricingRules(svc.id)
    if (!rules.length) return null

    // Compute the base price with default options
    const price = computePriceFromRules(rules as any, {
      applicationType,
      niceClasses: [],
      goodsServices: { dropdown: 'standard' },
      priorUse: { used: false },
    } as any)

    return price ?? null
  } catch {
    return null
  }
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * Format a price in INR.
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}
