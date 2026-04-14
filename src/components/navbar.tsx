'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useLang, translations } from '@/context/lang'
import { useCart } from '@/context/cart'
import { useWishlist } from '@/context/wishlist'
import { useRouter } from 'next/navigation'
import Magnetic from '@/components/magnetic'
import { useLowPowerMotion } from '@/hooks/use-low-power-motion'
import { useIsMobile } from '@/hooks/useIsMobile'
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@/lib/csrf-constants'
import ThemeButton from '@/components/theme-button'

type Lang = 'az' | 'ru' | 'en'

function NavLinks({ userEmail, onClose }: { userEmail?: string | null; onClose?: () => void }) {
  const { lang, setLang } = useLang()
  const { count } = useCart()
  const { count: wishCount } = useWishlist()
  const router = useRouter()
  const tr = translations

  const handleCart = () => {
    onClose?.()
    router.push('/cart')
  }

  const pill =
    'inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 min-h-[44px] text-sm sm:text-[12px] font-medium motion-safe:transition-transform motion-safe:transition-opacity border border-white/10 bg-transparent text-white/60 hover:text-[#e8c97a] hover:border-[#c9a84c]/50'

  return (
    <>
      <Link href="/" onClick={() => onClose?.()} className={pill}>
        <span className="text-amber-600">◇</span>
        {tr.catalog[lang]}
      </Link>

      <Link href="/about" onClick={() => onClose?.()} className={pill}>
        <span className="text-amber-600">✦</span>
        {tr.about[lang]}
      </Link>

      <div className="flex rounded-full border border-white/10 bg-white/5 p-0.5 shadow-inner text-[11px] font-semibold">
        {(['az', 'ru', 'en'] as Lang[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
              lang === l
                ? 'bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.4)] text-[#e8c97a]'
                : 'text-white/70 hover:bg-white/5'
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <ThemeButton />

      <Link
        href="/wishlist"
        onClick={() => onClose?.()}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c9a84c]/35 hover:bg-[rgba(201,168,76,0.1)]"
        title={tr.wishlist[lang]}
        aria-label={tr.wishlist[lang]}
      >
        <motion.span
          className="text-lg text-rose-500"
          whileHover={{ scale: 1.15 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          ♡
        </motion.span>
        {wishCount > 0 && (
          <motion.span
            key={wishCount}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 px-1 text-[10px] font-bold text-white shadow-md"
          >
            {wishCount}
          </motion.span>
        )}
      </Link>

      <motion.button
        type="button"
        id="nav-cart-fly-target"
        onClick={handleCart}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.96 }}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-white/70 shadow-sm transition-all hover:bg-[rgba(201,168,76,0.1)] hover:border-[#c9a84c]/35"
        aria-label={tr.cart[lang]}
      >
        <span className="drop-shadow-sm">🛒</span>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 1.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-neutral-900 ring-2 ring-white"
          >
            {count > 9 ? '9+' : count}
          </motion.span>
        )}
      </motion.button>

      {userEmail ? (
        <div className="flex items-center gap-2">
          <Link
            href="/account"
            onClick={() => onClose?.()}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 shadow-sm transition-all hover:border-[#c9a84c]/40 hover:bg-[rgba(201,168,76,0.1)]"
          >
            {userEmail.split('@')[0]}
          </Link>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const csrfToken = document.cookie
                .split('; ')
                .find((c) => c.startsWith(`${CSRF_COOKIE_NAME}=`))
                ?.split('=')[1] || ''
              fetch('/auth/signout', {
                method: 'POST',
                headers: { [CSRF_HEADER_NAME]: csrfToken },
              }).then(() => { window.location.href = '/' }).catch(() => { window.location.href = '/' })
            }}
          >
            <button
              type="submit"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10"
            >
              {tr.signout[lang]}
            </button>
          </form>
        </div>
      ) : (
        <Magnetic className="inline-flex" strength={0.24}>
          <Link
            href="/auth/signin"
            onClick={() => onClose?.()}
            className="btn-primary rounded-full px-5 py-2.5 text-sm shadow-lg shadow-amber-900/15"
          >
            {tr.signin[lang]}
          </Link>
        </Magnetic>
      )}
    </>
  )
}

export default function Navbar({ userEmail }: { userEmail?: string | null }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const lowPower = useLowPowerMotion()
  const isMobile = useIsMobile()
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
      if (e.key !== 'Tab' || !drawerRef.current) return

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
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
    const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  return (
    <motion.nav
      initial={
        lowPower ? false : isMobile ? { y: 0, opacity: 0 } : { y: -12, opacity: 0 }
      }
      animate={{ y: 0, opacity: 1 }}
      transition={
        lowPower
          ? { duration: 0 }
          : isMobile
            ? { duration: 0.15, ease: 'easeOut' }
            : { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }
      }
      className={`sticky top-0 z-50 border-b border-white/5 bg-[rgba(5,13,26,0.85)] text-white shadow-none ${lowPower ? '' : 'backdrop-blur-xl'}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[4.25rem] flex items-center justify-between gap-3">
        <Link href="/" className="group flex shrink-0 items-center gap-1">
          <motion.span
            className="text-2xl font-bold tracking-tight text-white"
            whileHover={lowPower ? undefined : { scale: 1.02 }}
          >
            Royal
            <span className="text-[#c9a84c]">
              Az
            </span>
          </motion.span>
          {!lowPower && (
            <motion.span
              className="hidden h-2 w-2 rounded-full bg-amber-400 opacity-0 group-hover:opacity-100 sm:inline-block"
              layoutId="nav-dot"
              transition={{ type: 'spring', stiffness: 300 }}
            />
          )}
        </Link>

        <div className="hidden md:flex items-center gap-1.5 flex-wrap justify-end">
          <NavLinks userEmail={userEmail} />
        </div>

        <motion.button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white shadow-sm md:hidden"
        aria-label="Menu"
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav-drawer"
        whileTap={lowPower ? undefined : { scale: 0.95 }}
      >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className={`fixed inset-0 z-[99] bg-black/45 md:hidden ${lowPower ? '' : 'backdrop-blur-sm'}`}
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: lowPower ? 0.12 : isMobile ? 0.15 : 0.2 }}
            />
            <motion.div
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile menu"
              ref={drawerRef}
              className={`fixed right-0 top-0 z-[100] flex h-full w-[min(100%,20rem)] flex-col gap-5 border-l border-white/10 bg-[rgba(5,13,26,0.95)] p-5 text-white shadow-2xl md:hidden ${lowPower ? '' : 'backdrop-blur-xl'}`}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={
                lowPower
                  ? { type: 'tween', duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }
                  : isMobile
                    ? { type: 'spring', stiffness: 300, damping: 30 }
                    : { type: 'spring', damping: 28, stiffness: 280 }
              }
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-white">
                  Royal<span className="text-[#c9a84c]">Az</span>
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/10 text-white"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <NavLinks userEmail={userEmail} onClose={() => setMobileOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
