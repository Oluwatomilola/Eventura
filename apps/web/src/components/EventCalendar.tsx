'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Calendar as BigCalendar, momentLocalizer, View, SlotInfo } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, ExternalLink, X, Calendar as CalendarIcon, Filter } from 'lucide-react'
import type { EventWithMetadata, LanguageCode } from '@/types/multilang-event'
import { getTranslation, detectUserLanguage } from '@/utils/multilang'
import {
  CalendarEvent,
  eventsToCalendarFormat,
  downloadICSFile,
  getGoogleCalendarURL,
  getOutlookCalendarURL,
  formatEventDate,
  isEventToday,
  isEventUpcoming,
} from '@/utils/calendar'
import { useAccount } from 'wagmi'

const localizer = momentLocalizer(moment)

interface EventCalendarProps {
  events: EventWithMetadata[]
  onEventClick?: (event: EventWithMetadata) => void
  defaultLanguage?: LanguageCode
}

export function EventCalendar({
  events,
  onEventClick,
  defaultLanguage,
}: EventCalendarProps) {
  const { isConnected } = useAccount()
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<EventWithMetadata | null>(null)
  const [language, setLanguage] = useState<LanguageCode>(
    defaultLanguage || detectUserLanguage()
  )
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Convert events to calendar format
  const calendarEvents = useMemo(
    () => eventsToCalendarFormat(events, language),
    [events, language]
  )

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set<string>()
    events.forEach((event) => {
      const translation = getTranslation(event.metadata, language)
      cats.add(translation.category)
    })
    return Array.from(cats)
  }, [events, language])

  // Filter events by category
  const filteredEvents = useMemo(() => {
    if (categoryFilter === 'all') return calendarEvents
    return calendarEvents.filter((event) => {
      const translation = getTranslation(event.resource.metadata, language)
      return translation.category === categoryFilter
    })
  }, [calendarEvents, categoryFilter, language])

  // Handle event selection
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      setSelectedEvent(event.resource)
      onEventClick?.(event.resource)
    },
    [onEventClick]
  )

  // Handle slot selection (future: create event)
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    console.log('Selected slot:', slotInfo)
    // Future: Open create event modal
  }, [])

  // Custom event style
  const eventStyleGetter = useCallback(
    (event: CalendarEvent) => {
      const isToday = isEventToday(event.resource)
      const isUpcoming = isEventUpcoming(event.resource)

      return {
        style: {
          backgroundColor: isToday
            ? '#3b82f6'
            : isUpcoming
            ? '#8b5cf6'
            : '#6366f1',
          borderRadius: '6px',
          opacity: 0.9,
          color: 'white',
          border: '0px',
          display: 'block',
        },
      }
    },
    []
  )

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Event Calendar</h2>
          <p className="text-gray-400 mt-1">
            {isConnected
              ? 'View all events from Base L2 blockchain'
              : 'Connect wallet to view your events'}
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <Filter className="w-4 h-4 text-white" />
          <span className="text-white">Filters</span>
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
          >
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm text-gray-400 mb-2 block">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all" className="bg-slate-800">
                    All Categories
                  </option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-800">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={() => {
                    setCategoryFilter('all')
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 calendar-container">
        <style jsx global>{`
          .calendar-container .rbc-calendar {
            color: white;
          }
          .calendar-container .rbc-header {
            color: white;
            padding: 12px;
            font-weight: 600;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          .calendar-container .rbc-month-view {
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          .calendar-container .rbc-day-bg {
            border-left: 1px solid rgba(255, 255, 255, 0.1);
          }
          .calendar-container .rbc-date-cell {
            padding: 8px;
            text-align: right;
          }
          .calendar-container .rbc-off-range {
            color: rgba(255, 255, 255, 0.3);
          }
          .calendar-container .rbc-off-range-bg {
            background: rgba(0, 0, 0, 0.2);
          }
          .calendar-container .rbc-today {
            background-color: rgba(59, 130, 246, 0.1);
          }
          .calendar-container .rbc-toolbar {
            margin-bottom: 20px;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: space-between;
          }
          .calendar-container .rbc-toolbar button {
            color: white;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 8px;
            transition: all 0.2s;
          }
          .calendar-container .rbc-toolbar button:hover {
            background: rgba(255, 255, 255, 0.2);
          }
          .calendar-container .rbc-toolbar button.rbc-active {
            background: #3b82f6;
            border-color: #3b82f6;
          }
          .calendar-container .rbc-event {
            padding: 4px 6px;
            font-size: 12px;
            cursor: pointer;
          }
          .calendar-container .rbc-event:hover {
            opacity: 1 !important;
          }
        `}</style>

        <BigCalendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
        />
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-slate-800/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <EventDetailModal
                event={selectedEvent}
                language={language}
                onClose={() => setSelectedEvent(null)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Event Detail Modal Component
function EventDetailModal({
  event,
  language,
  onClose,
}: {
  event: EventWithMetadata
  language: LanguageCode
  onClose: () => void
}) {
  const translation = getTranslation(event.metadata, language)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {translation.name}
          </h3>
          <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
            {translation.category}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Cover Image */}
      {event.metadata.media?.coverImage && (
        <img
          src={event.metadata.media.coverImage.replace(
            'ipfs://',
            'https://ipfs.io/ipfs/'
          )}
          alt={translation.name}
          className="w-full h-48 object-cover rounded-lg mb-6"
        />
      )}

      {/* Description */}
      <div className="mb-6">
        <p className="text-gray-300 leading-relaxed">{translation.description}</p>
      </div>

      {/* Event Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-gray-300">
          <CalendarIcon className="w-5 h-5 text-blue-400" />
          <span>{formatEventDate(event.startTime, language)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <span className="text-blue-400">📍</span>
          <span>
            {translation.location} • {translation.venue}
          </span>
        </div>
      </div>

      {/* Tags */}
      {translation.tags && translation.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {translation.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-white/5 text-gray-300 text-sm rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => downloadICSFile(event, language)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          <Download className="w-4 h-4" />
          Download .ics
        </button>

        <a
          href={getGoogleCalendarURL(event, language)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Google Calendar
        </a>

        <a
          href={getOutlookCalendarURL(event, language)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Outlook
        </a>
      </div>
    </div>
  )
}
