import { sampleEvents } from '@/data/sampleEvents'
import { getSiteUrl } from '@/config/site'
import { slugify } from '@/utils/slugify'
import type { SeoEvent } from './seo'

export interface SeoReadyEvent {
  id: string
  title: string
  description: string
  image?: string
  date?: string
  endDate?: string
  price?: number
  category?: string
  location?: string
  organizer?: string
  slug: string
}

const extractTitle = (event: any): string => {
  return (
    event.metadata?.title ||
    event.metadata?.translations?.en?.name ||
    event.metadata?.translations?.[event.metadata?.defaultLanguage || 'en']?.name ||
    `Event ${event.id?.toString() || ''}`
  )
}

const extractDescription = (event: any): string => {
  return (
    event.metadata?.description ||
    event.metadata?.translations?.en?.description ||
    event.metadata?.translations?.[event.metadata?.defaultLanguage || 'en']?.description ||
    'Discover unforgettable experiences powered by Eventura.'
  )
}

const extractImage = (event: any): string | undefined => {
  return event.metadata?.image || event.metadata?.media?.coverImage
}

const extractDate = (event: any): string | undefined => {
  if (event.metadata?.date) {
    return event.metadata.date
  }

  if (event.startTime) {
    return new Date(Number(event.startTime) * 1000).toISOString()
  }

  return undefined
}

const extractEndDate = (event: any): string | undefined => {
  if (event.metadata?.endDate) {
    return event.metadata.endDate
  }
  if (event.endTime) {
    return new Date(Number(event.endTime) * 1000).toISOString()
  }
  return undefined
}

const extractPrice = (event: any): number | undefined => {
  if (typeof event.metadata?.price === 'number') {
    return event.metadata.price
  }
  if (event.ticketPrice) {
    const price = Number(event.ticketPrice)
    if (!Number.isNaN(price)) {
      return price / 10 ** 18
    }
  }
  return undefined
}

const extractCategory = (event: any): string | undefined => {
  return event.metadata?.category || event.metadata?.translations?.en?.category
}

const extractLocation = (event: any): string | undefined => {
  return event.metadata?.location || event.metadata?.translations?.en?.location
}

const extractOrganizer = (event: any): string | undefined => {
  return (
    event.metadata?.organizer?.name ||
    event.organizer ||
    event.metadata?.translations?.en?.organizer ||
    undefined
  )
}

export const toSeoReadyEvent = (event: any): SeoReadyEvent => {
  const title = extractTitle(event)
  const slug = slugify(`${title}-${event.id?.toString?.() || event.id || 'event'}`)

  return {
    id: event.id?.toString?.() || event.id || slug,
    title,
    description: extractDescription(event),
    image: extractImage(event),
    date: extractDate(event),
    endDate: extractEndDate(event),
    price: extractPrice(event),
    category: extractCategory(event),
    location: extractLocation(event),
    organizer: extractOrganizer(event),
    slug,
  }
}

export const getAllSeoEvents = (): SeoReadyEvent[] => {
  return sampleEvents.map(toSeoReadyEvent)
}

export const findSeoEventBySlug = (slug: string): SeoReadyEvent | undefined => {
  return getAllSeoEvents().find((event) => event.slug === slug)
}

export const getEventKeywords = (event: SeoReadyEvent): string[] => {
  const keywords = [
    event.title,
    event.category,
    event.location,
    'Eventura events',
    'NFT tickets',
    'blockchain events',
  ].filter(Boolean) as string[]

  return Array.from(new Set(keywords))
}

export const buildEventJsonLd = (event: SeoReadyEvent): SeoEvent => {
  return {
    name: event.title,
    description: event.description,
    url: getSiteUrl(`/events/${event.slug}`),
    image: event.image,
    startDate: event.date,
    endDate: event.endDate,
    location: {
      name: event.location,
      address: event.location,
    },
    offers: event.price
      ? {
          price: event.price,
          priceCurrency: 'USD',
          url: getSiteUrl(`/events/${event.slug}`),
        }
      : undefined,
    organizer: {
      name: event.organizer || 'Eventura',
      url: getSiteUrl('/'),
    },
  }
}

