import test from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeReportingRange,
  reportingRangeToLocalInputs,
  localInputsToReportingRange,
} from './organizer-reporting-range.ts'

const saleWindow = { startAt: '2026-01-01T00:00:00.000Z', endAt: '2026-02-01T00:00:00.000Z' }

test('normalizeReportingRange accepts a range equal to the sale window', () => {
  const result = normalizeReportingRange({ from: saleWindow.startAt, to: saleWindow.endAt }, saleWindow)
  assert.equal(result.ok, true)
  assert.equal(result.ok && result.range.from, saleWindow.startAt)
  assert.equal(result.ok && result.range.to, saleWindow.endAt)
})

test('normalizeReportingRange accepts an inner range', () => {
  const result = normalizeReportingRange({ from: '2026-01-05T00:00:00.000Z', to: '2026-01-10T00:00:00.000Z' }, saleWindow)
  assert.equal(result.ok, true)
})

test('normalizeReportingRange rejects a from before the sale window start', () => {
  const result = normalizeReportingRange({ from: '2025-12-31T00:00:00.000Z', to: saleWindow.endAt }, saleWindow)
  assert.equal(result.ok, false)
  assert.equal(result.ok === false && typeof result.error, 'string')
})

test('normalizeReportingRange rejects a to after the sale window end', () => {
  const result = normalizeReportingRange({ from: saleWindow.startAt, to: '2026-02-02T00:00:00.000Z' }, saleWindow)
  assert.equal(result.ok, false)
})

test('normalizeReportingRange rejects a reversed range', () => {
  const result = normalizeReportingRange({ from: saleWindow.endAt, to: saleWindow.startAt }, saleWindow)
  assert.equal(result.ok, false)
})

test('normalizeReportingRange rejects an equal from and to', () => {
  const result = normalizeReportingRange({ from: saleWindow.startAt, to: saleWindow.startAt }, saleWindow)
  assert.equal(result.ok, false)
})

test('normalizeReportingRange rejects invalid ISO input', () => {
  const result = normalizeReportingRange({ from: 'not-a-date', to: saleWindow.endAt }, saleWindow)
  assert.equal(result.ok, false)
})

test('reportingRangeToLocalInputs and localInputsToReportingRange round-trip a value', () => {
  const local = reportingRangeToLocalInputs({ from: saleWindow.startAt, to: saleWindow.endAt })
  assert.match(local.from, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
  const back = localInputsToReportingRange(local)
  assert.equal(back && new Date(back.from).getTime(), new Date(saleWindow.startAt).getTime())
  assert.equal(back && new Date(back.to).getTime(), new Date(saleWindow.endAt).getTime())
})

test('reportingRangeToLocalInputs emits second-precision values with no fractional milliseconds', () => {
  // datetime-local with step=1 is second precision; a trailing .000 milliseconds
  // component makes some browsers reject or mis-render the value. The picker inputs
  // must therefore stop at seconds.
  const local = reportingRangeToLocalInputs({ from: saleWindow.startAt, to: saleWindow.endAt })
  assert.match(local.from, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
  assert.match(local.to, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
})

test('localInputsToReportingRange returns null for an empty input', () => {
  assert.equal(localInputsToReportingRange({ from: '', to: '' }), null)
})
