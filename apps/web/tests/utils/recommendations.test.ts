import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  buildUserProfile,
  scoreEventByContent,
  findSimilarUsers,
  calculatePopularityScore,
  generateRecommendations,
  findSimilarEvents,
  getCachedRecommendations,
  setCachedRecommendations,
  clearRecommendationCache,
  type UserInteraction,
  type UserProfile,
} from '../../src/lib/recommendations'
import type { EventWithMetadata } from '../../src/types/multilang-event'

// Mock the event helpers
vi.mock('../../src/lib/eventHelpers', () => ({
  getEventId: vi.fn((event) => event.id),
  getEventCategory: vi.fn((event, language = 'en') => event.metadata[language]?.category || 'general'),
  getEventLocation: vi.fn((event, language = 'en') => event.metadata[language]?.location || 'Unknown'),
  getEventPrice: vi.fn((event) => Number(event.ticketPrice) / 1e18), // Convert from wei to ETH
}))

const mockGetEventId = vi.mocked(require('../../src/lib/eventHelpers').getEventId)
const mockGetEventCategory = vi.mocked(require('../../src/lib/eventHelpers').getEventCategory)
const mockGetEventLocation = vi.mocked(require('../../src/lib/eventHelpers').getEventLocation)
const mockGetEventPrice = vi.mocked(require('../../src/lib/eventHelpers').getEventPrice)

