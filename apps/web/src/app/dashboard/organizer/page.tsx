'use client'

import { useState, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  X,
  Megaphone,
} from 'lucide-react'
import { ConnectButton } from '@/components/ConnectButton'
import Image from 'next/image'

interface OrganizerEvent {
  id: string
  title: string
  coverImageUrl?: string
  startDateTime: string
  endDateTime: string
  ticketPrice: string
  capacity: number
  ticketsSold: number
  revenue: string
  revenueUSD: number
  attendeeCount: number
  status: 'upcoming' | 'ongoing' | 'past' | 'cancelled'
  createdAt: string
}

type EventStatus = 'all' | 'upcoming' | 'ongoing' | 'past' | 'cancelled'
type SortOption = 'newest' | 'oldest' | 'most-sales'

export default function OrganizerDashboardPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [events, setEvents] = useState<OrganizerEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<EventStatus>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchEvents() {
      if (!isConnected || !address) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/organizer/events?wallet=${address}&chainId=${chainId}`
        )
        const result = await response.json()

        if (result.success) {
          setEvents(result.data || [])
        } else {
          setError(result.error || 'Failed to load events')
        }
      } catch (err: any) {
        console.error('Error fetching events:', err)
        setError(err.message || 'Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [isConnected, address, chainId])

  const filteredAndSortedEvents = events
    .filter((event) => {
      if (statusFilter !== 'all' && event.status !== statusFilter) {
        return false
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          event.title.toLowerCase().includes(query) ||
          event.id.includes(query)
        )
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        case 'most-sales':
          return b.ticketsSold - a.ticketsSold
        default:
          return 0
      }
    })

  const totalStats = {
    ticketsSold: events.reduce((sum, e) => sum + e.ticketsSold, 0),
    revenue: events.reduce((sum, e) => sum + parseFloat(e.revenue), 0),
    revenueUSD: events.reduce((sum, e) => sum + e.revenueUSD, 0),
    totalEvents: events.length,
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
        <div className="bg-zinc-900/50 border border-zinc-800 p-12 rounded-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-zinc-950 border border-zinc-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-cyan-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">
            Organizer Dashboard
          </h1>
          <p className="text-zinc-400 mb-8 font-mono text-sm">
            Connect your wallet to manage your events
          </p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
              Organizer Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/events/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-mono uppercase tracking-wider transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Link>
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
              Total Events
            </p>
            <p className="text-3xl font-bold text-white">{totalStats.totalEvents}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
              Tickets Sold
            </p>
            <p className="text-3xl font-bold text-white">
              {totalStats.ticketsSold.toLocaleString()}
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
              Revenue (ETH)
            </p>
            <p className="text-3xl font-bold text-white">
              {totalStats.revenue.toFixed(4)}
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
              Revenue (USD)
            </p>
            <p className="text-3xl font-bold text-white">
              ${totalStats.revenueUSD.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EventStatus)}
              className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="past">Past</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-sales">Most Sales</option>
            </select>
          </div>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-cyan-500 font-mono text-sm">Loading events...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800 p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : filteredAndSortedEvents.length === 0 ? (
          <div className="bg-zinc-900/30 border border-zinc-800 border-dashed p-12 text-center rounded-lg">
            <Calendar className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">
              No Events Found
            </h3>
            <p className="text-zinc-500 mb-8 font-mono text-sm max-w-md mx-auto">
              {events.length === 0
                ? 'You haven\'t created any events yet. Create your first event to get started!'
                : 'No events match your filters.'}
            </p>
            {events.length === 0 && (
              <Link
                href="/events/create"
                className="inline-flex items-center gap-2 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold font-mono uppercase tracking-wider transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Your First Event
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 border border-zinc-800 overflow-hidden hover:border-cyan-500 transition-colors"
              >
                {event.coverImageUrl && (
                  <div className="relative w-full h-48 bg-zinc-800">
                    <Image
                      src={event.coverImageUrl}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex-1">
                      {event.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-mono uppercase ${
                        event.status === 'upcoming'
                          ? 'bg-blue-900/50 text-blue-400'
                          : event.status === 'ongoing'
                          ? 'bg-green-900/50 text-green-400'
                          : event.status === 'past'
                          ? 'bg-zinc-800 text-zinc-400'
                          : 'bg-red-900/50 text-red-400'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(event.startDateTime).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>
                        {event.ticketsSold} / {event.capacity} tickets
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        {event.revenue} ETH (${event.revenueUSD.toLocaleString()})
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/dashboard/organizer/events/${event.id}`}
                      className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-center font-mono uppercase text-sm transition-colors"
                    >
                      <Eye className="w-4 h-4 inline mr-2" />
                      View
                    </Link>
                    <Link
                      href={`/dashboard/organizer/events/${event.id}/attendees`}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono uppercase text-sm transition-colors"
                    >
                      <Users className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

