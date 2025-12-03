import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppKitProvider } from '@/components/providers/AppkitProviders'
import { WebVitals } from './web-vitals'
import { Onboarding } from '@/components/Onboarding'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: 'Eventura - Decentralized Event Ticketing',
  description: 'The future of event ticketing on Base blockchain',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <WebVitals />
        <AppKitProvider>
          <Onboarding />
          {children}
        </AppKitProvider>
      </body>
    </html>
  )
}
