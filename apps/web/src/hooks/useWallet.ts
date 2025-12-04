import { useAccount, useBalance, useChainId, useSwitchChain, useDisconnect } from 'wagmi'
import { base, baseSepolia } from 'viem/chains'
import { useAppKit, useAppKitState } from '@reown/appkit/react'
import { useEffect } from 'react'
import { useBlockchainToast } from './useToast'

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
  const toast = useBlockchainToast()

  // Fetch balance with proper typing
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address,
  })

  const isOnBase = chainId === base.id || chainId === baseSepolia.id
  const isOnMainnet = chainId === base.id
  const isOnTestnet = chainId === baseSepolia.id

  // Toast notifications for wallet events
  useEffect(() => {
    if (isConnected && address) {
      toast.walletConnected(address)
    }
  }, [isConnected, address])

  const switchToBase = () => {
    if (!isConnected) return
    toast.networkSwitching('Base')
    switchChain(
      { chainId: base.id },
      {
        onSuccess: () => toast.networkSwitched('Base'),
        onError: () => toast.networkSwitchFailed('Base'),
      }
    )
  }

  const switchToBaseSepolia = () => {
    if (!isConnected) return
    toast.networkSwitching('Base Sepolia')
    switchChain(
      { chainId: baseSepolia.id },
      {
        onSuccess: () => toast.networkSwitched('Base Sepolia'),
        onError: () => toast.networkSwitchFailed('Base Sepolia'),
      }
    )
  }

  const handleDisconnect = () => {
    disconnect()
    toast.walletDisconnected()
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
    disconnect: handleDisconnect,
  }
}