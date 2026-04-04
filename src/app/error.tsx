'use client'
import Link from 'next/link'
import { useLang, translations } from '@/context/lang'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { lang } = useLang()
  const tr = translations

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="text-5xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold mb-2">{tr.error[lang]}</h1>
      <p className="text-gray-500 mb-6 text-center max-w-md">{error.message}</p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="btn-primary btn-icon-arrow px-6 py-2"
        >
          {tr.tryAgain[lang]} <span className="arrow">→</span>
        </button>
        <Link href="/" className="btn-secondary btn-icon-arrow px-6 py-2">
          {tr.backToCatalog[lang]} <span className="arrow">→</span>
        </Link>
      </div>
    </main>
  )
}
