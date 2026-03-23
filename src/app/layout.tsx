import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import NavbarWrapper from '@/components/navbar-wrapper'
import Footer from '@/components/footer'
import { PageTransition } from '@/components/page-transition'

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
    <html lang="az">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@400;500;600&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#f4f4f5] text-neutral-900 antialiased">
        <Providers>
          <NavbarWrapper />
          <PageTransition className="flex-1">{children}</PageTransition>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
