import type { Metadata } from 'next'
import { siteConfig, getSiteUrl } from '@/config/site'

interface CreatePageMetadataOptions {
  title: string
  description: string
  path?: string
  keywords?: string[]
  type?: 'website' | 'article' | 'profile' | 'event'
  images?: string[]
  robots?: Metadata['robots']
  canonical?: string
  publishedTime?: string
  modifiedTime?: string
}

export const createPageMetadata = (options: CreatePageMetadataOptions): Metadata => {
  const {
    title,
    description,
    path = '/',
    keywords,
    type = 'website',
    images,
    robots,
    canonical,
    publishedTime,
    modifiedTime,
  } = options

  const canonicalUrl = canonical || getSiteUrl(path)
  const ogImages = images?.length ? images : [siteConfig.ogImage]
  
  // Map 'event' to 'website' as event is not a valid OpenGraph type in Next.js
  const ogType = type === 'event' ? 'website' : type;

  return {
    title,
    description,
    keywords: (keywords && keywords.join(', ')) || siteConfig.keywords.join(', '),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: ogType,
      siteName: siteConfig.name,
      images: ogImages.map((url) => ({
        url,
        width: 1200,
        height: 630,
        alt: title,
      })),
      locale: 'en_US',
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      site: '@eventura_app',
      title,
      description,
      images: ogImages,
    },
    robots,
  }
}

export const organizationJsonLd = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: siteConfig.logo,
    description: siteConfig.description,
    sameAs: Object.values(siteConfig.social),
    contactPoint: {
      '@type': 'ContactPoint',
      email: siteConfig.contact.email,
      contactType: 'customer support',
    },
  }
}

interface BreadcrumbItem {
  name: string
  item: string
}

export const breadcrumbListJsonLd = (items: BreadcrumbItem[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  }
}

export interface SeoEvent {
  name: string
  description: string
  url: string
  image?: string
  startDate?: string
  endDate?: string
  location?: {
    name?: string
    address?: string
  }
  offers?: {
    price: number
    priceCurrency?: string
    url?: string
    availability?: string
  }
  organizer?: {
    name?: string
    url?: string
  }
  performer?: {
    name: string
  }[]
}

export const eventJsonLd = (event: SeoEvent) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    url: event.url,
    image: event.image,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    location: {
      '@type': 'Place',
      name: event.location?.name || event.location?.address || 'Online',
      address: event.location?.address,
    },
    offers: event.offers
      ? {
          '@type': 'Offer',
          price: event.offers.price,
          priceCurrency: event.offers.priceCurrency || 'USD',
          url: event.offers.url || event.url,
          availability: event.offers.availability || 'https://schema.org/InStock',
        }
      : undefined,
    organizer: event.organizer
      ? {
          '@type': 'Organization',
          name: event.organizer.name || siteConfig.name,
          url: event.organizer.url || siteConfig.url,
        }
      : undefined,
    performer: event.performer?.map((person) => ({
      '@type': 'Person',
      name: person.name,
    })),
  }
}

