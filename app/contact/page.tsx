import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Linkedin, Clock, Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com";

export const metadata: Metadata = {
  title: "Contact IP Protection India | Online IP & Patent Filing Services",
  description: "Contact IP Protection India for online patent filing, trademark registration & IP advisory services across India. Speak to an IP expert today.",
  keywords: [
    "patent attorneys bangalore",
    "patent filing bangalore",
    "online ip services india",
    "ip law firm bangalore",
    "trademark attorney bangalore",
    "patent lawyer bangalore",
    "ip consultant bangalore",
    "online patent filing india",
    "bangalore patent services",
    "intellectual property attorney bangalore",
    "online trademark registration",
    "ip services bengaluru",
  ],
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/contact`,
    title: "Contact Us | IP Protection India",
    description: "Get in touch with our IP experts for patent, trademark, copyright, and design filing services.",
    siteName: "IP Protection India",
  },
};

export default function ContactPage() {
  return (
    <>
      {/* JSON-LD Schema for ContactPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact IP Protection India",
            "description": "Contact page for IP Protection India - Patent, Trademark, Copyright, and Design services",
            "url": `${siteUrl}/contact`,
            "mainEntity": {
              "@type": "ProfessionalService",
              "name": "IP Protection India",
              "telephone": "+91-99161-93248",
              "email": "info@ipprotectionindia.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "8th Floor, A 10, Shilpitha Tech Park- iSprout, Devarabisanahalli Rd, Kariyammana Agrahara",
                "addressLocality": "Bellandur, Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560103",
                "addressCountry": "IN"
              }
            }
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Contact IP Protection India – Online Intellectual Property Services
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Contact IP Protection India for online patent, trademark, copyright, and intellectual property services across India. We assist startups, businesses, and innovators with end-to-end IP protection, filing, and advisory services through a fully digital process. Our team ensures timely support, transparent communication, and compliance with applicable IP laws.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <span className="bg-blue-50 px-4 py-2 rounded-full">✓ Patent Filing Bangalore</span>
              <span className="bg-blue-50 px-4 py-2 rounded-full">✓ Online IP Services</span>
              <span className="bg-blue-50 px-4 py-2 rounded-full">✓ Trademark Registration</span>
              <span className="bg-blue-50 px-4 py-2 rounded-full">✓ IP Law Firm Bengaluru</span>
            </div>
          </div>
        </section>

        {/* When to Contact Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">When Should You Contact IP Protection India?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-700 mb-6">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>To file a patent or trademark online</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>To conduct a patentability or freedom-to-operate (FTO) search</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>To protect software, designs, or creative works</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>To get cost estimates for IP filing in India</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>To consult an IP expert before filing</span>
                  </li>
                </ul>
                <p className="text-gray-600">
                  If you are looking for specific services, you may explore our{" "}
                  <Link href="/services/patent-filing" className="text-blue-600 hover:text-blue-700 font-medium underline">
                    Online Patent Filing Services
                  </Link>
                  , patentability search, or{" "}
                  <Link href="/#trademark-services" className="text-blue-600 hover:text-blue-700 font-medium underline">
                    Trademark Registration Services
                  </Link>
                  {" "}pages for detailed information.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Information Cards */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-lg">Visit Our Bangalore Office</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  8th Floor, A 10, Shilpitha Tech Park- iSprout<br />
                  Devarabisanahalli Rd, Kariyammana Agrahara<br />
                  Bellandur, Bengaluru<br />
                  Karnataka 560103
                </p>
                <p className="text-sm text-blue-600 mt-3 font-medium">
                  Top Patent Law Firm in Bangalore
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-4 rounded-full">
                    <Phone className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-lg">Call Our Patent Attorneys</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">
                  <a href="tel:+919916193248" className="text-blue-600 hover:text-blue-700 font-medium">
                    +91 99161 93248
                  </a>
                </p>
                <p className="text-sm text-gray-500">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Mon-Fri: 9:00 AM - 6:00 PM IST
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Free IP Consultation Available
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-purple-100 p-4 rounded-full">
                    <Mail className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-lg">Email for Online Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  <a href="mailto:info@ipprotectionindia.com" className="text-blue-600 hover:text-blue-700 font-medium">
                    info@ipprotectionindia.com
                  </a>
                </p>
                <p className="text-sm text-gray-500">
                  Online patent filing & IP services
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Response within 24 hours
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Social Media Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Connect With Us</CardTitle>
                <CardDescription>
                  Follow us on social media for updates, tips, and industry insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-6">
                  <a
                    href="https://www.instagram.com/lexanalytico_consulting/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-6 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-full group-hover:scale-110 transition-transform">
                      <Instagram className="h-8 w-8 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Instagram</span>
                    <span className="text-xs text-gray-500">@lexanalytico_consulting</span>
                  </a>

                  <a
                    href="https://www.linkedin.com/company/lexanalytico-consulting/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-6 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="bg-blue-600 p-4 rounded-full group-hover:scale-110 transition-transform">
                      <Linkedin className="h-8 w-8 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">LinkedIn</span>
                    <span className="text-xs text-gray-500">LexAnalytico Consulting</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Map Section - Placeholder */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                We serve clients across India through online consultations, with operational support from our offices in Bangalore and other locations.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Find Our IP Law Firm in Bangalore</CardTitle>
                <CardDescription>Patent attorneys conveniently located in Bengaluru's tech hub - Bellandur. Serving clients across India with online IP services.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2 font-medium">
                      Patent Attorneys Office - Bangalore
                    </p>
                    <p className="text-gray-600 mb-4 text-sm">
                      8th Floor, Shilpitha Tech Park, Bellandur, Bengaluru
                    </p>
                    <Button asChild variant="outline">
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=8th+Floor+A+10+Shilpitha+Tech+Park+Bellandur+Bengaluru+560103"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in Google Maps
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Services Overview */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">IP Services in Bangalore & Online Across India</h2>
              <p className="text-gray-600">
                Leading patent attorneys in Bangalore offering comprehensive online IP services for startups, MSMEs, and enterprises across India
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Patent Filing Bangalore</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Expert patent attorneys for search, drafting, filing, and examination response. Online and offline services available.
                  </p>
                  <Link href="/services/patent-filing" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Learn More →
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Online Trademark Registration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete online trademark search, registration, monitoring, and protection services across India
                  </p>
                  <Link href="/#trademark-services" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Learn More →
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Copyright Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Registration and protection for creative works
                  </p>
                  <Link href="/#copyright-services" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Learn More →
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Design Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Design registration and protection services
                  </p>
                  <Link href="/#design-services" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Learn More →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Can I file a patent online through IP Protection India?
                  </h3>
                  <p className="text-gray-600">
                    Yes, we provide end-to-end online patent filing services in India, including consultation, drafting, and filing.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Do you provide services across India?
                  </h3>
                  <p className="text-gray-600">
                    Yes, our services are delivered online, allowing us to assist clients across India regardless of location.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Need Patent Attorneys in Bangalore?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Get started with expert patent filing and online IP services today. Free consultation available for startups!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/#services" className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Start Patent Filing
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <a href="tel:+919916193248" className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Call Now
                </a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
