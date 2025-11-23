import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'
import { getAllSeoEvents } from '@/lib/eventSeo'
import { sampleProfiles } from '@/data/sampleProfiles'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      priority: 1.0,
      changeFrequency: 'daily' as const,
      lastModified: new Date(),
    },
    {
      url: `${siteConfig.url}/events`,
      priority: 0.8,
      changeFrequency: 'daily' as const,
      lastModified: new Date(),
    },
    {
      url: `${siteConfig.url}/calendar`,
      priority: 0.6,
      changeFrequency: 'weekly' as const,
      lastModified: new Date(),
    },
    {
      url: `${siteConfig.url}/performance`,
      priority: 0.4,
      changeFrequency: 'weekly' as const,
      lastModified: new Date(),
    },
    {
      url: `${siteConfig.url}/recommendations-demo`,
      priority: 0.4,
      changeFrequency: 'weekly' as const,
      lastModified: new Date(),
    },
  ]

  const eventRoutes = getAllSeoEvents().map((event) => ({
    url: `${siteConfig.url}/events/${event.slug}`,
    priority: 0.8,
    changeFrequency: 'weekly' as const,
    lastModified: event.date ? new Date(event.date) : new Date(),
  }))

  const profileRoutes = sampleProfiles
    .filter((profile) => !profile.isPrivate)
    .map((profile) => ({
      url: `${siteConfig.url}/profile/${profile.wallet}`,
      priority: 0.3,
      changeFrequency: 'monthly' as const,
      lastModified: new Date(),
    }))

  return [...baseRoutes, ...eventRoutes, ...profileRoutes]
}

