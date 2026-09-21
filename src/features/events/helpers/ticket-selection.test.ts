import assert from 'node:assert/strict'
import test from 'node:test'
import type { EventTicketTier } from '../types/event.ts'
import { clampTicketQuantity, getTicketAvailability, getTicketQuantityBounds } from './ticket-selection.ts'

const tier = (overrides: Partial<EventTicketTier> = {}): EventTicketTier => ({
  id: 'standard',
  name: 'Standard',
  price: 100000,
  availabilityLabel: 'Lựa chọn',
  note: 'Ghế tiêu chuẩn',
  ...overrides,
})

test('marks future, expired, sold-out, and invalid-price tiers unavailable', () => {
  const now = new Date('2026-09-21T10:00:00.000Z')
  assert.equal(getTicketAvailability(tier({ saleStartAt: '2026-09-21T11:00:00.000Z' }), now).status, 'future')
  assert.equal(getTicketAvailability(tier({ saleEndAt: '2026-09-21T09:00:00.000Z' }), now).status, 'expired')
  assert.equal(getTicketAvailability(tier({ quantity: 0 }), now).status, 'sold-out')
  assert.equal(getTicketAvailability(tier({ price: 0 }), now).status, 'invalid-price')
  assert.equal(getTicketAvailability(tier({ eventEndAt: '2026-09-21T09:00:00.000Z' }), now).status, 'event-ended')
  assert.equal(getTicketAvailability(tier(), now).status, 'available')
})

test('uses valid order bounds and clamps quantity when tier changes', () => {
  const bounds = getTicketQuantityBounds(tier({ minPerOrder: 2, maxPerOrder: 5, quantity: 3 }))
  assert.deepEqual(bounds, { min: 2, max: 3 })
  assert.equal(clampTicketQuantity(1, bounds), 2)
  assert.equal(clampTicketQuantity(8, bounds), 3)
  assert.equal(clampTicketQuantity(2, bounds), 2)
})

test('event end makes a tier unavailable even when its sale window is open', () => {
  const now = new Date('2026-09-21T10:00:00.000Z')
  const result = getTicketAvailability(tier({ saleStartAt: '2026-09-21T09:00:00.000Z', saleEndAt: '2026-09-21T11:00:00.000Z', eventEndAt: '2026-09-21T09:30:00.000Z' }), now)
  assert.equal(result.status, 'event-ended')
})
