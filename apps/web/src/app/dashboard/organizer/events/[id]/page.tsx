'use client'

import { useState, useEffect } from 'react'
import { useAccount, useChainId, useWriteContract } from 'wagmi'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { EventTicketingABI, getContractAddresses } from '@/lib/contracts'
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  Activity,
  Tag,
  Network,
  Clock,
  X,
  AlertTriangle,
} from 'lucide-react'

interface AnalyticsData {
  totalTicketsSold: number
  totalRevenue: {
    eth: string
    usd: number
  }
  salesOverTime: Array<{
    date: string
    ticketsSold: number
    revenue: number
  }>
  attendeeDemographics: {
    totalAttendees: number
    attendeesWithPersonas: number
    topInterests: Array<{ interest: string; count: number }>
    topLookingFor: Array<{ item: string; count: number }>
  }
  connectionStats: {
    totalConnections: number
    avgConnectionsPerAttendee: number
  }
  waitlistCount: number
  checkInCount: number
}

export default function EventAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    async function fetchAnalytics() {
      if (!isConnected || !address) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/organizer/events/${eventId}/analytics?wallet=${address}&chainId=${chainId}`
        )
        const result = await response.json()

        if (result.success) {
          setAnalytics(result.data)
        } else {
          setError(result.error || 'Failed to load analytics')
        }
      } catch (err: any) {
        console.error('Error fetching analytics:', err)
        setError(err.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [isConnected, address, chainId, eventId])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Please connect your wallet</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-500 font-mono text-sm">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Failed to load analytics'}</p>
          <Link
            href="/dashboard/organizer"
            className="text-cyan-500 hover:text-cyan-400"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const socialEngagementRate =
    analytics.attendeeDemographics.totalAttendees > 0
      ? (analytics.attendeeDemographics.attendeesWithPersonas /
          analytics.attendeeDemographics.totalAttendees) *
        100
      : 0

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/organizer"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
              Event Analytics
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/organizer/events/${eventId}/attendees`}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono uppercase text-sm transition-colors"
            >
              View Attendees
            </Link>
            <Link
              href={`/dashboard/organizer/events/${eventId}/scan`}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono uppercase text-sm transition-colors"
            >
              Scan Tickets
            </Link>
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono uppercase text-sm transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel Event
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
              Tickets Sold
            </p>
            <p className="text-3xl font-bold text-white">
              {analytics.totalTicketsSold.toLocaleString()}
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
              Total Revenue
            </p>
            <p className="text-2xl font-bold text-white">
              {analytics.totalRevenue.eth} ETH
            </p>
            <p className="text-sm text-zinc-400 mt-1">
              ${analytics.totalRevenue.usd.toLocaleString()}
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
              Social Engagement
            </p>
            <p className="text-3xl font-bold text-white">
              {Math.round(socialEngagementRate)}%
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {analytics.attendeeDemographics.attendeesWithPersonas} with personas
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
              Avg Connections
            </p>
            <p className="text-3xl font-bold text-white">
              {analytics.connectionStats.avgConnectionsPerAttendee.toFixed(1)}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {analytics.connectionStats.totalConnections} total
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Sales Over Time */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Sales Over Time
            </h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.salesOverTime.slice(-14).map((day, idx) => {
                const maxSales = Math.max(
                  ...analytics.salesOverTime.map((d) => d.ticketsSold)
                )
                const height = maxSales > 0 ? (day.ticketsSold / maxSales) * 100 : 0
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-cyan-500 hover:bg-cyan-400 transition-colors"
                      style={{ height: `${height}%` }}
                      title={`${day.date}: ${day.ticketsSold} tickets`}
                    />
                    <span className="text-xs text-zinc-500 mt-2 transform -rotate-45 origin-top-left">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Revenue Over Time
            </h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.salesOverTime.slice(-14).map((day, idx) => {
                const maxRevenue = Math.max(
                  ...analytics.salesOverTime.map((d) => d.revenue)
                )
                const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-green-500 hover:bg-green-400 transition-colors"
                      style={{ height: `${height}%` }}
                      title={`${day.date}: $${day.revenue.toFixed(2)}`}
                    />
                    <span className="text-xs text-zinc-500 mt-2 transform -rotate-45 origin-top-left">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Attendee Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Top Interests */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Top Interests
            </h3>
            <div className="space-y-3">
              {analytics.attendeeDemographics.topInterests.length > 0 ? (
                analytics.attendeeDemographics.topInterests.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-zinc-300">{item.interest}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500"
                          style={{
                            width: `${
                              (item.count /
                                analytics.attendeeDemographics.topInterests[0]
                                  .count) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-zinc-400 text-sm w-8 text-right">
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-sm">No interests data available</p>
              )}
            </div>
          </div>

          {/* Top Looking For */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Network className="w-5 h-5" />
              Top "Looking For"
            </h3>
            <div className="space-y-3">
              {analytics.attendeeDemographics.topLookingFor.length > 0 ? (
                analytics.attendeeDemographics.topLookingFor.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-zinc-300">{item.item}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${
                              (item.count /
                                analytics.attendeeDemographics.topLookingFor[0]
                                  .count) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-zinc-400 text-sm w-8 text-right">
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-sm">No "looking for" data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
              Waitlist
            </p>
            <p className="text-3xl font-bold text-white">
              {analytics.waitlistCount}
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
              Check-ins
            </p>
            <p className="text-3xl font-bold text-white">
              {analytics.checkInCount}
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">
              Check-in Rate
            </p>
            <p className="text-3xl font-bold text-white">
              {analytics.totalTicketsSold > 0
                ? Math.round(
                    (analytics.checkInCount / analytics.totalTicketsSold) * 100
                  )
                : 0}
              %
            </p>
          </div>
        </div>
      </main>

      {/* Cancel Event Modal */}
      {showCancelModal && (
        <CancelEventModal
          eventId={eventId}
          onClose={() => setShowCancelModal(false)}
          onSuccess={() => {
            setShowCancelModal(false)
            router.push('/dashboard/organizer')
          }}
        />
      )}
    </div>
  )
}

function CancelEventModal({
  eventId,
  onClose,
  onSuccess,
}: {
  eventId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const { address } = useAccount()
  const chainId = useChainId()
  const { writeContract, isPending } = useWriteContract()
  const [confirmText, setConfirmText] = useState('')
  const [step, setStep] = useState<'confirm' | 'transaction'>('confirm')

  const handleCancel = async () => {
    if (!address) return

    try {
      // Get transaction data and notify attendees
      const response = await fetch(
        `/api/organizer/events/${eventId}/cancel`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address,
            chainId,
          }),
        }
      )

      const result = await response.json()

      if (result.success) {
        setStep('transaction')
        // Execute transaction
        const contractAddresses = getContractAddresses(chainId)
        const contractAddress = contractAddresses.EventTicketing

        if (!contractAddress || contractAddress.length !== 42) {
          alert('Contract not configured for this chain')
          return
        }

        try {
          await writeContract({
            address: contractAddress as `0x${string}`,
            abi: EventTicketingABI,
            functionName: 'cancelEvent',
            args: [BigInt(eventId)],
          })

          alert('Event cancelled successfully! All attendees will be refunded.')
          onSuccess()
        } catch (txError: any) {
          console.error('Transaction error:', txError)
          alert('Transaction failed. Please try again.')
          setStep('confirm')
        }
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (err: any) {
      console.error('Error cancelling event:', err)
      alert('Failed to cancel event')
      setStep('confirm')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-6 max-w-md w-full">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <h2 className="text-xl font-bold text-white">Cancel Event</h2>
        </div>

        {step === 'confirm' ? (
          <>
            <div className="mb-6">
              <p className="text-zinc-300 mb-4">
                Are you sure you want to cancel this event? This action cannot be undone.
              </p>
              <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2 mb-4">
                <li>All ticket holders will receive refunds</li>
                <li>All attendees will be notified</li>
                <li>The event will be marked as cancelled</li>
              </ul>
              <p className="text-sm text-zinc-500 mb-4">
                Type <strong className="text-white">CANCEL</strong> to confirm:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type CANCEL to confirm"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleCancel}
                disabled={confirmText !== 'CANCEL' || isPending}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono uppercase text-sm transition-colors"
              >
                {isPending ? 'Processing...' : 'Cancel Event'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono uppercase text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-300 mb-4">
              Processing cancellation transaction...
            </p>
            <p className="text-sm text-zinc-500">
              Please confirm the transaction in your wallet
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

