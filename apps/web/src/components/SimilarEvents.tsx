'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, MapPin, Calendar, DollarSign, ArrowRight } from 'lucide-react'
import { useAccount } from 'wagmi'
import type { EventWithMetadata } from '@/types/multilang-event'
import { getTranslation } from '@/utils/multilang'
import { findSimilarEvents } from '@/lib/recommendations'
import { trackInteraction } from '@/lib/userTracking'

interface SimilarEventsProps {
  currentEvent: EventWithMetadata
  allEvents: EventWithMetadata[]
  className?: string
  title?: string
  limit?: number
  onEventClick?: (event: EventWithMetadata) => void
}

export function SimilarEvents({
  currentEvent,
  allEvents,
  className = '',
  title = 'Similar Events You Might Like',
  limit = 4,
  onEventClick,
}: SimilarEventsProps) {
  const { address } = useAccount()
  const [hoveredEvent, setHoveredEvent] = useState<bigint | null>(null)

  // Find similar events using content-based similarity
  const similarEvents = useMemo(() => {
    return findSimilarEvents(currentEvent, allEvents, limit)
  }, [currentEvent, allEvents, limit])

  const handleEventClick = (event: EventWithMetadata) => {
    const translation = getTranslation(event.metadata, 'en')
    // Track interaction
    trackInteraction({
      userId: address || 'anonymous',
      eventId: event.id.toString(),
      type: 'view',
      metadata: {
        category: translation.category,
        price: Number(event.ticketPrice) / 1e18,
        location: translation.location,
      },
    })

    // Call parent handler if provided
    onEventClick?.(event)
  }

  if (similarEvents.length === 0) {
    return null
  }

  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Lightbulb className="w-8 h-8 text-blue-400" />
          <h2 className="text-3xl font-bold text-white">{title}</h2>
        </div>
        <p className="text-gray-300 text-lg mb-8">
          Based on the category, price, and location of this event
        </p>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {similarEvents.map((event, index) => {
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
                onClick={() => handleEventClick(event)}
                onMouseEnter={() => setHoveredEvent(event.id)}
                onMouseLeave={() => setHoveredEvent(null)}
              >
                {/* Event Image */}
                <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600">
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt={translation.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Category Badge */}
                  {translation.category && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
                      <span className="text-white text-xs font-semibold capitalize">
                        {translation.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {translation.name}
                  </h3>

                  <div className="space-y-1.5 mb-3">
                    {translation.location && (
                      <div className="flex items-center gap-2 text-gray-300 text-xs">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{translation.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-300 text-xs">
                      <Calendar className="w-3 h-3" />
                      <span>{eventDate.toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-300 text-xs">
                      <DollarSign className="w-3 h-3" />
                      <span>{priceInEth.toFixed(2)} ETH</span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredEvent === event.id ? 1 : 0 }}
                    className="flex items-center gap-1 text-blue-400 text-sm font-semibold"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
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
