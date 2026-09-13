import { useCallback, useMemo, useState, type ChangeEvent } from 'react'
import { EVENT_CATEGORIES, MOCK_EVENTS } from '../mock/eventData'
import {
  countActiveEventFilters,
  createDefaultEventDiscoveryFilters,
  getActiveEventFilterChips,
  removeEventDiscoveryFilter,
  updateEventDiscoveryFilter,
  type EventFilterChip,
} from '../helpers/event-discovery-filter-state'
import type { EventCategory, MockEvent } from '../types/event'

function normalizeSearchValue(value: string) {
  return value.trim().toLocaleLowerCase('vi-VN')
}

export function useEventDiscovery() {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('Tất cả')
  const [favoriteEventIds, setFavoriteEventIds] = useState<string[]>([])
  const [advancedFilters, setAdvancedFilters] = useState(createDefaultEventDiscoveryFilters)
  const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const activeFilterChips = useMemo(() => getActiveEventFilterChips(advancedFilters), [advancedFilters])
  const activeFilterCount = useMemo(() => countActiveEventFilters(advancedFilters), [advancedFilters])

  const filteredEvents = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query)

    return MOCK_EVENTS.filter((event) => {
      const matchesCategory = selectedCategory === 'Tất cả' || event.category === selectedCategory
      const searchableText = normalizeSearchValue(`${event.title} ${event.category} ${event.city} ${event.venue}`)

      return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery))
    })
  }, [query, selectedCategory])

  const handleQueryChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }, [])

  const selectCategory = useCallback((category: EventCategory) => {
    setSelectedCategory(category)
  }, [])

  const selectRecentSearch = useCallback((value: string) => {
    setQuery(value)
  }, [])

  const setAdvancedFilter = useCallback(<K extends keyof typeof advancedFilters>(field: K, value: (typeof advancedFilters)[K]) => {
    setAdvancedFilters((current) => updateEventDiscoveryFilter(current, field, value))
  }, [])

  const removeAdvancedFilter = useCallback((id: EventFilterChip['id']) => {
    setAdvancedFilters((current) => removeEventDiscoveryFilter(current, id))
  }, [])

  const resetAdvancedFilters = useCallback(() => {
    setAdvancedFilters(createDefaultEventDiscoveryFilters())
  }, [])

  const resetDiscovery = useCallback(() => {
    setQuery('')
    setSelectedCategory('Tất cả')
    setAdvancedFilters(createDefaultEventDiscoveryFilters())
  }, [])

  const openFilterDrawer = useCallback(() => setFilterDrawerOpen(true), [])
  const closeFilterDrawer = useCallback(() => setFilterDrawerOpen(false), [])

  const toggleFavorite = useCallback((event: MockEvent, isFavorite: boolean) => {
    setFavoriteEventIds((current) =>
      isFavorite ? current.filter((eventId) => eventId !== event.id) : [...current, event.id],
    )
  }, [])

  return {
    activeFilterChips,
    activeFilterCount,
    advancedFilters,
    categories: EVENT_CATEGORIES,
    closeFilterDrawer,
    favoriteEventIds,
    filteredEvents,
    handleQueryChange,
    isFilterDrawerOpen,
    openFilterDrawer,
    query,
    removeAdvancedFilter,
    resetAdvancedFilters,
    resetDiscovery,
    selectCategory,
    selectRecentSearch,
    selectedCategory,
    setAdvancedFilter,
    toggleFavorite,
  }
}
