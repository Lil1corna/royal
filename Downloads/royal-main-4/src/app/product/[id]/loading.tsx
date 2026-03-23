export default function ProductLoading() {
  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="h-4 w-24 bg-white/10 rounded mb-6 animate-pulse" />
      <div className="h-3 w-20 bg-white/10 rounded mb-1 animate-pulse" />
      <div className="h-9 w-2/3 bg-white/10 rounded mb-8 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-square bg-white/10 rounded-xl animate-pulse" />
        <div className="space-y-6">
          <div className="h-10 w-32 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
          <div className="h-12 w-full bg-white/10 rounded animate-pulse" />
          <div className="h-12 w-full bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    </main>
  )
}
