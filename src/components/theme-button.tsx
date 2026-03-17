'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return (
    <div className="w-9 h-9 border rounded-lg" />
  )

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-700 text-lg">
      {resolvedTheme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
