import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useWallet } from '@/hooks/useWallet'

export interface EventCreationResult {
  success: boolean
  eventId?: string
  txHash?: string
  error?: string
}

export function useEventCreation() {
  const [isLoading, setIsLoading] = useState(false)
  const { address } = useAccount()
  const { chainId } = useWallet()

  const createEvent = async (eventData: any): Promise<EventCreationResult> => {
    if (!address) {
      return { success: false, error: 'Wallet not connected' }
    }

    setIsLoading(true)
    try {
      // Step 1: Create event metadata via API
      const apiResponse = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          chainId,
          ...eventData,
        }),
      })

      if (!apiResponse.ok) {
        const error = await apiResponse.json()
        return { success: false, error: error.error || 'Failed to create event metadata' }
      }

      const { data } = await apiResponse.json()

      // Step 2: Execute transaction via wallet
      if (typeof window !== 'undefined' && window.ethereum) {
        const txHash = await (window.ethereum as any).request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: address,
              to: data.to,
              data: data.data,
              value: data.value,
              gas: data.estimatedGas,
            },
          ],
        })

        // Step 3: Wait for confirmation and get event ID
        // In a real implementation, you would poll the contract or listen for events
        // For now, we'll use a mock event ID
        const eventId = Math.floor(Math.random() * 1000000).toString()

        return {
          success: true,
          eventId,
          txHash,
        }
      } else {
        return { success: false, error: 'No Ethereum provider found' }
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create event' }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createEvent,
    isLoading,
  }
}