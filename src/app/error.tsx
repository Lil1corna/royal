'use client'
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
    <main className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="text-5xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold mb-2">{tr.error[lang]}</h1>
      <p className="text-gray-500 mb-6 text-center max-w-md">{error.message}</p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
        >
          {tr.tryAgain[lang]}
        </button>
        <a href="/" className="border px-6 py-2 rounded-lg hover:bg-gray-100">
          {tr.backToCatalog[lang]}
        </a>
      </div>
    </main>
  )
}
