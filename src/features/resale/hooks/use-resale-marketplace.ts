import { useCallback, useMemo, useState } from 'react'
import { filterResaleListings } from '../helpers/filter-resale-listings'
import type { ResaleListing, ResaleMarketplaceFilters } from '../types/resale'

export const DEFAULT_RESALE_FILTERS: ResaleMarketplaceFilters = {
  query: '',
  eventDate: '',
  priceBand: 'all',
  ticketType: '',
  city: '',
  seatingType: 'all',
  sort: 'relevance',
}

export function useResaleMarketplace(listings: readonly ResaleListing[]) {
  const [filters, setFilters] = useState(DEFAULT_RESALE_FILTERS)
  const filteredListings = useMemo(() => filterResaleListings(listings, filters), [filters, listings])
  const cities = useMemo(() => [...new Set(listings.map((listing) => listing.city))].toSorted(), [listings])
  const ticketTypes = useMemo(() => [...new Set(listings.map((listing) => listing.ticketType))].toSorted(), [listings])
  const hasActiveFilters = Object.entries(filters).some(([field, value]) => {
    if (field === 'sort') return value !== 'relevance'
    if (field === 'priceBand' || field === 'seatingType') return value !== 'all'
    return Boolean(value)
  })

  const setFilter = useCallback(<K extends keyof ResaleMarketplaceFilters>(field: K, value: ResaleMarketplaceFilters[K]) => {
    setFilters((current) => ({ ...current, [field]: value }))
  }, [])

  const resetFilters = useCallback(() => setFilters(DEFAULT_RESALE_FILTERS), [])

  return { cities, filteredListings, filters, hasActiveFilters, resetFilters, setFilter, ticketTypes }
}
