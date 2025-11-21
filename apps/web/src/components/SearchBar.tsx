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
      <div className="absolute z-20 mt-px w-full bg-zinc-950 border border-zinc-700 shadow-xl max-h-60 overflow-y-auto">
        {suggestions.length > 0 && (
          <div className="p-0">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 bg-zinc-900 px-3 py-2 border-b border-zinc-800 uppercase tracking-wider">
              <FiSearch /> <span>Detected Signals</span>
            </div>
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-4 py-3 cursor-pointer text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors border-b border-zinc-800/50 ${
                  index === activeSuggestionIndex ? 'bg-zinc-900 text-white' : ''
                }`}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
        {recentSearches.length > 0 && (
          <div className="border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-500 bg-zinc-900 px-3 py-2 border-b border-zinc-800 uppercase tracking-wider">
              <div className="flex items-center gap-2"><FiClock /> <span>History Log</span></div>
              <button
                onClick={(e) => { e.stopPropagation(); clearRecentSearches(); }}
                className="text-cyan-500 hover:text-cyan-400 hover:underline"
              >
                PURGE
              </button>
            </div>
            {recentSearches.map((search, index) => (
              <div
                key={search}
                onClick={() => handleSuggestionClick(search)}
                className={`px-4 py-3 cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors border-b border-zinc-800/50 ${
                  suggestions.length + index === activeSuggestionIndex ? 'bg-zinc-900 text-white' : ''
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
    <div ref={containerRef} className="w-full space-y-0">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch gap-0 relative border border-zinc-700 bg-zinc-950">
        <div className="flex items-center flex-grow bg-zinc-950 px-4 py-3">
          <FiSearch className="text-cyan-500 mr-3" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsSuggestionsOpen(true)}
            placeholder="SEARCH_DATABASE..."
            aria-label="Search for events"
            className="flex-1 bg-transparent text-white placeholder-zinc-600 outline-none font-mono text-sm"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search">
              <FiX className="text-zinc-500 hover:text-white transition-colors" />
            </button>
          )}
          {isLoading && <div className="ml-3 text-xs text-cyan-500 font-mono animate-pulse">SCANNING...</div>}
        </div>

        <div className="flex border-t md:border-t-0 md:border-l border-zinc-700">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            aria-expanded={isFiltersOpen}
            aria-controls="filters-panel"
            className={`flex items-center justify-center gap-2 px-6 py-3 transition-all font-mono text-sm uppercase tracking-wide ${
              isFiltersOpen ? 'bg-zinc-900 text-cyan-400' : 'bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <FiFilter /> <span>Config</span>
            {isFiltersOpen ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          <button
            onClick={() => setQuery(query)}
            className="bg-cyan-600 text-zinc-950 px-8 py-3 hover:bg-cyan-500 transition-colors font-bold font-mono uppercase tracking-wider"
          >
            Execute
          </button>
        </div>

        {isSuggestionsOpen && renderSuggestions()}
      </div>

      {/* Filters Panel */}
      {isFiltersOpen && (
        <div id="filters-panel" className="bg-zinc-950 border-x border-b border-zinc-700 p-6 space-y-6 animate-fadeIn shadow-2xl relative z-10">
          {/* Location */}
          <div>
            <h3 className="flex items-center gap-2 font-mono text-xs text-cyan-500 mb-3 uppercase tracking-widest border-b border-zinc-800 pb-1">
              <FiMapPin /> Coordinates
            </h3>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => updateFilter({ location: e.target.value })}
              placeholder="ENTER LOCATION DATA"
              className="w-full bg-zinc-900 border border-zinc-700 text-white p-3 text-sm focus:outline-none focus:border-cyan-500 placeholder-zinc-600 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range */}
            <div>
              <h3 className="flex items-center gap-2 font-mono text-xs text-cyan-500 mb-3 uppercase tracking-widest border-b border-zinc-800 pb-1">
                <FiCalendar /> Temporal Range
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => updateFilter({ startDate: e.target.value || null })}
                  className="flex-1 bg-zinc-900 border border-zinc-700 text-white p-3 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                />
                <input
                  type="date"
                  value={filters.endDate || ''}
                  min={filters.startDate || undefined}
                  onChange={(e) => updateFilter({ endDate: e.target.value || null })}
                  className="flex-1 bg-zinc-900 border border-zinc-700 text-white p-3 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="flex items-center gap-2 font-mono text-xs text-cyan-500 mb-3 uppercase tracking-widest border-b border-zinc-800 pb-1">
                <FiDollarSign /> Value Limits
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice || ''}
                  onChange={(e) => updateFilter({ minPrice: e.target.value ? Number(e.target.value) : null })}
                  placeholder="MIN_VAL"
                  className="flex-1 bg-zinc-900 border border-zinc-700 text-white p-3 text-sm focus:outline-none focus:border-cyan-500 placeholder-zinc-600 font-mono"
                />
                <input
                  type="number"
                  min={filters.minPrice || 0}
                  value={filters.maxPrice || ''}
                  onChange={(e) => updateFilter({ maxPrice: e.target.value ? Number(e.target.value) : null })}
                  placeholder="MAX_VAL"
                  className="flex-1 bg-zinc-900 border border-zinc-700 text-white p-3 text-sm focus:outline-none focus:border-cyan-500 placeholder-zinc-600 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="flex items-center gap-2 font-mono text-xs text-cyan-500 mb-3 uppercase tracking-widest border-b border-zinc-800 pb-1">
              <FiStar /> Sort Parameters
            </h3>
            <div className="flex flex-wrap gap-2">
              {['relevance', 'date', 'price', 'popularity'].map(option => (
                <button
                  key={option}
                  onClick={() => setSortBy(option as any)}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wide transition-all border ${
                    sortBy === option
                      ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400'
                      : 'bg-transparent border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-mono text-xs text-cyan-500 mb-3 uppercase tracking-widest border-b border-zinc-800 pb-1">
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1 text-xs uppercase tracking-wider border transition-all ${
                    filters.categories.includes(category)
                      ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-bold'
                      : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="text-right pt-4 border-t border-zinc-800">
            <button
              onClick={handleClearFilters}
              className="text-red-500 hover:text-red-400 text-xs font-mono uppercase tracking-wider hover:underline"
            >
              RESET_FILTERS
            </button>
          </div>
        </div>
      )}

      {/* No Results */}
      {showNoResults && (
        <div className="text-center py-12 bg-zinc-950 border border-zinc-700 mt-4">
          <FiSearch className="mx-auto h-12 w-12 text-zinc-700 mb-3" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">No Data Found</h3>
          <p className="text-zinc-500 font-mono text-sm mt-2">Query returned 0 results. Adjust parameters.</p>
          <button 
            onClick={handleClearFilters} 
            className="mt-6 text-cyan-500 hover:text-cyan-400 font-mono text-sm uppercase tracking-wider border-b border-cyan-500/30 hover:border-cyan-500 pb-1 transition-all"
          >
            Reset All Parameters
          </button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {results.map(event => (
            <div key={event.id} className="p-0 bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 transition-all group">
              <div className="p-4">
                <h3 className="font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{event.title}</h3>
                <div className="space-y-1">
                  <p className="text-xs font-mono text-zinc-500 uppercase">{event.location}</p>
                  <p className="text-xs font-mono text-zinc-500">{new Date(event.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-mono text-zinc-600 uppercase">Price</span>
                <p className="text-sm font-mono font-bold text-white">${event.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
