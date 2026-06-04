"use client"
import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import Image from 'next/image'
// Chevron icons removed since arrows are not used
import { bannerSlides as staticBannerSlides } from '@/constants/data'

// Rich slide metadata to support original hero design.
interface Slide {
  image: string
  eyebrow?: string
  title?: string
  description?: string
  primaryCta?: { label: string; href?: string }
  secondaryCta?: { label: string; href?: string }
  stats?: Array<{ value: string; label: string }>
  hideFrame?: boolean // allow slide to remove right media frame
  frameNote?: string  // optional small center text
  // legacy fallbacks
  subtitle?: string
  ctaText?: string
  ctaHref?: string
  blurb?: string
}
interface BannerCarouselProps {
  featureFlag?: string // NEXT_PUBLIC_ENABLE_BANNER_API toggler value expected to be '1'
}

export function BannerCarousel({ featureFlag = process.env.NEXT_PUBLIC_ENABLE_BANNER_API || '0' }: BannerCarouselProps) {
  const enrichedStaticSlides: Slide[] = useMemo(() => {
    // Map legacy static slides (from constants) into rich format with defaults.
    return (staticBannerSlides as any as Slide[]).map((s, idx) => ({
      image: s.image,
      eyebrow: s.eyebrow || 'Professional IP Services',
      title: s.title || s.subtitle || 'Protect Your Intellectual Property',
      description: s.description || s.subtitle || s.blurb || 'Secure your brand with professional trademark services and comprehensive protection strategies',
      primaryCta: s.primaryCta || (s.ctaText ? { label: s.ctaText, href: s.ctaHref } : { label: 'Get Started Today', href: '#services' }),
      secondaryCta: s.secondaryCta || { label: 'Learn More', href: '#learn-more' },
      stats: s.stats || [
        { value: '2500+', label: 'Patents Filed' },
        { value: '1800+', label: 'Trademarks' },
        { value: '950+', label: 'Happy Clients' }
      ]
    }))
  }, [])

  const [slides, setSlides] = useState<Slide[]>(enrichedStaticSlides)
  const [current, setCurrent] = useState(0)
  const overrideAppliedRef = useRef(false)

  const scrollToPatentServices = useCallback(() => {
    window.dispatchEvent(new CustomEvent('nav:go-section', { detail: { id: 'patent-services' } }))
  }, [])

  const playExplainerVideo = useCallback(() => {
    window.dispatchEvent(new CustomEvent('explainer-video:play'))
  }, [])

  // Remote override (optional)
  useEffect(() => {
    if (featureFlag !== '1') return
    if (overrideAppliedRef.current) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/banner-images', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        const images: Array<{ url: string; filename: string }> = Array.isArray(json.images) ? json.images : []
        if (!cancelled && images.length > 0) {
          const clone = enrichedStaticSlides.map((s, i) => ({ ...s, image: images[i % images.length]?.url || s.image }))
          overrideAppliedRef.current = true
          setSlides(clone)
          setCurrent(0)
        }
      } catch {/* swallow */}
    })()
    return () => { cancelled = true }
  }, [featureFlag, enrichedStaticSlides])

  // Autoplay removed: slides will only change via user interaction (arrows/dots)

  // Navigation via dots only; arrow handlers removed

  return (
    <section className="banner-section relative h-[420px] md:h-[520px] lg:h-[600px] overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-[#0F3B97] via-[#1549B5] to-[#1B3F92]" />
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === current ? 'opacity-100 translate-x-0' : index < current ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'}`}
          >
            {/* Single background gradient only (no per-slide overlay) */}
            <div className="absolute inset-0" />
            <div className="relative h-full flex items-center">
              <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 py-6 md:py-10">
                {/* Left Column */}
                <div className="flex flex-col justify-center max-w-xl">
                  {slide.eyebrow && (
                    <span className="inline-block text-xs md:text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-white/15 shadow-sm w-fit mb-4 md:mb-6 tracking-wide">
                      {slide.eyebrow}
                    </span>
                  )}
                  {slide.title && (
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight md:leading-[1.05] drop-shadow-lg">
                      {slide.title}
                    </h1>
                  )}
                  {slide.description && (
                    <p className="mt-4 md:mt-6 text-sm sm:text-base md:text-xl text-blue-50 leading-relaxed drop-shadow-sm">
                      {slide.description}
                    </p>
                  )}
                  <div className="mt-6 md:mt-10 flex flex-wrap gap-3 md:gap-4">
                    {slide.primaryCta && (
                      <button
                        type="button"
                        onClick={scrollToPatentServices}
                        className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm transition-colors text-sm md:text-base select-none"
                      >
                        {slide.primaryCta.label}
                      </button>
                    )}
                    {slide.secondaryCta && (
                      <button
                        type="button"
                        onClick={playExplainerVideo}
                        className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 rounded-lg border border-white/30 text-white font-medium hover:bg-white/10 transition-colors text-sm md:text-base select-none"
                      >
                        {slide.secondaryCta.label}
                      </button>
                    )}
                  </div>
                  {slide.stats && (
                    <div className="mt-6 md:mt-12 flex flex-wrap gap-6 md:gap-10 text-white/90">
                      {slide.stats.map((stat, i) => (
                        <div key={i} className="min-w-[95px] relative">
                          <div className="text-base sm:text-lg md:text-xl font-semibold tracking-tight">{stat.value}</div>
                          <div className="text-[10px] sm:text-[11px] uppercase tracking-wide text-white/70 mt-1 font-medium">{stat.label}</div>
                          {i < (slide.stats?.length || 0) - 1 && (
                            <span className="hidden md:block absolute top-1/2 -right-5 h-10 w-px bg-white/15 -translate-y-1/2" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Right Column: Framed media placeholder */}
                {!slide.hideFrame && (
                  <div className="hidden md:flex items-center justify-center">
                    <div className="relative w-[320px] h-[210px] md:w-[420px] md:h-[280px] lg:w-[520px] lg:h-[340px] rounded-2xl bg-white/5 border border-white/20 backdrop-blur-md shadow-2xl overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                      <div className="relative w-[84%] h-[74%] rounded-xl bg-neutral-100 border border-neutral-200 shadow-inner overflow-hidden flex items-center justify-center">
                        <Image
                          src={slide.image}
                          alt={`Patent and trademark services India - ${slide.title || 'IP protection services for startups and businesses'}`}
                          fill
                          className="object-cover"
                          priority={index === 0}
                          sizes="(max-width: 768px) 0px, (max-width: 1024px) 420px, 520px"
                          quality={85}
                        />
                      </div>
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-14 -left-10 w-56 h-56 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Arrows removed: navigation via dots only */}
      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`transition-all duration-300 rounded-full ${index === current ? 'w-12 h-3 bg-white shadow-lg' : 'w-3 h-3 bg-white/50 hover:bg-white/70'}`}
          />
        ))}
      </div>
      {/* Progress bar (no autoplay: short transition on manual change) */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div className="h-full bg-white transition-all duration-300 ease-linear" style={{ width: `${((current + 1) / slides.length) * 100}%` }} />
      </div>
    </section>
  )
}
