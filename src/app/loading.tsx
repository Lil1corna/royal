export default function Loading() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="h-9 w-48 bg-white/10 rounded mb-8 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="ds-card-glass rounded-xl overflow-hidden">
            <div className="aspect-video bg-white/10 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
              <div className="h-5 w-3/4 bg-white/10 rounded animate-pulse" />
              <div className="h-6 w-20 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
