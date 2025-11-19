import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppKitProvider } from '@/components/providers/AppkitProviders'
import { WebVitals } from './web-vitals'
import { MainNav } from '@/components/MainNav'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

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
          <div className="relative flex min-h-screen flex-col">
            <MainNav />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </AppKitProvider>
      </body>
    </html>
  )
}