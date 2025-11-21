'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Wallet, AlertCircle, Sparkles } from 'lucide-react'
import { useAccount, usePublicClient } from 'wagmi'
import { ConnectButton } from '@/components/ConnectButton'
import type { EventWithMetadata } from '@/types/multilang-event'
import { detectUserLanguage } from '@/utils/multilang'
import { sortEventsByDate } from '@/utils/calendar'

const EventCalendar = dynamic(
  () => import('@/components/EventCalendar').then((mod) => ({ default: mod.EventCalendar })),
  {
    loading: () => (
      <div className="flex justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
    ssr: false,
  }
)

export function CalendarPageContent() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [events, setEvents] = useState<EventWithMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [language] = useState(detectUserLanguage())

  useEffect(() => {
    async function fetchEvents() {
      if (!isConnected || !publicClient) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const mockEvents: EventWithMetadata[] = []
        const sortedEvents = sortEventsByDate(mockEvents)
        setEvents(sortedEvents)
      } catch (err) {
        console.error('Error fetching events:', err)
        setError('Failed to load events from blockchain')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [isConnected, publicClient, address])

  const handleEventClick = (event: EventWithMetadata) => {
    console.log('Event clicked:', event)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      <header className="relative z-10 px-6 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2" aria-label="Eventura home">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Eventura</span>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-white hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link href="/calendar" className="text-blue-400 font-semibold">
              Calendar
            </Link>
            <Link href="/events" className="text-white hover:text-blue-400 transition-colors">
              Browse Events
            </Link>
            <Link href="/recommendations-demo" className="text-white hover:text-blue-400 transition-colors">
              Recommendation Demo
            </Link>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <ConnectButton />
          </motion.div>
        </nav>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CalendarIcon className="w-12 h-12 text-blue-400" />
            <h1 className="text-5xl font-bold text-white">Event Calendar</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">View and manage all events from Base L2 blockchain</p>
        </motion.div>

        {!isConnected && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto mb-12">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 text-center">
              <Wallet className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-gray-300 mb-4">Connect your wallet via REOWN to view events from Base L2 blockchain</p>
              <ConnectButton />
            </div>
          </motion.div>
        )}

        {isConnected && loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-300 text-lg">Loading events from Base L2...</p>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto mb-12">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Error Loading Events</h3>
              <p className="text-gray-300">{error}</p>
            </div>
          </motion.div>
        )}

        {isConnected && !loading && !error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <EventCalendar events={events} onEventClick={handleEventClick} defaultLanguage={language} />
          </motion.div>
        )}

        {isConnected && !loading && !error && events.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">No Events Found</h3>
              <p className="text-gray-300 mb-6">There are no events available on the Base L2 blockchain yet.</p>
              <Link href="/events" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
                Discover Events
              </Link>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">About Base L2 Integration</h3>
            <div className="space-y-3 text-gray-300">
              <p>✅ Events are stored on Base L2 blockchain for low gas costs</p>
              <p>✅ Event metadata stored on IPFS for decentralized access</p>
              <p>✅ Connected via REOWN (WalletConnect) for secure wallet interaction</p>
              <p>✅ Export events to Google Calendar, Apple Calendar, or Outlook</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

