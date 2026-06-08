"use client"

import React, { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "../../lib/supabase"
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useOrders } from '@/hooks/useOrders'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from "@/components/ui/label"
import pricingToForm from '../data/service-pricing-to-form.json'
import CheckoutModal from "@/components/checkout-modal"
import {
  ArrowLeft,
  User,
  LogOut,
} from "lucide-react"
import { ChevronDown, ChevronRight } from "lucide-react"

// helpers: pricing map
const getPricingToForm = (k?: string | null) => {
  if (!k) return null
  const map = pricingToForm as unknown as Record<string, string>
  return map[k] ?? null
}

// helpers: thank-you acknowledgement
const markThankYouAcknowledged = (pid?: string | number | null) => {
  try {
    if (!pid) return
    localStorage.setItem(`shown_thankyou_pay_${pid}`, '1')
  } catch { /* ignore */ }
}

const hasAcknowledgedThankYou = (pid?: string | number | null) => {
  try {
    if (!pid) return false
    return !!localStorage.getItem(`shown_thankyou_pay_${pid}`)
  } catch {
    return false
  }
}

interface Profile {
  id?: string | null
  first_name?: string | null
  last_name?: string | null
  company?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
}

function ProfilePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    loading,
    authChecked,
    user,
    userId,
    email: sessionEmail,
    signOut: authSignOut,
  } = useAuth()

  const {
    profile,
    saving,
    save: saveProfile,
    refresh: refreshProfile,
  } = useProfile(userId, sessionEmail ?? null, user)

  const {
    orders: userOrders,
    loading: loadingUserOrders,
    statusMap: orderStatuses,
    refresh: refreshOrders,
  } = useOrders()
  const [editProfile, setEditProfile] = useState<Profile>({} as Profile)

  // Populate edit form when profile loads from hook
  useEffect(() => {
    if (profile) setEditProfile(profile as Profile)
  }, [profile])
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({})
  const [searchOrders, setSearchOrders] = useState<string>('')
  const [sortOrders, setSortOrders] = useState<string>('date_desc')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [currentTab, setCurrentTab] = useState<string>('orders')
  const [highlightPaymentId, setHighlightPaymentId] = useState<string | null>(null)
  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({})
  // Thank You modal state
  const [showThankYou, setShowThankYou] = useState(false)
  const [thankYouOrders, setThankYouOrders] = useState<any[]>([])
  const [thankYouPayment, setThankYouPayment] = useState<any | null>(null)
  const [showFormOptions, setShowFormOptions] = useState(false)
  const [hasShownThankYou, setHasShownThankYou] = useState(false)
  // NEW: track the payment id whose thank-you is currently active
  const [activeThankYouPid, setActiveThankYouPid] = useState<string | number | null>(null)

  // Close/proceed helpers
  const cleanupPaymentQuery = () => {
    try {
      const url = new URL(window.location.href)
      if (url.searchParams.has('payment_id')) {
        url.searchParams.delete('payment_id')
        window.history.replaceState({}, '', url.toString())
      }
    } catch { /* ignore */ }
  }

  const handleCloseThankYou = () => {
    if (activeThankYouPid) markThankYouAcknowledged(activeThankYouPid)
    setShowThankYou(false)
    setHasShownThankYou(true)
    cleanupPaymentQuery()
  }

  const handleProceedSingle = (o: any) => {
    try {
      openFormForOrder(o)
    } finally {
      handleCloseThankYou()
    }
  }

  const handleProceedMultiple = () => {
  try {
    // Collect URLs for all orders contained in this payment group
    const urls = (thankYouOrders || [])
      .map((o) => buildFormUrlForOrder(o))
      .filter((u): u is string => !!u)

    if (!urls.length) {
      alert('No forms available to open for these services.')
      return
    }

    // Open all forms synchronously within the same click to avoid popup blockers
    const opened = urls.map((u) => window.open(u, '_blank'))
    const blocked = opened.filter((w) => !w).length

    if (blocked > 0) {
      // Best-effort: ensure at least the first form opens
      if (!opened.some((w) => !!w)) {
        const fallback = window.open(urls[0], '_blank')
        if (!fallback) {
          alert('Your browser blocked multiple tabs. Please enable pop-ups for this site and try again.')
          return
        }
      }
      console.warn(`Popup blocker prevented opening ${blocked} tabs.`)
    }
  } finally {
    // Persist acknowledgement and close, same as handleProceedSingle
    handleCloseThankYou()
  }
}

  // initialize tab from query param if present
  useEffect(() => {
    const t = searchParams?.get('tab') || 'orders'
    setCurrentTab(t)
  }, [searchParams])

  // helper to filter and sort orders locally
  const filteredOrders = (items: any[], q: string, sort: string) => {
    const filtered = items.filter((r) => {
      if (!q) return true
      const s = q.toLowerCase()
      const cat = (r.categories as any)?.name ?? ''
      const svc = (r.services as any)?.name ?? ''
      const amt = String((r.payments as any)?.total_amount ?? '')
      return cat.toLowerCase().includes(s) || svc.toLowerCase().includes(s) || amt.includes(s)
    })
    if (sort === 'date_desc') return filtered.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (sort === 'date_asc') return filtered.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    if (sort === 'amount_desc') return filtered.sort((a,b) => Number((b.payments as any)?.total_amount ?? 0) - Number((a.payments as any)?.total_amount ?? 0))
    if (sort === 'amount_asc') return filtered.sort((a,b) => Number((a.payments as any)?.total_amount ?? 0) - Number((b.payments as any)?.total_amount ?? 0))
    return filtered
  }

  // Resolve form type key...
  const resolveOrderTypeKey = (o: any): string | null => {
    if (!o) return null
    let t = o.type ?? (o.payments ? o.payments.type ?? null : null)
    if (t) return t
    if (o.service_pricing_key) {
      const mapped = getPricingToForm(o.service_pricing_key as string)
      return mapped ?? o.service_pricing_key
    }
    const svcName = (o.services as any)?.name ?? null
    if (!svcName) return null
    const mapping: Record<string, string> = {
      'Patentability Search': 'patentability_search',
      'Patentability search': 'patentability_search',
      'Patentability Search ': 'patentability_search',
      'Drafting': 'drafting',
      'Provisional Filing': 'provisional_filing',
      'Provisional Filing ': 'provisional_filing',
      'Provisional Filling': 'provisional_filing',
      'Complete Non Provisional Filing': 'complete_non_provisional_filing',
      'Complete non Provisional Filling': 'complete_non_provisional_filing',
      'PCT Filling': 'pct_filing',
      'PCT Filing': 'pct_filing',
      'PS-CS': 'ps_cs',
      'PS CS': 'ps_cs',
      'PS-CS ': 'ps_cs',
      'FER Response': 'fer_response',
      'Trademark Registration': 'trademark',
      'Copyright Registration': 'copyrights',
      'Design Filing': 'design',
    }
    return mapping[svcName] ?? null
  }

  const typeLabelFromKey = (k: string | null) => {
    if (!k) return null
    const labels: Record<string, string> = {
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
    return labels[k] ?? k
  }


  const downloadSelected = () => {
    const first = userOrders.find(o => o.id === selectedOrderId)
    if (!first) {
      alert('Please select an order to open its form')
      return
    }
    let t: string | null = null
    if (first.service_pricing_key) {
      const mappedFromDisplay = getPricingToForm(first.service_pricing_key as string)
      t = mappedFromDisplay ?? first.service_pricing_key
    }
    if (!t) {
      t = first.type ?? (first.payments ? first.payments.type ?? null : null)
    }
    if (!t) {
      const candidate = resolveOrderTypeKey(first)
      if (candidate && !typeLabelFromKey(candidate)) {
        const mapped = getPricingToForm(candidate)
        if (mapped) t = mapped
      }
      if (!t && candidate && typeLabelFromKey(candidate)) {
        t = candidate
      }
    }
    if (!t) {
      alert('Selected order does not have an associated form type')
      return
    }
    if (t && !typeLabelFromKey(t)) {
      const mappedDirect = getPricingToForm(t)
      if (mappedDirect) t = mappedDirect
    }
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      const pk = first.service_pricing_key ? String(first.service_pricing_key) : ''
      const url = `${base}/forms?${pk ? `pricing_key=${encodeURIComponent(pk)}&` : ''}type=${encodeURIComponent(t)}&order_id=${encodeURIComponent(first.id)}`
      window.open(url, '_blank')
    } catch (e) {
      console.error('Navigation error opening form for order', e)
    }
  }

  const buildFormUrlForOrder = (o: any): string | null => {
    if (!o) return null
    let t: string | null = null
    if (o.service_pricing_key) {
      const mappedFromDisplay = getPricingToForm(String(o.service_pricing_key))
      t = mappedFromDisplay ?? String(o.service_pricing_key)
    }
    if (!t) t = o.type ?? (o.payments ? o.payments.type ?? null : null)
    if (!t) {
      const candidate = resolveOrderTypeKey(o)
      if (candidate && !typeLabelFromKey(candidate)) {
        const mapped = getPricingToForm(candidate)
        if (mapped) t = mapped
      }
      if (!t && candidate && typeLabelFromKey(candidate)) t = candidate
    }
    if (!t) return null
    if (t && !typeLabelFromKey(t)) {
      const mappedDirect = getPricingToForm(t)
      if (mappedDirect) t = mappedDirect
    }
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    const pk = o.service_pricing_key ? String(o.service_pricing_key) : ''
    const url = `${base}/forms?${pk ? `pricing_key=${encodeURIComponent(pk)}&` : ''}type=${encodeURIComponent(t)}&order_id=${encodeURIComponent(o.id)}`
    return url
  }

  const openFormForOrder = (o: any) => {
    const url = buildFormUrlForOrder(o)
    if (!url) {
      alert('Selected order does not have an associated form type')
      return
    }
    window.open(url, '_blank')
  }

  useEffect(() => {
    if (currentTab === 'orders') {
      refreshOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab])

  // pick up payment_id from query so we can auto-select after redirect
  useEffect(() => {
    const pid = searchParams?.get('payment_id') || null
    if (pid) {
      setHighlightPaymentId(pid)
      setCurrentTab('orders')
      // Only tentatively open if not acknowledged; final gating happens in loadUserOrders
      try {
        const key = `shown_thankyou_pay_${pid}`
        const already = typeof window !== 'undefined' ? localStorage.getItem(key) : null
        if (!already && !hasShownThankYou) setShowThankYou(true)
      } catch { /* ignore */ }
    }
  }, [searchParams])

  useEffect(() => {
    if (currentTab !== 'orders') return
    if (loadingUserOrders) return
    refreshOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightPaymentId, authChecked])
  const orders = [
    {
      id: "TRX-10342",
      title: "Trademark Registration",
      status: "In Review",
      placedAt: "2025-02-11",
      total: "₹ 18,500",
      details: {
        items: ["Trademark search (Class 25)", "Drafting & filing", "Government fees"],
        form: {
          fields: [
            { label: "Applicant Name", value: "Acme Clothing Co." },
            { label: "Mark Name", value: "ACME FIT" },
            { label: "Nice Classes", value: "25" },
            { label: "Use in Commerce", value: "Yes (since 2022-03-10)" },
          ],
          attachments: ["logo_mark.png", "specimen_use.pdf"],
        },
        timeline: [
          { label: "Order placed", date: "2025-02-11" },
          { label: "Attorney assigned", date: "2025-02-12" },
          { label: "Form review", date: "2025-02-13" },
        ],
      },
    },
    {
      id: "PSA-98761",
      title: "Patent Search & Analysis",
      status: "Completed",
      placedAt: "2024-12-03",
      total: "₹ 42,000",
      details: {
        items: ["Quick knockout search", "Prior art matrix", "Patentability opinion"],
        form: {
          fields: [
            { label: "Inventor", value: "John Doe" },
            { label: "Field", value: "IoT Sensors" },
            { label: "Jurisdictions", value: "IN, US" },
          ],
        },
        timeline: [
          { label: "Order placed", date: "2024-12-03" },
          { label: "Search completed", date: "2024-12-07" },
          { label: "Opinion delivered", date: "2024-12-09" },
        ],
      },
    },
  ] as const


  const displayName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Your Name"
    : "Your Name"

  async function handleSignOut() {
    await authSignOut()
    router.push("/")
  }
    async function handleSaveProfile() {
    if (!sessionEmail || !userId) {
      alert("You must be signed in to save your profile.")
      return
    }
    const ok = await saveProfile({
      first_name: editProfile.first_name || null,
      last_name: editProfile.last_name || null,
      company: editProfile.company || null,
      phone: editProfile.phone || null,
      address: editProfile.address || null,
      city: editProfile.city || null,
      state: editProfile.state || null,
      country: editProfile.country || null,
    })
    if (!ok) alert("Failed to save profile. Please try again.")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug chip: show user id/email and a per-page debug id when enabled */}
      {(() => {
        const fromEnv = process.env.NEXT_PUBLIC_DEBUG_USER === '1'
        const fromWin = typeof window !== 'undefined' && (window as any).DEBUG_USER === true
        return fromEnv || fromWin
      })() && (
        <div className="fixed bottom-3 right-3 z-[9999] inline-flex items-center gap-2 rounded border px-2 py-1 text-xs text-gray-700 bg-white shadow">
          <span className="font-medium">User</span>
          <span className="text-gray-900">{sessionEmail || '—'}</span>
          <span className="text-gray-400">({userId || 'no-id'})</span>
        </div>
      )}
      {/* Top Bar */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold">Profile Dashboard</span>
            </div>
          </div>
          {authChecked && sessionEmail ? (
            <Button variant="ghost" className="text-red-600 hover:text-red-700" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          ) : null}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page heading for global FocusProvider to target */}
        <h1 id="page-heading" tabIndex={-1} className="sr-only">Profile</h1>
        {/* State: Loading */}
        {loading && (
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 h-64 bg-white rounded-xl border"></div>
            <div className="lg:col-span-2 h-64 bg-white rounded-xl border"></div>
          </div>
        )}

        {/* State: Not authenticated */}
        {!loading && authChecked && !sessionEmail && (
          <Card className="bg-white border shadow-sm">
            <CardHeader>
              <CardTitle>You're not signed in</CardTitle>
              <CardDescription>
                Please sign in on the home page to view and manage your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Link href="/" className="inline-flex">
                <Button className="bg-blue-600 hover:bg-blue-700">Go to Home</Button>
              </Link>
              <Link href="/" className="inline-flex">
                <Button variant="outline">Open Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* State: Authenticated Dashboard */}
        {!loading && sessionEmail && (
          <div className="grid grid-cols-1 gap-6">
            {/* Tabs and content (full width) */}
            {/* Welcome card */}
            <Card className="bg-white border shadow-sm">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <div className="text-sm text-gray-800">
                    <span className="font-medium">Welcome{editProfile.first_name ? ", " : ""}</span>
                    <span>{editProfile.first_name ?? displayName}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Manage your account information and review recent activity</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v)} className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                  </TabsList>

                  {/* Profile */}
                  <TabsContent value="profile">
                    <Card className="border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Manage Profile</CardTitle>
                        <CardDescription>Update your contact and company information</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">First Name</Label>
                            <Input
                              className="mt-1"
                              value={editProfile.first_name ?? ""}
                              onChange={(e) => setEditProfile((p) => ({ ...p, first_name: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Last Name</Label>
                            <Input
                              className="mt-1"
                              value={editProfile.last_name ?? ""}
                              onChange={(e) => setEditProfile((p) => ({ ...p, last_name: e.target.value }))}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium text-gray-700">Company</Label>
                            <Input
                              className="mt-1"
                              value={editProfile.company ?? ""}
                              onChange={(e) => setEditProfile((p) => ({ ...p, company: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Phone</Label>
                            <Input
                              className="mt-1"
                              value={editProfile.phone ?? ""}
                              onChange={(e) => setEditProfile((p) => ({ ...p, phone: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Address</Label>
                            <Input
                              className="mt-1"
                              value={editProfile.address ?? ""}
                              onChange={(e) => setEditProfile((p) => ({ ...p, address: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">City</Label>
                            <Input
                              className="mt-1"
                              value={editProfile.city ?? ""}
                              onChange={(e) => setEditProfile((p) => ({ ...p, city: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">State</Label>
                            <Input
                              className="mt-1"
                              value={editProfile.state ?? ""}
                              onChange={(e) => setEditProfile((p) => ({ ...p, state: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Country</Label>
                            <Input
                              className="mt-1"
                              value={editProfile.country ?? ""}
                              onChange={(e) => setEditProfile((p) => ({ ...p, country: e.target.value }))}
                            />
                          </div>
                          <div className="md:col-span-2 flex justify-end">
                            <Button onClick={handleSaveProfile} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                              {saving ? "Saving..." : "Save Profile"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Orders - Table view */}
                  <TabsContent value="orders">
                    <Card className="border">
                      <CardHeader>
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <CardTitle>Orders</CardTitle>
                            <CardDescription>Your payments and orders</CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <Button onClick={downloadSelected} disabled={!selectedOrderId}>View / Edit Form</Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4 flex items-center gap-3">
                          <Input placeholder="Search by category, service or amount" value={searchOrders} onChange={(e) => setSearchOrders((e.target as HTMLInputElement).value)} />
                          <Select value={sortOrders} onValueChange={(v) => setSortOrders(v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="date_desc">Date (newest)</SelectItem>
                              <SelectItem value="date_asc">Date (oldest)</SelectItem>
                              <SelectItem value="amount_desc">Amount (high → low)</SelectItem>
                              <SelectItem value="amount_asc">Amount (low → high)</SelectItem>
                            </SelectContent>
                          </Select>
                          
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full table-auto border-collapse">
                            <thead>
                              <tr>
                                <th className="p-2 text-left"></th>
                                <th className="p-2 text-left">Category</th>
                                <th className="p-2 text-left">Service</th>
                                  {/* <th className="p-2 text-left">Type</th>*/}
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-left">Amount</th>
                                  {/*<th className="p-2 text-left">Razorpay ID</th>*/}
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                if (loadingUserOrders) return (<tr><td colSpan={7} className="p-4">Loading...</td></tr>)
                                const items = filteredOrders(userOrders, searchOrders, sortOrders)
                                if (!items || items.length === 0) return (<tr><td colSpan={7} className="p-4">No orders found</td></tr>)

                                // Group by payment_id; items without payment_id are singletons
                                const groupsMap = new Map<string, any[]>()
                                for (const r of items as any[]) {
                                  const key = r.payment_id ? String(r.payment_id) : `nopay-${r.id}`
                                  if (!groupsMap.has(key)) groupsMap.set(key, [])
                                  groupsMap.get(key)!.push(r)
                                }

                                // Build an array with sorting by payment date/amount similar to current sort
                                const groups = Array.from(groupsMap.entries()).map(([key, rows]) => {
                                  const payment = rows[0]?.payments ?? null
                                  const paymentDate = payment?.payment_date ?? rows[0]?.created_at ?? null
                                  const totalAmount = Number(payment?.total_amount ?? 0)
                                  return { key, rows, payment, paymentDate, totalAmount }
                                })

                                const sortedGroups = groups.sort((a, b) => {
                                  if (sortOrders === 'amount_desc') return (b.totalAmount || 0) - (a.totalAmount || 0)
                                  if (sortOrders === 'amount_asc') return (a.totalAmount || 0) - (b.totalAmount || 0)
                                  // default: date
                                  const ad = new Date(a.paymentDate || 0).getTime()
                                  const bd = new Date(b.paymentDate || 0).getTime()
                                  return sortOrders === 'date_asc' ? (ad - bd) : (bd - ad)
                                })

                                return (
                                  <>
                                    {sortedGroups.map((g) => {
                                      const multiple = g.rows.length > 1
                                      if (!multiple) {
                                        const r = g.rows[0]
                                        return (
                                          <tr key={r.id} className="border-t" data-order-id={r.id}>
                                          <td className="p-2">
                                            <input type="radio" name="order-select" checked={selectedOrderId === r.id} onChange={() => setSelectedOrderId(r.id)} />
                                          </td>
                                          <td className="p-2">{(r.categories as any)?.name ?? "N/A"}</td>
                                          <td className="p-2">{(r.services as any)?.name ?? "N/A"}</td>
                                          <td className="p-2">{orderStatuses[r.id] ?? "Not Started"}</td>
                                          <td className="p-2">{(r.payments as any)?.total_amount ?? "N/A"}</td>
                                        </tr>
                                          )
                                        }

                                      // Consolidated row for multi-service payment
                                      const isOpen = !!expandedPayments[g.key]
                                      const uniqueCats = Array.from(new Set(g.rows.map((r:any) => (r.categories as any)?.name).filter(Boolean)))
                                      const aggStatus = (() => {
                                        const { aggregateGroupStatus } = require('@/services/statusService')
                                        return aggregateGroupStatus(g.rows)
                                      })()
                                      return (
                                        <React.Fragment key={g.key}>
                                          
                                          <tr className="border-t bg-gray-50/60">
                                            <td className="p-2 align-top">
                                              <button
                                                className="inline-flex items-center justify-center rounded border px-1.5 py-0.5 text-xs hover:bg-gray-100"
                                                onClick={() => setExpandedPayments((p) => ({ ...p, [g.key]: !isOpen }))}
                                                aria-label={isOpen ? 'Collapse' : 'Expand'}
                                              >
                                                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                              </button>
                                            </td>
                                            <td className="p-2 font-medium">
                                              {uniqueCats.length === 1 ? uniqueCats[0] : `Multiple (${uniqueCats.length})`}
                                            </td>
                                            <td className="p-2 text-gray-700">Multiple ({g.rows.length})</td>
                                            <td className="p-2">{aggStatus}</td>
                                            <td className="p-2 font-medium">{g.payment?.total_amount ?? "N/A"}</td>
                                          </tr>

                                          
                                      {isOpen && g.rows.map((r: any) => (
                                        <tr key={r.id} className="border-t text-blue-700">
                                          <td className="p-2 align-top">
                                            <input
                                              type="radio"
                                              name="order-select"
                                              checked={selectedOrderId === r.id}
                                              onChange={() => setSelectedOrderId(r.id)}
                                            />
                                          </td>
                                          <td className="p-2 pl-6">
                                            <div className="text-sm">{(r.categories as any)?.name ?? "N/A"}</div>
                                          </td>
                                          <td className="p-2">
                                            <div className="text-sm font-medium">{(r.services as any)?.name ?? "N/A"}</div>
                                          </td>
                                          <td className="p-2">
                                            <div className="text-sm">{orderStatuses[r.id] ?? "Not Started"}</div>
                                          </td>
                                          <td className="p-2">
                                            <div className="text-sm">{(r.payments as any)?.total_amount ?? "N/A"}</div>
                                          </td>
                                        </tr>
                                      ))}

                                        </React.Fragment>
                                      )
                                    })}
                                  </>
                                )
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                    {/* Thank You modal after redirect with payment_id */}

                    <CheckoutModal
                    isOpen={showThankYou}
                    onClose={handleCloseThankYou}
                    payment={thankYouPayment}
                    orders={thankYouOrders}
                    onProceedSingle={(order?: any) => {
                      if (order) {
                        handleProceedSingle(order)
                      } else if (thankYouOrders?.length === 1) {
                        handleProceedSingle(thankYouOrders[0])
                      }
                    }}
                  onProceedMultiple={handleProceedMultiple}
                    
                    />  
                      
                    
                  </TabsContent>

                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <ProfilePageInner />
    </Suspense>
  )
}