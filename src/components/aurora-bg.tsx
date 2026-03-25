'use client'

import { useIsMobile } from '@/hooks/useIsMobile'

export default function AuroraBg({ className }: { className?: string }) {
  const isMobile = useIsMobile()

  if (isMobile) {
    // Mobile: frozen background (no blobs/keyframe animation).
    // Colors/gradients match the desktop aurora base layer.
    return (
      <div
        className={`fixed inset-0 z-[-1] pointer-events-none ${className || ''}`}
        aria-hidden="true"
        style={{
          background:
            // Aurora base radial gradients (same colors as ::before in globals.css)
            'radial-gradient(ellipse 80% 60% at 20% 80%, #0d2b4e 0%, transparent 60%),' +
            'radial-gradient(ellipse 60% 50% at 80% 20%, #0a1f3d 0%, transparent 55%),' +
            'radial-gradient(ellipse 100% 80% at 50% 50%, #071428 0%, transparent 70%),' +
            // Aurora vignette (same colors as .aurora-vignette)
            'radial-gradient(ellipse 85% 75% at 50% 50%, transparent 30%, rgba(5,13,26,0.5) 70%, rgba(5,13,26,0.85) 100%)',
        }}
      />
    )
  }

  return (
    <div
      className={`aurora-container fixed inset-0 z-[-1] pointer-events-none ${className || ''}`}
      aria-hidden="true"
    >
      <div className="aurora-blob blob-1" />
      <div className="aurora-blob blob-2" />
      <div className="aurora-blob blob-3" />
      <div className="aurora-blob blob-4" />
      <div className="aurora-blob blob-5" />
      <div className="aurora-noise" />
      <div className="aurora-vignette" />
    </div>
  )
}
