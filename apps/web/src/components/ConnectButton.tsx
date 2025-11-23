'use client'

import { useEffect } from 'react'
import { useAppKit } from '@reown/appkit/react'
import { useAccount } from 'wagmi'
import { Terminal } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useOnboardingStore } from '@/store/useOnboardingStore'

export function ConnectButton() {
  const { open } = useAppKit()
  const { isConnected } = useAccount()
  const { markMilestone } = useOnboardingStore()

  useEffect(() => {
    if (isConnected) {
      markMilestone('wallet_connected')
    }
  }, [isConnected, markMilestone])

  if (isConnected) {
    // Use the standard AppKit button for the connected state to get the profile modal
    return <appkit-button />
  }

  // Custom Cyberpunk "Connect" button
  return (
    <button
      onClick={() => open()}
      className={cn(
        "group relative overflow-hidden px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider transition-all",
        "bg-cyan-600 text-zinc-950 hover:bg-cyan-500",
        "clip-path-button"
      )}
    >
      <div className="flex items-center gap-3 relative z-10">
        <Terminal className="w-4 h-4" />
        <span>Connect_Wallet</span>
      </div>
    </button>
  )
}
