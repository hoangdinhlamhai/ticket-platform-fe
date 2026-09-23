import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveOrganizerCreateRedirect } from './resolve-organizer-create-redirect.ts'
import type { OrganizerOperationResult } from '../types/organizer-workspace.ts'

function result(over: Partial<OrganizerOperationResult> & Pick<OrganizerOperationResult, 'kind'>): OrganizerOperationResult {
  return { operation: 'create_event', targetIds: { eventId: 'e1' }, ...over } as OrganizerOperationResult
}

test('directs a confirmed event_created to the My events list and clears dirty first', () => {
  const redirect = resolveOrganizerCreateRedirect(result({ kind: 'event_created' }))

  assert.deepEqual(redirect, { path: '/organizer/events', clearDirtyFirst: true })
})

test('does not navigate or clear dirty when the create resolved to null (failed/stale)', () => {
  assert.equal(resolveOrganizerCreateRedirect(null), null)
})

test('does not treat an event_updated result as a create redirect', () => {
  assert.equal(resolveOrganizerCreateRedirect(result({ kind: 'event_updated' })), null)
})

test('does not navigate for an unsupported action result', () => {
  assert.equal(resolveOrganizerCreateRedirect(result({ kind: 'action_not_supported', reason: 'x' })), null)
})
