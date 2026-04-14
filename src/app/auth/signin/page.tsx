'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { sanitizeNext } from '@/lib/sanitize-next'

function SignInContent() {
  const searchParams = useSearchParams()
  const supabase = useMemo(() => getSupabaseClient(), [])
  const [error, setError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    const run = async () => {
      try {
        const baseUrl = window.location.origin
        const rawNext = searchParams.get('next')
        const callbackUrl = new URL('/auth/callback', baseUrl)
        if (rawNext !== null) {
          callbackUrl.searchParams.set('next', sanitizeNext(rawNext))
        }
        const redirectTo = callbackUrl.toString()

        const { data, error: err } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        })

        if (err) {
          console.error('[Sign In] OAuth error:', err)
          setError(err.message)
          return
        }

        if (data.url) {
          setIsRedirecting(true)
          setTimeout(() => {
            window.location.href = data.url
          }, 100)
        } else {
          console.error('[Sign In] No auth URL returned')
          setError('Authentication service unavailable')
        }
      } catch (err) {
        console.error('[Sign In] Unexpected error:', err)
        setError('Unexpected error occurred')
      }
    }
    void run()
  }, [searchParams, supabase])

  if (error) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="mb-4 max-w-2xl text-center">
          <p className="mb-2 text-red-300 font-semibold">Giriş xətası baş verdi</p>
          <p className="text-sm text-white/60">{error}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/" className="btn-primary px-6 py-2">
            Ana səhifə
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-secondary px-4 py-2"
          >
            Yenidən cəhd et
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-4 md:p-6 lg:p-8">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"
        aria-hidden
      />
      <p className="text-neutral-200">Google-a yönləndirilir…</p>
      <p className="text-sm text-neutral-400">Redirecting to Google…</p>
      {isRedirecting && (
        <p className="text-xs text-neutral-500 mt-4">
          If you are not redirected, please check your browser settings.
        </p>
      )}
    </main>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-4 md:p-6 lg:p-8">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"
            aria-hidden
          />
          <p className="text-neutral-200">Yüklənir…</p>
        </main>
      }
    >
      <SignInContent />
    </Suspense>
  )
}
