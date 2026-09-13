import type { ResaleMarketplaceFilters, ResaleListing } from '../types/resale'

function matchesPriceBand(listing: ResaleListing, priceBand: ResaleMarketplaceFilters['priceBand']) {
  if (priceBand === 'under-500k') return listing.price < 500000
  if (priceBand === '500k-to-1m') return listing.price >= 500000 && listing.price <= 1000000
  if (priceBand === 'over-1m') return listing.price > 1000000
  return true
}

export function filterResaleListings(
  listings: readonly ResaleListing[],
  filters: ResaleMarketplaceFilters,
): ResaleListing[] {
  const query = filters.query.trim().toLocaleLowerCase('vi')
  const filtered = listings.filter((listing) => {
    const searchable = [listing.eventTitle, listing.venue, listing.city, listing.seller.name]
      .join(' ')
      .toLocaleLowerCase('vi')

    return (
      (!query || searchable.includes(query)) &&
      (!filters.eventDate || listing.startsAt.slice(0, 10) === filters.eventDate) &&
      matchesPriceBand(listing, filters.priceBand) &&
      (!filters.ticketType || listing.ticketType === filters.ticketType) &&
      (!filters.city || listing.city === filters.city) &&
      (filters.seatingType === 'all' || listing.seatingType === filters.seatingType)
    )
  })

  if (filters.sort === 'price-asc') return filtered.toSorted((first, second) => first.price - second.price)
  if (filters.sort === 'price-desc') return filtered.toSorted((first, second) => second.price - first.price)
  if (filters.sort === 'event-date') {
    return filtered.toSorted((first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime())
  }
  return [...filtered]
}
