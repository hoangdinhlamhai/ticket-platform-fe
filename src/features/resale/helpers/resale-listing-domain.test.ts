import test from 'node:test'
import assert from 'node:assert/strict'
import { MOCK_RESALE_LISTINGS } from '../mock/resaleData.ts'
import { applyResaleSessionAvailability } from './apply-resale-session-availability.ts'
import { filterResaleListings } from './filter-resale-listings.ts'
import { formatResalePrice } from './format-resale-price.ts'
import { getResaleListingById } from './get-resale-listing-by-id.ts'
import type { ResaleMarketplaceFilters } from '../types/resale.ts'

const defaults: ResaleMarketplaceFilters = {
  query: '',
  eventDate: '',
  priceBand: 'all',
  ticketType: '',
  city: '',
  seatingType: 'all',
  sort: 'relevance',
}

test('provides eight varied resale listings with stable unique ids', () => {
  assert.equal(MOCK_RESALE_LISTINGS.length, 8)
  assert.equal(new Set(MOCK_RESALE_LISTINGS.map((listing) => listing.id)).size, 8)
  assert.equal(MOCK_RESALE_LISTINGS.some((listing) => listing.availability === 'unavailable'), true)
  assert.equal(new Set(MOCK_RESALE_LISTINGS.map((listing) => listing.city)).size >= 3, true)
  assert.equal(new Set(MOCK_RESALE_LISTINGS.map((listing) => listing.seatingType)).size, 2)
  assert.equal(MOCK_RESALE_LISTINGS.every((listing) => listing.price > 0), true)
})

test('formats resale prices and looks up listings by id', () => {
  assert.equal(formatResalePrice(390000), '390.000đ')
  assert.equal(formatResalePrice(1170000), '1.170.000đ')
  assert.equal(getResaleListingById(MOCK_RESALE_LISTINGS, MOCK_RESALE_LISTINGS[0].id), MOCK_RESALE_LISTINGS[0])
  assert.equal(getResaleListingById(MOCK_RESALE_LISTINGS, 'missing'), undefined)
})

test('searches normalized event, venue, city and seller values', () => {
  assert.equal(filterResaleListings(MOCK_RESALE_LISTINGS, { ...defaults, query: '  midnight  ' }).length, 1)
  assert.equal(filterResaleListings(MOCK_RESALE_LISTINGS, { ...defaults, query: 'nhà hát' }).length > 0, true)
  assert.equal(filterResaleListings(MOCK_RESALE_LISTINGS, { ...defaults, query: 'đà nẵng' }).length > 0, true)
  assert.equal(filterResaleListings(MOCK_RESALE_LISTINGS, { ...defaults, query: 'linh trần' }).length, 1)
})

test('combines marketplace filters with and semantics', () => {
  const listing = MOCK_RESALE_LISTINGS[0]
  const result = filterResaleListings(MOCK_RESALE_LISTINGS, {
    ...defaults,
    eventDate: listing.startsAt.slice(0, 10),
    priceBand: listing.price < 500000 ? 'under-500k' : listing.price <= 1000000 ? '500k-to-1m' : 'over-1m',
    ticketType: listing.ticketType,
    city: listing.city,
    seatingType: listing.seatingType,
  })

  assert.deepEqual(result.map((item) => item.id), [listing.id])
})

test('sorts listings without mutating the curated fixture order', () => {
  const originalIds = MOCK_RESALE_LISTINGS.map((listing) => listing.id)
  const ascending = filterResaleListings(MOCK_RESALE_LISTINGS, { ...defaults, sort: 'price-asc' })
  const descending = filterResaleListings(MOCK_RESALE_LISTINGS, { ...defaults, sort: 'price-desc' })
  const nearest = filterResaleListings(MOCK_RESALE_LISTINGS, { ...defaults, sort: 'event-date' })

  assert.equal(ascending[0].price <= ascending.at(-1)!.price, true)
  assert.equal(descending[0].price >= descending.at(-1)!.price, true)
  assert.equal(new Date(nearest[0].startsAt).getTime() <= new Date(nearest.at(-1)!.startsAt).getTime(), true)
  assert.deepEqual(MOCK_RESALE_LISTINGS.map((listing) => listing.id), originalIds)
  assert.deepEqual(filterResaleListings(MOCK_RESALE_LISTINGS, defaults).map((listing) => listing.id), originalIds)
})

test('returns an empty collection when filters have no match', () => {
  assert.deepEqual(filterResaleListings(MOCK_RESALE_LISTINGS, { ...defaults, query: 'không tồn tại' }), [])
})

test('marks a completed listing unavailable without mutating fixtures', () => {
  const listing = MOCK_RESALE_LISTINGS[0]
  const effectiveListing = applyResaleSessionAvailability(listing, new Set([listing.id]))

  assert.equal(effectiveListing.availability, 'unavailable')
  assert.equal(listing.availability, 'available')
  assert.equal(applyResaleSessionAvailability(listing, new Set()), listing)
})
