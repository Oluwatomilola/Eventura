import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, baseSepolia } from 'viem/chains'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 1. Get projectId from https://cloud.reown.com
const projectId = '982f175981feaa4270a11ee31a1231d6'

// 2. Set up Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [base, baseSepolia],
  projectId,
  ssr: true
})

// 3. Configure the metadata
const metadata = {
  name: 'Eventura',
  description: 'Decentralized Event Ticketing Platform on Base',
  url: 'https://eventura.app',
  icons: ['https://eventura.app/icon.png']
}

// 4. Create AppKit
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [base, baseSepolia],
  metadata,
  projectId,
  features: {
    analytics: true,
    email: false,
    socials: false
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#0052FF', // Base blue
    '--w3m-border-radius-master': '12px'
  }
})

export const wagmiConfig = wagmiAdapter.wagmiConfig