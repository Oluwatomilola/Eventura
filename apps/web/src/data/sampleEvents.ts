/**
 * Sample Event Data for Development and Demo
 *
 * This file contains mock event data to demonstrate the recommendation system
 * In production, this would be fetched from the Base blockchain via Reown/WalletConnect
 */

import type { EventWithMetadata } from '@/types/multilang-event'

export const sampleEvents: EventWithMetadata[] = [
  {
    id: BigInt(1),
    organizer: '0x1234567890123456789012345678901234567890',
    metadataURI: 'ipfs://QmExample1',
    startTime: BigInt(Math.floor(new Date('2025-12-15').getTime() / 1000)),
    endTime: BigInt(Math.floor(new Date('2025-12-15').getTime() / 1000) + 86400),
    ticketPrice: BigInt(299 * 10 ** 18), // 299 ETH in wei
    maxTickets: BigInt(500),
    ticketsSold: BigInt(234),
    active: true,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    metadata: {
      version: '1.0',
      defaultLanguage: 'en',
      translations: {
        en: {
          name: 'Web3 Developer Conference 2025',
          description: 'Join us for the biggest Web3 developer conference of the year. Learn about the latest in blockchain technology, DeFi, and NFTs.',
          category: 'technology',
          location: 'San Francisco, CA',
          venue: 'Moscone Center',
          tags: ['web3', 'blockchain', 'developer', 'conference'],
        },
        es: {
          name: 'Conferencia de Desarrolladores Web3 2025',
          description: 'Únete a nosotros para la mayor conferencia de desarrolladores Web3 del año.',
          category: 'tecnología',
          location: 'San Francisco, CA',
          venue: 'Moscone Center',
        },
        fr: {
          name: 'Conférence des Développeurs Web3 2025',
          description: 'Rejoignez-nous pour la plus grande conférence de développeurs Web3 de l\'année.',
          category: 'technologie',
          location: 'San Francisco, CA',
          venue: 'Moscone Center',
        },
      },
      media: {
        coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
      },
    },
  },
  {
    id: BigInt(2),
    organizer: '0x2345678901234567890123456789012345678901',
    metadataURI: 'ipfs://QmExample2',
    startTime: BigInt(Math.floor(new Date('2025-11-20').getTime() / 1000)),
    endTime: BigInt(Math.floor(new Date('2025-11-20').getTime() / 1000) + 14400), // 4 hours
    ticketPrice: BigInt(75 * 10 ** 18),
    maxTickets: BigInt(200),
    ticketsSold: BigInt(87),
    active: true,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    metadata: {
      version: '1.0',
      defaultLanguage: 'en',
      translations: {
        en: {
          name: 'Live Jazz Night',
          description: 'An evening of smooth jazz with renowned artists. Enjoy cocktails and great music.',
          category: 'music',
          location: 'New York, NY',
          venue: 'Blue Note Jazz Club',
          tags: ['jazz', 'music', 'live performance'],
        },
      },
      media: {
        coverImage: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop',
      },
    },
  },
  {
    id: BigInt(3),
    organizer: '0x3456789012345678901234567890123456789012',
    metadataURI: 'ipfs://QmExample3',
    startTime: BigInt(Math.floor(new Date('2025-11-25').getTime() / 1000)),
    endTime: BigInt(Math.floor(new Date('2025-11-25').getTime() / 1000) + 28800), // 8 hours
    ticketPrice: BigInt(25 * 10 ** 18),
    maxTickets: BigInt(150),
    ticketsSold: BigInt(92),
    active: true,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    metadata: {
      version: '1.0',
      defaultLanguage: 'en',
      translations: {
        en: {
          name: 'Modern Art Exhibition',
          description: 'Explore contemporary art from emerging artists around the world.',
          category: 'art',
          location: 'Los Angeles, CA',
          venue: 'LA Contemporary Art Museum',
          tags: ['art', 'exhibition', 'contemporary'],
        },
      },
      media: {
        coverImage: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&h=600&fit=crop',
      },
    },
  },
  {
    id: BigInt(4),
    organizer: '0x4567890123456789012345678901234567890123',
    metadataURI: 'ipfs://QmExample4',
    startTime: BigInt(Math.floor(new Date('2025-11-18').getTime() / 1000)),
    endTime: BigInt(Math.floor(new Date('2025-11-18').getTime() / 1000) + 10800), // 3 hours
    ticketPrice: BigInt(50 * 10 ** 18),
    maxTickets: BigInt(100),
    ticketsSold: BigInt(45),
    active: true,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    metadata: {
      version: '1.0',
      defaultLanguage: 'en',
      translations: {
        en: {
          name: 'Startup Networking Mixer',
          description: 'Connect with fellow entrepreneurs, investors, and innovators in the startup ecosystem.',
          category: 'networking',
          location: 'Austin, TX',
          venue: 'Capital Factory',
          tags: ['startup', 'networking', 'entrepreneurship'],
        },
      },
      media: {
        coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop',
      },
    },
  },
  {
    id: BigInt(5),
    organizer: '0x5678901234567890123456789012345678901234',
    metadataURI: 'ipfs://QmExample5',
    startTime: BigInt(Math.floor(new Date('2025-12-05').getTime() / 1000)),
    endTime: BigInt(Math.floor(new Date('2025-12-07').getTime() / 1000) + 86400), // 3 days
    ticketPrice: BigInt(350 * 10 ** 18),
    maxTickets: BigInt(5000),
    ticketsSold: BigInt(3456),
    active: true,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    metadata: {
      version: '1.0',
      defaultLanguage: 'en',
      translations: {
        en: {
          name: 'Electronic Music Festival',
          description: 'Three days of non-stop electronic music featuring top DJs from around the world.',
          category: 'music',
          location: 'Miami, FL',
          venue: 'Bayfront Park',
          tags: ['music', 'festival', 'electronic', 'DJ'],
        },
      },
      media: {
        coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
      },
    },
  },
  {
    id: BigInt(6),
    organizer: '0x6789012345678901234567890123456789012345',
    metadataURI: 'ipfs://QmExample6',
    startTime: BigInt(Math.floor(new Date('2025-12-10').getTime() / 1000)),
    endTime: BigInt(Math.floor(new Date('2025-12-11').getTime() / 1000) + 86400), // 2 days
    ticketPrice: BigInt(399 * 10 ** 18),
    maxTickets: BigInt(800),
    ticketsSold: BigInt(567),
    active: true,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    metadata: {
      version: '1.0',
      defaultLanguage: 'en',
      translations: {
        en: {
          name: 'AI & Machine Learning Summit',
          description: 'Discover the latest advancements in AI and machine learning from industry leaders.',
          category: 'technology',
          location: 'Seattle, WA',
          venue: 'Seattle Convention Center',
          tags: ['AI', 'machine learning', 'technology', 'conference'],
        },
      },
      media: {
        coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
      },
    },
  },
  {
    id: BigInt(7),
    organizer: '0x7890123456789012345678901234567890123456',
    metadataURI: 'ipfs://QmExample7',
    startTime: BigInt(Math.floor(new Date('2025-11-22').getTime() / 1000)),
    endTime: BigInt(Math.floor(new Date('2025-11-24').getTime() / 1000) + 86400), // 3 days
    ticketPrice: BigInt(450 * 10 ** 18),
    maxTickets: BigInt(50),
    ticketsSold: BigInt(38),
    active: true,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    metadata: {
      version: '1.0',
      defaultLanguage: 'en',
      translations: {
        en: {
          name: 'Yoga & Wellness Retreat',
          description: 'A weekend of mindfulness, yoga, and wellness activities in a serene mountain setting.',
          category: 'wellness',
          location: 'Boulder, CO',
          venue: 'Mountain Zen Retreat Center',
          tags: ['yoga', 'wellness', 'retreat', 'mindfulness'],
        },
      },
      media: {
        coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop',
      },
    },
  },
  {
    id: BigInt(8),
    organizer: '0x8901234567890123456789012345678901234567',
    metadataURI: 'ipfs://QmExample8',
    startTime: BigInt(Math.floor(new Date('2025-11-28').getTime() / 1000)),
    endTime: BigInt(Math.floor(new Date('2025-11-28').getTime() / 1000) + 21600), // 6 hours
    ticketPrice: BigInt(180 * 10 ** 18),
    maxTickets: BigInt(300),
    ticketsSold: BigInt(245),
    active: true,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    metadata: {
      version: '1.0',
      defaultLanguage: 'en',
      translations: {
        en: {
          name: 'Food & Wine Festival',
          description: 'Taste exquisite cuisines and premium wines from award-winning chefs and sommeliers.',
          category: 'food',
          location: 'Napa Valley, CA',
          venue: 'Napa Valley Expo',
          tags: ['food', 'wine', 'festival', 'culinary'],
        },
      },
      media: {
        coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
      },
    },
  },
  {
    id: BigInt(9),
    organizer: '0x9012345678901234567890123456789012345678',
    metadataURI: 'ipfs://QmExample9',
    startTime: BigInt(Math.floor(new Date('2025-11-16').getTime() / 1000)),
    endTime: BigInt(Math.floor(new Date('2025-11-16').getTime() / 1000) + 7200), // 2 hours
    ticketPrice: BigInt(45 * 10 ** 18),
    maxTickets: BigInt(250),
    ticketsSold: BigInt(198),
    active: true,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    metadata: {
      version: '1.0',
      defaultLanguage: 'en',
      translations: {
        en: {
          name: 'Stand-Up Comedy Night',
          description: 'Laugh out loud with performances from top comedians. A night of pure entertainment.',
          category: 'entertainment',
          location: 'Chicago, IL',
          venue: 'The Comedy Bar',
          tags: ['comedy', 'entertainment', 'stand-up'],
        },
      },
      media: {
        coverImage: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&h=600&fit=crop',
      },
    },
  },
  {
    id: BigInt(10),
    organizer: '0x0123456789012345678901234567890123456789',
    metadataURI: 'ipfs://QmExample10',
    startTime: BigInt(Math.floor(new Date('2025-12-01').getTime() / 1000)),
    endTime: BigInt(Math.floor(new Date('2025-12-01').getTime() / 1000) + 21600), // 6 hours
    ticketPrice: BigInt(85 * 10 ** 18),
    maxTickets: BigInt(10000),
    ticketsSold: BigInt(7834),
    active: true,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    metadata: {
      version: '1.0',
      defaultLanguage: 'en',
      translations: {
        en: {
          name: 'Marathon Running Event',
          description: 'Join thousands of runners in this annual city marathon. All skill levels welcome.',
          category: 'sports',
          location: 'Boston, MA',
          venue: 'Boston City Streets',
          tags: ['marathon', 'running', 'sports', 'fitness'],
        },
      },
      media: {
        coverImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&h=600&fit=crop',
      },
    },
  },
  {
    id: BigInt(11),
    organizer: '0x1234567890123456789012345678901234567891',
    metadataURI: 'ipfs://QmExample11',
    startTime: BigInt(Math.floor(new Date('2025-12-08').getTime() / 1000)),
    endTime: BigInt(Math.floor(new Date('2025-12-09').getTime() / 1000) + 86400), // 2 days
    ticketPrice: BigInt(275 * 10 ** 18),
    maxTickets: BigInt(600),
    ticketsSold: BigInt(412),
    active: true,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    metadata: {
      version: '1.0',
      defaultLanguage: 'en',
      translations: {
        en: {
          name: 'Blockchain Gaming Conference',
          description: 'Explore the future of gaming with blockchain technology and NFTs.',
          category: 'technology',
          location: 'San Francisco, CA',
          venue: 'Game Developers Conference Center',
          tags: ['blockchain', 'gaming', 'NFT', 'web3'],
        },
      },
      media: {
        coverImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=600&fit=crop',
      },
    },
  },
  {
    id: BigInt(12),
    organizer: '0x2345678901234567890123456789012345678902',
    metadataURI: 'ipfs://QmExample12',
    startTime: BigInt(Math.floor(new Date('2025-11-19').getTime() / 1000)),
    endTime: BigInt(Math.floor(new Date('2025-11-19').getTime() / 1000) + 10800), // 3 hours
    ticketPrice: BigInt(95 * 10 ** 18),
    maxTickets: BigInt(400),
    ticketsSold: BigInt(367),
    active: true,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    metadata: {
      version: '1.0',
      defaultLanguage: 'en',
      translations: {
        en: {
          name: 'Classical Orchestra Performance',
          description: 'An enchanting evening with the city orchestra performing timeless classics.',
          category: 'music',
          location: 'Philadelphia, PA',
          venue: 'Philadelphia Orchestra Hall',
          tags: ['classical', 'orchestra', 'music', 'concert'],
        },
      },
      media: {
        coverImage: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&h=600&fit=crop',
      },
    },
  },
  {
    id: BigInt(13),
    organizer: '0x3456789012345678901234567890123456789013',
    metadataURI: 'ipfs://QmExample13',
    startTime: BigInt(Math.floor(new Date('2025-11-21').getTime() / 1000)),
    endTime: BigInt(Math.floor(new Date('2025-11-21').getTime() / 1000) + 28800), // 8 hours
    ticketPrice: BigInt(150 * 10 ** 18),
    maxTickets: BigInt(30),
    ticketsSold: BigInt(24),
    active: true,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    metadata: {
      version: '1.0',
      defaultLanguage: 'en',
      translations: {
        en: {
          name: 'Photography Workshop',
          description: 'Master the art of photography with hands-on training from professional photographers.',
          category: 'art',
          location: 'Portland, OR',
          venue: 'Portland Photography Studio',
          tags: ['photography', 'workshop', 'art', 'learning'],
        },
      },
      media: {
        coverImage: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop',
      },
    },
  },
  {
    id: BigInt(14),
    organizer: '0x4567890123456789012345678901234567890124',
    metadataURI: 'ipfs://QmExample14',
    startTime: BigInt(Math.floor(new Date('2025-12-03').getTime() / 1000)),
    endTime: BigInt(Math.floor(new Date('2025-12-04').getTime() / 1000) + 86400), // 2 days
    ticketPrice: BigInt(500 * 10 ** 18),
    maxTickets: BigInt(200),
    ticketsSold: BigInt(156),
    active: true,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    metadata: {
      version: '1.0',
      defaultLanguage: 'en',
      translations: {
        en: {
          name: 'Business Leadership Summit',
          description: 'Learn from top business leaders and executives about strategy and innovation.',
          category: 'networking',
          location: 'Dallas, TX',
          venue: 'Dallas Convention Center',
          tags: ['business', 'leadership', 'networking', 'summit'],
        },
      },
      media: {
        coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop',
      },
    },
  },
  {
    id: BigInt(15),
    organizer: '0x5678901234567890123456789012345678901235',
    metadataURI: 'ipfs://QmExample15',
    startTime: BigInt(Math.floor(new Date('2025-12-12').getTime() / 1000)),
    endTime: BigInt(Math.floor(new Date('2025-12-12').getTime() / 1000) + 18000), // 5 hours
    ticketPrice: BigInt(125 * 10 ** 18),
    maxTickets: BigInt(2000),
    ticketsSold: BigInt(1678),
    active: true,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    metadata: {
      version: '1.0',
      defaultLanguage: 'en',
        translations: {
          en: {
            name: 'Rock Concert Extravaganza',
            description: 'An epic rock concert featuring legendary bands and special guest performers.',
            category: 'music',
            location: 'Las Vegas, NV',
            venue: 'Las Vegas Arena',
            tags: ['rock', 'concert', 'music', 'live performance'],
          },
        },
      media: {
        coverImage: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
      },
    },
  },
]
