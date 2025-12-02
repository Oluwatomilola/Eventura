import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, baseSepolia } from '@reown/appkit/networks'

// 1. Get projectId from https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined in environment variables')
}

// 2. Set up Wagmi adapter with proper configuration
// WagmiAdapter automatically configures WalletConnect, Coinbase, and Injected connectors
const wagmiAdapter = new WagmiAdapter({
  networks: [base, baseSepolia],
  projectId,
  ssr: true
})

// 3. Configure the metadata
const metadata = {
  name: 'Eventura',
  description: 'Decentralized Event Ticketing Platform on Base',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://eventura.app',
  icons: ['https://avatars.githubusercontent.com/u/eventura']
}

// 4. Create AppKit with proper configuration
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [base, baseSepolia],
  defaultNetwork: base,
  metadata,
  projectId,
  features: {
    analytics: true, // Enable REOWN analytics
    onramp: true, // Enable on-ramp providers for buying crypto
    swaps: false, // Disable swaps for now
    email: false, // Can enable email login if needed
    socials: false, // Can enable social logins if needed
    allWallets: true, // Show all available wallets
    emailShowWallets: true // Show wallets even with email enabled
  },
  allowUnsupportedChain: false, // Strict chain validation
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': 'Inter, system-ui, sans-serif',
    '--w3m-accent': '#0052FF', // Base blue
    '--w3m-color-mix': '#0052FF',
    '--w3m-color-mix-strength': 20,
    '--w3m-border-radius-master': '12px',
    '--w3m-font-size-master': '10px',
    '--w3m-z-index': 9999
  }
})

export const wagmiConfig = wagmiAdapter.wagmiConfig