'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

/**
 * Раньше вход был через route.ts (GET → redirect). На части хостингов такой ответ
 * сохранялся как файл «signin». Здесь отдаётся обычная HTML-страница, редирект на Google — в браузере.
 */
export default function SignInPage() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback`
      
      console.log('[Sign In] Starting OAuth flow', { redirectTo })
      
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      
      if (err) {
        console.error('[Sign In] OAuth error:', err)
        setError(err.message)
        return
      }
      
      if (data.url) {
        console.log('[Sign In] Redirecting to Google OAuth')
        window.location.assign(data.url)
      } else {
        console.error('[Sign In] No auth URL returned')
        setError('No auth URL')
      }
    }
    void run()
  }, [])

  if (error) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center p-8">
        <p className="mb-4 max-w-md text-center text-red-300">{error}</p>
        <Link href={`/auth/error?message=${encodeURIComponent(error)}`} className="btn-secondary mb-2 px-4 py-2">
          Təfsilat
        </Link>
        <Link href="/" className="btn-primary px-6 py-2">
          Ana səhifə
        </Link>
      </main>
    )
  }

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" aria-hidden />
      <p className="text-neutral-200">Google-a yönləndirilir…</p>
      <p className="text-sm text-neutral-400">Redirecting to Google…</p>
    </main>
  )
}
