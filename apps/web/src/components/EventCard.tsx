'use client'

import { useState } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Ticket, ExternalLink, Clock } from 'lucide-react'
import Link from 'next/link'
import type { EventWithMetadata, LanguageCode } from '@/types/multilang-event'
import { getTranslation, detectUserLanguage } from '@/utils/multilang'
import { formatEventDate } from '@/utils/multilang'
import { HCaptcha } from './HCaptcha'
import { rateLimitWallet } from '@/utils/rateLimit'
import { detectBot } from '@/utils/botDetection'
import { parseEther } from 'viem'

// TODO: Update with actual deployed contract address on Base L2
const EVENT_TICKETING_ADDRESS = process.env.NEXT_PUBLIC_EVENT_TICKETING_ADDRESS || '0x0000000000000000000000000000000000000000'

interface EventCardProps {
  event: EventWithMetadata
  language?: LanguageCode
  onPurchaseSuccess?: (ticketId: bigint) => void
  compact?: boolean
}

export function EventCard({
  event,
  language = detectUserLanguage(),
  onPurchaseSuccess,
  compact = false
}: EventCardProps) {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [purchasing, setPurchasing] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const translation = getTranslation(event.metadata, language)

  // Calculate availability
  const soldOut = event.ticketsSold >= event.maxTickets
  const availableTickets = event.maxTickets - event.ticketsSold
  const percentageSold = (Number(event.ticketsSold) / Number(event.maxTickets)) * 100

  // Check if event has started or ended
  const now = Date.now() / 1000
  const hasStarted = now >= Number(event.startTime)
  const hasEnded = now >= Number(event.endTime)

  const handlePurchaseClick = () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    if (soldOut) {
      return // Show waitlist button instead
    }

    if (hasStarted) {
      alert('Event has already started')
      return
    }

    setShowPurchaseModal(true)
  }

  const handlePurchase = async () => {
    if (!walletClient || !address || !publicClient) {
      setError('Wallet not connected')
      return
    }

    if (!captchaToken) {
      setError('Please complete CAPTCHA verification')
      return
    }

    setPurchasing(true)
    setError(null)

    try {
      // Bot detection
      const botCheck = detectBot()
      if (botCheck.isBot && botCheck.confidence > 70) {
        throw new Error('Automated access detected')
      }

      // Rate limiting check
      const rateLimit = await rateLimitWallet(address, 'purchase')
      if (!rateLimit.success) {
        throw new Error(`Rate limit exceeded. Please try again in ${Math.ceil((rateLimit.reset - Date.now()) / 1000)} seconds`)
      }

      // TODO: Replace with actual contract call
      // const hash = await walletClient.writeContract({
      //   address: EVENT_TICKETING_ADDRESS,
      //   abi: EventTicketingABI,
      //   functionName: 'purchaseTicket',
      //   args: [event.id],
      //   value: event.ticketPrice
      // })
      //
      // const receipt = await publicClient.waitForTransactionReceipt({ hash })
      // const ticketId = receipt.logs[0].topics[1] // Extract ticket ID from event

      // Mock success for development
      await new Promise(resolve => setTimeout(resolve, 2000))
      const mockTicketId = BigInt(Math.floor(Math.random() * 1000))

      setShowPurchaseModal(false)
      onPurchaseSuccess?.(mockTicketId)
      alert(`Ticket purchased successfully! Ticket ID: ${mockTicketId}`)

    } catch (err: any) {
      console.error('Purchase error:', err)
      setError(err.message || 'Failed to purchase ticket')
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-white/20 hover:shadow-lg transition-all ${compact ? '' : 'h-full'}`}
      >
        {/* Event Image */}
        {event.metadata.media?.coverImage && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={event.metadata.media.coverImage.replace('ipfs://', 'https://ipfs.io/ipfs/')}
              alt={translation.name}
              className="w-full h-full object-cover"
            />
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              {hasEnded ? (
                <span className="px-3 py-1 bg-gray-600 text-white text-xs font-bold rounded-full">
                  ENDED
                </span>
              ) : soldOut ? (
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                  SOLD OUT
                </span>
              ) : hasStarted ? (
                <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full animate-pulse">
                  LIVE
                </span>
              ) : null}
            </div>
            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                {translation.category}
              </span>
            </div>
          </div>
        )}

        {/* Event Content */}
        <div className="p-4 md:p-6 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">
            {translation.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-300 line-clamp-2 mb-4">
            {translation.description}
          </p>

          {/* Event Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>{formatEventDate(event.startTime, language)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-300">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span className="line-clamp-1">{translation.location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Clock className="w-4 h-4 text-green-400" />
              <span>{translation.venue}</span>
            </div>
          </div>

          {/* Ticket Availability */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-2 text-gray-300">
                <Ticket className="w-4 h-4 text-yellow-400" />
                <span>Available Tickets</span>
              </div>
              <span className={`font-bold ${soldOut ? 'text-red-400' : 'text-green-400'}`}>
                {availableTickets.toString()}/{event.maxTickets.toString()}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  percentageSold >= 90 ? 'bg-red-500' : percentageSold >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${percentageSold}%` }}
              />
            </div>
          </div>

          {/* Price and Actions */}
          <div className="mt-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-400">Price</p>
              <p className="text-2xl font-bold text-white">
                {(Number(event.ticketPrice) / 1e18).toFixed(4)} ETH
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {!hasEnded && (
                <>
                  {soldOut ? (
                    <Link
                      href={`/events/${event.id}#waitlist`}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Join Waitlist
                    </Link>
                  ) : (
                    <button
                      onClick={handlePurchaseClick}
                      disabled={!isConnected || hasStarted}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                    >
                      <Ticket className="w-4 h-4" />
                      {hasStarted ? 'Started' : isConnected ? 'Buy Ticket' : 'Connect Wallet'}
                    </button>
                  )}
                </>
              )}

              <Link
                href={`/events/${event.id}`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
              >
                View Details
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-lg max-w-md w-full p-6 border border-white/20"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Confirm Purchase</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Event:</span>
                <span className="text-white font-medium">{translation.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price:</span>
                <span className="text-white font-medium">{(Number(event.ticketPrice) / 1e18).toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Your Wallet:</span>
                <span className="text-white font-mono text-xs">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="mb-6">
              <HCaptcha
                siteKey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || 'mock-key'}
                onVerify={setCaptchaToken}
                theme="dark"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                disabled={purchasing}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={purchasing || !captchaToken}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purchasing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Confirm Purchase'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
