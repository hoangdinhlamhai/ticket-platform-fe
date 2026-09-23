import assert from 'node:assert/strict'
import test from 'node:test'
import { buildOrganizerEventPolicy } from './organizer-event-policy.ts'

test('keeps confirmation message bounded to 500 characters', () => {
  const result = buildOrganizerEventPolicy('x'.repeat(501))
  assert.equal(result.confirmationMessage.length, 500)
})
