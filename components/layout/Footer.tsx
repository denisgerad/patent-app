"use client"

import { Scale } from 'lucide-react'
import Link from "next/link"
import { Instagram, Linkedin } from 'lucide-react'

export function Footer() {
  const goSection = (id: string) => {
    try {
      if (window.location.pathname === '/') {
        window.dispatchEvent(new CustomEvent('nav:go-section', { detail: { id } }))
      } else {
        window.location.href = `/#${id}`
      }
    } catch {}
  }
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Scale className="h-8 w-8 text-blue-400 mr-2" />
              <span className="text-2xl font-bold">IP Protection India</span>
            </div>
            <p className="text-gray-400">
              Your trusted partner for comprehensive intellectual property protection services.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button type="button" onClick={() => goSection('patent-services')} className="hover:text-white transition-colors text-left">
                  Patent Services
                </button>
              </li>
              <li>
                <button type="button" onClick={() => goSection('trademark-services')} className="hover:text-white transition-colors text-left">
                  Trademark Services
                </button>
              </li>
              <li>
                <button type="button" onClick={() => goSection('design-services')} className="hover:text-white transition-colors text-left">
                  Design Services
                </button>
              </li>
              <li>
                <button type="button" onClick={() => goSection('copyright-services')} className="hover:text-white transition-colors text-left">
                  Copyright Services
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><span className="cursor-default">About Us</span></li>
              <li><span className="cursor-default">Our Team</span></li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li><span className="cursor-default">Terms of Service</span></li>
              <li><span className="cursor-default">Careers</span></li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-2 text-gray-400">
              <p>8th Floor, A 10, Shilpitha Tech Park- iSprout, Devarabisanahalli Rd, Kariyammana Agrahara, Bellandur, Bengaluru, Karnataka 560103</p>
              <p>Phone: +91 99161 93248</p>
              <p>Email: info@ipprotectionindia.com</p>
              <div className="flex gap-4 mt-4">
                <a 
                  href="https://www.instagram.com/lexanalytico_consulting/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="h-6 w-6" />
                </a>
                <a 
                  href="https://www.linkedin.com/company/lexanalytico-consulting/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label="Follow us on LinkedIn"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 IP Protection India. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
