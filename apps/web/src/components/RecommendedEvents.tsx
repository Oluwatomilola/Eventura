'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Heart, TrendingUp, MapPin, Calendar, DollarSign } from 'lucide-react'
import { useAccount } from 'wagmi'
import type { EventWithMetadata } from '@/types/multilang-event'
import { getTranslation } from '@/utils/multilang'
import {
  generateRecommendations,
  buildUserProfile,
  getCachedRecommendations,
  setCachedRecommendations,
  type RecommendationScore,
} from '@/lib/recommendations'
import { getStoredInteractions, trackInteraction } from '@/lib/userTracking'

interface RecommendedEventsProps {
  allEvents: EventWithMetadata[]
  className?: string
  title?: string
  subtitle?: string
  limit?: number
}

export function RecommendedEvents({
  allEvents,
  className = '',
  title = 'SYSTEM RECOMMENDATIONS',
  subtitle = 'Optimized event selection based on your profile data',
  limit = 6,
}: RecommendedEventsProps) {
  const { address } = useAccount()
  const [recommendedEvents, setRecommendedEvents] = useState<
    Array<{ event: EventWithMetadata; score: RecommendationScore }>
  >([])
  const [loading, setLoading] = useState(true)
  const [showReasons, setShowReasons] = useState<bigint | null>(null)

  useEffect(() => {
    async function loadRecommendations() {
      setLoading(true)

      try {
        // If no events, nothing to recommend. Stop loading immediately.
        if (!allEvents || allEvents.length === 0) {
          setRecommendedEvents([])
          return
        }

        const userId = address || 'anonymous'

        // Check cache first
        const cached = getCachedRecommendations(userId)
        if (cached && cached.length > 0) {
          const events = cached
            .map((score) => {
              const event = allEvents.find((e) => e.id.toString() === score.eventId)
              return event ? { event, score } : null
            })
            .filter((item): item is { event: EventWithMetadata; score: RecommendationScore } => item !== null)

          setRecommendedEvents(events.slice(0, limit))
          return
        }

        // Get user interactions
        const interactions = getStoredInteractions()

        // If no interactions, show popular events (or just first few if no metrics)
        if (interactions.length === 0) {
          const popularEvents = allEvents
            .slice(0, limit)
            .map((event) => ({
              event,
              score: {
                eventId: event.id.toString(),
                score: 1,
                reasons: ['System default: Popularity metric'],
              },
            }))

          setRecommendedEvents(popularEvents)
          return
        }

        // Build user profile
        const userProfile = buildUserProfile(interactions)

        // For demo purposes, we'll use simplified collaborative filtering
        const allProfiles = [userProfile] // Would include other users

        // Generate recommendations
        const recommendations = generateRecommendations(
          allEvents,
          userProfile,
          allProfiles,
          interactions,
          { limit, excludeViewed: false }
        )

        // Cache the recommendations
        setCachedRecommendations(userId, recommendations)

        // Map recommendations to events
        const events = recommendations
          .map((score) => {
            const event = allEvents.find((e) => e.id.toString() === score.eventId)
            return event ? { event, score } : null
          })
          .filter((item): item is { event: EventWithMetadata; score: RecommendationScore } => item !== null)

        setRecommendedEvents(events)
      } catch (error) {
        console.error('Failed to load recommendations:', error)
        // Fallback to first few events
        if (allEvents.length > 0) {
          setRecommendedEvents(
            allEvents.slice(0, limit).map((event) => ({
              event,
              score: { eventId: event.id.toString(), score: 1, reasons: ['Fallback protocol active'] },
            }))
          )
        }
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [allEvents, address, limit])

  const handleEventClick = (eventId: bigint, eventData: EventWithMetadata) => {
    const translation = getTranslation(eventData.metadata, 'en')
    trackInteraction({
      userId: address || 'anonymous',
      eventId: eventId.toString(),
      type: 'view',
      metadata: {
        category: translation.category,
        price: Number(eventData.ticketPrice) / 1e18,
        location: translation.location,
      },
    })
  }

  const handleFavorite = (eventId: bigint, eventData: EventWithMetadata, e: React.MouseEvent) => {
    e.stopPropagation()
    const translation = getTranslation(eventData.metadata, 'en')
    trackInteraction({
      userId: address || 'anonymous',
      eventId: eventId.toString(),
      type: 'favorite',
      metadata: {
        category: translation.category,
        price: Number(eventData.ticketPrice) / 1e18,
        location: translation.location,
      },
    })
  }

  if (loading) {
    return (
      <div className={`py-24 ${className}`}>
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-cyan-500 font-mono text-xs uppercase tracking-widest animate-pulse">Processing_Recommendations...</p>
        </div>
      </div>
    )
  }

  if (recommendedEvents.length === 0) {
    return null
  }

  return (
    <section className={`py-24 bg-zinc-950 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">{title}</h2>
            </div>
            <p className="text-zinc-500 text-sm font-mono uppercase tracking-wider border-l-2 border-cyan-500 pl-3">
              {subtitle}
            </p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-xs text-cyan-900 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 font-mono">
              AI_MODEL: ACTIVE
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedEvents.map(({ event, score }, index) => {
            const translation = getTranslation(event.metadata, 'en')
            const coverImage = event.metadata.media?.coverImage
            const priceInEth = Number(event.ticketPrice) / 1e18
            const eventDate = new Date(Number(event.startTime) * 1000)
            
            return (
              <motion.div
                key={event.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-zinc-900/50 border border-zinc-800 hover:border-cyan-500/50 transition-all cursor-pointer overflow-hidden"
                onClick={() => handleEventClick(event.id, event)}
                onMouseEnter={() => setShowReasons(event.id)}
                onMouseLeave={() => setShowReasons(null)}
              >
                {/* Event Image */}
                <div className="relative h-48 bg-zinc-900 border-b border-zinc-800">
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt={translation.name}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                    />
                  )}
                  
                  {/* Scanlines */}
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => handleFavorite(event.id, event, e)}
                    className="absolute top-3 right-3 p-2 bg-zinc-950/80 border border-zinc-700 hover:border-red-500 hover:text-red-500 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-zinc-400 group-hover:text-red-500" />
                  </button>

                  {/* Recommendation Badge */}
                  {score.score > 5 && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-cyan-900/80 border border-cyan-500/50 backdrop-blur-sm flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-cyan-400" />
                      <span className="text-cyan-400 text-[10px] font-bold font-mono uppercase tracking-wider">Match: 98%</span>
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-3 line-clamp-1 tracking-tight group-hover:text-cyan-400 transition-colors">
                    {translation.name}
                  </h3>

                  <div className="space-y-2 mb-4 font-mono text-xs">
                    {translation.category && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <span className="text-cyan-600">cat_id:</span>
                        <span className="capitalize text-white">{translation.category}</span>
                      </div>
                    )}

                    {translation.location && (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <MapPin className="w-3 h-3 text-zinc-600" />
                        <span>{translation.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-zinc-400">
                      <Calendar className="w-3 h-3 text-zinc-600" />
                      <span>{eventDate.toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-400">
                      <DollarSign className="w-3 h-3 text-zinc-600" />
                      <span className="text-cyan-500 font-bold">{priceInEth.toFixed(4)} ETH</span>
                    </div>
                  </div>

                  {/* Recommendation Reasons */}
                  <div className="h-16 overflow-hidden">
                    {showReasons === event.id && score.reasons.length > 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-2 border-t border-zinc-800"
                      >
                        <p className="text-[10px] text-cyan-600 mb-1 font-mono uppercase">Analyzed Data:</p>
                        <ul className="space-y-1">
                          {score.reasons.slice(0, 2).map((reason, i) => (
                            <li key={i} className="text-[10px] text-zinc-400 flex items-start gap-1 font-mono">
                              <span className="text-cyan-500">&gt;</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ) : (
                      <div className="pt-2 border-t border-zinc-800 opacity-50">
                        <p className="text-[10px] text-zinc-600 font-mono uppercase">Hover for analytics</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
