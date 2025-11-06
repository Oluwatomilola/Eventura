'use client'

import { useState, useEffect } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { motion } from 'framer-motion'
import { Bell, Clock, Calendar, MapPin, Users, ExternalLink } from 'lucide-react'
import type { EventWithWaitlist } from '@/types/waitlist'
import type { EventMetadata } from '@/types/multilang-event'
import { getTranslation, detectUserLanguage } from '@/utils/multilang'

// TODO: Update with actual deployed contract address on Base L2
const EVENT_TICKETING_ADDRESS = process.env.NEXT_PUBLIC_EVENT_TICKETING_ADDRESS || '0x0000000000000000000000000000000000000000'

export function WaitlistManagement() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [language] = useState(detectUserLanguage())

  const [waitlistEvents, setWaitlistEvents] = useState<EventWithWaitlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserWaitlists() {
      if (!address || !publicClient || !isConnected) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // TODO: Replace with actual contract calls
        // Example structure:
        // 1. Get all events
        // 2. Filter events where user is in waitlist
        // 3. Get waitlist position for each event

        // Mock data for development
        const mockEvents: EventWithWaitlist[] = []

        setWaitlistEvents(mockEvents)
      } catch (err) {
        console.error('Error fetching waitlists:', err)
        setError('Failed to load waitlists')
      } finally {
        setLoading(false)
      }
    }

    fetchUserWaitlists()
  }, [address, publicClient, isConnected])

  if (!isConnected) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-gray-300">
          Connect your wallet to view and manage your event waitlists
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-300">Loading waitlists...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  if (waitlistEvents.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Waitlists</h3>
        <p className="text-gray-300 mb-6">
          You're not currently on any event waitlists
        </p>
        <a
          href="/calendar"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          <Calendar className="w-5 h-5" />
          Browse Events
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Waitlists</h2>
          <p className="text-gray-400 mt-1">
            {waitlistEvents.length} event{waitlistEvents.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Waitlist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {waitlistEvents.map((event, index) => (
          <WaitlistCard key={event.eventId.toString()} event={event} index={index} language={language} />
        ))}
      </div>
    </div>
  )
}

// Individual Waitlist Card Component
function WaitlistCard({
  event,
  index,
  language,
}: {
  event: EventWithWaitlist
  index: number
  language: string
}) {
  // Mock event metadata - in production, fetch from IPFS
  const mockMetadata: EventMetadata = {
    version: '1.0',
    defaultLanguage: 'en',
    translations: {
      en: {
        name: 'Sample Event',
        description: 'Event description',
        category: 'Technology',
        location: 'San Francisco, CA',
        venue: 'Tech Hub',
        tags: [],
      },
      es: {
        name: 'Evento de muestra',
        description: 'Descripción del evento',
        category: 'Tecnología',
        location: 'San Francisco, CA',
        venue: 'Tech Hub',
        tags: [],
      },
      fr: {
        name: 'Événement exemple',
        description: 'Description de l\'événement',
        category: 'Technologie',
        location: 'San Francisco, CA',
        venue: 'Tech Hub',
        tags: [],
      },
      de: {
        name: 'Beispielveranstaltung',
        description: 'Veranstaltungsbeschreibung',
        category: 'Technologie',
        location: 'San Francisco, CA',
        venue: 'Tech Hub',
        tags: [],
      },
      ja: {
        name: 'サンプルイベント',
        description: 'イベントの説明',
        category: 'テクノロジー',
        location: 'サンフランシスコ、カリフォルニア州',
        venue: 'テックハブ',
        tags: [],
      },
      zh: {
        name: '示例活动',
        description: '活动描述',
        category: '技术',
        location: '加利福尼亚州旧金山',
        venue: '科技中心',
        tags: [],
      },
      ar: {
        name: 'حدث عينة',
        description: 'وصف الحدث',
        category: 'التكنولوجيا',
        location: 'سان فرانسيسكو، كاليفورنيا',
        venue: 'مركز التكنولوجيا',
        tags: [],
      },
      pt: {
        name: 'Evento de amostra',
        description: 'Descrição do evento',
        category: 'Tecnologia',
        location: 'São Francisco, CA',
        venue: 'Hub de Tecnologia',
        tags: [],
      },
    },
  }

  const translation = getTranslation(mockMetadata, language as any)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors"
    >
      {/* Event Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{translation.name}</h3>
          <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
            {translation.category}
          </span>
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-2 mb-4 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{translation.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{translation.venue}</span>
        </div>
      </div>

      {/* Waitlist Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Your Position</span>
          </div>
          <p className="text-xl font-bold text-white">#{event.userWaitlistPosition}</p>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">Total Waiting</span>
          </div>
          <p className="text-xl font-bold text-white">{event.waitlistCount}</p>
        </div>
      </div>

      {/* Action Button */}
      <a
        href={`/events/${event.eventId}`}
        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
      >
        <span>View Event</span>
        <ExternalLink className="w-4 h-4" />
      </a>
    </motion.div>
  )
}
