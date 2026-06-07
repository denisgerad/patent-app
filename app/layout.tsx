import type { Metadata, Viewport } from "next";
import React from 'react'
import Link from 'next/link'
import Navbar from "@/components/Navbar"; // navbar component
import AutoLogout from '@/components/AutoLogout'
import { Footer } from '@/components/layout/Footer'
import { Analytics } from "@vercel/analytics/react"
import { GoogleAnalytics } from '@next/third-parties/google'
import "./globals.css";
import { Inter } from 'next/font/google'

// Configure the font with proper optimization for best performance
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true, // Enable preload for faster font loading
  fallback: ['system-ui', 'arial'], // Ensure immediate text rendering
  variable: '--font-inter'
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ipprotectionindia.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "IP Protection India | Patent, Trademark & Copyright Services",
    template: "%s | IP Protection India",
  },
  description: "Expert patent filing, trademark registration, copyright protection, and design filing services in India. Affordable IP solutions for startups, MSMEs, and enterprises. Professional guidance from search to grant.",
  keywords: [
    "patent filing india",
    "trademark registration india",
    "copyright registration",
    "design filing",
    "intellectual property services",
    "patent drafting",
    "trademark search",
    "IP protection",
    "patent attorney india",
    "trademark attorney",
    "startup ip services",
    "msme patent filing",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "IP Protection India | Patent, Trademark & Copyright Services",
    description: "Expert patent filing, trademark registration, copyright protection, and design filing services in India. Affordable IP solutions for startups, MSMEs, and enterprises.",
    siteName: "IP Protection India",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "IP Protection India | Patent, Trademark & Copyright Services",
    description: "Expert patent filing, trademark registration, copyright protection, and design filing services in India. Professional IP solutions for innovators and brands.",
    creator: "@ip_protection_india",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="google-site-verification" content="Ch7rOvvSFu6vmASxSecCat0uH6Ya8OWQZddSC4Q0S5c" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "IP Protection India",
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              description: "Professional patent, trademark, copyright, and design filing services in India",
              address: {
                "@type": "PostalAddress",
                addressCountry: "IN"
              },
              sameAs: [
                "https://twitter.com/ip_protection_india"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "IP Protection India",
              url: siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${siteUrl}/knowledge-hub?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "IP Protection India",
              image: `${siteUrl}/logo.png`,
              "@id": siteUrl,
              url: siteUrl,
              telephone: "+91-XXXXXXXXXX",
              priceRange: "₹₹",
              address: {
                "@type": "PostalAddress",
                addressCountry: "IN"
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 28.6139,
                longitude: 77.2090
              },
              openingHoursSpecification: [{
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                opens: "09:00",
                closes: "18:00"
              }],
              sameAs: [
                "https://twitter.com/ip_protection_india"
              ],
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "IP Protection Services",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Patent Filing Services",
                      description: "Complete patent filing services in India including patentability search, drafting, and application filing"
                    }
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Trademark Registration",
                      description: "Professional trademark registration and monitoring services in India"
                    }
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Copyright Registration",
                      description: "Copyright registration and protection services for all work types"
                    }
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Design Filing",
                      description: "Design registration filing and protection services in India"
                    }
                  }
                ]
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "How long does patent filing take in India?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Patent filing in India typically takes 3-5 years from application to grant, depending on the complexity and examination timeline. Expedited examination is available for startups and certain categories."
                  }
                },
                {
                  "@type": "Question",
                  name: "What is the cost of trademark registration in India?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Trademark registration costs vary based on applicant type and number of classes. Government fees start from ₹4,500 for individuals and startups, with professional services additional."
                  }
                },
                {
                  "@type": "Question",
                  name: "Do I need a patent attorney for filing?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "While not mandatory, patent attorneys ensure proper drafting, broader claim scope, and higher success rates. Professional guidance significantly reduces objections and rejection risks."
                  }
                },
                {
                  "@type": "Question",
                  name: "Can I file for international patent protection?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, through PCT (Patent Cooperation Treaty) filing, you can seek protection in over 150 countries with a single international application, followed by national phase entries."
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <Navbar />
        <AutoLogout />

        <a href="#page-heading" className="sr-only focus:not-sr-only" style={{position:'absolute',left:0,top:0,zIndex:1000}}>
          Skip to content
        </a>

        { /* Removed legacy sub-navigation (Main / Orders) below brand header */ }

        <main role="main" style={{minHeight:'60vh',padding:0}}>
          {children}
        </main>

        <Footer />
        <Analytics />
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
