/**
 * statusService.ts
 *
 * Single source of truth for order status derivation.
 * Replaces 3 independent implementations in:
 *   - components/screens/OrdersScreen.tsx
 *   - app/profile/page.tsx (orderStatuses map)
 *   - app/admin/page.tsx (inline workflow_status labels)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'Payment Pending'
  | 'Details Required'
  | 'Details Completed'
  | 'In Progress'
  | 'Assigned'
  | 'Require Info'
  | 'Completed'

export type OrderStatusVariant = 'pending' | 'warning' | 'info' | 'success' | 'default'

// ─── Derivation ───────────────────────────────────────────────────────────────

/**
 * Derive the human-readable status for an order.
 *
 * Priority chain:
 * 1. Payment status — if not captured/paid → "Payment Pending"
 * 2. Workflow status — if set, takes precedence over form completion
 * 3. Form completion — "Details Required" vs "Details Completed"
 * 4. Assignment — if responsible/assigned_to is set
 */
export function deriveOrderStatus(order: any): OrderStatus {
  try {
    // 1. Payment check
    const paymentSucceeded = !!(
      (order.payments &&
        (order.payments.payment_status === 'paid' ||
          order.payments.payment_status === 'captured' ||
          order.payments.status === 'captured')) ||
      order.payment_status === 'paid'
    )
    if (!paymentSucceeded) return 'Payment Pending'

    // 2. Workflow status (set by admin)
    const wf = (order.workflow_status || '').toLowerCase().trim()
    if (wf === 'completed') return 'Completed'
    if (wf === 'require_info') return 'Require Info'
    if (wf === 'in_progress') return 'In Progress'

    // 3. Form completion
    const formConfirmed = !!order.form_confirmed
    const formCoreComplete = !!order.form_core_complete
    if (!formConfirmed && !formCoreComplete) return 'Details Required'

    // 4. Assignment
    const responsible = (order.responsible || order.assigned_to || '').trim()
    if (responsible) return 'Assigned'

    return 'Details Completed'
  } catch {
    return 'Payment Pending'
  }
}

/**
 * Aggregate status across a group of orders (e.g. grouped by payment).
 * Returns the most significant status in the group.
 */
export function aggregateGroupStatus(orders: any[]): OrderStatus {
  const statuses = orders.map(o => deriveOrderStatus(o))

  if (statuses.includes('Completed')) return 'Completed'
  if (statuses.includes('In Progress')) return 'In Progress'
  if (statuses.includes('Require Info')) return 'Require Info'
  if (statuses.includes('Assigned')) return 'Assigned'
  if (statuses.includes('Details Completed')) return 'Details Completed'
  if (statuses.includes('Details Required')) return 'Details Required'
  return 'Payment Pending'
}

/**
 * Map an OrderStatus to a UI variant for badge/chip coloring.
 */
export function getStatusVariant(status: OrderStatus): OrderStatusVariant {
  switch (status) {
    case 'Completed': return 'success'
    case 'In Progress': return 'info'
    case 'Assigned': return 'info'
    case 'Require Info': return 'warning'
    case 'Details Required': return 'warning'
    case 'Details Completed': return 'default'
    case 'Payment Pending': return 'pending'
    default: return 'default'
  }
}

/**
 * Build a status map for a list of orders, keyed by order id.
 * Used by profile/page.tsx orderStatuses state — replaces the
 * manual form_responses query + loop that built the same thing.
 */
export function buildStatusMap(orders: any[]): Record<string, OrderStatus> {
  const map: Record<string, OrderStatus> = {}
  for (const order of orders) {
    map[String(order.id)] = deriveOrderStatus(order)
  }
  return map
}
