'use client'

import { useState, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  Search,
  Download,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Filter,
  Send,
} from 'lucide-react'

interface Attendee {
  wallet_address: string
  ticket_id?: string
  persona_name?: string
  purchase_date?: string
  checked_in: boolean
  checked_in_at?: string
  interests?: string[]
  looking_for?: string[]
}

type FilterType = 'all' | 'checked-in' | 'not-checked-in' | 'with-persona' | 'without-persona'

export default function AttendeesPage() {
  const params = useParams()
  const eventId = params.id as string
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [showAnnounceModal, setShowAnnounceModal] = useState(false)

  useEffect(() => {
    async function fetchAttendees() {
      if (!isConnected || !address) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/organizer/events/${eventId}/attendees?wallet=${address}&chainId=${chainId}`
        )
        const result = await response.json()

        if (result.success) {
          setAttendees(result.data || [])
        } else {
          setError(result.error || 'Failed to load attendees')
        }
      } catch (err: any) {
        console.error('Error fetching attendees:', err)
        setError(err.message || 'Failed to load attendees')
      } finally {
        setLoading(false)
      }
    }

    fetchAttendees()
  }, [isConnected, address, chainId, eventId])

  const filteredAttendees = attendees.filter((attendee) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !attendee.wallet_address.toLowerCase().includes(query) &&
        !attendee.persona_name?.toLowerCase().includes(query)
      ) {
        return false
      }
    }

    switch (filter) {
      case 'checked-in':
        return attendee.checked_in
      case 'not-checked-in':
        return !attendee.checked_in
      case 'with-persona':
        return !!attendee.persona_name
      case 'without-persona':
        return !attendee.persona_name
      default:
        return true
    }
  })

  const handleExportCSV = async () => {
    try {
      const response = await fetch(
        `/api/organizer/events/${eventId}/attendees?wallet=${address}&chainId=${chainId}&format=csv`
      )
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `event-${eventId}-attendees.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exporting CSV:', err)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Please connect your wallet</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/organizer/events/${eventId}`}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
              Attendees
            </h1>
            <span className="text-sm text-zinc-500">
              ({filteredAttendees.length} / {attendees.length})
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAnnounceModal(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono uppercase text-sm transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Announce
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono uppercase text-sm transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <Link
              href={`/dashboard/organizer/events/${eventId}/scan`}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-mono uppercase text-sm transition-colors"
            >
              Scan Tickets
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name or wallet address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Attendees</option>
            <option value="checked-in">Checked In</option>
            <option value="not-checked-in">Not Checked In</option>
            <option value="with-persona">With Persona</option>
            <option value="without-persona">Without Persona</option>
          </select>
        </div>

        {/* Attendees Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800 p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div className="bg-zinc-900/30 border border-zinc-800 border-dashed p-12 text-center rounded-lg">
            <Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Attendees Found</h3>
            <p className="text-zinc-500">
              {searchQuery || filter !== 'all'
                ? 'No attendees match your filters.'
                : 'No attendees have registered yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-mono uppercase text-zinc-400">
                    Wallet Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-mono uppercase text-zinc-400">
                    Persona Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-mono uppercase text-zinc-400">
                    Ticket ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-mono uppercase text-zinc-400">
                    Purchase Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-mono uppercase text-zinc-400">
                    Check-in Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredAttendees.map((attendee, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm text-zinc-300">
                        {attendee.wallet_address.slice(0, 6)}...
                        {attendee.wallet_address.slice(-4)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {attendee.persona_name ? (
                        <span className="text-white">{attendee.persona_name}</span>
                      ) : (
                        <span className="text-zinc-500 text-sm">No persona</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-zinc-400">
                        {attendee.ticket_id || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-zinc-400">
                        {attendee.purchase_date
                          ? new Date(attendee.purchase_date).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {attendee.checked_in ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Checked In</span>
                          {attendee.checked_in_at && (
                            <span className="text-xs text-zinc-500">
                              {new Date(attendee.checked_in_at).toLocaleString()}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-zinc-500">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm">Not Checked In</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Announcement Modal */}
      {showAnnounceModal && (
        <AnnouncementModal
          eventId={eventId}
          onClose={() => setShowAnnounceModal(false)}
        />
      )}
    </div>
  )
}

function AnnouncementModal({
  eventId,
  onClose,
}: {
  eventId: string
  onClose: () => void
}) {
  const { address } = useAccount()
  const chainId = useChainId()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!title || !message || !address) return

    try {
      setSending(true)
      const response = await fetch(
        `/api/organizer/events/${eventId}/announce`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            message,
            walletAddress: address,
            chainId,
          }),
        }
      )

      const result = await response.json()
      if (result.success) {
        alert(`Announcement sent to ${result.data.notificationsSent} attendees!`)
        onClose()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (err) {
      console.error('Error sending announcement:', err)
      alert('Failed to send announcement')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-6 max-w-2xl w-full">
        <h2 className="text-xl font-bold text-white mb-4">Send Announcement</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500"
              placeholder="Announcement title"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500"
              placeholder="Your announcement message..."
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleSend}
              disabled={!title || !message || sending}
              className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono uppercase text-sm transition-colors"
            >
              {sending ? 'Sending...' : 'Send Announcement'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono uppercase text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

