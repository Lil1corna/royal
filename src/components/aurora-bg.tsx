/**
 * Aurora background with animated blobs on desktop, static gradient on mobile.
 * Uses CSS media queries to avoid hydration mismatch - no JS-based mobile detection.
 */
export default function AuroraBg({ className }: { className?: string }) {
  return (
    <div
      className={`aurora-container fixed inset-0 z-[-1] pointer-events-none ${className || ''}`}
      aria-hidden="true"
    >
      {/* Static gradient for mobile - shown via CSS, hidden on md+ */}
      <div
        className="absolute inset-0 md:hidden"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 20% 80%, #0d2b4e 0%, transparent 60%),' +
            'radial-gradient(ellipse 60% 50% at 80% 20%, #0a1f3d 0%, transparent 55%),' +
            'radial-gradient(ellipse 100% 80% at 50% 50%, #071428 0%, transparent 70%),' +
            'radial-gradient(ellipse 85% 75% at 50% 50%, transparent 30%, rgba(5,13,26,0.5) 70%, rgba(5,13,26,0.85) 100%)',
        }}
      />
      {/* Animated blobs - hidden on mobile via CSS, shown on md+ */}
      <div className="aurora-blob blob-1 hidden md:block" />
      <div className="aurora-blob blob-2 hidden md:block" />
      <div className="aurora-blob blob-3 hidden md:block" />
      <div className="aurora-blob blob-4 hidden md:block" />
      <div className="aurora-blob blob-5 hidden md:block" />
      <div className="aurora-noise hidden md:block" />
      <div className="aurora-vignette hidden md:block" />
    </div>
  )
}
