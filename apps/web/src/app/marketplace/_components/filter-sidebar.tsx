'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Filter as FilterIcon, X } from 'lucide-react';

type PriceRange = [number, number];

export function FilterSidebar() {
  const [priceRange, setPriceRange] = useState<PriceRange>([0, 1]);
  const [categories, setCategories] = useState<Record<string, boolean>>({
    'Music': false,
    'Conference': false,
    'Sports': false,
    'Theater': false,
    'Festival': false,
    'Workshop': false,
  });  
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    categories: true,
    date: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleCategory = (category: string) => {
    setCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const clearAllFilters = () => {
    setPriceRange([0, 1]);
    setCategories(Object.keys(categories).reduce((acc, key) => ({ ...acc, [key]: false }), {}));
    setDateRange('all');
  };

  const selectedFilterCount = 
    (priceRange[0] > 0 || priceRange[1] < 1 ? 1 : 0) +
    Object.values(categories).filter(Boolean).length +
    (dateRange !== 'all' ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center">
          <FilterIcon className="h-4 w-4 mr-2" />
          Filters
          {selectedFilterCount > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {selectedFilterCount}
            </span>
          )}
        </h3>
        {selectedFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs"
            onClick={clearAllFilters}
          >
            Clear all
          </Button>
        )}
      </div>

      <Collapsible 
        open={openSections.price} 
        onOpenChange={() => toggleSection('price')}
        className="space-y-2"
      >
        <CollapsibleTrigger className="w-full flex justify-between items-center">
          <span className="text-sm font-medium">Price Range</span>
          {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-4">
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as PriceRange)}
              min={0}
              max={1}
              step={0.01}
              minStepsBetweenThumbs={0.01}
              className="py-4"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min-price" className="text-xs text-muted-foreground">
                  Min
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Ξ
                  </span>
                  <Input
                    id="min-price"
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    min={0}
                    max={priceRange[1]}
                    step={0.01}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="max-price" className="text-xs text-muted-foreground">
                  Max
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Ξ
                  </span>
                  <Input
                    id="max-price"
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    min={priceRange[0]}
                    max={10}
                    step={0.01}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible 
        open={openSections.categories} 
        onOpenChange={() => toggleSection('categories')}
        className="space-y-2 border-t pt-4"
      >
        <CollapsibleTrigger className="w-full flex justify-between items-center">
          <span className="text-sm font-medium">Categories</span>
          {openSections.categories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-3">
            {Object.entries(categories).map(([category, checked]) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox 
                  id={`category-${category}`} 
                  checked={checked}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <Label htmlFor={`category-${category}`} className="text-sm font-normal">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible 
        open={openSections.date} 
        onOpenChange={() => toggleSection('date')}
        className="space-y-2 border-t pt-4"
      >
        <CollapsibleTrigger className="w-full flex justify-between items-center">
          <span className="text-sm font-medium">Date</span>
          {openSections.date ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-3">
            {[
              { value: 'all', label: 'All Upcoming' },
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'year', label: 'This Year' },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`date-${option.value}`}
                  name="date-range"
                  checked={dateRange === option.value}
                  onChange={() => setDateRange(option.value as any)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <Label htmlFor={`date-${option.value}`} className="text-sm font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {selectedFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {priceRange[0] > 0 && (
            <FilterPill onRemove={() => setPriceRange([0, priceRange[1]])}>
              Min: {priceRange[0]} ETH
            </FilterPill>
          )}
          {priceRange[1] < 1 && (
            <FilterPill onRemove={() => setPriceRange([priceRange[0], 1])}>
              Max: {priceRange[1]} ETH
            </FilterPill>
          )}
          {Object.entries(categories)
            .filter(([_, checked]) => checked)
            .map(([category]) => (
              <FilterPill 
                key={category} 
                onRemove={() => toggleCategory(category)}
              >
                {category}
              </FilterPill>
            ))}
          {dateRange !== 'all' && (
            <FilterPill onRemove={() => setDateRange('all')}>
              {dateRange === 'today' ? 'Today' : 
               dateRange === 'week' ? 'This Week' : 
               dateRange === 'month' ? 'This Month' : 'This Year'}
            </FilterPill>
          )}
        </div>
      )}
    </div>
  );
}

function FilterPill({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs">
      {children}
      <button 
        onClick={(e) => {
          e.preventDefault();
          onRemove();
        }}
        className="ml-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
