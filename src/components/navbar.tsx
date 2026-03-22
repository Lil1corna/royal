'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { useLang, translations } from '@/context/lang'
import { useCart } from '@/context/cart'
import { useWishlist } from '@/context/wishlist'
import { useRouter } from 'next/navigation'
import Magnetic from '@/components/magnetic'

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
    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 border border-neutral-200/90 bg-white text-neutral-900 hover:border-amber-300 hover:bg-amber-50 hover:shadow-sm'

  return (
    <>
      <Link href="/" onClick={() => onClose?.()} className={pill}>
        <span className="text-amber-600">◇</span>
        {tr.catalog[lang]}
      </Link>

      <div className="flex rounded-full border border-neutral-300 bg-neutral-100 p-0.5 shadow-inner text-xs font-semibold">
        {(['az', 'ru', 'en'] as Lang[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
              lang === l
                ? 'bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-md'
                : 'text-neutral-800 hover:bg-white'
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <Link
        href="/wishlist"
        onClick={() => onClose?.()}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md"
        title={tr.wishlist[lang]}
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
        className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-amber-400/50 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-lg shadow-lg shadow-amber-900/20 transition-shadow hover:shadow-amber-500/25"
        aria-label={tr.cart[lang]}
      >
        <span className="drop-shadow-sm">🛒</span>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
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
            className="rounded-full border border-neutral-200 bg-white/80 px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
          >
            {userEmail.split('@')[0]}
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-full border border-neutral-200 bg-white/80 px-3 py-2 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-50"
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

  return (
    <motion.nav
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-neutral-200/90 bg-white/95 text-neutral-900 backdrop-blur-xl shadow-[0_4px_24px_rgba(15,23,42,0.08)]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[4.25rem] flex items-center justify-between gap-3">
        <Link href="/" className="group flex items-center gap-1 shrink-0">
          <motion.span
            className="text-2xl font-bold tracking-tight text-neutral-900"
            whileHover={{ scale: 1.02 }}
          >
            Royal
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
              Az
            </span>
          </motion.span>
          <motion.span
            className="hidden sm:inline-block h-2 w-2 rounded-full bg-amber-400 opacity-0 group-hover:opacity-100"
            layoutId="nav-dot"
            transition={{ type: 'spring', stiffness: 300 }}
          />
        </Link>

        <div className="hidden lg:flex items-center gap-1.5 flex-wrap justify-end">
          <NavLinks userEmail={userEmail} />
        </div>

        <motion.button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-900 shadow-sm"
          aria-label="Menu"
          whileTap={{ scale: 0.95 }}
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
              className="lg:hidden fixed inset-0 bg-black/45 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="lg:hidden fixed top-0 right-0 w-[min(100%,20rem)] h-full bg-white text-neutral-900 backdrop-blur-xl border-l border-neutral-200 shadow-2xl z-50 p-5 flex flex-col gap-5"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-neutral-900">
                  Royal<span className="text-amber-600">Az</span>
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="h-10 w-10 rounded-xl border border-neutral-200 flex items-center justify-center hover:bg-neutral-50"
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
