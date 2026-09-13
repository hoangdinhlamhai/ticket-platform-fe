import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getOrganizerEventId,
  getOrganizerRoute,
  isOrganizerEventRoute,
  isOrganizerPath,
} from './organizer-route.ts'

const eventRoutes = [
  ['/organizer/events/summer-live', 'event-overview'],
  ['/organizer/events/summer-live/edit', 'event-edit'],
  ['/organizer/events/summer-live/tickets', 'event-tickets'],
  ['/organizer/events/summer-live/orders', 'event-orders'],
  ['/organizer/events/summer-live/attendees', 'event-attendees'],
  ['/organizer/events/summer-live/check-in', 'event-check-in'],
  ['/organizer/events/summer-live/analytics', 'event-analytics'],
] as const

test('maps every Organizer P0 path to its page', () => {
  assert.equal(getOrganizerRoute('/organizer'), 'dashboard')
  assert.equal(getOrganizerRoute('/organizer/events'), 'events')
  assert.equal(getOrganizerRoute('/organizer/events/new'), 'event-create')
  assert.equal(getOrganizerRoute('/organizer/finance'), 'finance')
  assert.equal(getOrganizerRoute('/organizer/settings'), 'settings')

  for (const [path, route] of eventRoutes) {
    assert.equal(getOrganizerRoute(path), route)
  }
})

test('matches the static create path before dynamic event ids', () => {
  assert.equal(getOrganizerRoute('/organizer/events/new'), 'event-create')
  assert.equal(getOrganizerEventId('/organizer/events/new'), null)
  assert.equal(getOrganizerRoute('/organizer/events/new/edit'), 'not-found')
  assert.equal(getOrganizerEventId('/organizer/events/new/edit'), null)
  assert.equal(getOrganizerRoute('/organizer/events/%6E%65%77'), 'not-found')
  assert.equal(getOrganizerRoute('/organizer/events/%6E%65%77/edit'), 'not-found')
  assert.equal(getOrganizerEventId('/organizer/events/%6E%65%77/edit'), null)
})

test('normalizes trailing slashes, queries and hashes', () => {
  assert.equal(getOrganizerRoute('/organizer/'), 'dashboard')
  assert.equal(getOrganizerRoute('/organizer/events/summer-live/orders/?status=paid#latest'), 'event-orders')
  assert.equal(getOrganizerEventId('/organizer/events/summer-live/orders/?status=paid#latest'), 'summer-live')
})

test('extracts and safely decodes event ids only from event workspace paths', () => {
  assert.equal(getOrganizerEventId('/organizer/events/vong-khuc-thanh-pho'), 'vong-khuc-thanh-pho')
  assert.equal(getOrganizerEventId('/organizer/events/demo%20event/tickets'), 'demo event')
  assert.equal(getOrganizerEventId('/organizer/events'), null)
  assert.equal(getOrganizerEventId('/organizer/finance'), null)
  assert.equal(getOrganizerEventId('/organizer/events//edit'), null)
})

test('rejects malformed or path-breaking encoded event ids', () => {
  assert.equal(getOrganizerRoute('/organizer/events/a%2Fb/tickets'), 'not-found')
  assert.equal(getOrganizerEventId('/organizer/events/a%2Fb/tickets'), null)
  assert.equal(getOrganizerRoute('/organizer/events/a%3Fb/edit'), 'not-found')
  assert.equal(getOrganizerRoute('/organizer/events/a%23b'), 'not-found')
  assert.equal(getOrganizerRoute('/organizer/events/bad%ZZ/orders'), 'not-found')
})

test('keeps unsupported Organizer paths inside an Organizer not-found route', () => {
  assert.equal(getOrganizerRoute('/organizer/unknown'), 'not-found')
  assert.equal(getOrganizerRoute('/organizer/events/summer-live/unknown'), 'not-found')
  assert.equal(getOrganizerRoute('/organizer/events//edit'), 'not-found')
  assert.equal(getOrganizerRoute('/organizers'), 'not-found')
})

test('identifies Organizer and event-workspace paths without prefix collisions', () => {
  assert.equal(isOrganizerPath('/organizer'), true)
  assert.equal(isOrganizerPath('/organizer/events/summer-live'), true)
  assert.equal(isOrganizerPath('/organizer-tools'), false)
  assert.equal(isOrganizerPath('/organizers'), false)
  assert.equal(isOrganizerPath('/events/summer-live'), false)

  assert.equal(isOrganizerEventRoute('event-overview'), true)
  assert.equal(isOrganizerEventRoute('event-check-in'), true)
  assert.equal(isOrganizerEventRoute('event-create'), false)
  assert.equal(isOrganizerEventRoute('finance'), false)
})
