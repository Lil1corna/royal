import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import NavbarWrapper from '@/components/navbar-wrapper'
import Footer from '@/components/footer'
import { PageTransition } from '@/components/page-transition'
import AuroraBg from '@/components/aurora-bg'
import { jost, cormorant, dmSans } from '@/lib/fonts'
import { ensureCsrfToken } from '@/lib/csrf'

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
  await ensureCsrfToken()

  return (
    <html
      lang="az"
      className={`${jost.variable} ${cormorant.variable} ${dmSans.variable} overflow-x-hidden scroll-smooth`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-transparent antialiased overflow-x-hidden isolate">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-[#050d1a] focus:p-4 focus:text-white focus:ring-2 focus:ring-white"
          >
            Skip to content
          </a>
          <AuroraBg />
          <div className="relative z-[1] flex flex-col min-h-screen">
            <NavbarWrapper />
            <PageTransition className="flex-1">
              <div id="main" className="min-w-0">
                {children}
              </div>
            </PageTransition>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
