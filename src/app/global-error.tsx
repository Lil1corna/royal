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
      <body className="min-h-screen flex flex-col items-center justify-center p-8 bg-neutral-950">
        <h1 className="text-2xl font-bold mb-2 text-white">Xəta baş verdi</h1>
        <p className="text-neutral-300 text-center max-w-md mb-6">
          Səhifəni yeniləyin və ya bir az sonra yenidən cəhd edin.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="ds-btn-primary px-6 py-3 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          Yenidən cəhd et
        </button>
      </body>
    </html>
  )
}
