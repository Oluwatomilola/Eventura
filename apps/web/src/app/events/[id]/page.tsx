'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import {
  Calendar,
  MapPin,
  Users,
  Share2,
  Ticket,
  Download,
  ArrowLeft,
  CheckCircle,
  Clock,
  Globe,
  DollarSign,
  AlertCircle,
  Flag,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import Head from 'next/head'

interface AttendeePreview {
  wallet_address: string
  display_name?: string
  avatar_ipfs_hash?: string
}

interface EventData {
  id: string
  title: string
  description: string
  coverImage: string
  category: string
  startTime: number
  endTime: number
  location: string
  ticketPrice: string
  maxTickets: number
  ticketsSold: number
  organizer: {
    name: string
    address: string
    email?: string
    website?: string
  }
  metadata: {
    highlights: string[]
    refundPolicy: string
    languages?: string[]
  }
  attendeeCount: number
  userConnectionCount: number
  userOwnsTicket: boolean
  userHasPersona: boolean
  attendeePreviews?: AttendeePreview[]
  suggestedConnections?: AttendeePreview[]
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const eventId = params.id as string

  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [ethToUsd, setEthToUsd] = useState(0)
  const [showReportModal, setShowReportModal] = useState(false)

  useEffect(() => {
    fetchEvent()
    fetchEthPrice()
  }, [eventId, address])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const url = `/api/events/${eventId}${address ? `?wallet=${address}` : ''}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch event')
      }

      setEvent(data.data)
    } catch (err: any) {
      console.error('Fetch event error:', err)
      setError(err.message || 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const fetchEthPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      const data = await response.json()
      setEthToUsd(data.ethereum.usd)
    } catch (err) {
      console.error('Failed to fetch ETH price:', err)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: event?.title,
        text: event?.description,
        url
      })
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  const handleCalendarExport = () => {
    if (!event) return
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${new Date(event.startTime * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(event.endTime * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${event.title}.ics`
    link.click()
  }

  const getGoogleMapsUrl = (location: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
  }

  const getAvatarUrl = (ipfsHash: string) => {
    const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
    return gateway.endsWith('/') ? `${gateway}${ipfsHash}` : `${gateway}/${ipfsHash}`
  }

  const shouldTruncateDescription = (desc: string) => desc.length > 500

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading event...</div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Event not found</div>
      </div>
    )
  }

  const ticketsRemaining = event.maxTickets - event.ticketsSold
  const isSoldOut = ticketsRemaining <= 0
  const usdPrice = ethToUsd > 0 ? (parseFloat(event.ticketPrice) * ethToUsd).toFixed(2) : null

  return (
    <>
      <Head>
        <title>{event.title} | Eventura</title>
        <meta name="description" content={event.description} />
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.description} />
        <meta property="og:type" content="event" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        {event.coverImage && <meta property="og:image" content={event.coverImage} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Event',
              name: event.title,
              description: event.description,
              startDate: new Date(event.startTime * 1000).toISOString(),
              endDate: new Date(event.endTime * 1000).toISOString(),
              location: {
                '@type': 'Place',
                name: event.location
              },
              organizer: {
                '@type': 'Organization',
                name: event.organizer.name
              },
              offers: {
                '@type': 'Offer',
                price: event.ticketPrice,
                priceCurrency: 'ETH',
                availability: isSoldOut ? 'SoldOut' : 'InStock'
              }
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Hero Section */}
        <div className="relative h-96 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-purple-500/30 border border-purple-500/50 rounded-full text-sm text-purple-300 mb-3">
                  {event.category}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {event.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-white/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {format(new Date(event.startTime * 1000), 'MMM d, yyyy • HH:mm')}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {event.location !== 'Virtual' ? (
                      <a
                        href={getGoogleMapsUrl(event.location)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        {event.location}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      event.location
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Report Event"
                >
                  <Flag className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Social Features Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 rounded-xl p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Connect with Attendees
                </h2>

                {!event.userOwnsTicket ? (
                  <div>
                    <p className="text-white/70 mb-4 text-lg">
                      Connect with <span className="font-bold text-white">{event.attendeeCount}</span> attendees before the event
                    </p>
                    {event.attendeePreviews && event.attendeePreviews.length > 0 && (
                      <div className="flex -space-x-2 mb-4">
                        {event.attendeePreviews.slice(0, 5).map((attendee, i) => (
                          <div
                            key={i}
                            className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-2 border-white/20 flex items-center justify-center"
                          >
                            {attendee.avatar_ipfs_hash ? (
                              <img
                                src={getAvatarUrl(attendee.avatar_ipfs_hash)}
                                alt={attendee.display_name || 'User'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-white/40" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-white/50 text-sm">
                      Buy a ticket to see all attendees and start networking
                    </p>
                  </div>
                ) : !event.userHasPersona ? (
                  <div>
                    <p className="text-white mb-2 text-lg">
                      <span className="font-bold text-2xl">{event.attendeeCount}</span> people are looking to connect
                    </p>
                    <p className="text-white/70 mb-4">
                      Create your persona to connect with other attendees
                    </p>
                    <Link
                      href={`/events/${eventId}/create-persona`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
                    >
                      Create Your Persona
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-white mb-4">
                      You've connected with <span className="font-bold">{event.userConnectionCount}</span> attendees
                    </p>

                    {/* Suggested Connections */}
                    {event.suggestedConnections && event.suggestedConnections.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-3">Suggested Connections</h3>
                        <div className="flex gap-3">
                          {event.suggestedConnections.slice(0, 3).map((suggested, i) => (
                            <div
                              key={i}
                              className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-lg"
                            >
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-2 border-white/20 flex items-center justify-center">
                                {suggested.avatar_ipfs_hash ? (
                                  <img
                                    src={getAvatarUrl(suggested.avatar_ipfs_hash)}
                                    alt={suggested.display_name || 'User'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-6 h-6 text-white/40" />
                                )}
                              </div>
                              <span className="text-xs text-white text-center">
                                {suggested.display_name || 'Anonymous'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link
                      href={`/events/${eventId}/attendees`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
                    >
                      Browse All Attendees
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Description */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
                <div className="text-white/70 whitespace-pre-wrap">
                  {shouldTruncateDescription(event.description) && !showFullDescription
                    ? event.description.substring(0, 500) + '...'
                    : event.description}
                </div>
                {shouldTruncateDescription(event.description) && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-3 text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                  >
                    {showFullDescription ? (
                      <>
                        Read less <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Read more <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                {event.metadata.highlights.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Highlights</h3>
                    <ul className="space-y-2">
                      {event.metadata.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2 text-white/70">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Event Details */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Event Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-xs text-white/50">Date & Time</p>
                      <p className="text-white">{format(new Date(event.startTime * 1000), 'PPP')}</p>
                      <p className="text-white/70 text-sm">
                        {format(new Date(event.startTime * 1000), 'HH:mm')} - {format(new Date(event.endTime * 1000), 'HH:mm')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-xs text-white/50">Location</p>
                      <p className="text-white">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Ticket className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-xs text-white/50">Tickets</p>
                      <p className="text-white">{ticketsRemaining} / {event.maxTickets} available</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-xs text-white/50">Attendees</p>
                      <p className="text-white">{event.attendeeCount} with personas</p>
                    </div>
                  </div>

                  {event.metadata.languages && event.metadata.languages.length > 0 && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-white/50">Languages</p>
                        <p className="text-white">{event.metadata.languages.join(', ')}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs text-white/50 mb-1">Refund Policy</p>
                  <p className="text-white/70 text-sm">{event.metadata.refundPolicy}</p>
                </div>
              </div>

              {/* Organizer */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Organizer</h2>
                <p className="text-white mb-2">{event.organizer.name}</p>
                {event.organizer.email && (
                  <p className="text-white/70 text-sm mb-1">Email: {event.organizer.email}</p>
                )}
                {event.organizer.website && (
                  <a
                    href={event.organizer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                  >
                    Visit website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Similar Events */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Similar Events</h2>
                <p className="text-white/50 text-sm">Check out other events in {event.category}</p>
                {/* TODO: Integrate with recommendation system */}
              </div>
            </div>

            {/* Sidebar - Ticket Purchase */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-4">
                <div>
                  <p className="text-sm text-white/50 mb-1">Ticket Price</p>
                  <p className="text-3xl font-bold text-white">{event.ticketPrice} ETH</p>
                  {usdPrice && (
                    <p className="text-white/60 text-sm">≈ ${usdPrice} USD</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Tickets Remaining</span>
                  <span className="text-white font-semibold">
                    {ticketsRemaining} / {event.maxTickets}
                  </span>
                </div>

                {event.userOwnsTicket ? (
                  <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-center">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-300 font-semibold">Ticket Owned ✓</p>
                  </div>
                ) : isSoldOut ? (
                  <button className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-all">
                    Join Waitlist
                  </button>
                ) : (
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all">
                    Buy Ticket
                  </button>
                )}

                <button
                  onClick={handleCalendarExport}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all"
                >
                  <Download className="w-5 h-5" />
                  Add to Calendar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">Report Event</h3>
              <p className="text-white/70 mb-4">
                Please describe why you're reporting this event. Our team will review it.
              </p>
              <textarea
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={4}
                placeholder="Reason for reporting..."
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Report submitted. Thank you!')
                    setShowReportModal(false)
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
