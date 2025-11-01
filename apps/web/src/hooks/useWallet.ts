import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { base, baseSepolia } from 'viem/chains'
import { useAppKit } from '@reown/appkit/react'

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { open } = useAppKit()
  
  const { data: balance } = useBalance({
    address,
  })

  const isOnBase = chainId === base.id || chainId === baseSepolia.id
  
  const switchToBase = () => {
    switchChain({ chainId: base.id })
  }

  const switchToBaseSepolia = () => {
    switchChain({ chainId: baseSepolia.id })
  }

  return {
    address,
    isConnected,
    isConnecting,
    balance,
    chainId,
    isOnBase,
    switchToBase,
    switchToBaseSepolia,
    openConnectModal: open,
  }
}