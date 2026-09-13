import { useCallback, type MouseEvent } from 'react'
import type { AttendeePath } from '../../../app/routing/attendee-route'
import { shouldUseClientNavigation } from '../../../app/routing/attendee-route'
import { EventDiscoveryGrid } from '../components/EventDiscoveryGrid'
import { EventSearchHero } from '../components/EventSearchHero'
import { useEventDiscovery } from '../hooks/useEventDiscovery'
import type { MockEvent } from '../types/event'

type EventDiscoveryPageProps = {
  onNavigate: (path: AttendeePath) => void
  onNoticeChange: (notice: string) => void
}

export function EventDiscoveryPage({ onNavigate, onNoticeChange }: EventDiscoveryPageProps) {
  const {
    activeFilterChips,
    activeFilterCount,
    advancedFilters,
    categories,
    closeFilterDrawer,
    favoriteEventIds,
    filteredEvents,
    handleQueryChange: updateQuery,
    isFilterDrawerOpen,
    openFilterDrawer,
    query,
    removeAdvancedFilter,
    resetAdvancedFilters,
    resetDiscovery,
    selectCategory: updateCategory,
    selectRecentSearch,
    selectedCategory,
    setAdvancedFilter,
    toggleFavorite: updateFavorite,
  } = useEventDiscovery()

  const handleQueryChange = useCallback((event: Parameters<typeof updateQuery>[0]) => {
    updateQuery(event)
    onNoticeChange('')
  }, [onNoticeChange, updateQuery])

  const selectCategory = useCallback((category: Parameters<typeof updateCategory>[0]) => {
    updateCategory(category)
    onNoticeChange('')
  }, [onNoticeChange, updateCategory])

  const handleRecentSearchSelect = useCallback((value: string) => {
    selectRecentSearch(value)
    onNoticeChange('')
  }, [onNoticeChange, selectRecentSearch])

  const toggleFavorite = useCallback((event: MockEvent, isFavorite: boolean) => {
    updateFavorite(event, isFavorite)
    onNoticeChange(isFavorite ? `Đã bỏ lưu “${event.title}”.` : `Đã lưu “${event.title}” vào danh sách quan tâm.`)
  }, [onNoticeChange, updateFavorite])

  const viewEvent = useCallback((event: MockEvent, clickEvent: MouseEvent<HTMLAnchorElement>) => {
    if (!shouldUseClientNavigation(clickEvent)) return
    clickEvent.preventDefault()
    onNavigate(`/events/${event.id}`)
  }, [onNavigate])

  return (
    <>
      <EventSearchHero
        categories={categories}
        eventCount={filteredEvents.length}
        onCategorySelect={selectCategory}
        onQueryChange={handleQueryChange}
        onRecentSearchSelect={handleRecentSearchSelect}
        query={query}
        selectedCategory={selectedCategory}
      />
      <EventDiscoveryGrid
        activeFilterChips={activeFilterChips}
        activeFilterCount={activeFilterCount}
        advancedFilters={advancedFilters}
        events={filteredEvents}
        favoriteEventIds={favoriteEventIds}
        isFilterDrawerOpen={isFilterDrawerOpen}
        onAdvancedFilterChange={setAdvancedFilter}
        onCloseFilterDrawer={closeFilterDrawer}
        onOpenFilterDrawer={openFilterDrawer}
        onRemoveAdvancedFilter={removeAdvancedFilter}
        onResetAdvancedFilters={resetAdvancedFilters}
        onResetDiscovery={resetDiscovery}
        onSuggestionSelect={handleRecentSearchSelect}
        onToggleFavorite={toggleFavorite}
        onViewEvent={viewEvent}
      />
    </>
  )
}
