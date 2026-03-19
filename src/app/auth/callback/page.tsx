'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const finishAuth = async () => {
      await supabase.auth.exchangeCodeForSession(window.location.href)
      router.push('/')
    }

    finishAuth()
  }, [])

  return <p>Вход...</p>
}
