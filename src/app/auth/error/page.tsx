'use client'
import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'Auth xetasi'

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="text-5xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold mb-2 text-white">Giris ugursuz oldu</h1>
      <p className="text-neutral-300 mb-6 text-center max-w-md">{message}</p>
      <div className="flex gap-4">
        <Link href="/auth/signin" className="btn-primary btn-icon-arrow px-6 py-2">
          Yeniden cəhd et <span className="arrow">→</span>
        </Link>
        <Link href="/" className="btn-secondary btn-icon-arrow px-6 py-2">
          Ana səhifə <span className="arrow">→</span>
        </Link>
      </div>
    </main>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<main className="min-h-[60vh] flex items-center justify-center text-neutral-300">Yuklenir...</main>}>
      <AuthErrorContent />
    </Suspense>
  )
}
