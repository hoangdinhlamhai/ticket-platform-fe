import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getAttendeeEventId,
  getAttendeeOrderId,
  getAttendeeResaleListingId,
  getAttendeeRoute,
  getAttendeeTicketId,
  getPrimaryCheckoutEventId,
  getResaleSellTicketId,
  isResaleRoute,
  shouldUseClientNavigation,
} from './attendee-route.ts'

test('maps supported attendee paths to their pages', () => {
  assert.equal(getAttendeeRoute('/'), 'home')
  assert.equal(getAttendeeRoute('/saved-events'), 'saved-events')
  assert.equal(getAttendeeRoute('/profile'), 'profile')
  assert.equal(getAttendeeRoute('/tickets'), 'tickets')
  assert.equal(getAttendeeRoute('/resale'), 'resale')
  assert.equal(getAttendeeRoute('/resale/resale-midnight-market'), 'resale-listing')
  assert.equal(getAttendeeRoute('/resale/resale-midnight-market/checkout'), 'resale-checkout')
  assert.equal(getAttendeeRoute('/resale/resale-midnight-market/result'), 'resale-result')
  assert.equal(getAttendeeRoute('/events/vong-khuc-thanh-pho'), 'event-detail')
  assert.equal(getAttendeeRoute('/tickets/ticket-vong-khuc'), 'ticket-status')
})

test('maps new checkout, order and resale seller paths before generic routes', () => {
  assert.equal(getAttendeeRoute('/events/vong-khuc-thanh-pho/checkout'), 'primary-checkout')
  assert.equal(getAttendeeRoute('/events/vong-khuc-thanh-pho/checkout/result'), 'primary-result')
  assert.equal(getAttendeeRoute('/orders'), 'orders')
  assert.equal(getAttendeeRoute('/orders/ORD-1001'), 'order-detail')
  assert.equal(getAttendeeRoute('/resale/sell/ticket-vong-khuc'), 'resale-sell')
  assert.equal(getAttendeeRoute('/resale/my-listings'), 'my-resale-listings')
})

test('extracts ids for checkout, order and resale seller paths', () => {
  assert.equal(getPrimaryCheckoutEventId('/events/vong-khuc-thanh-pho/checkout'), 'vong-khuc-thanh-pho')
  assert.equal(getPrimaryCheckoutEventId('/events/vong-khuc-thanh-pho/checkout/result/'), 'vong-khuc-thanh-pho')
  assert.equal(getPrimaryCheckoutEventId('/events/vong-khuc-thanh-pho'), null)
  assert.equal(getAttendeeOrderId('/orders/ORD-1001'), 'ORD-1001')
  assert.equal(getAttendeeOrderId('/orders'), null)
  assert.equal(getResaleSellTicketId('/resale/sell/ticket-vong-khuc'), 'ticket-vong-khuc')
  assert.equal(getResaleSellTicketId('/resale/my-listings'), null)
})

test('extracts event ids from detail paths and normalizes trailing slashes', () => {
  assert.equal(getAttendeeEventId('/events/vong-khuc-thanh-pho'), 'vong-khuc-thanh-pho')
  assert.equal(getAttendeeEventId('/events/midnight-market-live-set/'), 'midnight-market-live-set')
  assert.equal(getAttendeeEventId('/events'), null)
  assert.equal(getAttendeeEventId('/tickets'), null)
})

test('extracts ticket ids from status paths and keeps the ticket list route distinct', () => {
  assert.equal(getAttendeeTicketId('/tickets/ticket-vong-khuc'), 'ticket-vong-khuc')
  assert.equal(getAttendeeTicketId('/tickets/ticket-night-run/'), 'ticket-night-run')
  assert.equal(getAttendeeTicketId('/tickets'), null)
  assert.equal(getAttendeeTicketId('/tickets/'), null)
})

test('extracts resale listing ids from every nested resale page', () => {
  assert.equal(getAttendeeResaleListingId('/resale/resale-midnight-market'), 'resale-midnight-market')
  assert.equal(getAttendeeResaleListingId('/resale/resale-midnight-market/checkout/'), 'resale-midnight-market')
  assert.equal(getAttendeeResaleListingId('/resale/resale-midnight-market/result'), 'resale-midnight-market')
  assert.equal(getAttendeeResaleListingId('/resale'), null)
  assert.equal(getAttendeeResaleListingId('/resale//checkout'), null)
  assert.equal(getAttendeeResaleListingId('/resale/resale-midnight-market/extra'), null)
})

test('keeps checkout and result routes distinct from resale listing detail', () => {
  assert.equal(getAttendeeRoute('/resale/resale-midnight-market/checkout/'), 'resale-checkout')
  assert.equal(getAttendeeRoute('/resale/resale-midnight-market/result/'), 'resale-result')
  assert.equal(getAttendeeRoute('/resale//checkout'), 'home')
  assert.equal(getAttendeeRoute('/resale/resale-midnight-market/extra'), 'home')
})

test('identifies every resale route for shared navigation state', () => {
  assert.equal(isResaleRoute('resale'), true)
  assert.equal(isResaleRoute('resale-listing'), true)
  assert.equal(isResaleRoute('resale-checkout'), true)
  assert.equal(isResaleRoute('resale-result'), true)
  assert.equal(isResaleRoute('home'), false)
  assert.equal(isResaleRoute('event-detail'), false)
  assert.equal(isResaleRoute('ticket-status'), false)
  assert.equal(isResaleRoute('profile'), false)
})

test('falls back to home for unsupported paths and normalizes trailing slashes', () => {
  assert.equal(getAttendeeRoute('/profile/'), 'profile')
  assert.equal(getAttendeeRoute('/saved-events/'), 'saved-events')
  assert.equal(getAttendeeRoute('/tickets/'), 'tickets')
  assert.equal(getAttendeeRoute('/resale/'), 'resale')
  assert.equal(getAttendeeRoute('/profiles'), 'home')
  assert.equal(getAttendeeRoute('/unknown'), 'home')
})

test('uses client navigation only for unmodified primary clicks', () => {
  assert.equal(shouldUseClientNavigation({ button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }), true)
  assert.equal(shouldUseClientNavigation({ button: 0, metaKey: false, ctrlKey: true, shiftKey: false, altKey: false }), false)
  assert.equal(shouldUseClientNavigation({ button: 1, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }), false)
})

test('maps dedicated attendee authentication URLs before the home fallback', () => {
  assert.equal(getAttendeeRoute('/login'), 'login')
  assert.equal(getAttendeeRoute('/register/'), 'register')
  assert.equal(getAttendeeRoute('/login/extra'), 'home')
})
