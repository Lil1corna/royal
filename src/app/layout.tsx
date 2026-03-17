import type { Metadata } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { Providers } from '@/components/providers'
import NavbarWrapper from '@/components/navbar-wrapper'

export const metadata: Metadata = {
  title: 'RoyalAz',
  description: 'Ortopedik Dosekler',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body className="bg-white min-h-screen">
        <Providers>
          <NavbarWrapper />
          {children}
        </Providers>
      </body>
    </html>
  )
}
