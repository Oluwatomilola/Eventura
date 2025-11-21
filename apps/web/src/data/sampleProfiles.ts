export interface SampleProfile {
  wallet: string
  name: string
  bio: string
  avatar: string
  location: string
  expertise: string[]
  isPrivate?: boolean
}

export const sampleProfiles: SampleProfile[] = [
  {
    wallet: '0x1234',
    name: 'Grace Builder',
    bio: 'Founder @ Eventura. Building decentralized ticketing infra on Base.',
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80',
    location: 'San Francisco, CA',
    expertise: ['web3', 'product', 'events'],
  },
  {
    wallet: '0xabcd',
    name: 'Leo Innovator',
    bio: 'Community strategist focused on NFT ticketing growth.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    location: 'Austin, TX',
    expertise: ['community', 'marketing', 'events'],
  },
  {
    wallet: '0xprivate',
    name: 'Private Organizer',
    bio: 'This profile is private.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    location: 'Remote',
    expertise: ['operations'],
    isPrivate: true,
  },
]

