'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Wallet, AlertCircle, Home, Sparkles } from 'lucide-react'
import { ConnectButton } from '@/components/ConnectButton'
import type { EventWithMetadata } from '@/types/multilang-event'
import { fetchEventMetadata, detectUserLanguage } from '@/utils/multilang'
import { sortEventsByDate } from '@/utils/calendar'

// Code-split EventCalendar component for better performance
// Only loaded when user is connected and ready to view events
const EventCalendar = dynamic(
  () => import('@/components/EventCalendar').then(mod => ({ default: mod.EventCalendar })),
  {
    loading: () => (
      <div className="flex justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
    ssr: false
  }
)

// Import contract ABI (will need to be added)
// TODO: Update with actual deployed contract address on Base L2
const EVENT_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_EVENT_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000'

export default function CalendarPage() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [events, setEvents] = useState<EventWithMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [language] = useState(detectUserLanguage())

  // Fetch events from Base L2 blockchain via REOWN connection
  useEffect(() => {
    async function fetchEvents() {
      if (!isConnected || !publicClient) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // TODO: Replace with actual contract ABI
        // For now, using mock data structure
        // In production, this would use:
        // const contract = getContract({
        //   address: EVENT_FACTORY_ADDRESS,
        //   abi: EventFactoryABI,
        //   client: publicClient,
        // })
        // const eventCount = await contract.read.eventCount()
        // Loop through events and fetch metadata from IPFS

        // Mock implementation - replace with actual blockchain read
        const mockEvents: EventWithMetadata[] = []

        // Example of how to fetch from contract:
        // for (let i = 0; i < eventCount; i++) {
        //   const event = await contract.read.getEvent([i])
        //   const metadata = await fetchEventMetadata(event.metadataURI)
        //   mockEvents.push({ ...event, metadata })
        // }

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

  // Handle event click
  const handleEventClick = (event: EventWithMetadata) => {
    console.log('Event clicked:', event)
    // Future: Navigate to event detail page or open modal
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-cyan-500/30">
      {/* Grid Background */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }} 
      />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center group-hover:border-cyan-500 transition-colors">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">EVENTURA</span>
            </a>
          </motion.div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <a href="/" className="text-zinc-400 hover:text-white transition-colors">
              HOME
            </a>
            <a href="/calendar" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              CALENDAR
            </a>
            <a href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
              DASHBOARD
            </a>
            <a href="#" className="text-zinc-400 hover:text-white transition-colors">
              BROWSE
            </a>
            <a href="#" className="text-zinc-400 hover:text-white transition-colors">
              CREATE
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ConnectButton />
          </motion.div>
        </nav>
      </header>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <CalendarIcon className="w-12 h-12 text-cyan-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">EVENT CALENDAR</h1>
          </div>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-mono">
            // BASE NETWORK EVENT PROTOCOL
          </p>
        </motion.div>

        {/* Wallet Connection Status */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 text-center">
              <Wallet className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">
                Connection Required
              </h3>
              <p className="text-zinc-400 mb-6 font-mono text-sm">
                Link your Web3 wallet to access the event database.
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isConnected && loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-cyan-500 font-mono text-sm animate-pulse">SYNCING_BLOCKCHAIN_DATA...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="bg-red-950/30 border border-red-500/50 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">
                System Error
              </h3>
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Calendar Component */}
        {isConnected && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <EventCalendar
              events={events}
              onEventClick={handleEventClick}
              defaultLanguage={language}
            />
          </motion.div>
        )}

        {/* Empty State */}
        {isConnected && !loading && !error && events.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-12 text-center hover:border-cyan-500/30 transition-colors">
              <CalendarIcon className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">
                No Events Found
              </h3>
              <p className="text-zinc-500 mb-8 font-mono text-sm">
                Zero entries in blockchain registry. Initialize first event protocol.
              </p>
              <a href="#" className="inline-block px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold font-mono uppercase tracking-wider transition-all">
                Create_Event
              </a>
            </div>
          </motion.div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 max-w-4xl mx-auto"
        >
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-xs font-mono text-cyan-500 mb-4 uppercase tracking-widest">
              // Protocol Specifications
            </h3>
            <div className="space-y-3 text-zinc-400 text-sm font-mono">
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Base L2 Storage Integration
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span> IPFS Metadata Decentralization
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Secure Wallet Auth (WalletConnect)
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Cross-Platform Calendar Sync
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
