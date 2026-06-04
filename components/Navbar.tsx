"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from "@/lib/supabase";
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { useRef } from 'react';
import { useFocusTrap } from '@/components/hooks/useFocusTrap';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((
      _event: AuthChangeEvent,
      session: Session | null
    ) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    try {
      if (mobileOpen) {
        const prev = document.body.style.overflow;
        document.body.setAttribute('data-prev-overflow', prev);
        document.body.style.overflow = 'hidden';
      } else {
        const prev = document.body.getAttribute('data-prev-overflow') || '';
        document.body.style.overflow = prev;
        document.body.removeAttribute('data-prev-overflow');
      }
    } catch {}
    return () => {
      try {
        const prev = document.body.getAttribute('data-prev-overflow') || '';
        document.body.style.overflow = prev;
        document.body.removeAttribute('data-prev-overflow');
      } catch {}
    };
  }, [mobileOpen]);

  // Focus trap within the off-canvas panel
  useFocusTrap(mobileOpen, panelRef, triggerRef.current)

  // Use Next's pathname to reliably detect current route (SSR-safe)
  const pathname = usePathname() || '/'
  const router = useRouter()
  const isHomePage = pathname === '/'
  const goSection = (id: string) => {
    try {
      // Treat only '/' as the main landing page. If already there, dispatch
      // a client event to scroll. Otherwise, navigate to the root with hash.
      const onMain = pathname === '/'
      // Dev-telemetry: log menu click target to help debug routing
      try {
        fetch('/api/debug-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'menu-click', item: id, from: pathname, to: onMain ? 'scroll' : `/#${id}` })
        }).catch(() => {})
      } catch {}
      if (onMain) {
        window.dispatchEvent(new CustomEvent('nav:go-section', { detail: { id } }))
      } else {
        router.push(`/#${id}`)
      }
    } catch {}
  }

  // duplicate declaration removed (mobileOpen is declared at top of component)
  return (
  <nav className={`${isHomePage ? 'md:hidden ' : ''}flex items-center justify-between bg-white p-4 shadow-md sticky top-0 z-[200] md:min-h-[188px] md:px-10 md:py-0`}>
      {/* Left: Logo/Brand (non-clickable) */}
      <div className="flex items-center select-none" aria-label="IP Protection India" role="img">
        <img
          src="/logo.png"
          alt="IP Protection India"
          width={3600}
          height={1600}
          className="h-auto w-[197px] shrink-0 object-contain sm:w-[224px] md:h-[164px] md:w-[405px] md:object-fill lg:h-[174px] lg:w-[431px]"
        />
        <span className="sr-only">IP Protection India</span>
      </div>

  {/* Right: Top links aligned in a row (desktop) */}
  <div className="hidden md:flex items-center space-x-4">
        {/* Patent Services with hover dropdown */}
        <div className="relative group z-[201]">
          <button type="button" onClick={() => goSection('patent-services')} className="text-gray-700 hover:text-blue-600 px-2 py-1 text-sm font-medium inline-flex items-center">
            Patent Services
          </button>
          <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[300]">
            <div className="py-2">
              <button type="button" onClick={() => goSection('patent-services')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Patentability Search</button>
              <button type="button" onClick={() => goSection('patent-services')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Drafting</button>
              <button type="button" onClick={() => goSection('patent-services')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Patent Application Filing</button>
              <button type="button" onClick={() => goSection('patent-services')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">First Examination Response</button>
            </div>
          </div>
        </div>
        <button type="button" onClick={() => goSection('trademark-services')} className="text-gray-700 hover:text-blue-600 px-2 py-1 text-sm font-medium">
          Trademark Services
        </button>
        <button type="button" onClick={() => goSection('design-services')} className="text-gray-700 hover:text-blue-600 px-2 py-1 text-sm font-medium">
          Design Services
        </button>
        <button type="button" onClick={() => goSection('copyright-services')} className="text-gray-700 hover:text-blue-600 px-2 py-1 text-sm font-medium">
          Copyright Services
        </button>
      </div>

      {/* Mobile menu button */}
      <button
        type="button"
        className="md:hidden inline-flex items-center justify-center p-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
        aria-label="Open navigation menu"
        onClick={() => setMobileOpen(o => !o)}
        ref={triggerRef}
      >
        {/* Simple hamburger */}
        <span className="block w-5 h-0.5 bg-gray-700 mb-1" />
        <span className="block w-5 h-0.5 bg-gray-700 mb-1" />
        <span className="block w-5 h-0.5 bg-gray-700" />
      </button>

      {/* Mobile off-canvas menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[300] md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          {/* Panel */}
          <div
            className="absolute right-0 top-0 h-full w-72 max-w-[85%] bg-white shadow-xl border-l border-gray-200 transition-transform duration-300 ease-out translate-x-0"
            ref={panelRef}
            onFocusCapture={() => {/* noop ensure focusable container */}}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setMobileOpen(false)
            }}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <span className="text-lg font-semibold">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                className="p-2 rounded-md text-gray-600 hover:bg-gray-50"
                onClick={() => setMobileOpen(false)}
              >
                ✕
              </button>
            </div>
            <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
              {/* User Section - Show if logged in */}
              {user && (
                <div className="pb-3 mb-3 border-b border-gray-200">
                  <div className="px-3 py-2 text-sm text-gray-500">Signed in as</div>
                  <div className="px-3 py-1 text-sm font-medium text-gray-900 truncate">{user.email}</div>
                  <a href="/profile" onClick={() => setMobileOpen(false)} className="block w-full px-3 py-2 mt-2 rounded hover:bg-blue-50 text-blue-600 font-medium">
                    My Profile
                  </a>
                  <a href="/orders" onClick={() => setMobileOpen(false)} className="block w-full px-3 py-2 rounded hover:bg-blue-50 text-blue-600 font-medium">
                    My Orders
                  </a>
                </div>
              )}
              
              {/* Services Section */}
              <div className="pb-3 mb-3 border-b border-gray-200">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Services</div>
                <button type="button" onClick={() => { setMobileOpen(false); goSection('patent-services') }} className="w-full text-left px-3 py-2 rounded hover:bg-blue-50">
                  Patent Services
                </button>
                <button type="button" onClick={() => { setMobileOpen(false); goSection('trademark-services') }} className="w-full text-left px-3 py-2 rounded hover:bg-blue-50">
                  Trademark Services
                </button>
                <button type="button" onClick={() => { setMobileOpen(false); goSection('design-services') }} className="w-full text-left px-3 py-2 rounded hover:bg-blue-50">
                  Design Services
                </button>
                <button type="button" onClick={() => { setMobileOpen(false); goSection('copyright-services') }} className="w-full text-left px-3 py-2 rounded hover:bg-blue-50">
                  Copyright Services
                </button>
              </div>

              {/* Resources Section */}
              <div className="pb-3 mb-3 border-b border-gray-200">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Resources</div>
                <a href="/knowledge-hub" onClick={() => setMobileOpen(false)} className="block w-full px-3 py-2 rounded hover:bg-gray-50">
                  Knowledge Hub
                </a>
                <a href="/contact" onClick={() => setMobileOpen(false)} className="block w-full px-3 py-2 rounded hover:bg-gray-50">
                  Contact Us
                </a>
                <a href="/privacy" onClick={() => setMobileOpen(false)} className="block w-full px-3 py-2 rounded hover:bg-gray-50">
                  Privacy Policy
                </a>
              </div>

              {/* Auth Section */}
              {!user ? (
                <div>
                  <button
                    type="button"
                    onClick={async () => {
                      setMobileOpen(false);
                      // If not on main page, navigate there first
                      if (pathname !== '/' && pathname !== '/main') {
                        router.push('/');
                        // Delay event dispatch to allow navigation
                        setTimeout(() => {
                          window.dispatchEvent(new CustomEvent('mobile-auth-trigger', { detail: { mode: 'signin' } }));
                        }, 500);
                      } else {
                        // Already on main page, trigger auth immediately
                        window.dispatchEvent(new CustomEvent('mobile-auth-trigger', { detail: { mode: 'signin' } }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                  >
                    Sign In / Sign Up
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={async () => {
                      setMobileOpen(false);
                      await supabase.auth.signOut();
                      router.push('/');
                    }}
                    className="w-full px-3 py-2 text-red-600 rounded hover:bg-red-50 font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </nav>
  );
}
