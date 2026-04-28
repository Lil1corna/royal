'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { useLang, translations } from '@/context/lang'
import { useCart } from '@/context/cart'
import { useWishlist } from '@/context/wishlist'
import { usePathname, useRouter } from 'next/navigation'
import Magnetic from '@/components/magnetic'
import { useLowPowerMotion } from '@/hooks/use-low-power-motion'
import { useIsMobile } from '@/hooks/useIsMobile'
import { fetchWithCsrf } from '@/lib/fetch-with-csrf'
import ThemeButton from '@/components/theme-button'
import { useNavbarState } from '@/hooks/use-navbar-state'
import { useScrollDirection } from '@/hooks/use-scroll-direction'
import { useMobileMenu } from '@/hooks/use-mobile-menu'

type Lang = 'az' | 'ru' | 'en'

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const
const EASE_SMOOTH = [0.4, 0, 0.2, 1] as const

const MOBILE_CONTAINER_VARIANTS = {
  hidden: {
    opacity: 0,
    y: -12,
    scale: 0.985,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: EASE_PREMIUM,
      staggerChildren: 0.04,
      delayChildren: 0.01,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
    transition: {
      duration: 0.18,
      ease: EASE_SMOOTH,
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
}

const MOBILE_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: EASE_PREMIUM,
    },
  },
  exit: {
    opacity: 0,
    y: 4,
    transition: {
      duration: 0.15,
      ease: EASE_SMOOTH,
    },
  },
}

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavLink({
  href,
  icon,
  label,
  pathname,
  onClose,
  mobile,
}: {
  href: string
  icon: string
  label: string
  pathname: string
  onClose?: () => void
  mobile?: boolean
}) {
  const active = isActivePath(pathname, href)
  const containerClass = mobile
    ? 'inline-flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/75'
    : 'group relative inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 min-h-[44px] text-sm sm:text-[12px] font-medium text-white/65 transition-colors duration-300 hover:text-[#efd89a]'

  return (
    <motion.div
      variants={mobile ? MOBILE_ITEM_VARIANTS : undefined}
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      <Link
        href={href}
        onClick={() => onClose?.()}
        aria-current={active ? 'page' : undefined}
        className={`${containerClass} ${active ? 'text-[#f1dc9f]' : ''}`}
      >
        <span className="text-amber-500/85">{icon}</span>
        <span>{label}</span>

        {!mobile && (
          <>
            {active ? (
              <>
                <motion.span
                  layoutId="active-nav-underline"
                  className="pointer-events-none absolute inset-x-2 -bottom-[2px] h-[2px] rounded-full bg-gradient-to-r from-[#b98e2f] via-[#f3dd9c] to-[#b98e2f]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
                <motion.span
                  layoutId="active-nav-glow"
                  className="pointer-events-none absolute inset-x-4 -bottom-1 h-3 rounded-full bg-[#f0cf80]/25 blur-md"
                  transition={{ duration: 0.34, ease: EASE_PREMIUM }}
                />
              </>
            ) : (
              <span className="pointer-events-none absolute inset-x-5 -bottom-[2px] h-[1.5px] origin-center scale-x-0 rounded-full bg-[#f0cf80]/65 transition-transform duration-300 ease-out group-hover:scale-x-100" />
            )}
          </>
        )}
      </Link>
    </motion.div>
  )
}

