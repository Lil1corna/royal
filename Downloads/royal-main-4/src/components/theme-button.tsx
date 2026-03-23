'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return (
    <div className="w-9 h-9 border border-white/20 rounded-lg bg-white/5" />
  )

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 border border-white/20 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-lg bg-white/5">
      {resolvedTheme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
