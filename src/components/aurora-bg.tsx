'use client'

import { useIsMobile } from '@/hooks/useIsMobile'

export default function AuroraBg({ className }: { className?: string }) {
  const isMobile = useIsMobile()

  // Always render the full aurora container to avoid hydration mismatch
  // On mobile, we hide the animated blobs with CSS and show a static gradient instead
  return (
    <div
      className={`aurora-container fixed inset-0 z-[-1] pointer-events-none ${className || ''}`}
      aria-hidden="true"
    >
      {/* Static gradient for mobile - hidden on desktop */}
      {isMobile && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 20% 80%, #0d2b4e 0%, transparent 60%),' +
              'radial-gradient(ellipse 60% 50% at 80% 20%, #0a1f3d 0%, transparent 55%),' +
              'radial-gradient(ellipse 100% 80% at 50% 50%, #071428 0%, transparent 70%),' +
              'radial-gradient(ellipse 85% 75% at 50% 50%, transparent 30%, rgba(5,13,26,0.5) 70%, rgba(5,13,26,0.85) 100%)',
          }}
        />
      )}
      {/* Animated blobs - hidden on mobile via CSS */}
      <div className={`aurora-blob blob-1 ${isMobile ? 'hidden' : ''}`} />
      <div className={`aurora-blob blob-2 ${isMobile ? 'hidden' : ''}`} />
      <div className={`aurora-blob blob-3 ${isMobile ? 'hidden' : ''}`} />
      <div className={`aurora-blob blob-4 ${isMobile ? 'hidden' : ''}`} />
      <div className={`aurora-blob blob-5 ${isMobile ? 'hidden' : ''}`} />
      <div className={`aurora-noise ${isMobile ? 'hidden' : ''}`} />
      <div className={`aurora-vignette ${isMobile ? 'hidden' : ''}`} />
    </div>
  )
}
