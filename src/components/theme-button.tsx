'use client'
import { useTheme } from 'next-themes'

export default function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme()
  if (!resolvedTheme) return (
    <div className="w-11 h-11 border border-white/20 rounded-lg bg-white/5" aria-hidden />
  )

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="w-11 h-11 min-h-[44px] min-w-[44px] border border-white/20 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-lg bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      aria-label={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {resolvedTheme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
