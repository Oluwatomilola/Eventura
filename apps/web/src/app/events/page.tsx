import Link from 'next/link'
import { CalendarDays, MapPin, Tag } from 'lucide-react'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SeoJsonLd } from '@/components/SeoJsonLd'
import { breadcrumbListJsonLd, createPageMetadata } from '@/lib/seo'
import { buildEventJsonLd, getAllSeoEvents, getEventKeywords } from '@/lib/eventSeo'
import { siteConfig } from '@/config/site'

const events = getAllSeoEvents()

export const metadata = createPageMetadata({
  title: 'Browse Events | Eventura',
  description:
    'Discover tech conferences, concerts, workshops, and more. Buy verified NFT tickets and connect with attendees.',
  path: '/events',
  keywords: ['browse events', 'NFT tickets', 'tech conferences', 'concerts', 'web3 events'],
})

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <SeoJsonLd
        data={[
          breadcrumbListJsonLd([
            { name: 'Home', item: siteConfig.url },
            { name: 'Events', item: `${siteConfig.url}/events` },
          ]),
          ...events.slice(0, 6).map((event) => buildEventJsonLd(event)),
        ]}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Events' },
          ]}
          className="mb-6"
        />

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Browse Events</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Discover tech conferences, concerts, workshops, and more. Buy verified NFT tickets and connect with attendees ahead of time.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {events.map((event) => (
            <div key={event.id} className="bg-white/10 border border-white/10 rounded-2xl overflow-hidden backdrop-blur">
              {event.image && (
                <img src={event.image} alt={`${event.title} cover`} className="h-56 w-full object-cover" loading="lazy" />
              )}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-blue-300 uppercase tracking-wide mb-1">{event.category}</p>
                  <h2 className="text-2xl font-semibold">{event.title}</h2>
                </div>
                <p className="text-gray-300 line-clamp-3">{event.description}</p>
                <div className="space-y-2 text-sm text-gray-300">
                  {event.date && (
                    <p className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                  {event.location && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </p>
                  )}
                  {event.price && (
                    <p className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Starting at ${event.price}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2 text-xs text-purple-200">
                    {getEventKeywords(event)
                      .slice(0, 3)
                      .map((keyword) => (
                        <span key={keyword} className="px-2 py-1 bg-purple-500/20 rounded-full">
                          {keyword}
                        </span>
                      ))}
                  </div>
                  <Link
                    href={`/events/${event.slug}`}
                    className="text-blue-300 font-semibold hover:text-blue-200 transition-colors"
                    aria-label={`View details for ${event.title}`}
                  >
                    View Event →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

