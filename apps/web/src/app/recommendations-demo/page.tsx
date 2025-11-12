'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, User, BarChart3, RefreshCw, Trash2 } from 'lucide-react'
import { useAccount } from 'wagmi'
import { RecommendedEvents } from '@/components/RecommendedEvents'
import { SimilarEvents } from '@/components/SimilarEvents'
import { sampleEvents } from '@/data/sampleEvents'
import { getTranslation } from '@/utils/multilang'
import type { EventWithMetadata } from '@/types/multilang-event'
import {
  getStoredInteractions,
  getInteractionStats,
  clearInteractions,
  trackInteraction,
} from '@/lib/userTracking'
import type { UserInteraction } from '@/lib/recommendations'
import { buildUserProfile, clearRecommendationCache } from '@/lib/recommendations'

export default function RecommendationsDemoPage() {
  const { address, isConnected } = useAccount()
  const [interactions, setInteractions] = useState<UserInteraction[]>([])
  const [stats, setStats] = useState<ReturnType<typeof getInteractionStats> | null>(null)
  const [selectedEvent, setSelectedEvent] = useState(sampleEvents[0])
  const [refreshKey, setRefreshKey] = useState(0)

  // Load interactions
  useEffect(() => {
    loadInteractions()
  }, [refreshKey])

  const loadInteractions = () => {
    const stored = getStoredInteractions()
    setInteractions(stored)
    setStats(getInteractionStats())
  }

  const handleClearData = () => {
    clearInteractions()
    clearRecommendationCache()
    setRefreshKey((prev) => prev + 1)
  }

  const handleSimulateInteraction = (
    type: UserInteraction['type'],
    eventId?: string
  ) => {
    const event = eventId
      ? sampleEvents.find((e) => e.id.toString() === eventId)
      : sampleEvents[Math.floor(Math.random() * sampleEvents.length)]

    if (!event) return

    const translation = getTranslation(event.metadata, 'en')

    trackInteraction({
      userId: address || 'anonymous',
      eventId: event.id.toString(),
      type,
      metadata: {
        category: translation.category,
        price: Number(event.ticketPrice) / 1e18,
        location: translation.location,
      },
    })

    setRefreshKey((prev) => prev + 1)
  }

  const userProfile = interactions.length > 0 ? buildUserProfile(interactions) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-yellow-400" />
            <h1 className="text-5xl font-bold text-white">Recommendation System Demo</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Test and explore the AI-powered event recommendation engine
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-6 h-6" />
              Simulate User Interactions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={() => handleSimulateInteraction('view')}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-colors"
              >
                + View Event
              </button>
              <button
                onClick={() => handleSimulateInteraction('favorite')}
                className="px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-pink-300 rounded-lg transition-colors"
              >
                + Favorite Event
              </button>
              <button
                onClick={() => handleSimulateInteraction('purchase')}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg transition-colors"
              >
                + Purchase Event
              </button>
              <button
                onClick={() => handleSimulateInteraction('share')}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg transition-colors"
              >
                + Share Event
              </button>
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              User Profile Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Total Interactions</p>
                <p className="text-3xl font-bold text-white">{stats?.total || 0}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Views</p>
                <p className="text-3xl font-bold text-blue-400">
                  {stats?.byType.view || 0}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Favorites</p>
                <p className="text-3xl font-bold text-pink-400">
                  {stats?.byType.favorite || 0}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Purchases</p>
                <p className="text-3xl font-bold text-green-400">
                  {stats?.byType.purchase || 0}
                </p>
              </div>
            </div>

            {/* Category Preferences */}
            {userProfile && Object.keys(userProfile.preferences.categories).length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Category Preferences
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(userProfile.preferences.categories)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, score]) => (
                      <div
                        key={category}
                        className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full"
                      >
                        <span className="text-purple-300 capitalize">{category}</span>
                        <span className="text-purple-400 ml-2 text-sm">
                          {score.toFixed(1)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            {userProfile && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Price Range</h3>
                <p className="text-gray-300">
                  ${userProfile.preferences.priceRange.min} - $
                  {userProfile.preferences.priceRange.max}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recommended Events */}
        <RecommendedEvents
          key={refreshKey}
          allEvents={sampleEvents}
          className="mb-8"
          title="Personalized Recommendations"
          subtitle="Events tailored to your preferences and behavior"
          limit={6}
        />

        {/* Similar Events Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Similar Events Feature</h2>
            <p className="text-gray-300 mb-4">
              Select an event below to see similar events based on content similarity:
            </p>
            <div className="flex flex-wrap gap-2">
              {sampleEvents.slice(0, 5).map((event) => {
                const translation = getTranslation(event.metadata, 'en')
                return (
                  <button
                    key={event.id.toString()}
                    onClick={() => setSelectedEvent(event)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedEvent.id === event.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {translation.name}
                  </button>
                )
              })}
            </div>
          </div>

          <SimilarEvents
            currentEvent={selectedEvent}
            allEvents={sampleEvents}
            limit={4}
          />
        </motion.div>

        {/* Algorithm Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Content-Based Filtering
                </h3>
                <p className="text-sm">
                  Recommends events based on your category preferences, price range, and
                  location history.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Collaborative Filtering
                </h3>
                <p className="text-sm">
                  Finds users with similar preferences and recommends events they enjoyed
                  using cosine similarity.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Popularity & Recency
                </h3>
                <p className="text-sm">
                  Boosts trending events and applies time decay to keep recommendations
                  fresh and relevant.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-300 mb-2">Weighting System</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-300">
                <div>Purchase: <span className="text-white font-semibold">1.0</span></div>
                <div>Favorite: <span className="text-white font-semibold">0.7</span></div>
                <div>Share: <span className="text-white font-semibold">0.5</span></div>
                <div>View: <span className="text-white font-semibold">0.3</span></div>
                <div>Category: <span className="text-white font-semibold">0.8</span></div>
                <div>Location: <span className="text-white font-semibold">0.6</span></div>
                <div>Price: <span className="text-white font-semibold">0.5</span></div>
                <div>Popularity: <span className="text-white font-semibold">0.4</span></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
