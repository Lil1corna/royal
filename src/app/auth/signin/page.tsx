'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { sanitizeNext } from '@/lib/sanitize-next'

/**
 * Раньше вход был через route.ts (GET → redirect). На части хостингов такой ответ
 * сохранялся как файл «signin». Здесь отдаётся обычная HTML-страница, редирект на Google — в браузере.
 */
function SignInContent() {
  const searchParams = useSearchParams()
  const supabase = useMemo(() => getSupabaseClient(), [])
  const [error, setError] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>('')

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

        setDebugInfo(`Base URL: ${baseUrl}, Redirect: ${redirectTo}`)

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
          setError(`OAuth Error: ${err.message}`)
          setDebugInfo((prev) => `${prev}\nError: ${JSON.stringify(err)}`)
          return
        }

        if (data.url) {
          setIsRedirecting(true)
          setDebugInfo((prev) => `${prev}\nRedirect URL: ${data.url}`)

          setTimeout(() => {
            window.location.href = data.url
          }, 100)
        } else {
          console.error('[Sign In] No auth URL returned', { data })
          setError('No auth URL returned from Supabase. Check Supabase Auth settings.')
          setDebugInfo((prev) => `${prev}\nNo URL in response: ${JSON.stringify(data)}`)
        }
      } catch (err) {
        console.error('[Sign In] Unexpected error:', err)
        const errorMsg = err instanceof Error ? err.message : 'Unexpected error occurred'
        setError(errorMsg)
        setDebugInfo((prev) => `${prev}\nException: ${errorMsg}`)
      }
    }
    void run()
  }, [searchParams, supabase])

  if (error) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center p-8">
        <div className="mb-4 max-w-2xl">
          <p className="mb-2 text-center text-red-300 font-semibold">{error}</p>
          {debugInfo && (
            <details className="mt-4 text-xs text-white/60 bg-black/30 p-4 rounded">
              <summary className="cursor-pointer mb-2">Debug Info (click to expand)</summary>
              <pre className="whitespace-pre-wrap">{debugInfo}</pre>
            </details>
          )}
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
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-8">
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
      {debugInfo && (
        <details className="mt-4 text-xs text-white/60 max-w-2xl">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="whitespace-pre-wrap mt-2">{debugInfo}</pre>
        </details>
      )}
    </main>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-8">
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
