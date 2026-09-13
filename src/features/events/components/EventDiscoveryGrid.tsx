import { useRef, type MouseEvent } from 'react'
import type { EventDiscoveryFilters, EventFilterChip, EventSortOption } from '../helpers/event-discovery-filter-state'
import type { MockEvent } from '../types/event'
import { AdvancedEventFilterSidebar } from './AdvancedEventFilterSidebar'
import { EventDiscoveryCard } from './EventDiscoveryCard'
import { EventDiscoveryEmptyState } from './EventDiscoveryEmptyState'
import { EventDiscoveryToolbar } from './EventDiscoveryToolbar'
import { EventFilterDrawer } from './EventFilterDrawer'

type EventDiscoveryGridProps = {
  activeFilterChips: readonly EventFilterChip[]
  activeFilterCount: number
  advancedFilters: EventDiscoveryFilters
  events: readonly MockEvent[]
  favoriteEventIds: readonly string[]
  isFilterDrawerOpen: boolean
  onAdvancedFilterChange: <K extends keyof EventDiscoveryFilters>(field: K, value: EventDiscoveryFilters[K]) => void
  onCloseFilterDrawer: () => void
  onOpenFilterDrawer: () => void
  onRemoveAdvancedFilter: (id: EventFilterChip['id']) => void
  onResetAdvancedFilters: () => void
  onResetDiscovery: () => void
  onSuggestionSelect: (query: string) => void
  onToggleFavorite: (event: MockEvent, isFavorite: boolean) => void
  onViewEvent: (event: MockEvent, clickEvent: MouseEvent<HTMLAnchorElement>) => void
}

export function EventDiscoveryGrid({ activeFilterChips, activeFilterCount, advancedFilters, events, favoriteEventIds, isFilterDrawerOpen, onAdvancedFilterChange, onCloseFilterDrawer, onOpenFilterDrawer, onRemoveAdvancedFilter, onResetAdvancedFilters, onResetDiscovery, onSuggestionSelect, onToggleFavorite, onViewEvent }: EventDiscoveryGridProps) {
  const mobileFilterButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <section id="discover-events" className="scroll-mt-5 py-[clamp(3.5rem,7vw,6.5rem)]" aria-labelledby="discover-events-title">
      <div className="attendee-container">
        <EventDiscoveryToolbar
          activeFilterChips={activeFilterChips}
          activeFilterCount={activeFilterCount}
          filterButtonRef={mobileFilterButtonRef}
          filters={advancedFilters}
          resultCount={events.length}
          onOpenMobileFilters={onOpenFilterDrawer}
          onRemoveFilter={onRemoveAdvancedFilter}
          onResetFilters={onResetAdvancedFilters}
          onSortChange={(sort: EventSortOption) => onAdvancedFilterChange('sort', sort)}
        />

        <div className="mt-7 min-[1101px]:grid min-[1101px]:grid-cols-[minmax(15rem,18rem)_minmax(0,1fr)] items-start gap-5">
          <AdvancedEventFilterSidebar filters={advancedFilters} hasActiveFilters={activeFilterCount > 0} onChange={onAdvancedFilterChange} onReset={onResetAdvancedFilters} />
          {events.length > 0 ? (
            <div className="grid min-w-0 grid-cols-1 gap-5 min-[769px]:grid-cols-2 min-[1101px]:grid-cols-3">
              {events.map((event) => (
                <EventDiscoveryCard key={event.id} event={event} isFavorite={favoriteEventIds.includes(event.id)} onToggleFavorite={onToggleFavorite} onViewEvent={onViewEvent} />
              ))}
            </div>
          ) : (
            <EventDiscoveryEmptyState onReset={onResetDiscovery} onSuggestionSelect={onSuggestionSelect} />
          )}
        </div>
      </div>
      <EventFilterDrawer
        activeFilterCount={activeFilterCount}
        filters={advancedFilters}
        isOpen={isFilterDrawerOpen}
        onApply={onCloseFilterDrawer}
        onChange={onAdvancedFilterChange}
        onClose={onCloseFilterDrawer}
        onReset={onResetAdvancedFilters}
        returnFocus={mobileFilterButtonRef}
      />
    </section>
  )
}
