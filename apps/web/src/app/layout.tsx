import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppKitProvider } from '@/components/providers/AppkitProviders'
import { WebVitals } from './web-vitals'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Eventura - Decentralized Event Ticketing',
  description: 'The future of event ticketing on Base blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WebVitals />
        <AppKitProvider>
          {children}
        </AppKitProvider>
      </body>
    </html>
  )
}