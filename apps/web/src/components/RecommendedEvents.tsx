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
  title = 'Recommended For You',
  subtitle = 'Events we think you\'ll love based on your preferences',
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
          setLoading(false)
          return
        }

        // Get user interactions
        const interactions = getStoredInteractions()

        // If no interactions, show popular events
        if (interactions.length === 0) {
          const popularEvents = allEvents
            .slice(0, limit)
            .map((event) => ({
              event,
              score: {
                eventId: event.id.toString(),
                score: 1,
                reasons: ['Popular event'],
              },
            }))

          setRecommendedEvents(popularEvents)
          setLoading(false)
          return
        }

        // Build user profile
        const userProfile = buildUserProfile(interactions)

        // For demo purposes, we'll use simplified collaborative filtering
        // In production, this would fetch data from a backend
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
        setRecommendedEvents(
          allEvents.slice(0, limit).map((event) => ({
            event,
            score: { eventId: event.id.toString(), score: 1, reasons: ['Featured event'] },
          }))
        )
      } finally {
        setLoading(false)
      }
    }

    if (allEvents.length > 0) {
      loadRecommendations()
    }
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
      <div className={`py-12 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (recommendedEvents.length === 0) {
    return null
  }

  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-yellow-400" />
          <h2 className="text-4xl font-bold text-white">{title}</h2>
        </div>
        <p className="text-gray-300 text-lg mb-8">{subtitle}</p>

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
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
                onClick={() => handleEventClick(event.id, event)}
                onMouseEnter={() => setShowReasons(event.id)}
                onMouseLeave={() => setShowReasons(null)}
              >
                {/* Event Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt={translation.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => handleFavorite(event.id, event, e)}
                    className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Heart className="w-5 h-5 text-white" />
                  </button>

                  {/* Recommendation Badge */}
                  {score.score > 5 && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500/90 backdrop-blur-sm rounded-full flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-white" />
                      <span className="text-white text-xs font-semibold">Top Pick</span>
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {translation.name}
                  </h3>

                  <div className="space-y-2 mb-4">
                    {translation.category && (
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Sparkles className="w-4 h-4" />
                        <span className="capitalize">{translation.category}</span>
                      </div>
                    )}

                    {translation.location && (
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{translation.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{eventDate.toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <DollarSign className="w-4 h-4" />
                      <span>{priceInEth.toFixed(2)} ETH</span>
                    </div>
                  </div>

                  {/* Recommendation Reasons */}
                  {showReasons === event.id && score.reasons.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-white/20"
                    >
                      <p className="text-xs text-gray-400 mb-1">Why this event?</p>
                      <ul className="space-y-1">
                        {score.reasons.slice(0, 3).map((reason, i) => (
                          <li key={i} className="text-xs text-blue-300 flex items-start gap-1">
                            <span className="text-blue-400">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 border-2 border-blue-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
