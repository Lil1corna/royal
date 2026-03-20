'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useLang, translations } from '@/context/lang'
import { useCart } from '@/context/cart'
import { useWishlist } from '@/context/wishlist'
import { useRouter } from 'next/navigation'

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

  return (
    <>
      <div className="flex border rounded-lg overflow-hidden text-xs font-medium">
        {(['az', 'ru', 'en'] as Lang[]).map(l => (
          <button key={l} onClick={() => setLang(l)}
            className={`px-3 py-1.5 transition-colors ${
              lang === l ? 'bg-black text-white' : 'hover:bg-gray-100'
            }`}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <a
        href="/wishlist"
        onClick={() => onClose?.()}
        className="relative w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all duration-200 hover:-translate-y-0.5"
        title={tr.wishlist[lang]}
      >
        ♡
        {wishCount > 0 && (
          <motion.span
            key={wishCount}
            initial={{ scale: 0.7, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.16 }}
            className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-xs min-w-4 h-4 px-0.5 rounded-full flex items-center justify-center"
          >
            {wishCount}
          </motion.span>
        )}
      </a>
      <button onClick={handleCart}
        className="relative w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all duration-200 hover:-translate-y-0.5">
        🛒
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.7, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.16 }}
            className="absolute -top-1.5 -right-1.5 bg-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
          >
            {count}
          </motion.span>
        )}
      </button>
      {userEmail ? (
        <div className="flex items-center gap-2">
          <a href="/account" onClick={onClose}
            className="btn-secondary text-sm px-3 py-1.5">
            {userEmail.split('@')[0]}
          </a>
          <form action="/auth/signout" method="post">
            <button className="btn-secondary text-sm px-3 py-1.5">
              {tr.signout[lang]}
            </button>
          </form>
        </div>
      ) : (
        <a href="/auth/signin" onClick={onClose}
          className="btn-primary text-sm px-4 py-1.5">
          {tr.signin[lang]}
        </a>
      )}
    </>
  )
}

export default function Navbar({ userEmail }: { userEmail?: string | null }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="text-2xl font-bold tracking-tight">
          Royal<span className="text-amber-500">Az</span>
        </a>

        <div className="hidden md:flex items-center gap-2">
          <NavLinks userEmail={userEmail} />
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"
          aria-label="Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="md:hidden fixed top-0 right-0 w-64 h-full bg-white border-l shadow-lg z-50 p-6 flex flex-col gap-4"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="self-end w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex flex-col gap-4">
                <NavLinks userEmail={userEmail} onClose={() => setMobileOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}
