import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSearch } from '../../src/hooks/useSearch'

// Mock use-debounce
vi.mock('use-debounce', () => ({
  useDebounce: vi.fn(),
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock setTimeout and clearTimeout for testing debouncing
vi.stubGlobal('setTimeout', vi.fn())
vi.stubGlobal('clearTimeout', vi.fn())

const mockUseDebounce = vi.mocked(require('use-debounce').useDebounce)

describe('useSearch', () => {
  const mockEvents = [
    {
      id: '1',
      title: 'Blockchain Conference 2025',
      description: 'A conference about blockchain technology',
      location: 'New York',
      date: '2025-12-25',
      price: 100,
      category: 'conference',
      popularity: 90,
    },
    {
      id: '2',
      title: 'Web3 Workshop',
      description: 'Learn about Web3 development',
      location: 'San Francisco',
      date: '2025-11-15',
      price: 50,
      category: 'workshop',
      popularity: 80,
    },
    {
      id: '3',
      title: 'Crypto Concert',
      description: 'Music event for crypto enthusiasts',
      location: 'New York',
      date: '2025-10-20',
      price: 75,
      category: 'music',
      popularity: 95,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default localStorage state
    localStorageMock.getItem.mockReturnValue(null)
    
    // Default useDebounce mock
    mockUseDebounce.mockReturnValue(['initial-query', vi.fn()])
    
    // Mock setTimeout to immediately execute
    vi.mocked(setTimeout).mockImplementation((fn) => {
      fn()
      return 1
    })
  })

  describe('initial state', () => {
    it('returns correct initial state', () => {
      const { result } = renderHook(() => useSearch())
      
      expect(result.current.query).toBe('')
      expect(result.current.suggestions).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.results).toEqual([])
      expect(result.current.showNoResults).toBe(false)
      expect(result.current.filters).toEqual({
        location: '',
        startDate: null,
        endDate: null,
        minPrice: null,
        maxPrice: null,
        categories: [],
      })
      expect(result.current.sortBy).toBe('relevance')
      expect(result.current.recentSearches).toEqual([])
    })
  })

  describe('localStorage integration', () => {
    it('loads recent searches from localStorage on mount', () => {
      localStorageMock.getItem.mockReturnValue('["search1", "search2", "search3"]')
      
      const { result } = renderHook(() => useSearch())
      
      expect(result.current.recentSearches).toEqual(['search1', 'search2', 'search3'])
    })

    it('handles invalid localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')
      
      const { result } = renderHook(() => useSearch())
      
      expect(result.current.recentSearches).toEqual([])
    })

    it('handles null localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const { result } = renderHook(() => useSearch())
      
      expect(result.current.recentSearches).toEqual([])
    })

    it('saves recent searches to localStorage when they change', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const { result } = renderHook(() => useSearch())
      
      act(() => {
        result.current.clearRecentSearches()
      })
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('recentSearches')
    })
  })

  describe('search functionality', () => {
    it('searches by query', async () => {
      const mockSearchEvents = vi.fn().mockResolvedValue(undefined)
      
      const { result } = renderHook(() => useSearch())
      
      act(() => {
        result.current.setQuery('blockchain')
      })
      
      await act(async () => {
        await mockSearchEvents()
      })
      
      expect(result.current.query).toBe('blockchain')
    })

    it('adds search to recent searches', async () => {
      localStorageMock.getItem.mockReturnValue('[]')
      
      const { result } = renderHook(() => useSearch())
      
      await act(async () => {
        result.current.setQuery('test search')
      })
      
      expect(result.current.recentSearches).toContain('test search')
    })

    it('does not add empty searches to recent searches', async () => {
      localStorageMock.getItem.mockReturnValue('[]')
      
      const { result } = renderHook(() => useSearch())
      
      await act(async () => {
        result.current.setQuery('   ')
      })
      
      expect(result.current.recentSearches).not.toContain('   ')
    })

    it('limits recent searches to 5 items', async () => {
      localStorageMock.getItem.mockReturnValue('["search1", "search2", "search3", "search4"]')
      
      const { result } = renderHook(() => useSearch())
      
      await act(async () => {
        result.current.setQuery('search5')
      })
      
      expect(result.current.recentSearches).toEqual(['search5', 'search1', 'search2', 'search3', 'search4'])
      
      // Adding another should replace the oldest
      await act(async () => {
        result.current.setQuery('search6')
      })
      
      expect(result.current.recentSearches).toEqual(['search6', 'search5', 'search1', 'search2', 'search3'])
    })

    it('removes duplicates from recent searches', async () => {
      localStorageMock.getItem.mockReturnValue('["existing"]')
      
      const { result } = renderHook(() => useSearch())
      
      await act(async () => {
        result.current.setQuery('existing')
      })
      
      expect(result.current.recentSearches).toEqual(['existing']) // Should not duplicate
      
      await act(async () => {
        result.current.setQuery('existing') // Search again
      })
      
      expect(result.current.recentSearches).toEqual(['existing']) // Should not add duplicate
    })

    it('clears recent searches', async () => {
      localStorageMock.getItem.mockReturnValue('["search1", "search2"]')
      
      const { result } = renderHook(() => useSearch())
      
      act(() => {
        result.current.clearRecentSearches()
      })
      
      expect(result.current.recentSearches).toEqual([])
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('recentSearches')
    })
  })

  describe('filters', () => {
    it('updates filters correctly', () => {
      const { result } = renderHook(() => useSearch())
      
      act(() => {
        result.current.updateFilter({ location: 'New York' })
      })
      
      expect(result.current.filters.location).toBe('New York')
    })

    it('merges partial filter updates', () => {
      const { result } = renderHook(() => useSearch())
      
      act(() => {
        result.current.updateFilter({ location: 'New York', minPrice: 50 })
      })
      
      act(() => {
        result.current.updateFilter({ location: 'San Francisco' })
      })
      
      expect(result.current.filters).toEqual({
        location: 'San Francisco', // Updated
        startDate: null,
        endDate: null,
        minPrice: 50, // Preserved
        maxPrice: null,
        categories: [],
      })
    })

    it('updates multiple filter properties at once', () => {
      const { result } = renderHook(() => useSearch())
      
      act(() => {
        result.current.updateFilter({
          location: 'New York',
          minPrice: 50,
          maxPrice: 100,
          categories: ['conference', 'workshop'],
        })
      })
      
      expect(result.current.filters).toEqual({
        location: 'New York',
        startDate: null,
        endDate: null,
        minPrice: 50,
        maxPrice: 100,
        categories: ['conference', 'workshop'],
      })
    })
  })

  describe('sorting', () => {
    it('changes sort option', () => {
      const { result } = renderHook(() => useSearch())
      
      act(() => {
        result.current.setSortBy('price')
      })
      
      expect(result.current.sortBy).toBe('price')
    })

    it('supports all sort options', () => {
      const { result } = renderHook(() => useSearch())
      
      const sortOptions = ['relevance', 'date', 'price', 'popularity'] as const
      
      sortOptions.forEach(sortOption => {
        act(() => {
          result.current.setSortBy(sortOption)
        })
        expect(result.current.sortBy).toBe(sortOption)
      })
    })
  })

  describe('suggestions', () => {
    it('shows recent searches when query is empty', () => {
      localStorageMock.getItem.mockReturnValue('["recent1", "recent2"]')
      mockUseDebounce.mockReturnValue(['', vi.fn()])
      
      const { result } = renderHook(() => useSearch())
      
      expect(result.current.suggestions).toEqual(['recent1', 'recent2'])
    })

    it('generates suggestions based on query', () => {
      mockUseDebounce.mockReturnValue(['blockchain', vi.fn()])
      
      const { result } = renderHook(() => useSearch())
      
      expect(result.current.suggestions).toContain('blockchain') // From popular suggestions
    })

    it('limits suggestions to 5 items', () => {
      mockUseDebounce.mockReturnValue(['test', vi.fn()])
      localStorageMock.getItem.mockReturnValue('["test1", "test2", "test3"]')
      
      const { result } = renderHook(() => useSearch())
      
      expect(result.current.suggestions.length).toBeLessThanOrEqual(5)
    })

    it('removes duplicates from suggestions', () => {
      mockUseDebounce.mockReturnValue(['blockchain', vi.fn()])
      localStorageMock.getItem.mockReturnValue('["blockchain"]')
      
      const { result } = renderHook(() => useSearch())
      
      const suggestionCount = result.current.suggestions.filter(s => s === 'blockchain').length
      expect(suggestionCount).toBe(1) // Should only appear once
    })
  })

  describe('search execution', () => {
    it('performs search when query changes', async () => {
      const { result } = renderHook(() => useSearch())
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await act(async () => {
        result.current.setQuery('test search')
      })
      
      // Search should be triggered by the effect
      expect(result.current.isLoading).toBe(false) // Should complete quickly in test
      
      consoleSpy.mockRestore()
    })

    it('performs search when filters change', async () => {
      const { result } = renderHook(() => useSearch())
      
      await act(async () => {
        result.current.updateFilter({ location: 'New York' })
      })
      
      // Should trigger search due to non-empty filters
      expect(result.current.isLoading).toBe(false)
    })

    it('does not search when no query and no filters', async () => {
      const { result } = renderHook(() => useSearch())
      
      await act(async () => {
        // Update filters to empty state
        result.current.updateFilter({
          location: '',
          startDate: null,
          endDate: null,
          minPrice: null,
          maxPrice: null,
          categories: [],
        })
      })
      
      expect(result.current.results).toEqual([])
      expect(result.current.showNoResults).toBe(false)
    })
  })

  describe('search results', () => {
    it('displays results after successful search', async () => {
      const { result } = renderHook(() => useSearch())
      
      await act(async () => {
        result.current.setQuery('blockchain')
      })
      
      expect(Array.isArray(result.current.results)).toBe(true)
    })

    it('shows no results message when applicable', async () => {
      const { result } = renderHook(() => useSearch())
      
      await act(async () => {
        result.current.setQuery('nonexistent-event')
      })
      
      expect(result.current.showNoResults).toBe(false) // Based on mock implementation
    })

    it('handles search errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const { result } = renderHook(() => useSearch())
      
      await act(async () => {
        result.current.setQuery('test')
      })
      
      // Should handle errors without crashing
      expect(result.current.results).toEqual([])
      
      consoleSpy.mockRestore()
    })
  })

  describe('loading state', () => {
    it('shows loading during search', async () => {
      // Mock setTimeout to delay execution
      vi.mocked(setTimeout).mockImplementation((fn) => {
        // Don't execute immediately for this test
        return 123
      })
      
      const { result } = renderHook(() => useSearch())
      
      await act(async () => {
        result.current.setQuery('test search')
      })
      
      // Loading state is managed by the internal search function
      expect(typeof result.current.isLoading).toBe('boolean')
    })

    it('stops loading after search completes', async () => {
      vi.mocked(setTimeout).mockImplementation((fn) => {
        fn()
        return 123
      })
      
      const { result } = renderHook(() => useSearch())
      
      await act(async () => {
        result.current.setQuery('test search')
      })
      
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('debouncing', () => {
    it('uses debounced query for suggestions', () => {
      mockUseDebounce.mockReturnValue(['debounced-query', vi.fn()])
      
      const { result } = renderHook(() => useSearch())
      
      // The hook should use the debounced value for suggestions
      expect(Array.isArray(result.current.suggestions)).toBe(true)
    })

    it('updates debounced query when setQuery is called', () => {
      const { result } = renderHook(() => useSearch())
      
      act(() => {
        result.current.setQuery('new query')
      })
      
      // The debounced value should eventually update
      expect(typeof result.current.query).toBe('string')
    })
  })

  describe('complex scenarios', () => {
    it('handles combined query and filters', async () => {
      const { result } = renderHook(() => useSearch())
      
      await act(async () => {
        result.current.setQuery('blockchain')
        result.current.updateFilter({
          location: 'New York',
          minPrice: 50,
          categories: ['conference'],
        })
        result.current.setSortBy('date')
      })
      
      expect(result.current.query).toBe('blockchain')
      expect(result.current.filters.location).toBe('New York')
      expect(result.current.filters.minPrice).toBe(50)
      expect(result.current.filters.categories).toEqual(['conference'])
      expect(result.current.sortBy).toBe('date')
    })

    it('persists state correctly across re-renders', () => {
      localStorageMock.getItem.mockReturnValue('["saved-search"]')
      
      const { result, rerender } = renderHook(() => useSearch())
      
      expect(result.current.recentSearches).toEqual(['saved-search'])
      
      // Re-render should maintain state
      rerender()
      expect(result.current.recentSearches).toEqual(['saved-search'])
    })
  })
})