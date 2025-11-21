const DEFAULT_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://eventura.xyz'

export const siteConfig = {
  name: 'Eventura',
  tagline: 'Connect with Event Attendees Before You Arrive',
  description:
    'Eventura is the first platform where you connect with attendees before events. Buy NFT tickets, create personas, and network before you arrive.',
  keywords: [
    'Eventura',
    'event tickets',
    'NFT tickets',
    'blockchain events',
    'pre-event networking',
    'web3 ticketing',
  ],
  url: DEFAULT_URL,
  logo: `${DEFAULT_URL}/logo.svg`,
  ogImage:
    'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&w=1200&q=80',
  social: {
    twitter: 'https://twitter.com/eventura_app',
    discord: 'https://discord.gg/eventura',
    linkedin: 'https://www.linkedin.com/company/eventura',
    github: 'https://github.com/EventuraHQ',
  },
  contact: {
    email: 'hello@eventura.xyz',
  },
}

export type SiteConfig = typeof siteConfig

export const getSiteUrl = (path = '/'): string => {
  if (path.startsWith('http')) return path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return new URL(normalizedPath, siteConfig.url).toString()
}

