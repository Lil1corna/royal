'use client'

import { useReducedMotion } from 'framer-motion'
import { useSyncExternalStore } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

/**
 * Телефоны / планшеты с основным тач-вводом + системный reduced motion.
 * На десктопе с мышью — полные анимации.
 */
function subscribeCoarse(cb: () => void) {
  const mq = window.matchMedia('(pointer: coarse)')
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

function getCoarseSnapshot() {
  return window.matchMedia('(pointer: coarse)').matches
}

function getCoarseServerSnapshot() {
  return false
}

export function useCoarsePointer() {
  return useSyncExternalStore(subscribeCoarse, getCoarseSnapshot, getCoarseServerSnapshot)
}

/** true = упростить или отключить тяжёлые анимации (мобильный тач, accessibility) */
export function useLowPowerMotion() {
  const reduce = useReducedMotion()
  const coarse = useCoarsePointer()
  const isMobile = useIsMobile(820)
  return Boolean(reduce || coarse || isMobile)
}
