import assert from 'node:assert/strict'
import test from 'node:test'
import {
  dateTimeLocalToIso,
  dateTimeLocalToIsoPreservingOriginal,
  isoToDateTimeLocal,
} from './organizer-datetime-local.ts'

test('round trips a local datetime with seconds and milliseconds', () => {
  const localDate = new Date(2026, 8, 20, 12, 34, 56, 789)
  const instant = localDate.toISOString()
  const localValue = isoToDateTimeLocal(instant)

  assert.equal(localValue, '2026-09-20T12:34:56.789')
  assert.equal(dateTimeLocalToIso(localValue), instant)
})

test('accepts native minute precision and normalizes optional fractional seconds', () => {
  assert.equal(
    dateTimeLocalToIso('2026-09-20T12:34'),
    new Date(2026, 8, 20, 12, 34, 0, 0).toISOString(),
  )
  assert.equal(
    dateTimeLocalToIso('2026-09-20T12:34:56.7'),
    new Date(2026, 8, 20, 12, 34, 56, 700).toISOString(),
  )
})

test('rejects malformed, impossible, and invalid ISO datetime values', () => {
  for (const value of [
    '',
    '2026-09-20 12:34',
    '2026-02-29T12:34',
    '2026-09-31T12:34',
    '2026-09-20T24:00',
    '2026-09-20T12:60',
    '2026-09-20T12:34:60',
    '2026-09-20T12:34:56.7890',
  ]) {
    assert.equal(dateTimeLocalToIso(value), null)
  }

  assert.equal(isoToDateTimeLocal('not-an-instant'), '')
})

test('preserves the source instant exactly when a rendered datetime is unchanged', () => {
  const originalInstant = '2026-09-20T12:34:56.789+07:00'
  const originalLocalValue = isoToDateTimeLocal(originalInstant)

  assert.equal(
    dateTimeLocalToIsoPreservingOriginal(
      originalLocalValue,
      originalLocalValue,
      originalInstant,
    ),
    originalInstant,
  )

  const changedLocalValue = '2026-09-21T08:30'
  assert.equal(
    dateTimeLocalToIsoPreservingOriginal(
      changedLocalValue,
      originalLocalValue,
      originalInstant,
    ),
    dateTimeLocalToIso(changedLocalValue),
  )
})
