import { useEffect, useState } from 'react'

export function useIsMobile(breakpoint = 768) {
  // Start with false on both server and client to avoid hydration mismatch
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Set initial value on client
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    setIsMobile(mq.matches)
    
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => {
      mq.removeEventListener('change', handler)
    }
  }, [breakpoint])

  return isMobile
}

