'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Calendar as BigCalendar, momentLocalizer, View, SlotInfo } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Download, ExternalLink, X, Calendar as CalendarIcon, Filter, MapPin } from 'lucide-react'
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
            ? '#0891b2' // cyan-600
            : isUpcoming
            ? '#0e7490' // cyan-700
            : '#1e293b', // slate-800
          borderRadius: '0px',
          opacity: 0.9,
          color: 'white',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          display: 'block',
          fontFamily: 'monospace',
          fontSize: '12px',
        },
      }
    },
    []
  )

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/50 p-4 border border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white font-mono uppercase tracking-wide">
            Protocol Calendar
          </h2>
          <p className="text-zinc-500 text-xs font-mono mt-1">
            {isConnected
              ? `SYNCED: ${events.length} EVENTS`
              : 'WALLET DISCONNECTED'}
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors border ${
            showFilters 
              ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' 
              : 'bg-transparent border-zinc-700 text-zinc-400 hover:text-white'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>Filter_Data</span>
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-950 border-x border-b border-zinc-800 p-4"
          >
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs text-cyan-500 mb-2 block font-mono uppercase tracking-widest">
                  Category_Select
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-none text-white focus:outline-none focus:border-cyan-500 font-mono text-sm"
                >
                  <option value="all">ALL_CATEGORIES</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={() => {
                    setCategoryFilter('all')
                  }}
                  className="px-4 py-2 bg-transparent border border-red-900/50 text-red-500 hover:bg-red-900/10 hover:text-red-400 transition-colors font-mono text-xs uppercase"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar */}
      <div className="bg-zinc-950 p-6 border border-zinc-800 calendar-container">
        <style jsx global>{`
          .calendar-container .rbc-calendar {
            color: #e4e4e7; /* zinc-200 */
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          }
          .calendar-container .rbc-header {
            color: #06b6d4; /* cyan-500 */
            padding: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #27272a; /* zinc-800 */
          }
          .calendar-container .rbc-month-view {
            border: 1px solid #27272a;
            background: #09090b; /* zinc-950 */
          }
          .calendar-container .rbc-day-bg {
            border-left: 1px solid #27272a;
          }
          .calendar-container .rbc-date-cell {
            padding: 8px;
            text-align: right;
            font-size: 12px;
            color: #71717a; /* zinc-500 */
          }
          .calendar-container .rbc-off-range {
            color: #3f3f46; /* zinc-700 */
            background: #000000;
          }
          .calendar-container .rbc-off-range-bg {
            background: #000000;
          }
          .calendar-container .rbc-today {
            background-color: rgba(6, 182, 212, 0.05);
          }
          .calendar-container .rbc-toolbar {
            margin-bottom: 20px;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: space-between;
            border-bottom: 1px solid #27272a;
            padding-bottom: 16px;
          }
          .calendar-container .rbc-toolbar button {
            color: #a1a1aa; /* zinc-400 */
            background: transparent;
            border: 1px solid #27272a;
            padding: 6px 12px;
            border-radius: 0;
            transition: all 0.2s;
            font-size: 12px;
            text-transform: uppercase;
          }
          .calendar-container .rbc-toolbar button:hover {
            color: white;
            border-color: #52525b; /* zinc-600 */
          }
          .calendar-container .rbc-toolbar button.rbc-active {
            background: #06b6d4; /* cyan-500 */
            border-color: #06b6d4;
            color: black;
            font-weight: bold;
          }
          .calendar-container .rbc-toolbar-label {
            font-weight: bold;
            color: white;
            font-size: 16px;
            letter-spacing: 0.05em;
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
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-zinc-950 border border-cyan-500/30 shadow-[0_0_50px_-10px_rgba(6,182,212,0.2)] z-50 max-h-[90vh] overflow-y-auto"
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
    <div className="p-0">
      {/* Header */}
      <div className="flex justify-between items-start p-6 border-b border-zinc-800 bg-zinc-900/30">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
            {translation.name}
          </h3>
          <span className="px-3 py-1 bg-cyan-900/30 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-wider">
            {translation.category}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:text-cyan-400 transition-colors text-zinc-500"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6">
        {/* Cover Image */}
        {event.metadata.media?.coverImage && (
          <div className="relative mb-6 border border-zinc-800">
            <Image
              src={event.metadata.media.coverImage.replace('ipfs://', 'https://ipfs.io/ipfs/')}
              alt={translation.name}
              width={1200}
              height={400}
              className="w-full h-48 object-cover opacity-80 hover:opacity-100 transition-opacity"
            />
            {/* Scanline overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
          </div>
        )}

        {/* Description */}
        <div className="mb-8">
          <p className="text-zinc-300 leading-relaxed text-sm">{translation.description}</p>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-900/50 p-4 border border-zinc-800">
            <div className="flex items-center gap-2 text-cyan-500 mb-2">
              <CalendarIcon className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wider">Time_Data</span>
            </div>
            <span className="text-white text-sm">{formatEventDate(event.startTime, language)}</span>
          </div>
          <div className="bg-zinc-900/50 p-4 border border-zinc-800">
            <div className="flex items-center gap-2 text-cyan-500 mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wider">Coordinates</span>
            </div>
            <span className="text-white text-sm">
              {translation.location} • {translation.venue}
            </span>
          </div>
        </div>

        {/* Tags */}
        {translation.tags && translation.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {translation.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-zinc-900 text-zinc-400 text-xs font-mono border border-zinc-800"
              >
                #{tag.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-zinc-800 pt-6">
          <button
            onClick={() => downloadICSFile(event, language)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold font-mono uppercase tracking-wider transition-all"
          >
            <Download className="w-4 h-4" />
            Get .ICS
          </button>

          <a
            href={getGoogleCalendarURL(event, language)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-zinc-700 hover:border-white text-zinc-300 hover:text-white font-mono text-xs uppercase transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Google Cal
          </a>

          <a
            href={getOutlookCalendarURL(event, language)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-zinc-700 hover:border-white text-zinc-300 hover:text-white font-mono text-xs uppercase transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Outlook
          </a>
        </div>
      </div>
    </div>
  )
}
