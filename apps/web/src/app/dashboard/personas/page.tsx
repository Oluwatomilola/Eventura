'use client'

import { useEffect, useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

interface Persona {
  id: string
  event_id: number
  display_name: string
  bio?: string
  interests: string[]
  looking_for: string[]
  visibility: 'public' | 'attendees' | 'connections' | 'private'
  created_at: string
  updated_at: string
}

const VISIBILITY_ICONS: Record<string, string> = {
  public: '🌍',
  attendees: '🎫',
  connections: '🤝',
  private: '🔒'
}

export default function PersonasPage() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const router = useRouter()

  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  useEffect(() => {
    if (address) {
      fetchPersonas()
    }
  }, [address])

  const fetchPersonas = async () => {
    try {
      setLoading(true)

      // Generate message for signing
      const timestamp = Date.now()
      const message = `Sign this message to authenticate with Eventura\n\nWallet: ${address}\nTimestamp: ${timestamp}\n\nThis signature will not trigger any blockchain transaction or cost any gas fees.`

      // Sign the message
      const signature = await signMessageAsync({ message })

      const response = await fetch('/api/personas/me', {
        headers: {
          'x-wallet-address': address!,
          'x-signature': signature,
          'x-message': message
        }
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch personas')
      }

      setPersonas(data.data)
    } catch (err: any) {
      console.error('Fetch personas error:', err)
      setError(err.message || 'Failed to load personas')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (personaId: string) => {
    if (!confirm('Are you sure you want to delete this persona? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingId(personaId)
      setError(null)

      // Generate message for signing
      const timestamp = Date.now()
      const message = `Sign this message to authenticate with Eventura\n\nWallet: ${address}\nTimestamp: ${timestamp}\n\nThis signature will not trigger any blockchain transaction or cost any gas fees.`

      // Sign the message
      const signature = await signMessageAsync({ message })

      const response = await fetch(`/api/personas/${personaId}`, {
        method: 'DELETE',
        headers: {
          'x-wallet-address': address!,
          'x-signature': signature,
          'x-message': message
        }
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete persona')
      }

      setSuccessMessage('Persona deleted successfully')
      setPersonas(prev => prev.filter(p => p.id !== personaId))
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      console.error('Delete persona error:', err)
      setError(err.message || 'Failed to delete persona')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Please connect your wallet to access your personas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Personas</h1>
                <p className="text-white/70 mt-1">
                  Manage your event-specific personas
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{successMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}

        {/* Personas Grid */}
        {!loading && personas.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-12 text-center"
          >
            <User className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Personas Yet</h2>
            <p className="text-white/70 mb-6">
              Create your first event-specific persona when you purchase a ticket
            </p>
          </motion.div>
        )}

        {!loading && personas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((persona, index) => (
              <motion.div
                key={persona.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 border-b border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">
                      {persona.display_name}
                    </h3>
                    <span className="text-xl">
                      {VISIBILITY_ICONS[persona.visibility]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Calendar className="w-3 h-3" />
                    <span>Event ID: {persona.event_id}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-4">
                  {persona.bio && (
                    <div>
                      <p className="text-sm text-white/70 line-clamp-3">
                        {persona.bio}
                      </p>
                    </div>
                  )}

                  {persona.interests.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-white/50 mb-2">Interests</p>
                      <div className="flex flex-wrap gap-1">
                        {persona.interests.slice(0, 3).map((interest) => (
                          <span
                            key={interest}
                            className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300"
                          >
                            {interest}
                          </span>
                        ))}
                        {persona.interests.length > 3 && (
                          <span className="px-2 py-1 text-xs text-white/50">
                            +{persona.interests.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {persona.looking_for.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-white/50 mb-2">Looking For</p>
                      <div className="flex flex-wrap gap-1">
                        {persona.looking_for.slice(0, 2).map((item) => (
                          <span
                            key={item}
                            className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300"
                          >
                            {item}
                          </span>
                        ))}
                        {persona.looking_for.length > 2 && (
                          <span className="px-2 py-1 text-xs text-white/50">
                            +{persona.looking_for.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-white/40">
                      Updated {formatDate(persona.updated_at)}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/personas/${persona.id}/edit`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(persona.id)}
                    disabled={deletingId === persona.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {deletingId === persona.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Card */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-3">About Event Personas</h3>
            <div className="space-y-2 text-sm text-white/70">
              <p>• Each persona is specific to one event</p>
              <p>• Present yourself differently for different occasions</p>
              <p>• Control who can see your persona with visibility settings</p>
              <p>• You can edit or delete personas anytime</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
