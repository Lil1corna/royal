import { useEffect, useState } from 'react'

/**
 * Match mobile viewport. Initial state is always `false` so the first client render
 * matches SSR (avoid React hydration #418). Real value is applied after mount in `useEffect`.
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [breakpoint])

  return isMobile
}

