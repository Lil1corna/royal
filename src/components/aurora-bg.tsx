'use client'

export default function AuroraBg({ className }: { className?: string }) {
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
