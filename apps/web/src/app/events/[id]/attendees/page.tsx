'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  ArrowLeft,
  Users,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
  Sparkles,
  Target
} from 'lucide-react'
import Link from 'next/link'
import { AttendeeCard } from '@/components/AttendeeCard'
import { SuggestedConnections } from '@/components/SuggestedConnections'
import { AttendeeCardSkeleton } from '@/components/skeletons/AttendeeCardSkeleton'
import { EmptyState } from '@/components/empty/EmptyState'
import { UsersIllustration, SearchIllustration, FilterIllustration } from '@/components/illustrations'

interface Attendee {
  id: string
  wallet_address: string
  display_name: string
  bio?: string
  interests: string[]
  looking_for: string[]
  avatar_ipfs_hash?: string
  shared_interests_count: number
  match_score: number
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

const LOOKING_FOR_OPTIONS = [
  'Co-founder',
  'Mentorship',
  'Networking',
  'Friends',
  'Job Opportunities',
  'Business Partners',
  'Investors',
  'Collaboration',
  'Learning',
  'Fun'
]

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance (Most Shared Interests)' },
  { value: 'recent', label: 'Recently Joined' },
  { value: 'alphabetical', label: 'Alphabetical (A-Z)' }
]

export default function AttendeesPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { address, isConnected } = useAccount()

  const eventId = params.id as string

  // State
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    searchParams.get('interests')?.split(',').filter(Boolean) || []
  )
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>(
    searchParams.get('lookingFor')?.split(',').filter(Boolean) || []
  )
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance')
  const [showFilters, setShowFilters] = useState(false)
  const [newInterest, setNewInterest] = useState('')

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch attendees
  const fetchAttendees = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())
      params.set('sort', sortBy)

      if (debouncedSearch) params.set('search', debouncedSearch)
      if (selectedInterests.length > 0) params.set('interests', selectedInterests.join(','))
      if (selectedLookingFor.length > 0) params.set('lookingFor', selectedLookingFor.join(','))
      if (address) params.set('wallet', address)

      const response = await fetch(`/api/events/${eventId}/attendees?${params.toString()}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch attendees')
      }

      setAttendees(data.data)
      setPagination(data.pagination)

      // Update URL params
      const newSearchParams = new URLSearchParams()
      if (debouncedSearch) newSearchParams.set('search', debouncedSearch)
      if (selectedInterests.length > 0) newSearchParams.set('interests', selectedInterests.join(','))
      if (selectedLookingFor.length > 0) newSearchParams.set('lookingFor', selectedLookingFor.join(','))
      if (sortBy !== 'relevance') newSearchParams.set('sort', sortBy)

      const newUrl = newSearchParams.toString()
        ? `?${newSearchParams.toString()}`
        : ''

      window.history.replaceState(null, '', `/events/${eventId}/attendees${newUrl}`)
    } catch (err: any) {
      console.error('Fetch attendees error:', err)
      setError(err.message || 'Failed to load attendees')
    } finally {
      setLoading(false)
    }
  }, [eventId, pagination.page, pagination.limit, sortBy, debouncedSearch, selectedInterests, selectedLookingFor, address])

  useEffect(() => {
    fetchAttendees()
  }, [fetchAttendees])

  // Handlers
  const handleAddInterest = () => {
    const trimmed = newInterest.trim()
    if (trimmed && !selectedInterests.includes(trimmed)) {
      setSelectedInterests([...selectedInterests, trimmed])
      setNewInterest('')
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }

  const handleRemoveInterest = (interest: string) => {
    setSelectedInterests(selectedInterests.filter(i => i !== interest))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const toggleLookingFor = (option: string) => {
    setSelectedLookingFor(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    )
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setDebouncedSearch('')
    setSelectedInterests([])
    setSelectedLookingFor([])
    setSortBy('relevance')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleConnect = async (attendeeId: string) => {
    // TODO: Implement connection request modal
    console.log('Connect with attendee:', attendeeId)
    alert('Connection feature will be implemented in the connections issue')
  }

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
    }
  }

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }))
    }
  }

  const activeFiltersCount =
    (debouncedSearch ? 1 : 0) +
    selectedInterests.length +
    selectedLookingFor.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Attendees</h1>
                <p className="text-white/70 mt-1">
                  {pagination.total > 0
                    ? `${pagination.total} attendee${pagination.total > 1 ? 's' : ''} looking to connect`
                    : 'Loading attendees...'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none w-full lg:w-64 px-4 py-3 pr-10 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value} className="bg-slate-800">
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all relative"
            >
              <Filter className="w-5 h-5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-white/10 space-y-4">
                  {/* Interests Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <label className="text-sm font-semibold text-white/70">
                        Filter by Interests
                      </label>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                        placeholder="Add interest to filter..."
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleAddInterest}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedInterests.map(interest => (
                        <span
                          key={interest}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300"
                        >
                          {interest}
                          <button
                            onClick={() => handleRemoveInterest(interest)}
                            className="hover:text-purple-100 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Looking For Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <label className="text-sm font-semibold text-white/70">
                        Filter by Looking For
                      </label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {LOOKING_FOR_OPTIONS.map(option => (
                        <button
                          key={option}
                          onClick={() => toggleLookingFor(option)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedLookingFor.includes(option)
                              ? 'bg-blue-500/30 border-2 border-blue-500 text-blue-300'
                              : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleClearFilters}
                      className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Suggested Connections */}
        {!loading && !error && (
          <SuggestedConnections
            eventId={eventId}
            walletAddress={address}
            onConnect={handleConnect}
          />
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AttendeeCardSkeleton count={6} />
          </div>
        )}

        {/* Empty State - No attendees */}
        {!loading && attendees.length === 0 && !activeFiltersCount && (
          <EmptyState
            illustration={<UsersIllustration />}
            heading="No Attendees Yet"
            message="Be the first to create your persona and connect with others!"
            ctaText="Create Your Persona"
            ctaLink={`/events/${eventId}/create-persona`}
          />
        )}

        {/* Empty State - No results after filtering */}
        {!loading && attendees.length === 0 && activeFiltersCount > 0 && (
          <EmptyState
            illustration={<FilterIllustration />}
            heading="No Results Found"
            message="No attendees match your current filters. Try adjusting your search criteria."
            ctaText="Clear Filters"
            onCtaClick={handleClearFilters}
          />
        )}

        {/* Attendees Grid */}
        {!loading && attendees.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {attendees.map((attendee, index) => (
                <AttendeeCard
                  key={attendee.id}
                  attendee={attendee}
                  onConnect={handleConnect}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handlePrevPage}
                  disabled={pagination.page === 1}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                >
                  Previous
                </button>
                <span className="text-white">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
