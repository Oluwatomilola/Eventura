'use client'

import { wagmiConfig } from '@/lib/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { ReactNode, useState, useEffect } from 'react'
import { ThemeProvider } from '@/components/theme/theme-provider'

/**
 * AppKitProvider Component
 *
 * Root provider for REOWN AppKit integration.
 * Sets up Wagmi, React Query, and theme providers.
 *
 * Best Practices:
 * - Initializes AppKit outside React components (done in @/lib/wagmi)
 * - Handles SSR hydration mismatch prevention
 * - Provides proper QueryClient configuration
 * - Integrates with app theme system
 */

export function AppKitProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Initialize QueryClient with proper defaults for Web3
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 2,
            staleTime: 30_000, // 30 seconds
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  // Prevent hydration mismatch for SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </QueryClientProvider>
      </WagmiProvider>
    )
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}