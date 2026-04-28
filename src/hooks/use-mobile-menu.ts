'use client'
import { useCallback, useEffect, useState } from 'react'

type UseMobileMenuOptions = {
  getFocusableElements?: () => NodeListOf<HTMLElement> | HTMLElement[]
}

export function useMobileMenu(options: UseMobileMenuOptions = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const getFocusableElements = options.getFocusableElements

  const openMenu = useCallback(() => setIsOpen(true), [])
  const closeMenu = useCallback(() => setIsOpen(false), [])
  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), [])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        return
      }
      if (e.key !== 'Tab' || !getFocusableElements) return

      const focusable = Array.from(getFocusableElements())

      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    const firstFocusable = getFocusableElements ? Array.from(getFocusableElements())[0] : null
    firstFocusable?.focus()

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [getFocusableElements, isOpen])

  return {
    isOpen,
    openMenu,
    closeMenu,
    toggleMenu,
  }
}
