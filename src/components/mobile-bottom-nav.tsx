'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useLang, translations } from '@/context/lang'

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { lang } = useLang()
  const tr = translations

  if (/^\/product\/[^/]+/.test(pathname) || pathname.startsWith('/auth/')) {
    return null
  }

  const items = [
    { href: '/', label: tr.catalog[lang], icon: '◈' },
    { href: '/about', label: tr.about[lang], icon: '✦' },
    { href: '/wishlist', label: tr.wishlist[lang], icon: '♡' },
    { href: '/cart', label: tr.cart[lang], icon: '🛒' },
    { href: '/account', label: tr.account[lang], icon: '◉' },
  ]

  return (
    <motion.nav
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-3 bottom-2 z-40 rounded-2xl border border-white/10 bg-[#0a1629]/84 p-1.5 shadow-[0_6px_16px_rgba(0,0,0,0.22)] backdrop-blur-sm md:hidden"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
      <div className="grid grid-cols-5 gap-1.5">
        {items.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <motion.div key={item.href} whileTap={{ scale: 0.97 }} transition={{ duration: 0.1 }}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[44px] flex-col items-center justify-center rounded-xl px-1 py-1 text-center transition-colors duration-200 ${
                  active ? 'bg-white/8 text-[#f2dfae]' : 'text-white/60'
                }`}
              >
                <motion.span
                  className="text-base leading-none"
                  animate={{ scale: active ? 1.06 : 1, color: active ? '#f2dfae' : 'rgba(255,255,255,0.68)' }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  {item.icon}
                </motion.span>
                <span className="mt-1 text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </motion.nav>
  )
}
