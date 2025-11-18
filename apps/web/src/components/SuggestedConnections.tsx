'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Target,
  User,
  UserPlus,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface MatchResult {
  attendee: {
    id: string
    wallet_address: string
    display_name: string
    bio?: string
    interests: string[]
    looking_for: string[]
    avatar_ipfs_hash?: string
    created_at: string
  }
  score: number
  percentage: number
  reasons: string[]
  sharedInterests: string[]
  sharedLookingFor: string[]
}

interface SuggestedConnectionsProps {
  eventId: string
  walletAddress?: string
  onConnect?: (attendeeId: string) => void
}

export function SuggestedConnections({
  eventId,
  walletAddress,
  onConnect
}: SuggestedConnectionsProps) {
  const [suggestions, setSuggestions] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMore, setShowMore] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (walletAddress) {
      fetchSuggestions()
      loadDismissedSuggestions()
    }
  }, [eventId, walletAddress])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/events/${eventId}/suggested-connections?wallet=${walletAddress}&limit=20`
      )
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch suggestions')
      }

      setSuggestions(data.data)
    } catch (err: any) {
      console.error('Fetch suggestions error:', err)
      setError(err.message || 'Failed to load suggestions')
    } finally {
      setLoading(false)
    }
  }

  const loadDismissedSuggestions = () => {
    try {
      const key = `dismissed_suggestions_${eventId}_${walletAddress}`
      const stored = localStorage.getItem(key)
      if (stored) {
        setDismissedIds(new Set(JSON.parse(stored)))
      }
    } catch (err) {
      console.error('Failed to load dismissed suggestions:', err)
    }
  }

  const saveDismissedSuggestions = (ids: Set<string>) => {
    try {
      const key = `dismissed_suggestions_${eventId}_${walletAddress}`
      localStorage.setItem(key, JSON.stringify([...ids]))
    } catch (err) {
      console.error('Failed to save dismissed suggestions:', err)
    }
  }

  const handleDismiss = (suggestionId: string) => {
    const newDismissed = new Set(dismissedIds)
    newDismissed.add(suggestionId)
    setDismissedIds(newDismissed)
    saveDismissedSuggestions(newDismissed)
  }

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-600 to-emerald-600'
    if (percentage >= 60) return 'from-blue-600 to-cyan-600'
    if (percentage >= 40) return 'from-purple-600 to-pink-600'
    if (percentage >= 20) return 'from-yellow-600 to-orange-600'
    return 'from-gray-600 to-slate-600'
  }

  const getMatchEmoji = (percentage: number) => {
    if (percentage >= 80) return '🔥'
    if (percentage >= 60) return '⭐'
    if (percentage >= 40) return '✨'
    if (percentage >= 20) return '💡'
    return '👋'
  }

  const getAvatarUrl = (ipfsHash: string) => {
    const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
    return gateway.endsWith('/')
      ? `${gateway}${ipfsHash}`
      : `${gateway}/${ipfsHash}`
  }

  const visibleSuggestions = suggestions
    .filter(s => !dismissedIds.has(s.attendee.id))
    .slice(0, showMore ? 20 : 10)

  if (!walletAddress) {
    return null
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          <p className="text-white">Finding your best matches...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div>
            <h3 className="text-red-400 font-semibold mb-1">Unable to Load Suggestions</h3>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (visibleSuggestions.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Suggested Connections</h2>
          <p className="text-white/70 text-sm">
            Based on your interests and goals
          </p>
        </div>
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <AnimatePresence>
          {visibleSuggestions.map((match, index) => (
            <motion.div
              key={match.attendee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-purple-500/50 transition-all relative"
            >
              {/* Dismiss Button */}
              <button
                onClick={() => handleDismiss(match.attendee.id)}
                className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors z-10"
                title="Dismiss suggestion"
              >
                <X className="w-4 h-4 text-white/50 hover:text-white" />
              </button>

              {/* Header with Avatar and Match Badge */}
              <div className="flex items-start gap-3 mb-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-2 border-white/20 flex items-center justify-center flex-shrink-0">
                  {match.attendee.avatar_ipfs_hash ? (
                    <img
                      src={getAvatarUrl(match.attendee.avatar_ipfs_hash)}
                      alt={match.attendee.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white/40" />
                  )}
                </div>

                {/* Name and Match Badge */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-white mb-1 truncate">
                    {match.attendee.display_name}
                  </h3>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r ${getMatchColor(match.percentage)} rounded-full`}>
                    <span className="text-xs font-bold text-white">
                      {match.percentage}% match
                    </span>
                    <span className="text-sm">{getMatchEmoji(match.percentage)}</span>
                  </div>
                </div>
              </div>

              {/* Match Reasons */}
              {match.reasons.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-start gap-2 text-sm text-white/70">
                    <Target className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <p>{match.reasons.join('. ')}</p>
                  </div>
                </div>
              )}

              {/* Shared Interests Tags */}
              {match.sharedInterests.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {match.sharedInterests.slice(0, 3).map(interest => (
                      <span
                        key={interest}
                        className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300"
                      >
                        #{interest}
                      </span>
                    ))}
                    {match.sharedInterests.length > 3 && (
                      <span className="px-2 py-0.5 text-xs text-white/50">
                        +{match.sharedInterests.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Connect Button */}
              <button
                onClick={() => onConnect?.(match.attendee.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Connect
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show More Button */}
      {suggestions.filter(s => !dismissedIds.has(s.attendee.id)).length > 10 && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-lg transition-all"
          >
            {showMore ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show More Suggestions
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
