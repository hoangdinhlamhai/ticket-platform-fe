import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { EVENT_CATEGORIES } from '../mock/eventData'
import { createEventApi } from '../../auth/api/event-api.ts'
import {
  countActiveEventFilters,
  createDefaultEventDiscoveryFilters,
  getActiveEventFilterChips,
  removeEventDiscoveryFilter,
  updateEventDiscoveryFilter,
  type EventFilterChip,
} from '../helpers/event-discovery-filter-state'
import type { EventCategory, MockEvent } from '../types/event'

const eventApi = createEventApi({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api', fetch: globalThis.fetch })

function normalizeSearchValue(value: string) {
  return value.trim().toLocaleLowerCase('vi-VN')
}

export function useEventDiscovery() {
  const [events, setEvents] = useState<readonly MockEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('Tất cả')
  const [favoriteEventIds, setFavoriteEventIds] = useState<string[]>([])
  const [advancedFilters, setAdvancedFilters] = useState(createDefaultEventDiscoveryFilters)
  const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const [loadAttempt, setLoadAttempt] = useState(0)
  const loadEvents = useCallback(() => {
    setIsLoading(true)
    setLoadError('')
    setLoadAttempt((attempt) => attempt + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    void eventApi.findPublic().then((nextEvents) => {
      if (!cancelled) setEvents(nextEvents)
    }).catch(() => {
      if (!cancelled) setLoadError('Không thể tải danh sách sự kiện. Vui lòng thử lại.')
    }).finally(() => {
      if (!cancelled) setIsLoading(false)
    })
    return () => { cancelled = true }
  }, [loadAttempt])

  const activeFilterChips = useMemo(() => getActiveEventFilterChips(advancedFilters), [advancedFilters])
  const activeFilterCount = useMemo(() => countActiveEventFilters(advancedFilters), [advancedFilters])
  const filteredEvents = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query)
    return events.filter((event) => {
      const matchesCategory = selectedCategory === 'Tất cả' || event.category === selectedCategory
      const searchableText = normalizeSearchValue(`${event.title} ${event.category} ${event.city} ${event.venue}`)
      return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery))
    })
  }, [events, query, selectedCategory])

  const handleQueryChange = useCallback((event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value), [])
  const selectCategory = useCallback((category: EventCategory) => setSelectedCategory(category), [])
  const selectRecentSearch = useCallback((value: string) => setQuery(value), [])
  const setAdvancedFilter = useCallback(<K extends keyof typeof advancedFilters>(field: K, value: (typeof advancedFilters)[K]) => setAdvancedFilters((current) => updateEventDiscoveryFilter(current, field, value)), [])
  const removeAdvancedFilter = useCallback((id: EventFilterChip['id']) => setAdvancedFilters((current) => removeEventDiscoveryFilter(current, id)), [])
  const resetAdvancedFilters = useCallback(() => setAdvancedFilters(createDefaultEventDiscoveryFilters()), [])
  const resetDiscovery = useCallback(() => { setQuery(''); setSelectedCategory('Tất cả'); setAdvancedFilters(createDefaultEventDiscoveryFilters()) }, [])
  const openFilterDrawer = useCallback(() => setFilterDrawerOpen(true), [])
  const closeFilterDrawer = useCallback(() => setFilterDrawerOpen(false), [])
  const toggleFavorite = useCallback((event: MockEvent, isFavorite: boolean) => setFavoriteEventIds((current) => isFavorite ? current.filter((eventId) => eventId !== event.id) : [...current, event.id]), [])

  return { activeFilterChips, activeFilterCount, advancedFilters, categories: EVENT_CATEGORIES, closeFilterDrawer, favoriteEventIds, filteredEvents, handleQueryChange, isFilterDrawerOpen, isLoading, loadError, loadEvents, openFilterDrawer, query, removeAdvancedFilter, resetAdvancedFilters, resetDiscovery, selectCategory, selectRecentSearch, selectedCategory, setAdvancedFilter, toggleFavorite }
}
