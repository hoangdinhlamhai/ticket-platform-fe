import type { ResaleListing } from '../types/resale'

export function getResaleListingById(listings: readonly ResaleListing[], listingId: string) {
  return listings.find((listing) => listing.id === listingId)
}
