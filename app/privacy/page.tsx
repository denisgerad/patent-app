"use client"

import { useMemo, useEffect, useState } from 'react'
import { Footer } from "@/components/layout/Footer"
import { Shield, Eye, Lock, Trash2, Download, Mail, Phone, Calendar, AlertCircle, Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthProfile } from '@/app/useAuthProfile'

export default function PrivacyPolicyPage() {
  // Auth / admin state (mirrors main landing page logic for consistent header)
  const {
    isAuthenticated,
    displayName,
    handleGoogleLogin,
    handleLogout,
  } = useAuthProfile()
  const adminEmails = useMemo(() => (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean), [])
  const userEmail = (typeof window !== 'undefined' ? (window as any).supabaseUserEmail : null) || '' // non-blocking placeholder (hook already covers greeting)
  const isAdmin = !!(userEmail && adminEmails.includes(userEmail.toLowerCase()))
  const primaryAdminEmail = adminEmails[0]
  const isPrimaryAdmin = !!(userEmail && userEmail.toLowerCase() === primaryAdminEmail)
  const lastUpdated = "January 15, 2024"
  // Local overlay for refresh cycle
  const [refreshing, setRefreshing] = useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Accessibility: move focus to page heading on mount so keyboard users land correctly
  useEffect(() => {
    const h = document.getElementById('page-heading') as HTMLElement | null
    if (h) {
      try { h.focus() } catch {}
    }
  }, [])

  // Hard refresh on tab-out/tab-in to ensure a clean render similar to dedicated screens
  useEffect(() => {
    const FLAG = 'privacy:refreshPending'
    const onBlur = () => {
      try { sessionStorage.setItem(FLAG, '1') } catch {}
    }
    const runRefreshIfNeeded = () => {
      try {
        if (typeof document !== 'undefined' && document.hidden) return
        const pending = sessionStorage.getItem(FLAG) === '1'
        if (!pending || refreshing) return
        // one-shot
        sessionStorage.removeItem(FLAG)
        setRefreshing(true)
        // small delay to allow overlay paint
        setTimeout(() => {
          try { window.location.replace(window.location.href) } catch { window.location.reload() }
        }, 120)
      } catch {}
    }
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', runRefreshIfNeeded)
    document.addEventListener('visibilitychange', runRefreshIfNeeded)
    return () => {
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', runRefreshIfNeeded)
      document.removeEventListener('visibilitychange', runRefreshIfNeeded)
    }
  }, [refreshing])

  return (
    <div className="min-h-screen bg-white">
      {refreshing && (
        <div aria-hidden="true" style={{
          position: 'fixed', inset: 0 as any, zIndex: 2147483000,
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)',
          transition: 'opacity 160ms ease',
          pointerEvents: 'none'
        }} />
      )}
      {/* Minimal header for legal pages (brand only; hide menu controls) */}
      <header className="bg-white shadow-md p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="flex items-center gap-2">
           {/* <Scale className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">LegalIP Pro</span>*/}
          </div>
        </div>
      </header>
      
      {/* Back-to-home link intentionally hidden on privacy screen to reduce clutter */}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-16 w-16 text-blue-300 mr-4" />
            <h1 id="page-heading" tabIndex={-1} className="text-4xl md:text-5xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Your privacy is our priority. Learn how we collect, use, protect, and manage your personal information 
            in accordance with the highest standards of data protection.
          </p>
          <div className="mt-4">
           {/*} <a href="/privacy/data-management" className="inline-block text-blue-200 hover:text-white underline">
              See what we do with collected data and when we delete it
            </a>*/}
          </div>
          <div className="bg-blue-600/20 backdrop-blur-sm rounded-lg p-4 border border-blue-400/30 inline-block">
            <p className="text-blue-200 text-sm">
              <Calendar className="h-4 w-4 inline mr-2" />
              Last Updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="bg-gray-50 py-8 sticky top-16 z-40 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: "overview", label: "Overview" },
              { id: "information-collection", label: "Data Collection" },
              { id: "data-usage", label: "How We Use Data" },
              { id: "data-sharing", label: "Data Sharing" },
              { id: "data-storage", label: "Data Storage" },
              { id: "data-retention", label: "Data Retention" },
              { id: "user-rights", label: "Your Rights" },
              { id: "security", label: "Security" },
              { id: "contact", label: "Contact Us" },
            ].map((item) => (
              <Button
                key={item.id}
                variant="outline"
                size="sm"
                onClick={() => scrollToSection(item.id)}
                className="text-xs hover:bg-blue-50 hover:text-blue-600"
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview */}
        <section id="overview" className="mb-12">
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-gray-900">
                <Eye className="h-6 w-6 mr-3 text-blue-600" />
                Privacy Policy Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                At LegalIP Pro, we are committed to protecting your privacy and ensuring the security of your personal 
                information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you visit our website and use our intellectual property services.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Key Principles:</h4>
                <ul className="text-blue-800 space-y-1">
                  <li>• We only collect information necessary to provide our services</li>
                  <li>• We never sell your personal information to third parties</li>
                  <li>• We implement industry-standard security measures</li>
                  <li>• You have full control over your data and can request deletion at any time</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Information Collection */}
        <section id="information-collection" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-gray-900">
                <Download className="h-6 w-6 mr-3 text-green-600" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information You Provide</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        <li>• Full name (first and last name)</li>
                        <li>• Email address</li>
                        <li>• Phone number</li>
                        <li>• Company name (if applicable)</li>
                        <li>• Professional title</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Service Information</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        <li>• Patent application details</li>
                        <li>• Trademark information</li>
                        <li>• Copyright materials</li>
                        <li>• Design specifications</li>
                        <li>• Legal consultation notes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Information Automatically Collected</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <ul className="text-gray-700 space-y-2">
                      <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns, and navigation paths</li>
                      <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                      <li><strong>Location Data:</strong> General geographic location based on IP address (not precise location)</li>
                      <li><strong>Cookies & Tracking:</strong> Session cookies, preference cookies, and analytics cookies</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Information from Third Parties</h3>
                  <p className="text-gray-700 mb-2">We may receive information from:</p>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Government patent and trademark offices</li>
                    <li>• Legal databases and research services</li>
                    <li>• Payment processors (transaction information only)</li>
                    <li>• Professional referral partners</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Data Usage */}
        <section id="data-usage" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-gray-900">
                <Lock className="h-6 w-6 mr-3 text-purple-600" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3">Primary Service Purposes</h3>
                    <ul className="text-blue-800 space-y-2 text-sm">
                      <li>• Processing patent, trademark, and copyright applications</li>
                      <li>• Providing legal consultation and advice</li>
                      <li>• Conducting prior art searches and analysis</li>
                      <li>• Managing your IP portfolio</li>
                      <li>• Communicating about your cases and services</li>
                      <li>• Processing payments and billing</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-3">Secondary Purposes</h3>
                    <ul className="text-green-800 space-y-2 text-sm">
                      <li>• Improving our website and services</li>
                      <li>• Sending relevant legal updates and newsletters</li>
                      <li>• Analyzing usage patterns for optimization</li>
                      <li>• Preventing fraud and ensuring security</li>
                      <li>• Complying with legal obligations</li>
                      <li>• Responding to customer support inquiries</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-900 mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Legal Basis for Processing
                  </h3>
                  <div className="text-red-800 space-y-2 text-sm">
                    <p><strong>Contractual Necessity:</strong> Processing required to fulfill our service agreements</p>
                    <p><strong>Legitimate Interest:</strong> Improving services, security, and business operations</p>
                    <p><strong>Legal Compliance:</strong> Meeting regulatory requirements and legal obligations</p>
                    <p><strong>Consent:</strong> Marketing communications and optional features (with your explicit consent)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Data Sharing */}
        <section id="data-sharing" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-gray-900">
                <Shield className="h-6 w-6 mr-3 text-orange-600" />
                Data Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">We DO NOT sell your personal information</h3>
                  <p className="text-green-800 text-sm">
                    LegalIP Pro never sells, rents, or trades your personal information to third parties for marketing purposes.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Limited Sharing Scenarios</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-l-blue-500 pl-4">
                      <h4 className="font-medium text-gray-900">Service Providers</h4>
                      <p className="text-gray-700 text-sm mt-1">
                        Trusted third-party vendors who help us provide services (cloud hosting, payment processing, 
                        legal research databases) under strict confidentiality agreements.
                      </p>
                    </div>
                    <div className="border-l-4 border-l-yellow-500 pl-4">
                      <h4 className="font-medium text-gray-900">Government Agencies</h4>
                      <p className="text-gray-700 text-sm mt-1">
                        Patent and trademark offices, courts, and regulatory bodies as required for IP applications 
                        and legal proceedings.
                      </p>
                    </div>
                    <div className="border-l-4 border-l-red-500 pl-4">
                      <h4 className="font-medium text-gray-900">Legal Requirements</h4>
                      <p className="text-gray-700 text-sm mt-1">
                        When required by law, court order, or to protect our rights, property, or safety, 
                        or that of our users or others.
                      </p>
                    </div>
                    <div className="border-l-4 border-l-purple-500 pl-4">
                      <h4 className="font-medium text-gray-900">Business Transfers</h4>
                      <p className="text-gray-700 text-sm mt-1">
                        In the event of a merger, acquisition, or sale of assets, your information may be 
                        transferred with appropriate notice and protection measures.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Data Storage */}
        <section id="data-storage" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-gray-900">
                <Lock className="h-6 w-6 mr-3 text-indigo-600" />
                Data Storage and Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h3 className="font-semibold text-indigo-900 mb-3">Storage Locations</h3>
                    <ul className="text-indigo-800 space-y-2 text-sm">
                      <li>• Primary servers: United States (AWS/Google Cloud)</li>
                      <li>• Backup servers: Multiple secure data centers</li>
                      <li>• EU data: Stored within EU boundaries (GDPR compliance)</li>
                      <li>• Encryption: AES-256 encryption at rest and in transit</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-3">Security Measures</h3>
                    <ul className="text-purple-800 space-y-2 text-sm">
                      <li>• SSL/TLS encryption for all data transmission</li>
                      <li>• Multi-factor authentication for staff access</li>
                      <li>• Regular security audits and penetration testing</li>
                      <li>• Firewall protection and intrusion detection</li>
                      <li>• Employee background checks and training</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Access Controls</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900">Role-Based Access</h4>
                      <p className="text-gray-700">Staff only access data necessary for their role</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Audit Logging</h4>
                      <p className="text-gray-700">All data access is logged and monitored</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Regular Reviews</h4>
                      <p className="text-gray-700">Quarterly access reviews and updates</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Data Retention */}
        <section id="data-retention" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-gray-900">
                <Trash2 className="h-6 w-6 mr-3 text-red-600" />
                Data Retention and Deletion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-900 mb-2">Automatic Data Deletion Policy</h3>
                  <p className="text-red-800 text-sm">
                    We automatically delete personal information when it's no longer needed for the purposes 
                    it was collected, unless we're legally required to retain it longer.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Retention Periods</h3>
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Data Type</th>
                            <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Retention Period</th>
                            <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">Account Information</td>
                            <td className="border border-gray-300 px-4 py-2">Until account deletion + 30 days</td>
                            <td className="border border-gray-300 px-4 py-2">Service provision and support</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">IP Application Data</td>
                            <td className="border border-gray-300 px-4 py-2">7 years after case closure</td>
                            <td className="border border-gray-300 px-4 py-2">Legal and regulatory requirements</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">Payment Information</td>
                            <td className="border border-gray-300 px-4 py-2">7 years</td>
                            <td className="border border-gray-300 px-4 py-2">Tax and accounting compliance</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">Website Analytics</td>
                            <td className="border border-gray-300 px-4 py-2">26 months</td>
                            <td className="border border-gray-300 px-4 py-2">Service improvement and optimization</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">Marketing Data</td>
                            <td className="border border-gray-300 px-4 py-2">Until unsubscribe + 30 days</td>
                            <td className="border border-gray-300 px-4 py-2">Communication preferences</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">Support Tickets</td>
                            <td className="border border-gray-300 px-4 py-2">3 years</td>
                            <td className="border border-gray-300 px-4 py-2">Quality assurance and training</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Deletion Process</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Automatic Deletion</h4>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Scheduled automated deletion processes</li>
                        <li>• Secure overwriting of deleted data</li>
                        <li>• Verification and audit trails</li>
                        <li>• Backup purging within 90 days</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-900 mb-2">Manual Deletion Requests</h4>
                      <ul className="text-green-800 text-sm space-y-1">
                        <li>• Processed within 30 days of request</li>
                        <li>• Identity verification required</li>
                        <li>• Confirmation email sent upon completion</li>
                        <li>• Legal hold exceptions may apply</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* User Rights */}
        <section id="user-rights" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-gray-900">
                <Shield className="h-6 w-6 mr-3 text-green-600" />
                Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-gray-700">
                  You have significant control over your personal information. Here are your rights and how to exercise them:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-900 mb-2">Right to Access</h3>
                      <p className="text-blue-800 text-sm mb-2">
                        Request a copy of all personal information we hold about you.
                      </p>
                      <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                        Request Data Export
                      </Button>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-green-900 mb-2">Right to Rectification</h3>
                      <p className="text-green-800 text-sm mb-2">
                        Correct any inaccurate or incomplete personal information.
                      </p>
                      <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                        Update Information
                      </Button>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h3 className="font-semibold text-purple-900 mb-2">Right to Erasure</h3>
                      <p className="text-purple-800 text-sm mb-2">
                        Request deletion of your personal information (subject to legal requirements).
                      </p>
                      <Button size="sm" variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50">
                        Delete My Data
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h3 className="font-semibold text-orange-900 mb-2">Right to Portability</h3>
                      <p className="text-orange-800 text-sm mb-2">
                        Receive your data in a structured, machine-readable format.
                      </p>
                      <Button size="sm" variant="outline" className="text-orange-600 border-orange-600 hover:bg-orange-50">
                        Export Data
                      </Button>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h3 className="font-semibold text-red-900 mb-2">Right to Restrict Processing</h3>
                      <p className="text-red-800 text-sm mb-2">
                        Limit how we process your personal information in certain circumstances.
                      </p>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                        Restrict Processing
                      </Button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2">Right to Object</h3>
                      <p className="text-gray-800 text-sm mb-2">
                        Object to processing based on legitimate interests or for marketing purposes.
                      </p>
                      <Button size="sm" variant="outline" className="text-gray-600 border-gray-600 hover:bg-gray-100">
                        Object to Processing
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-900 mb-2">How to Exercise Your Rights</h3>
                  <div className="text-yellow-800 text-sm space-y-2">
                    <p>1. <strong>Email us:</strong> info@ipprotectionindia.com with your request</p>
                    <p>2. <strong>Include:</strong> Your full name, email address, and specific request</p>
                    <p>3. <strong>Verification:</strong> We may ask for additional information to verify your identity</p>
                    <p>4. <strong>Response time:</strong> We'll respond within 30 days (may extend to 60 days for complex requests)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Security */}
        <section id="security" className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-gray-900">
                <Lock className="h-6 w-6 mr-3 text-red-600" />
                Security Measures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-gray-700">
                  We implement comprehensive security measures to protect your personal information from unauthorized 
                  access, alteration, disclosure, or destruction.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h3 className="font-semibold text-red-900 mb-3">Technical Safeguards</h3>
                    <ul className="text-red-800 text-sm space-y-1">
                      <li>• End-to-end encryption</li>
                      <li>• Secure socket layer (SSL)</li>
                      <li>• Advanced firewalls</li>
                      <li>• Intrusion detection systems</li>
                      <li>• Regular security updates</li>
                      <li>• Vulnerability assessments</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3">Administrative Safeguards</h3>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Employee background checks</li>
                      <li>• Privacy training programs</li>
                      <li>• Access control policies</li>
                      <li>• Incident response procedures</li>
                      <li>• Regular security audits</li>
                      <li>• Vendor security assessments</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-3">Physical Safeguards</h3>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Secure data centers</li>
                      <li>• Biometric access controls</li>
                      <li>• 24/7 monitoring</li>
                      <li>• Environmental controls</li>
                      <li>• Secure disposal procedures</li>
                      <li>• Backup and recovery systems</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-900 mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Data Breach Response
                  </h3>
                  <div className="text-orange-800 text-sm space-y-2">
                    <p>In the unlikely event of a data breach:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• We'll notify affected users within 72 hours</li>
                      <li>• Regulatory authorities will be informed as required</li>
                      <li>• Immediate containment and investigation procedures</li>
                      <li>• Free credit monitoring services if applicable</li>
                      <li>• Regular updates on investigation progress</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact */}
        <section id="contact" className="mb-12">
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-gray-900">
                <Mail className="h-6 w-6 mr-3 text-blue-600" />
                Contact Us About Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3">Privacy Officer</h3>
                    <div className="text-blue-800 text-sm space-y-2">
                      <p className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        info@ipprotectionindia.com
                      </p>
                      <p className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        +91 99161 93248
                      </p>
                      <p>Response time: Within 48 hours</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Mailing Address</h3>
                    <div className="text-gray-800 text-sm space-y-1">
                     {/*} <p>LegalIP Pro</p>
                      <p>Attn: Privacy Officer</p>*/}
                      <p>8th Floor, A 10, Shilpitha Tech Park- iSprout, Devarabisanahalli Rd, Kariyammana Agrahara, Bellandur, Bengaluru, Karnataka 560103</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">Regulatory Complaints</h3>
                  <p className="text-green-800 text-sm">
                    If you're not satisfied with our response, you have the right to file a complaint with your 
                    local data protection authority or the Federal Trade Commission (FTC) in the United States.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Updates */}
        <section className="mb-12">
          <Card className="bg-gray-50 border-2 border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Policy Updates</h2>
              <div className="space-y-3 text-gray-700 text-sm">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices, 
                  technology, legal requirements, or other factors.
                </p>
                <p>
                  <strong>How we notify you:</strong> We'll post the updated policy on our website and send 
                  email notifications for material changes at least 30 days before they take effect.
                </p>
                <p>
                  <strong>Your continued use</strong> of our services after the effective date constitutes 
                  acceptance of the updated Privacy Policy.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
