import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, MapPin, Tag } from 'lucide-react'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SeoJsonLd } from '@/components/SeoJsonLd'
import { ShareButton } from '@/components/ShareButton'
import { breadcrumbListJsonLd, createPageMetadata } from '@/lib/seo'
import { buildEventJsonLd, findSeoEventBySlug, getAllSeoEvents, getEventKeywords } from '@/lib/eventSeo'
import { getSiteUrl, siteConfig } from '@/config/site'

interface EventPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  return getAllSeoEvents().map((event) => ({ slug: event.slug }))
}

export async function generateMetadata({ params }: EventPageProps) {
  const event = findSeoEventBySlug(params.slug)

  if (!event) {
    return {}
  }

  const date = event.date
    ? new Date(event.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : undefined

  return createPageMetadata({
    title: `${event.title}${date ? ` - ${date}` : ''} | Eventura`,
    description: event.description.slice(0, 160),
    path: `/events/${event.slug}`,
    type: 'event',
    keywords: getEventKeywords(event),
    images: event.image ? [event.image] : undefined,
  })
}

export default function EventDetailPage({ params }: EventPageProps) {
  const event = findSeoEventBySlug(params.slug)

  if (!event) {
    notFound()
  }

  const relatedEvents = getAllSeoEvents()
    .filter((item) => item.slug !== event.slug && item.category === event.category)
    .slice(0, 3)

  const fallbackRelated = relatedEvents.length > 0 ? relatedEvents : getAllSeoEvents().filter((item) => item.slug !== event.slug).slice(0, 3)

  const eventUrl = getSiteUrl(`/events/${event.slug}`)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <SeoJsonLd
        data={[
          breadcrumbListJsonLd([
            { name: 'Home', item: siteConfig.url },
            { name: 'Events', item: `${siteConfig.url}/events` },
            { name: event.title, item: eventUrl },
          ]),
          buildEventJsonLd(event),
        ]}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Events', href: '/events' },
            { label: event.title },
          ]}
          className="mb-6"
        />

        <article className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {event.image && (
            <div className="relative h-80">
              <img src={event.image} alt={`${event.title} hero`} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-blue-300">{event.category}</p>
                <h1 className="text-4xl font-bold mt-2">{event.title}</h1>
              </div>
              <ShareButton eventId={event.id} eventTitle={event.title} eventUrl={eventUrl} />
            </div>

            <p className="text-gray-200 leading-relaxed">{event.description}</p>

            <div className="grid gap-4 md:grid-cols-3 text-sm text-gray-200">
              {event.date && (
                <div className="flex items-start gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-300 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Date</p>
                    <p className="text-white text-base">
                      {new Date(event.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}
              {event.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-blue-300 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Location</p>
                    <p className="text-white text-base">{event.location}</p>
                  </div>
                </div>
              )}
              {event.price && (
                <div className="flex items-start gap-2">
                  <Tag className="w-5 h-5 text-blue-300 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Ticket Price</p>
                    <p className="text-white text-base">Starting at ${event.price}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {getEventKeywords(event).map((keyword) => (
                <span key={keyword} className="px-3 py-1 rounded-full border border-white/20 text-xs uppercase tracking-wide text-purple-200">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </article>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">More events like this</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {fallbackRelated.map((related) => (
              <Link
                key={related.id}
                href={`/events/${related.slug}`}
                className="border border-white/10 rounded-2xl p-4 bg-white/5 hover:bg-white/10 transition-colors"
              >
                {related.image && (
                  <img src={related.image} alt={`${related.title} preview`} className="h-32 w-full object-cover rounded-xl mb-3" loading="lazy" />
                )}
                <p className="text-xs text-blue-300 uppercase tracking-wide">{related.category}</p>
                <h3 className="text-lg font-semibold mt-1">{related.title}</h3>
                {related.date && (
                  <p className="text-sm text-gray-300 mt-1">
                    {new Date(related.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

