import assert from 'node:assert/strict'
import test from 'node:test'
import { MOCK_OWNED_TICKETS } from '../../tickets/mock/ticketData.ts'
import { createResaleListing } from './create-resale-listing.ts'
import { updateResaleListingStatus } from './update-resale-listing-status.ts'

const profile = { fullName: 'Minh Anh', email: 'minhanh@ticketly.vn', phone: '0901234567', birthDate: '1998-06-15' }
test('creates an active current-profile listing from an owned ticket', () => {
  const listing = createResaleListing(MOCK_OWNED_TICKETS[0], 450000, profile)
  assert.equal(listing.price, 450000)
  assert.equal(listing.eventId, MOCK_OWNED_TICKETS[0].eventId)
  assert.equal(listing.sourceTicketId, MOCK_OWNED_TICKETS[0].id)
  assert.equal(listing.ownerLabel, 'current-profile')
  assert.equal(listing.listingStatus, 'active')
})
test('rejects non-positive prices and updates listing status immutably', () => {
  assert.throws(() => createResaleListing(MOCK_OWNED_TICKETS[0], 0, profile))
  const listing = createResaleListing(MOCK_OWNED_TICKETS[0], 450000, profile)
  const updated = updateResaleListingStatus([listing], listing.id, 'withdrawn')
  assert.equal(updated[0].listingStatus, 'withdrawn')
  assert.equal(listing.listingStatus, 'active')
})
