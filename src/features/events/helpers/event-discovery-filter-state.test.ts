import test from 'node:test'
import assert from 'node:assert/strict'
import {
  countActiveEventFilters,
  createDefaultEventDiscoveryFilters,
  getActiveEventFilterChips,
  removeEventDiscoveryFilter,
  updateEventDiscoveryFilter,
} from './event-discovery-filter-state.ts'

const defaults = createDefaultEventDiscoveryFilters()

test('creates an empty advanced event filter state', () => {
  assert.deepEqual(defaults, {
    city: '',
    venue: '',
    dateFrom: '',
    dateTo: '',
    minPrice: '',
    maxPrice: '',
    freeOnly: false,
    ticketStatuses: [],
    sort: 'date-asc',
  })
  assert.equal(countActiveEventFilters(defaults), 0)
  assert.deepEqual(getActiveEventFilterChips(defaults), [])
  assert.equal(countActiveEventFilters({ ...defaults, sort: 'popularity' }), 1)
})

test('updates controls without mutating the previous filter state', () => {
  const withCity = updateEventDiscoveryFilter(defaults, 'city', 'TP. Hồ Chí Minh')
  const withFreeEvents = updateEventDiscoveryFilter(withCity, 'freeOnly', true)
  const withStatuses = updateEventDiscoveryFilter(withFreeEvents, 'ticketStatuses', ['available', 'coming-soon'])

  assert.equal(defaults.city, '')
  assert.equal(withCity.freeOnly, false)
  assert.deepEqual(withStatuses.ticketStatuses, ['available', 'coming-soon'])
  assert.equal(countActiveEventFilters(withStatuses), 4)
})

test('removes grouped date, price and individual ticket status chips', () => {
  const filters = {
    ...defaults,
    dateFrom: '2026-10-01',
    dateTo: '2026-10-31',
    minPrice: '100000',
    maxPrice: '500000',
    ticketStatuses: ['available', 'sold-out'] as const,
  }

  const withoutDate = removeEventDiscoveryFilter(filters, 'dateFrom')
  const withoutPrice = removeEventDiscoveryFilter(withoutDate, 'minPrice')
  const withoutSoldOut = removeEventDiscoveryFilter(withoutPrice, 'ticket-status-sold-out')

  assert.equal(withoutDate.dateFrom, '')
  assert.equal(withoutDate.dateTo, '')
  assert.equal(withoutPrice.minPrice, '')
  assert.equal(withoutPrice.maxPrice, '')
  assert.deepEqual(withoutSoldOut.ticketStatuses, ['available'])
})
