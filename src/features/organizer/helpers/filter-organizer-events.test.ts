import assert from 'node:assert/strict'
import test from 'node:test'
import { filterOrganizerEvents } from './filter-organizer-events.ts'
import type { OrganizerEvent } from '../types/organizer-event.ts'

const events: readonly OrganizerEvent[] = [
  { id: '1', title: 'Đêm nhạc Mùa hè', startsAt: '2026-12-12T19:00:00+07:00', endsAt: '2026-12-12T22:00:00+07:00', venue: 'Sân khấu A', city: 'Hà Nội', status: 'draft', reviewFeedback: null },
  { id: '2', title: 'Hội thảo Công nghệ', startsAt: '2026-10-10T09:00:00+07:00', endsAt: '2026-10-10T17:00:00+07:00', venue: 'Trung tâm B', city: 'Đà Nẵng', status: 'published', reviewFeedback: null },
  { id: '3', title: 'Triển lãm Sáng tạo', startsAt: '2026-11-10T09:00:00+07:00', endsAt: '2026-11-10T17:00:00+07:00', venue: 'Nhà triển lãm', city: 'Hà Nội', status: 'published', reviewFeedback: null },
]

const revenueByEventId = { '1': 0, '2': 400000, '3': 800000 }

test('filters organizer events by case-insensitive query and status', () => {
  const result = filterOrganizerEvents(events, revenueByEventId, { query: 'hà nội', status: 'published', sort: 'date_asc' })
  assert.deepEqual(result.map((event) => event.id), ['3'])
})

test('sorts organizer events by date and revenue without mutating source', () => {
  const newest = filterOrganizerEvents(events, revenueByEventId, { query: '', status: 'all', sort: 'date_desc' })
  const revenue = filterOrganizerEvents(events, revenueByEventId, { query: '', status: 'all', sort: 'revenue_desc' })
  assert.deepEqual(newest.map((event) => event.id), ['1', '3', '2'])
  assert.deepEqual(revenue.map((event) => event.id), ['3', '2', '1'])
  assert.deepEqual(events.map((event) => event.id), ['1', '2', '3'])
})

test('returns an empty collection for a no-match filter state', () => {
  const result = filterOrganizerEvents(events, revenueByEventId, { query: 'không tồn tại', status: 'all', sort: 'date_asc' })
  assert.deepEqual(result, [])
})
