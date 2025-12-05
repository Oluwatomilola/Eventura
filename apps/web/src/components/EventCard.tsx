'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, Ticket, ExternalLink, Clock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { EventWithMetadata, LanguageCode } from '@/types/multilang-event'
import { getTranslation, detectUserLanguage } from '@/utils/multilang'
import { formatEventDate } from '@/utils/multilang'
import { HCaptcha } from './HCaptcha'
import { rateLimitWallet } from '@/utils/rateLimit'
import { detectBot } from '@/utils/botDetection'
import { parseEther } from 'viem'
import { useOnboardingStore } from '@/store/useOnboardingStore'

const EVENT_TICKETING_ADDRESS = process.env.NEXT_PUBLIC_EVENT_TICKETING_ADDRESS || '0x0000000000000000000000000000000000000000'

interface EventCardProps {
  event: EventWithMetadata | null
  language?: LanguageCode
  onPurchaseSuccess?: (ticketId: bigint) => void
  compact?: boolean
  isLoading?: boolean
  skeletonCount?: number
}

export function EventCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex flex-col bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden ${compact ? '' : 'h-full'}`}>
      <div className="relative h-40 sm:h-48 overflow-hidden bg-white/10"></div>
      <div className="p-4 md:p-6 flex-1 flex flex-col">
        <div className="h-7 w-3/4 bg-white/10 rounded mb-3"></div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
        </div>
        <div className="mt-auto pt-4">
          <div className="h-10 w-full bg-white/10 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export function EventCardSkeletonList({ count = 4, compact = false }: { count?: number, compact?: boolean }) {
  return (
    <div className={`${compact ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} grid gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} compact={compact} />
      ))}
    </div>
  )
}

export function EventCard({
  event,
  language = detectUserLanguage(),
  onPurchaseSuccess,
  compact = false,
  isLoading = false,
  skeletonCount = 4
}: EventCardProps) {
  // If loading, return skeleton
  if (isLoading || !event) {
    return <EventCardSkeletonList count={skeletonCount} compact={compact} />
  }

  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { markMilestone, markFeatureAsSeen, seenFeatures } = useOnboardingStore()

  const [purchasing, setPurchasing] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDetailTooltip, setShowDetailTooltip] = useState(false)

  useEffect(() => {
    if (!seenFeatures['view_event_detail']) {
      const timer = setTimeout(() => setShowDetailTooltip(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [seenFeatures])

  const dismissTooltip = () => {
    setShowDetailTooltip(false)
    markFeatureAsSeen('view_event_detail')
  }

  const translation = getTranslation(event.metadata, language)
  const soldOut = event.ticketsSold >= event.maxTickets
  const availableTickets = event.maxTickets - event.ticketsSold
  const percentageSold = (Number(event.ticketsSold) / Number(event.maxTickets)) * 100
  const now = Date.now() / 1000
  const hasStarted = now >= Number(event.startTime)
  const hasEnded = now >= Number(event.endTime)

  const handlePurchaseClick = () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    if (soldOut) return
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
      const botCheck = detectBot()
      if (botCheck.isBot && botCheck.confidence > 70) {
        throw new Error('Automated access detected')
      }

      const rateLimit = await rateLimitWallet(address, 'purchase')
      if (!rateLimit.success) {
        throw new Error(`Rate limit exceeded. Please try again in ${Math.ceil((rateLimit.reset - Date.now()) / 1000)} seconds`)
      }

      // Mock success for development
      await new Promise(resolve => setTimeout(resolve, 2000))
      const mockTicketId = BigInt(Math.floor(Math.random() * 1000))
      
      markMilestone('first_ticket_purchased')
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`flex flex-col bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-white/20 hover:shadow-lg transition-all ${
          compact ? '' : 'h-full'
        }`}
      >
        {/* Event Image */}
        {event.metadata.media?.coverImage && (
          <div className="relative h-40 sm:h-48 overflow-hidden">
            <img
              src={event.metadata.media.coverImage.replace('ipfs://', 'https://ipfs.io/ipfs/')}
              alt={translation.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Status Badge */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
              {hasEnded ? (
                <span className="px-2 py-1 sm:px-3 sm:py-1 bg-gray-600 text-white text-[10px] sm:text-xs font-bold rounded-full">
                  ENDED
                </span>
              ) : soldOut ? (
                <span className="px-2 py-1 sm:px-3 sm:py-1 bg-red-600 text-white text-[10px] sm:text-xs font-bold rounded-full">
                  SOLD OUT
                </span>
              ) : hasStarted ? (
                <span className="px-2 py-1 sm:px-3 sm:py-1 bg-green-600 text-white text-[10px] sm:text-xs font-bold rounded-full animate-pulse">
                  LIVE
                </span>
              ) : null}
            </div>
            {/* Category Badge */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
              <span className="px-2 py-1 sm:px-3 sm:py-1 bg-blue-600 text-white text-[10px] sm:text-xs font-bold rounded-full">
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
                      disabled={!isConnected || hasStarted || purchasing}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all min-w-[120px]"
                    >
                      {purchasing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Ticket className="w-4 h-4" />
                          {hasStarted ? 'Started' : isConnected ? 'Buy Ticket' : 'Connect Wallet'}
                        </>
                      )}
                    </button>
                  )}
                </>
              )}

              <Link
                href={`/events/${event.id}`}
                className="relative flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-white text-white font-semibold transition-colors"
              >
                {showDetailTooltip && (
                  <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-zinc-950 border border-cyan-500 p-4 shadow-[0_0_20px_rgba(6,182,212,0.3)] z-50 animate-bounce-subtle">
                    <h4 className="text-cyan-500 font-mono text-xs uppercase tracking-wider mb-2">System Hint</h4>
                    <p className="text-xs text-zinc-300 mb-3">Inspect event parameters and attendee manifests here.</p>
                    <button 
                      onClick={(e) => { e.preventDefault(); dismissTooltip() }}
                      className="text-xs font-mono uppercase text-white border-b border-white/50 hover:border-white"
                    >
                      Acknowledge
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-cyan-500" />
                  </div>
                )}
                <span>VIEW_DATA</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Purchase'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  )
}
