import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import NavbarWrapper from '@/components/navbar-wrapper'
import Footer from '@/components/footer'
import { PageTransition } from '@/components/page-transition'
import AuroraBg from '@/components/aurora-bg'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" className={`${jost.variable} ${cormorant.variable} ${dmSans.variable} overflow-x-hidden`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-transparent antialiased overflow-x-hidden">
        <Providers>
          <AuroraBg className="fixed" />
          <NavbarWrapper />
          <PageTransition className="flex-1">{children}</PageTransition>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
