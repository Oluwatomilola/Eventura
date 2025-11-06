'use client'

import { useState, useEffect } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, UserMinus, Bell, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import type { WaitlistStatus } from '@/types/waitlist'

// TODO: Update with actual deployed contract address on Base L2
const EVENT_TICKETING_ADDRESS = process.env.NEXT_PUBLIC_EVENT_TICKETING_ADDRESS || '0x0000000000000000000000000000000000000000'

interface WaitlistButtonProps {
  eventId: bigint
  isSoldOut: boolean
  onJoinSuccess?: () => void
  onLeaveSuccess?: () => void
}

export function WaitlistButton({
  eventId,
  isSoldOut,
  onJoinSuccess,
  onLeaveSuccess,
}: WaitlistButtonProps) {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [waitlistStatus, setWaitlistStatus] = useState<WaitlistStatus>({
    isInWaitlist: false,
    position: 0,
    totalInWaitlist: 0,
    ticketsAvailable: 0,
    hasBeenNotified: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch waitlist status
  useEffect(() => {
    async function fetchWaitlistStatus() {
      if (!address || !publicClient || !isConnected) return

      try {
        // TODO: Replace with actual contract ABI calls
        // Example structure:
        // const position = await publicClient.readContract({
        //   address: EVENT_TICKETING_ADDRESS,
        //   abi: EventTicketingABI,
        //   functionName: 'getWaitlistPosition',
        //   args: [eventId, address]
        // })

        // Mock data for development
        setWaitlistStatus({
          isInWaitlist: false,
          position: 0,
          totalInWaitlist: 0,
          ticketsAvailable: 0,
          hasBeenNotified: false,
        })
      } catch (err) {
        console.error('Error fetching waitlist status:', err)
      }
    }

    fetchWaitlistStatus()
  }, [address, eventId, publicClient, isConnected])

  const handleJoinWaitlist = async () => {
    if (!address || !walletClient) {
      setError('Please connect your wallet')
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // TODO: Replace with actual contract write
      // const hash = await walletClient.writeContract({
      //   address: EVENT_TICKETING_ADDRESS,
      //   abi: EventTicketingABI,
      //   functionName: 'joinWaitlist',
      //   args: [eventId]
      // })
      //
      // await publicClient.waitForTransactionReceipt({ hash })

      // Mock success for development
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setWaitlistStatus((prev) => ({
        ...prev,
        isInWaitlist: true,
        position: prev.totalInWaitlist + 1,
        totalInWaitlist: prev.totalInWaitlist + 1,
      }))

      setSuccessMessage('Successfully joined the waitlist!')
      onJoinSuccess?.()
    } catch (err: any) {
      console.error('Error joining waitlist:', err)
      setError(err.message || 'Failed to join waitlist')
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveWaitlist = async () => {
    if (!address || !walletClient) {
      setError('Please connect your wallet')
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // TODO: Replace with actual contract write
      // const hash = await walletClient.writeContract({
      //   address: EVENT_TICKETING_ADDRESS,
      //   abi: EventTicketingABI,
      //   functionName: 'leaveWaitlist',
      //   args: [eventId]
      // })
      //
      // await publicClient.waitForTransactionReceipt({ hash })

      // Mock success for development
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setWaitlistStatus({
        isInWaitlist: false,
        position: 0,
        totalInWaitlist: waitlistStatus.totalInWaitlist - 1,
        ticketsAvailable: 0,
        hasBeenNotified: false,
      })

      setSuccessMessage('Successfully left the waitlist')
      onLeaveSuccess?.()
    } catch (err: any) {
      console.error('Error leaving waitlist:', err)
      setError(err.message || 'Failed to leave waitlist')
    } finally {
      setLoading(false)
    }
  }

  // Don't show button if event is not sold out
  if (!isSoldOut) return null

  // Not connected state
  if (!isConnected) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-400">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">Connect wallet to join waitlist</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Status Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <p>{successMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waitlist Status Card */}
      {waitlistStatus.isInWaitlist ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">On Waitlist</h3>
              </div>
              <p className="text-gray-300 text-sm">
                You'll be notified when tickets become available
              </p>
            </div>
            {waitlistStatus.hasBeenNotified && (
              <span className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                Notified
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Your Position</span>
              </div>
              <p className="text-2xl font-bold text-white">#{waitlistStatus.position}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <UserPlus className="w-4 h-4" />
                <span className="text-xs font-medium">Total Waiting</span>
              </div>
              <p className="text-2xl font-bold text-white">{waitlistStatus.totalInWaitlist}</p>
            </div>
          </div>

          <button
            onClick={handleLeaveWaitlist}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <UserMinus className="w-5 h-5" />
                <span>Leave Waitlist</span>
              </>
            )}
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 rounded-lg p-6"
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">Event Sold Out</h3>
            <p className="text-gray-300 text-sm">
              Join the waitlist to get notified when tickets become available due to refunds or cancellations.
            </p>
          </div>

          {waitlistStatus.totalInWaitlist > 0 && (
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
              <UserPlus className="w-4 h-4" />
              <span>{waitlistStatus.totalInWaitlist} people already on waitlist</span>
            </div>
          )}

          <button
            onClick={handleJoinWaitlist}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Joining...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Join Waitlist</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Waitlist Info */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-2">How it works</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">✓</span>
            <span>When someone refunds their ticket, you'll be notified on-chain</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">✓</span>
            <span>Priority given based on waitlist position (first come, first served)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">✓</span>
            <span>You can leave the waitlist anytime with no cost</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
