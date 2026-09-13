import assert from 'node:assert/strict'
import test from 'node:test'
import { validateOrganizerEvent } from './validate-organizer-event.ts'

const validEvent = {
  title: 'Hội thảo thiết kế',
  startsAt: '2026-11-20T09:00',
  endsAt: '2026-11-20T17:00',
  venue: 'Trung tâm hội nghị',
  city: 'Hà Nội',
}

test('rejects required organizer event fields in visual field order', () => {
  const result = validateOrganizerEvent({ ...validEvent, title: '  ', venue: '', city: ' ' })
  assert.deepEqual(result.errors, {
    title: 'Nhập tên sự kiện.',
    venue: 'Nhập địa điểm tổ chức.',
    city: 'Nhập tỉnh/thành phố.',
  })
  assert.equal(result.firstInvalidField, 'title')
})

test('rejects an invalid or reversed date range', () => {
  const result = validateOrganizerEvent({ ...validEvent, startsAt: '2026-11-20T18:00', endsAt: '2026-11-20T09:00' })
  assert.equal(result.errors.endsAt, 'Thời gian kết thúc phải sau thời gian bắt đầu.')
  assert.equal(result.firstInvalidField, 'endsAt')
})

test('accepts a complete event and trims external text at validation boundary', () => {
  const result = validateOrganizerEvent({ ...validEvent, title: '  Hội thảo thiết kế  ' })
  assert.deepEqual(result.errors, {})
  assert.equal(result.firstInvalidField, null)
})
