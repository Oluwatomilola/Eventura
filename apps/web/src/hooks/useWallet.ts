import { useAccount, useBalance, useChainId, useSwitchChain, useDisconnect } from 'wagmi'
import { base, baseSepolia } from 'viem/chains'
import { useAppKit, useAppKitState } from '@reown/appkit/react'

/**
 * useWallet Hook
 *
 * Unified wallet interaction hook leveraging REOWN AppKit and Wagmi.
 *
 * Features:
 * - Account connection state
 * - Balance fetching
 * - Network switching (Base/Base Sepolia)
 * - Modal control
 * - AppKit state tracking
 *
 * @returns Wallet state and actions
 */

export function useWallet() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const { disconnect } = useDisconnect()
  const { open, close } = useAppKit()
  const { open: modalOpen, selectedNetworkId } = useAppKitState()

  // Fetch balance with proper typing
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address,
  })

  const isOnBase = chainId === base.id || chainId === baseSepolia.id
  const isOnMainnet = chainId === base.id
  const isOnTestnet = chainId === baseSepolia.id

  const switchToBase = () => {
    if (!isConnected) return
    switchChain({ chainId: base.id })
  }

  const switchToBaseSepolia = () => {
    if (!isConnected) return
    switchChain({ chainId: baseSepolia.id })
  }

  return {
    // Account state
    address,
    isConnected,
    isConnecting,
    isReconnecting,

    // Balance
    balance,
    isBalanceLoading,

    // Network state
    chainId,
    isOnBase,
    isOnMainnet,
    isOnTestnet,
    selectedNetworkId,

    // Network actions
    switchToBase,
    switchToBaseSepolia,
    switchChain,
    isSwitching,

    // Modal control
    openConnectModal: open,
    closeModal: close,
    isModalOpen: modalOpen,

    // Account actions
    disconnect,
  }
}