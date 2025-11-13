import React, { useState, useRef, useEffect } from 'react';
import {
  FiSearch, FiX, FiCalendar, FiMapPin, FiDollarSign,
  FiFilter, FiChevronDown, FiChevronUp, FiClock, FiStar
} from 'react-icons/fi';
import { useSearch } from '../hooks/useSearch';

const CATEGORIES = [
  'Music', 'Sports', 'Arts', 'Business', 'Food & Drink',
  'Technology', 'Health', 'Fashion', 'Education', 'Other'
];

const SearchBar: React.FC = () => {
  const {
    query,
    setQuery,
    suggestions,
    isLoading,
    results,
    showNoResults,
    filters,
    updateFilter,
    sortBy,
    setSortBy,
    recentSearches,
    clearRecentSearches
  } = useSearch();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsSuggestionsOpen(true);
    setActiveSuggestionIndex(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setIsSuggestionsOpen(false);
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSuggestionsOpen) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
          setQuery(suggestions[activeSuggestionIndex]);
          setIsSuggestionsOpen(false);
        }
        break;
      case 'Escape':
        setIsSuggestionsOpen(false);
        break;
    }
  };

  const handleClearFilters = () => {
    updateFilter({
      location: '',
      startDate: null,
      endDate: null,
      minPrice: null,
      maxPrice: null,
      categories: [],
    });
  };

  const toggleCategory = (category: string) => {
    updateFilter({
      categories: filters.categories.includes(category)
        ? filters.categories.filter(c => c !== category)
        : [...filters.categories, category]
    });
  };

  const renderSuggestions = () => {
    if (!isSuggestionsOpen || (!suggestions.length && !recentSearches.length)) return null;
    return (
      <div className="absolute z-20 mt-2 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
        {suggestions.length > 0 && (
          <div className="p-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 border-b pb-1 mb-1">
              <FiSearch /> <span>Suggestions</span>
            </div>
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                  index === activeSuggestionIndex ? 'bg-gray-100' : ''
                }`}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
        {recentSearches.length > 0 && (
          <div className="p-2 border-t">
            <div className="flex items-center justify-between text-sm font-medium text-gray-600 mb-1">
              <div className="flex items-center gap-2"><FiClock /> <span>Recent Searches</span></div>
              <button
                onClick={(e) => { e.stopPropagation(); clearRecentSearches(); }}
                className="text-xs text-blue-600 hover:underline"
              >
                Clear all
              </button>
            </div>
            {recentSearches.map((search, index) => (
              <div
                key={search}
                onClick={() => handleSuggestionClick(search)}
                className={`p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                  suggestions.length + index === activeSuggestionIndex ? 'bg-gray-100' : ''
                }`}
              >
                {search}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="w-full space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch gap-2 relative">
        <div className="flex items-center flex-grow bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <FiSearch className="text-gray-400 mr-2" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsSuggestionsOpen(true)}
            placeholder="Search for events..."
            aria-label="Search for events"
            className="flex-1 text-gray-700 outline-none placeholder-gray-400"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search">
              <FiX className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
          {isLoading && <div className="ml-2 text-sm text-gray-500">Searching...</div>}
        </div>

        <button
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          aria-expanded={isFiltersOpen}
          aria-controls="filters-panel"
          className={`flex items-center justify-center gap-2 border border-gray-200 px-4 py-2 rounded-lg shadow-sm transition-all ${
            isFiltersOpen ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FiFilter /> <span>Filters</span>
          {isFiltersOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        <button
          onClick={() => setQuery(query)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>

        {isSuggestionsOpen && renderSuggestions()}
      </div>

      {/* Filters Panel */}
      {isFiltersOpen && (
        <div id="filters-panel" className="bg-white border border-gray-200 rounded-lg p-4 shadow-md space-y-4 animate-fadeIn">
          {/* Location */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-2"><FiMapPin /> Location</h3>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => updateFilter({ location: e.target.value })}
              placeholder="City or venue"
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Date Range */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-2"><FiCalendar /> Date Range</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => updateFilter({ startDate: e.target.value || null })}
                className="flex-1 border border-gray-300 rounded-md p-2"
              />
              <input
                type="date"
                value={filters.endDate || ''}
                min={filters.startDate || undefined}
                onChange={(e) => updateFilter({ endDate: e.target.value || null })}
                className="flex-1 border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-2"><FiDollarSign /> Price Range</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                min="0"
                value={filters.minPrice || ''}
                onChange={(e) => updateFilter({ minPrice: e.target.value ? Number(e.target.value) : null })}
                placeholder="Min ($)"
                className="flex-1 border border-gray-300 rounded-md p-2"
              />
              <input
                type="number"
                min={filters.minPrice || 0}
                value={filters.maxPrice || ''}
                onChange={(e) => updateFilter({ maxPrice: e.target.value ? Number(e.target.value) : null })}
                placeholder="Max ($)"
                className="flex-1 border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-2"><FiStar /> Sort By</h3>
            <div className="flex flex-wrap gap-2">
              {['relevance', 'date', 'price', 'popularity'].map(option => (
                <button
                  key={option}
                  onClick={() => setSortBy(option as any)}
                  className={`px-3 py-1 rounded-md border transition ${
                    sortBy === option
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1 rounded-full border text-sm transition ${
                    filters.categories.includes(category)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="text-right">
            <button
              onClick={handleClearFilters}
              className="text-red-500 hover:underline text-sm"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* No Results */}
      {showNoResults && (
        <div className="text-center py-6 text-gray-500 border-t">
          <h3 className="text-lg font-semibold">No events found</h3>
          <p>Try adjusting your search or filters to find more events.</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {results.map(event => (
            <div key={event.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold text-gray-800">{event.title}</h3>
              <p className="text-sm text-gray-600">{event.location}</p>
              <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
              <p className="text-sm text-gray-800 font-medium">${event.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