function NavLinks({
  userEmail,
  pathname,
  onClose,
  mobile = false,
}: {
  userEmail?: string | null
  pathname: string
  onClose?: () => void
  mobile?: boolean
}) {
  const { lang, setLang } = useLang()
  const { count, isHydrated: cartHydrated } = useCart()
  const { count: wishCount } = useWishlist()
  const router = useRouter()
  const tr = translations

  const handleCart = () => {
    onClose?.()
    router.push('/cart')
  }

  const wrapperClass = mobile
    ? 'flex w-full flex-col gap-3'
    : 'hidden md:flex items-center gap-1.5 flex-wrap justify-end'
  const iconButtonClass = mobile
    ? 'relative flex h-11 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/75 transition-all duration-300 hover:border-[#d9b86a]/45 hover:bg-[rgba(201,168,76,0.13)]'
    : 'relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d9b86a]/45 hover:bg-[rgba(201,168,76,0.13)]'

  return (
    <div className={wrapperClass}>
      <NavLink href="/" icon="◇" label={tr.catalog[lang]} pathname={pathname} onClose={onClose} mobile={mobile} />
      <NavLink href="/about" icon="✦" label={tr.about[lang]} pathname={pathname} onClose={onClose} mobile={mobile} />

      <motion.div variants={mobile ? MOBILE_ITEM_VARIANTS : undefined} className="flex rounded-full border border-white/10 bg-white/5 p-0.5 shadow-inner text-[11px] font-semibold">
        {(['az', 'ru', 'en'] as Lang[]).map((l) => (
          <motion.button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            whileTap={{ scale: 0.97 }}
            className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
              lang === l
                ? 'bg-[rgba(201,168,76,0.2)] border border-[rgba(232,201,122,0.42)] text-[#f3dfac]'
                : 'text-white/70 hover:bg-white/5'
            }`}
          >
            {l.toUpperCase()}
          </motion.button>
        ))}
      </motion.div>

      <motion.div variants={mobile ? MOBILE_ITEM_VARIANTS : undefined}>
        <ThemeButton />
      </motion.div>

      <motion.div variants={mobile ? MOBILE_ITEM_VARIANTS : undefined}>
        <Link href="/wishlist" onClick={() => onClose?.()} className={iconButtonClass} title={tr.wishlist[lang]} aria-label={tr.wishlist[lang]}>
          <motion.span className="text-lg text-rose-500" whileHover={{ scale: 1.1, y: -1 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 360, damping: 26 }}>
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
      </motion.div>

      <motion.div variants={mobile ? MOBILE_ITEM_VARIANTS : undefined}>
        <motion.button
          type="button"
          id="nav-cart-fly-target"
          onClick={handleCart}
          whileHover={{ y: -1, scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className={iconButtonClass}
          aria-label={tr.cart[lang]}
        >
          <span className="drop-shadow-sm">🛒</span>
          {cartHydrated && count > 0 && (
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
      </motion.div>

      {userEmail ? (
        <motion.div variants={mobile ? MOBILE_ITEM_VARIANTS : undefined} className="flex items-center gap-2">
          <Link
            href="/account"
            onClick={() => onClose?.()}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d9b86a]/45 hover:bg-[rgba(201,168,76,0.13)]"
          >
            {userEmail.split('@')[0]}
          </Link>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void fetchWithCsrf('/auth/signout', { method: 'POST' })
                .then(() => {
                  window.location.href = '/'
                })
                .catch(() => {
                  window.location.href = '/'
                })
            }}
          >
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/75 transition-all duration-300 hover:bg-white/10"
            >
              {tr.signout[lang]}
            </motion.button>
          </form>
        </motion.div>
      ) : (
        <motion.div variants={mobile ? MOBILE_ITEM_VARIANTS : undefined}>
          <Magnetic className="inline-flex" strength={0.22}>
            <Link
              href="/auth/signin"
              onClick={() => onClose?.()}
              className="btn-primary rounded-full px-5 py-2.5 text-sm shadow-[0_12px_30px_rgba(201,168,76,0.18)] transition-shadow duration-300 hover:shadow-[0_16px_34px_rgba(201,168,76,0.24)]"
            >
              {tr.signin[lang]}
            </Link>
          </Magnetic>
        </motion.div>
      )}
    </div>
  )
}

export default function Navbar({ userEmail }: { userEmail?: string | null }) {
  const [navHovered, setNavHovered] = useState(false)
  const lowPower = useLowPowerMotion()
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const drawerRef = useRef<HTMLDivElement>(null)
  const { isOpen: mobileOpen, openMenu, closeMenu } = useMobileMenu({
    getFocusableElements: () =>
      drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) ?? [],
  })
  const scroll = useScrollDirection({ deadZone: 6 })
  const navbarState = useNavbarState({
    y: scroll.y,
    direction: scroll.direction,
    velocity: scroll.velocity,
    menuOpen: mobileOpen,
  })

  const shellShadow =
    navbarState.state === 'top'
      ? '0 0 0 rgba(3,10,24,0)'
      : '0 2px 8px rgba(2,8,20,0.16), 0 10px 26px rgba(2,8,20,0.16)'

  const navbarY = navbarState.state === 'hidden' ? -88 : 0
  const stateTransition =
    navbarState.state === 'hidden'
      ? { type: 'spring' as const, stiffness: 300, damping: 34, mass: 0.7, duration: navbarState.hideDuration }
      : { type: 'spring' as const, stiffness: 230, damping: 28, mass: 0.8, duration: navbarState.revealDuration }

  const topLayerOpacity = Math.min(1, Math.max(0.02, navbarState.topProgress))
  const baseLayerOpacity = navbarState.state === 'top' ? 0.45 + topLayerOpacity * 0.2 : 0.82
  const contentOpacity = navHovered ? 1 : 0.99

  return (
    <motion.nav
      initial={
        lowPower ? false : isMobile ? { y: 0, opacity: 0 } : { y: -12, opacity: 0 }
      }
      animate={{
        y: navbarY,
        opacity: 1,
      }}
      onHoverStart={() => setNavHovered(true)}
      onHoverEnd={() => setNavHovered(false)}
      transition={
        lowPower
          ? { duration: 0 }
          : isMobile
            ? { duration: 0.18, ease: EASE_PREMIUM }
            : stateTransition
      }
      className="sticky top-0 z-50 will-change-transform"
      style={{ boxShadow: shellShadow }}
    >
      <div className="relative overflow-hidden border-b border-white/[0.08]">
        <div className={`pointer-events-none absolute inset-0 ${lowPower ? '' : 'backdrop-blur-xl'}`} />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(6,14,28,0.86),rgba(8,18,34,0.7)_44%,rgba(28,22,14,0.38)_100%)]"
          animate={{ opacity: baseLayerOpacity }}
          transition={{ duration: 0.3, ease: EASE_PREMIUM }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_140%_at_50%_0%,rgba(241,208,128,0.16),rgba(7,15,30,0)_50%)]"
          animate={{ opacity: navbarState.state === 'top' ? topLayerOpacity * 0.85 : 0.52 }}
          transition={{ duration: 0.34, ease: EASE_PREMIUM }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.065]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.18) 0.5px, transparent 0.5px)',
            backgroundSize: '3px 3px',
          }}
          animate={{ opacity: navbarState.state === 'top' ? 0.02 : 0.045 }}
          transition={{ duration: 0.2, ease: EASE_SMOOTH }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/0 via-white/35 to-white/0"
          animate={{ opacity: navbarState.state === 'top' ? 0.3 : 0.65 }}
          transition={{ duration: 0.25, ease: EASE_SMOOTH }}
        />

        <motion.div
          animate={{ opacity: contentOpacity }}
          transition={{ duration: 0.26, ease: EASE_SMOOTH }}
          className="relative"
        >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[4.45rem] flex items-center justify-between gap-3">
        <Link href="/" className="group flex shrink-0 items-center gap-1.5">
          <motion.span
            className="bg-gradient-to-r from-white to-[#f0dfb7] bg-clip-text text-2xl font-bold tracking-tight text-transparent"
            whileHover={lowPower ? undefined : { scale: 1.022, rotate: -1.4, y: -0.5 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
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

          <NavLinks userEmail={userEmail} pathname={pathname} />

        <motion.button
        type="button"
        onClick={openMenu}
        className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white shadow-sm transition-colors hover:bg-white/15 md:hidden"
        aria-label="Menu"
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav-drawer"
        whileTap={lowPower ? undefined : { scale: 0.97 }}
        whileHover={lowPower ? undefined : { y: -1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className={`fixed inset-0 z-[99] bg-black/40 md:hidden ${lowPower ? '' : 'backdrop-blur-[1px]'}`}
              onClick={closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: lowPower ? 0.1 : 0.16, ease: EASE_SMOOTH }}
            />
            <motion.div
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile menu"
              ref={drawerRef}
              className={`fixed inset-x-3 top-3 z-[100] flex max-h-[min(80dvh,34rem)] flex-col gap-4 overflow-auto rounded-2xl border border-white/12 bg-[rgba(5,13,26,0.9)] p-4 text-white shadow-[0_18px_40px_rgba(0,0,0,0.36)] md:hidden ${lowPower ? '' : 'backdrop-blur-md'}`}
              variants={MOBILE_CONTAINER_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-white">
                  Royal<span className="text-[#c9a84c]">Az</span>
                </span>
                <motion.button
                  type="button"
                  onClick={closeMenu}
                  className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/10 text-white"
                  aria-label="Close menu"
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ y: -1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              <NavLinks userEmail={userEmail} pathname={pathname} onClose={closeMenu} mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