describe('Recommendations System', () => {
  const mockEvent: EventWithMetadata = {
    id: 1n,
    startTime: 1704067200n,
    endTime: 1704074400n,
    ticketPrice: 1000000000000000000n, // 1 ETH
    maxTickets: 100n,
    ticketsSold: 25n,
    metadata: {
      [1]: {
        name: 'Test Event',
        description: 'Test description',
        category: 'conference',
        location: 'New York',
        venue: 'Convention Center',
      },
    },
  }

  const mockInteractions: UserInteraction[] = [
    {
      userId: 'user-1',
      eventId: 'event-1',
      type: 'purchase',
      timestamp: Date.now(),
      metadata: {
        category: 'conference',
        price: 100,
        location: 'New York',
      },
    },
    {
      userId: 'user-1',
      eventId: 'event-2',
      type: 'favorite',
      timestamp: Date.now() - 1000,
      metadata: {
        category: 'workshop',
        price: 50,
        location: 'San Francisco',
      },
    },
    {
      userId: 'user-1',
      eventId: 'event-3',
      type: 'view',
      timestamp: Date.now() - 2000,
      metadata: {
        category: 'conference',
        price: 80,
        location: 'New York',
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set default mock implementations
    mockGetEventId.mockReturnValue('event-1')
    mockGetEventCategory.mockReturnValue('conference')
    mockGetEventLocation.mockReturnValue('New York')
    mockGetEventPrice.mockReturnValue(100)
    
    // Clear recommendation cache before each test
    clearRecommendationCache()
  })

  describe('buildUserProfile', () => {
    it('builds user profile from interactions', () => {
      const profile = buildUserProfile(mockInteractions)
      
      expect(profile.userId).toBe('user-1')
      expect(profile.interactions).toEqual(mockInteractions)
      expect(profile.preferences.categories).toEqual({
        conference: 1.3, // purchase (1.0) + view (0.3)
        workshop: 0.7,   // favorite (0.7)
      })
      expect(profile.preferences.priceRange).toEqual({
        min: 50,
        max: 100,
      })
      expect(profile.preferences.locations).toEqual(['New York', 'San Francisco'])
    })

    it('handles empty interactions', () => {
      const profile = buildUserProfile([])
      
      expect(profile.userId).toBe('anonymous')
      expect(profile.preferences.categories).toEqual({})
      expect(profile.preferences.priceRange).toEqual({
        min: 0,
        max: 1000,
      })
      expect(profile.preferences.locations).toEqual([])
    })

    it('handles missing metadata gracefully', () => {
      const interactionsWithoutMetadata: UserInteraction[] = [
        {
          userId: 'user-2',
          eventId: 'event-4',
          type: 'view',
          timestamp: Date.now(),
          // No metadata
        },
      ]
      
      const profile = buildUserProfile(interactionsWithoutMetadata)
      
      expect(profile.preferences.categories).toEqual({
        general: 0.3, // Default category with view weight
      })
      expect(profile.preferences.priceRange).toEqual({
        min: 0,
        max: 1000,
      })
      expect(profile.preferences.locations).toEqual([])
    })

    it('deduplicates locations', () => {
      const interactionsWithDuplicates = [
        ...mockInteractions,
        {
          userId: 'user-1',
          eventId: 'event-5',
          type: 'view' as const,
          timestamp: Date.now(),
          metadata: {
            category: 'conference',
            price: 100,
            location: 'New York', // Duplicate
          },
        },
      ]
      
      const profile = buildUserProfile(interactionsWithDuplicates)
      
      expect(profile.preferences.locations).toEqual(['New York', 'San Francisco'])
      expect(profile.preferences.locations).not.toContain('New York' /* duplicate */)
    })
  })

  describe('scoreEventByContent', () => {
    it('calculates content-based score for matching category', () => {
      const profile = buildUserProfile(mockInteractions)
      const { score, reasons } = scoreEventByContent(mockEvent, profile)
      
      expect(score).toBeGreaterThan(0)
      expect(reasons).toContain('Matches your interest in conference')
    })

    it('calculates price range match', () => {
      const profile = buildUserProfile(mockInteractions)
      const { score, reasons } = scoreEventByContent(mockEvent, profile)
      
      expect(reasons).toContain('Within your price range')
    })

    it('calculates location match', () => {
      const profile = buildUserProfile(mockInteractions)
      const { score, reasons } = scoreEventByContent(mockEvent, profile)
      
      expect(reasons).toContain('In your preferred location: New York')
    })

    it('handles events outside price range', () => {
      mockGetEventPrice.mockReturnValue(500) // Much higher than user's max of 100
      
      const profile = buildUserProfile(mockInteractions)
      const { score, reasons } = scoreEventByContent(mockEvent, profile)
      
      expect(reasons).not.toContain('Within your price range')
    })

    it('handles events in unfamiliar locations', () => {
      mockGetEventLocation.mockReturnValue('London') // Not in user's preferences
      
      const profile = buildUserProfile(mockInteractions)
      const { score, reasons } = scoreEventByContent(mockEvent, profile)
      
      expect(reasons).not.toContain(expect.stringContaining('In your preferred location'))
    })

    it('returns zero score for unknown categories', () => {
      const profile = buildUserProfile(mockInteractions)
      mockGetEventCategory.mockReturnValue('unknown-category')
      
      const { score } = scoreEventByContent(mockEvent, profile)
      
      expect(score).toBe(0.5) // Only price match
    })
  })

  describe('findSimilarUsers', () => {
    it('finds users with similar interests', () => {
      const profile1 = buildUserProfile(mockInteractions)
      const profile2: UserProfile = {
        userId: 'user-2',
        interactions: [
          {
            userId: 'user-2',
            eventId: 'event-6',
            type: 'purchase',
            timestamp: Date.now(),
            metadata: { category: 'conference', price: 90, location: 'New York' },
          },
        ],
        preferences: {
          categories: { conference: 1.0 },
          priceRange: { min: 50, max: 100 },
          locations: ['New York'],
        },
      }
      const allProfiles = [profile1, profile2]
      
      const similarUsers = findSimilarUsers(profile1, allProfiles)
      
      expect(similarUsers.length).toBe(1)
      expect(similarUsers[0].userId).toBe('user-2')
      expect(similarUsers[0].similarity).toBeGreaterThan(0)
    })

    it('filters out the target user', () => {
      const profile = buildUserProfile(mockInteractions)
      const allProfiles = [profile] // Only the target user
      
      const similarUsers = findSimilarUsers(profile, allProfiles)
      
      expect(similarUsers).toEqual([])
    })

    it('applies similarity threshold', () => {
      const profile1 = buildUserProfile(mockInteractions)
      const profile2: UserProfile = {
        userId: 'user-2',
        interactions: [
          {
            userId: 'user-2',
            eventId: 'event-6',
            type: 'view',
            timestamp: Date.now(),
            metadata: { category: 'music', price: 10, location: 'Tokyo' },
          },
        ],
        preferences: {
          categories: { music: 0.3 },
          priceRange: { min: 0, max: 50 },
          locations: ['Tokyo'],
        },
      }
      const allProfiles = [profile1, profile2]
      
      const similarUsers = findSimilarUsers(profile1, allProfiles)
      
      // Should be empty due to low similarity
      expect(similarUsers).toEqual([])
    })

    it('limits results to 10 users', () => {
      const profile = buildUserProfile(mockInteractions)
      const similarProfiles = Array.from({ length: 15 }, (_, i) => ({
        userId: `user-${i + 2}`,
        interactions: [
          {
            userId: `user-${i + 2}`,
            eventId: `event-${i + 6}`,
            type: 'purchase',
            timestamp: Date.now(),
            metadata: { category: 'conference', price: 100, location: 'New York' },
          },
        ],
        preferences: {
          categories: { conference: 1.0 },
          priceRange: { min: 50, max: 100 },
          locations: ['New York'],
        },
      }))
      
      const allProfiles = [profile, ...similarProfiles]
      const similarUsers = findSimilarUsers(profile, allProfiles)
      
      expect(similarUsers.length).toBe(10)
    })
  })

  describe('calculatePopularityScore', () => {
    it('calculates popularity based on interactions', () => {
      const eventInteractions = mockInteractions.filter(i => i.eventId === 'event-1')
      const score = calculatePopularityScore('event-1', mockInteractions)
      
      expect(score).toBeGreaterThan(0)
    })

    it('weights different interaction types appropriately', () => {
      const event1Interactions: UserInteraction[] = [
        { userId: 'user-1', eventId: 'event-1', type: 'purchase', timestamp: Date.now() },
        { userId: 'user-2', eventId: 'event-1', type: 'view', timestamp: Date.now() },
        { userId: 'user-3', eventId: 'event-1', type: 'share', timestamp: Date.now() },
      ]
      
      const score = calculatePopularityScore('event-1', event1Interactions)
      
      // purchase (1.0) + view (0.3) + share (0.5) = 1.8
      expect(score).toBeCloseTo(1.8, 1)
    })

    it('applies recency boost', () => {
      const recentInteraction: UserInteraction = {
        userId: 'user-1',
        eventId: 'event-1',
        type: 'purchase',
        timestamp: Date.now(), // Very recent
      }
      
      const oldInteraction: UserInteraction = {
        userId: 'user-2',
        eventId: 'event-1',
        type: 'purchase',
        timestamp: Date.now() - 100 * 24 * 60 * 60 * 1000, // 100 days ago
      }
      
      const score = calculatePopularityScore('event-1', [recentInteraction, oldInteraction])
      
      // Recent should have higher weight
      expect(score).toBeGreaterThan(1.0)
    })

    it('handles events with no interactions', () => {
      const score = calculatePopularityScore('nonexistent-event', [])
      
      expect(score).toBe(0)
    })
  })

  describe('generateRecommendations', () => {
    it('generates personalized recommendations', () => {
      const profile = buildUserProfile(mockInteractions)
      const allProfiles = [profile]
      const events = [mockEvent]
      
      const recommendations = generateRecommendations(events, profile, allProfiles, mockInteractions)
      
      expect(recommendations).toHaveLength(1)
      expect(recommendations[0]).toEqual({
        eventId: 'event-1',
        score: expect.any(Number),
        reasons: expect.arrayContaining([expect.stringContaining('Matches your interest')]),
      })
    })

    it('respects limit parameter', () => {
      const profile = buildUserProfile(mockInteractions)
      const allProfiles = [profile]
      const events = Array.from({ length: 15 }, (_, i) => ({
        ...mockEvent,
        id: `event-${i + 1}`,
      }))
      
      const recommendations = generateRecommendations(events, profile, allProfiles, mockInteractions, {
        limit: 5,
      })
      
      expect(recommendations).toHaveLength(5)
    })

    it('excludes already viewed events when option is set', () => {
      const profile = buildUserProfile(mockInteractions)
      const allProfiles = [profile]
      const events = [mockEvent] // User already interacted with this event
      
      const recommendations = generateRecommendations(events, profile, allProfiles, mockInteractions, {
        excludeViewed: true,
      })
      
      expect(recommendations).toEqual([])
    })

    it('includes viewed events when option is disabled', () => {
      const profile = buildUserProfile(mockInteractions)
      const allProfiles = [profile]
      const events = [mockEvent]
      
      const recommendations = generateRecommendations(events, profile, allProfiles, mockInteractions, {
        excludeViewed: false,
      })
      
      expect(recommendations).toHaveLength(1)
    })

    it('filters by minimum score', () => {
      const profile = buildUserProfile(mockInteractions)
      const allProfiles = [profile]
      const events = [mockEvent]
      
      const recommendations = generateRecommendations(events, profile, allProfiles, mockInteractions, {
        minScore: 10, // Very high threshold
      })
      
      expect(recommendations).toEqual([])
    })

    it('includes collaborative filtering when similar users exist', () => {
      const profile1 = buildUserProfile(mockInteractions)
      const profile2: UserProfile = {
        ...profile1,
        userId: 'user-2',
        interactions: [
          {
            userId: 'user-2',
            eventId: 'event-4',
            type: 'purchase',
            timestamp: Date.now(),
            metadata: { category: 'conference', price: 100, location: 'New York' },
          },
        ],
      }
      
      const allProfiles = [profile1, profile2]
      const events = [{ ...mockEvent, id: 'event-4' }]
      
      const recommendations = generateRecommendations(events, profile1, allProfiles, [...mockInteractions, ...profile2.interactions])
      
      expect(recommendations[0].reasons).toContain('Popular with similar users')
    })

    it('includes popularity boost for trending events', () => {
      const profile = buildUserProfile(mockInteractions)
      const allProfiles = [profile]
      
      // Create multiple interactions to make it "trending"
      const trendingEventInteractions = Array.from({ length: 10 }, (_, i) => ({
        userId: `user-${i}`,
        eventId: 'trending-event',
        type: 'purchase' as const,
        timestamp: Date.now(),
        metadata: { category: 'conference', price: 100, location: 'New York' },
      }))
      
      const events = [{ ...mockEvent, id: 'trending-event' }]
      
      const recommendations = generateRecommendations(events, profile, allProfiles, trendingEventInteractions)
      
      expect(recommendations[0].reasons).toContain('Trending event')
    })
  })

  describe('findSimilarEvents', () => {
    it('finds events with similar content', () => {
      const similarEvent: EventWithMetadata = {
        ...mockEvent,
        id: 'event-2',
        metadata: {
          en: {
            name: 'Similar Event',
            description: 'Similar description',
            category: 'conference', // Same category
            location: 'New York', // Same location
            venue: 'Another Center',
          },
        },
      }
      
      const events = [mockEvent, similarEvent]
      const similar = findSimilarEvents(mockEvent, events, 5)
      
      expect(similar).toContain(similarEvent)
      expect(similar).not.toContain(mockEvent) // Should not include itself
    })

    it('scores events by category match', () => {
      const conferenceEvent: EventWithMetadata = {
        ...mockEvent,
        id: 'event-2',
        metadata: {
          en: {
            name: 'Conference Event',
            description: 'Conference',
            category: 'conference',
            location: 'Different City',
            venue: 'Conference Hall',
          },
        },
      }
      
      const workshopEvent: EventWithMetadata = {
        ...mockEvent,
        id: 'event-3',
        metadata: {
          en: {
            name: 'Workshop Event',
            description: 'Workshop',
            category: 'workshop',
            location: 'Different City',
            venue: 'Workshop Space',
          },
        },
      }
      
      const events = [mockEvent, conferenceEvent, workshopEvent]
      const similar = findSimilarEvents(mockEvent, events, 2)
      
      // Should prefer conference event (same category)
      expect(similar[0]).toBe(conferenceEvent)
      expect(similar[1]).toBe(workshopEvent)
    })

    it('considers price similarity', () => {
      const expensiveEvent: EventWithMetadata = {
        ...mockEvent,
        id: 'event-2',
        ticketPrice: 5000000000000000000n, // 5 ETH
        metadata: {
          en: {
            name: 'Expensive Event',
            description: 'Expensive',
            category: 'conference',
            location: 'New York',
            venue: 'Luxury Venue',
          },
        },
      }
      
      const similarPriceEvent: EventWithMetadata = {
        ...mockEvent,
        id: 'event-3',
        ticketPrice: 1100000000000000000n, // 1.1 ETH (close to 1.0 ETH)
        metadata: {
          en: {
            name: 'Similar Price Event',
            description: 'Similar price',
            category: 'conference',
            location: 'New York',
            venue: 'Similar Venue',
          },
        },
      }
      
      mockGetEventPrice
        .mockReturnValueOnce(100) // mockEvent
        .mockReturnValueOnce(500) // expensiveEvent
        .mockReturnValueOnce(110) // similarPriceEvent
      
      const events = [mockEvent, expensiveEvent, similarPriceEvent]
      const similar = findSimilarEvents(mockEvent, events, 2)
      
      // Should prefer similar price event
      expect(similar[0]).toBe(similarPriceEvent)
    })

    it('limits results by limit parameter', () => {
      const events = Array.from({ length: 10 }, (_, i) => ({
        ...mockEvent,
        id: `event-${i + 2}`,
      }))
      
      const similar = findSimilarEvents(mockEvent, events, 3)
      
      expect(similar).toHaveLength(3)
    })
  })

  describe('Recommendation Cache', () => {
    const mockRecommendations = [
      { eventId: 'event-1', score: 0.8, reasons: ['Test reason'] },
    ]

    it('caches recommendations', () => {
      setCachedRecommendations('user-1', mockRecommendations)
      
      const cached = getCachedRecommendations('user-1')
      
      expect(cached).toEqual(mockRecommendations)
    })

    it('returns null for uncached users', () => {
      const cached = getCachedRecommendations('unknown-user')
      
      expect(cached).toBeNull()
    })

    it('expires cache after TTL', () => {
      // Mock Date.now to simulate time passage
      const originalNow = Date.now
      vi.setSystemTime(10000) // Advance time by 10 seconds (past 5 min TTL)
      
      setCachedRecommendations('user-1', mockRecommendations)
      
      const cached = getCachedRecommendations('user-1')
      
      expect(cached).toBeNull()
      
      vi.setSystemTime(originalNow)
    })

    it('clears cache for specific user', () => {
      setCachedRecommendations('user-1', mockRecommendations)
      setCachedRecommendations('user-2', mockRecommendations)
      
      clearRecommendationCache('user-1')
      
      expect(getCachedRecommendations('user-1')).toBeNull()
      expect(getCachedRecommendations('user-2')).toEqual(mockRecommendations)
    })

    it('clears entire cache when no user specified', () => {
      setCachedRecommendations('user-1', mockRecommendations)
      setCachedRecommendations('user-2', mockRecommendations)
      
      clearRecommendationCache()
      
      expect(getCachedRecommendations('user-1')).toBeNull()
      expect(getCachedRecommendations('user-2')).toBeNull()
    })
  })
})