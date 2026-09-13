import assert from 'node:assert/strict'
import test from 'node:test'
import {
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from './use-organizer-event-form.ts'

test('converts canonical ISO timestamps to local datetime-local values and back', () => {
  const source = '2026-11-20T12:30:00.000Z'
  const localValue = toDateTimeLocalValue(source)

  assert.match(localValue, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  assert.equal(fromDateTimeLocalValue(localValue), new Date(source).toISOString())
})

test('rejects malformed and impossible datetime-local values', () => {
  for (const value of [
    '',
    '2026-02-30T09:00',
    '2026-11-20T24:00',
    '2026-11-20T09:60',
    '2026-11-20T09:00:00',
    'not-a-date',
  ]) {
    assert.equal(fromDateTimeLocalValue(value), '')
  }

  assert.equal(toDateTimeLocalValue('not-a-date'), '')
})
