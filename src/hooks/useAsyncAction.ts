'use client'

import { useState } from 'react'

export function useAsyncAction<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<void> | void
) {
  const [loading, setLoading] = useState(false)

  const execute = async (...args: TArgs) => {
    setLoading(true)
    try {
      await fn(...args)
    } finally {
      setLoading(false)
    }
  }

  return { execute, loading }
}
