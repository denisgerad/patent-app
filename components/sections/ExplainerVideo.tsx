"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Pause, Play, RotateCcw, RotateCw } from "lucide-react"

export function ExplainerVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)

  const playVideo = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
  }, [])

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      playVideo()
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const skipBy = (seconds: number) => {
    const video = videoRef.current
    if (!video) return
    const duration = Number.isFinite(video.duration) ? video.duration : video.currentTime + seconds
    video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), duration)
  }

  useEffect(() => {
    const handleHeroLearnMore = () => {
      const section = document.getElementById("explainer-video")
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" })
      window.setTimeout(playVideo, 350)
    }

    window.addEventListener("explainer-video:play", handleHeroLearnMore)
    return () => window.removeEventListener("explainer-video:play", handleHeroLearnMore)
  }, [playVideo])

  return (
    <section id="explainer-video" className="bg-white py-12 md:py-16 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How IP Protection India Works</h2>
          <p className="mt-3 text-base md:text-lg text-gray-600">
            A quick walkthrough of our intellectual property filing and advisory process.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-950 shadow-xl">
          <video
            ref={videoRef}
            src="/IP_Protection_India_Explainer.mp4"
            className="block aspect-video w-full bg-black object-contain"
            autoPlay
            muted
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 bg-gray-900 px-4 py-4">
            <button
              type="button"
              onClick={() => skipBy(-10)}
              className="inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" />
              10s
            </button>
            <button
              type="button"
              onClick={togglePlayback}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => skipBy(10)}
              className="inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              10s
              <RotateCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
