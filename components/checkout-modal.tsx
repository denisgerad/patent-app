//components/checkout-modal.tsx
"use client"

import { resolveFormTypeFromOrderLike } from "./utils/resolve-form-type"
import { useEffect, useState } from "react"
import { AppTour } from "@/components/AppTour"

// Map canonical keys to human-readable labels used in forms
const TYPE_LABELS: Record<string,string> = {
  patentability_search: 'Patentability Search',
  drafting: 'Drafting',
  provisional_filing: 'Provisional Filing',
  complete_non_provisional_filing: 'Complete Non Provisional Filing',
  pct_filing: 'PCT Filing',
  ps_cs: 'PS CS',
  fer_response: 'FER Response'
}

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  payment?: any
  orders?: any[]
  onProceedSingle?: (order?: any) => void
  onProceedMultiple?: (orders?: any[]) => void
}

const CheckoutModal = ({
  isOpen,
  onClose,
  payment,
  orders = [],
  onProceedSingle,
  onProceedMultiple,
}: CheckoutModalProps) => {
  const showCheckoutThankYou = isOpen
  const checkoutPayment = payment
  const checkoutOrders = orders
  
  // Tour guide state
  const [showTour, setShowTour] = useState(false)
  
  const handleTourComplete = () => {
    setShowTour(false)
  }
  
  const startTour = () => {
    setShowTour(true)
  }

  // Lock body scroll when modal is open; restore on close
  useEffect(() => {
    if (!showCheckoutThankYou) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [showCheckoutThankYou])

  // Pre-resolve application type(s) for display & debug
  const resolvedTypes: string[] = (checkoutOrders || []).map(o => resolveFormTypeFromOrderLike(o))

  const openFormForOrder = (o: any) => {
    try {
      const base = typeof window !== "undefined" ? window.location.origin : ""
      const type = resolveFormTypeFromOrderLike(o)
      const pk = o?.service_pricing_key ? String(o.service_pricing_key) : ""
      const url = `${base}/forms?${pk ? `pricing_key=${encodeURIComponent(pk)}&` : ""}type=${encodeURIComponent(type)}&order_id=${encodeURIComponent(o.id)}`
      window.open(url, "_blank")
      onClose()
    } catch (e) {
      console.error("Open form error", e)
    }
  }

  const openAllOrderFormsInTabs = (orders: any[]) => {
    if (!orders?.length) return
    try {
      const base = typeof window !== "undefined" ? window.location.origin : ""
      const wins = orders.map(() => window.open("", "_blank"))
      if (wins.some(w => w == null)) {
        alert("Please enable pop-ups for this site to open all forms in separate tabs.")
        return
      }

    // 2) Compute URLs for each order
    const urls = orders.map((o) => {
        const type = resolveFormTypeFromOrderLike(o)
        const pk = o?.service_pricing_key ? String(o.service_pricing_key) : ""
        return `${base}/forms?${pk ? `pricing_key=${encodeURIComponent(pk)}&` : ""}type=${encodeURIComponent(type)}&order_id=${encodeURIComponent(o.id)}`
      })
      wins.forEach((w, i) => {
        if (!w) return
        const url = urls[i]
        try { w.location.href = url } catch { w.location.replace(url) }
      })
      onClose()
    } catch (e) {
      console.error("Open all forms error", e)
    }
  }

  // Open stacked forms view in single page with multiple order IDs
  const openStackedFormsPage = (orders: any[]) => {
    if (!orders?.length) return
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      const ids = orders.map(o => o.id).filter(Boolean)
      if (!ids.length) return
      const url = `${base}/forms?order_ids=${ids.join(',')}`
      window.open(url, '_blank')
      onClose()
    } catch (e) {
      console.error('Open stacked forms error', e)
    }
  }


    // Optional: close the Thank You modal after opening tabs
    //setShowCheckoutThankYou(false)
    
const openSingleOrderForm = (o: any) => {
  try {
    const base = typeof window !== "undefined" ? window.location.origin : ""
    const type = resolveFormTypeFromOrderLike(o)
    const pk = o?.service_pricing_key ? String(o.service_pricing_key) : ""
    const url = `${base}/forms?${pk ? `pricing_key=${encodeURIComponent(pk)}&` : ""}type=${encodeURIComponent(type)}&order_id=${encodeURIComponent(o.id)}`
    window.open(url, "_blank")
    // Optional: close
    // setShowCheckoutThankYou(false)
  } catch (e) {
    console.error("Open form error", e)
  }
}
  return (
    <>
      <AppTour 
        run={showTour} 
        onComplete={handleTourComplete}
        tourType="payment"
      />
      {showCheckoutThankYou && (
        <div
          id="checkout-thankyou-modal"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <div className="w-full max-w-2xl mx-4 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Payment Successful!</h2>
                    <p className="text-blue-100 text-sm">Your order has been confirmed and verified</p>
                  </div>
                </div>
                <button
                  onClick={startTour}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md transition-colors shadow-sm"
                  title="Start payment screen tour"
                >
                  <span className="flex items-center justify-center w-5 h-5 bg-white rounded-full">
                    <span className="text-orange-500 text-base">👉</span>
                  </span>
                  Tour
                </button>
              </div>
            </div>

            <div className="p-6">
              {checkoutOrders.length === 0 && (
                <div className="mb-6 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm space-y-2">
                  <p><strong>We’re processing your services…</strong></p>
                  <p>Your payment was verified but the individual service orders haven’t appeared yet. This can happen if the order creation step briefly failed or is still completing.</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        try { window.location.reload() } catch {}
                      }}
                      className="inline-flex items-center rounded bg-amber-600 px-3 py-1.5 text-white text-xs font-medium hover:bg-amber-700"
                    >Reload Page</button>
                    <button
                      onClick={() => onClose()}
                      className="inline-flex items-center rounded border border-amber-300 px-3 py-1.5 text-amber-700 text-xs font-medium hover:bg-amber-100"
                    >Close</button>
                  </div>
                  <p className="text-xs opacity-80">If this persists, please contact support with your Payment ID.</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mb-6" data-tour="payment-details">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="text-blue-600 text-xs font-medium uppercase tracking-wide mb-1">Payment ID</div>
                  <div className="font-semibold text-gray-900">
                    {checkoutPayment?.razorpay_payment_id ?? checkoutPayment?.id ?? "—"}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="text-blue-600 text-xs font-medium uppercase tracking-wide mb-1">Date</div>
                  <div className="font-semibold text-gray-900">
                    {checkoutPayment?.payment_date ? new Date(checkoutPayment.payment_date).toLocaleString() : "—"}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="text-blue-600 text-xs font-medium uppercase tracking-wide mb-1">Amount</div>
                  <div className="font-semibold text-gray-900">{checkoutPayment?.total_amount ?? "—"}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="text-blue-600 text-xs font-medium uppercase tracking-wide mb-1">Status</div>
                  <div className="font-semibold text-green-600">{checkoutPayment?.payment_status ?? "—"}</div>
                </div>
              </div>

              {/* Application Type summary */}
              {checkoutOrders.length === 1 && (
                <div className="mb-6" data-tour="application-type">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="text-blue-600 text-xs font-medium uppercase tracking-wide mb-1">Application Type</div>
                    <div className="font-semibold text-gray-900">
                      {(() => { const t = resolvedTypes[0]; return TYPE_LABELS[t] || t || '—' })()}
                    </div>
                  </div>
                </div>
              )}

              {checkoutOrders.length > 1 && (
                <div>
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-blue-800 font-medium">Multiple Services Detected</span>
                    </div>
                    <p className="text-blue-700 text-sm">Click each service below to open its form. Application types shown as badges:</p>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4">
                    {checkoutOrders.map((o, idx) => (
                      <button
                        key={o.id}
                        className="group relative overflow-hidden rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:-translate-y-0.5"
                        onClick={() => {
                          try { onClose() } catch {}
                          try {
                            if (onProceedSingle) onProceedSingle(o)
                            else openFormForOrder(o)
                          } finally {
                            try { window.dispatchEvent(new Event('screen:ready')) } catch {}
                          }
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{(o.services as any)?.name || "Service"}</span>
                          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                        <div className="mt-2 text-xs inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700">
                          {(() => { const t = resolvedTypes[idx]; return TYPE_LABELS[t] || t || '—' })()}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      className="inline-flex items-center rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                      onClick={() => {
                        try { onClose() } catch {}
                        try {
                          if (onProceedMultiple) onProceedMultiple(checkoutOrders)
                          else openAllOrderFormsInTabs(checkoutOrders)
                        } finally {
                          try { window.dispatchEvent(new Event('screen:ready')) } catch {}
                        }
                      }}
                    >
                      Open Forms
                    </button>
                  </div>
                </div>
              )}

              {checkoutOrders.length === 1 && (
                <div>
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 7a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2h6a2 2 0 012 2v14z" />
                      </svg>
                      <span className="text-blue-800 font-medium">Form Ready</span>
                    </div>
                    <p className="text-blue-700 text-sm mt-1">Click proceed to open your form in a new tab.</p>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      data-tour="proceed-button"
                      className="group inline-flex items-center space-x-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white font-medium shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:-translate-y-0.5"
                      onClick={() => {
                        try { onClose() } catch {}
                        try {
                          if (onProceedSingle) onProceedSingle(checkoutOrders[0])
                          else openFormForOrder(checkoutOrders[0])
                        } finally {
                          try { window.dispatchEvent(new Event('screen:ready')) } catch {}
                        }
                      }}
                    >
                      <span>Proceed To Form</span>
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CheckoutModal