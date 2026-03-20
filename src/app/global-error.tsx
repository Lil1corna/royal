'use client'

import { useEffect } from 'react'
import { captureException } from '@/lib/monitoring'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    captureException(error, { digest: error.digest, source: 'global-error' })
  }, [error])

  return (
    <html lang="az">
      <body className="min-h-screen flex flex-col items-center justify-center p-8 bg-neutral-50">
        <h1 className="text-2xl font-bold mb-2">Xəta baş verdi</h1>
        <p className="text-gray-600 text-center max-w-md mb-6">
          Səhifəni yeniləyin və ya bir az sonra yenidən cəhd edin.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-black text-white px-6 py-3 font-semibold hover:bg-neutral-800"
        >
          Yenidən cəhd et
        </button>
      </body>
    </html>
  )
}
