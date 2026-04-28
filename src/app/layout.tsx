import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'
import { Providers } from '@/components/providers'
import { isAppLocale, NEXT_LOCALE_COOKIE } from '@/lib/locale-cookie'
import NavbarWrapper from '@/components/navbar-wrapper'
import Footer from '@/components/footer'
import { PageTransition } from '@/components/page-transition'
import AuroraBg from '@/components/aurora-bg'
import MobileBottomNav from '@/components/mobile-bottom-nav'
import { jost, cormorant, dmSans } from '@/lib/fonts'

export const metadata: Metadata = {
  title: 'RoyalAz — Ortopedik Dosekler',
  description: 'RoyalAz — ortopedik dosekler, yastıqlar və topperlər. Keyfiyyətli yuxu üçün.',
  keywords: ['ortopedik dosek', 'matras', 'yastıq', 'topper', 'Bakı', 'Azerbaijan'],
  openGraph: {
    title: 'RoyalAz — Ortopedik Dosekler',
    description: 'Ortopedik dosekler, yastıqlar və topperlər. Keyfiyyətli yuxu üçün.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoyalAz — Ortopedik Dosekler',
    description: 'Ortopedik dosekler, yastıqlar və topperlər.',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const localeRaw = cookieStore.get(NEXT_LOCALE_COOKIE)?.value
  const htmlLang = isAppLocale(localeRaw) ? localeRaw : 'az'

  return (
    <html
      lang={htmlLang}
      className={`${jost.variable} ${cormorant.variable} ${dmSans.variable} overflow-x-hidden scroll-smooth`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-transparent antialiased overflow-x-hidden isolate">
        <Providers initialLang={isAppLocale(localeRaw) ? localeRaw : undefined}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-[#050d1a] focus:p-4 focus:text-white focus:ring-2 focus:ring-white"
          >
            Skip to content
          </a>
          <AuroraBg />
          <div className="relative z-[1] flex flex-col min-h-screen">
            <NavbarWrapper />
            <PageTransition className="flex-1 pb-24 md:pb-0">
              <div id="main" className="min-w-0">
                {children}
              </div>
            </PageTransition>
            <MobileBottomNav />
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
