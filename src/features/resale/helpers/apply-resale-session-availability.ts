import type { ResaleListing } from '../types/resale'

export function applyResaleSessionAvailability(listing: ResaleListing, completedListingIds: ReadonlySet<string>): ResaleListing {
  if (listing.availability === 'unavailable' || !completedListingIds.has(listing.id)) return listing
  return { ...listing, availability: 'unavailable' }
}
