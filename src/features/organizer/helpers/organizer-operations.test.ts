import assert from 'node:assert/strict'
import test from 'node:test'
import { createOrganizerWorkspace } from '../mock/create-organizer-workspace.ts'
import {
  filterOrganizerAttendees,
  getOrganizerAttendeeSource,
} from './filter-organizer-attendees.ts'
import { filterOrganizerOrders } from './filter-organizer-orders.ts'
import { organizerWorkspaceReducer } from './organizer-workspace-reducer.ts'
import { canSaveOrganizerTicketTier, validateOrganizerTicketTier } from './validate-organizer-ticket-tier.ts'

const validDraft = {
  name: 'Vé tiêu chuẩn',
  price: 200_000,
  capacity: 100,
  salesStartAt: '2026-09-15T09:00:00.000Z',
  salesEndAt: '2026-10-24T23:00:00.000Z',
  perOrderLimit: 4,
}

test('validates editable ticket-tier fields and protects sold inventory', () => {
  assert.equal(validateOrganizerTicketTier(validDraft).valid, true)
  assert.equal(canSaveOrganizerTicketTier(validDraft, 3), true)
  assert.equal(canSaveOrganizerTicketTier({ ...validDraft, capacity: 2 }, 3), false)

  for (const draft of [
    { ...validDraft, name: '   ' },
    { ...validDraft, price: -1 },
    { ...validDraft, capacity: 1.5 },
    { ...validDraft, perOrderLimit: 0 },
    { ...validDraft, salesStartAt: 'khong-hop-le' },
    { ...validDraft, salesEndAt: validDraft.salesStartAt },
  ]) {
    assert.equal(validateOrganizerTicketTier(draft).valid, false)
  }
})

test('reducer rejects attempts to rewrite ticket ownership or sold count', () => {
  const workspace = createOrganizerWorkspace()
  const tier = workspace.ticketTiers.find((item) => item.soldCount > 0)!
  const anotherEvent = workspace.events.find((event) => event.id !== tier.eventId)!

  for (const replacement of [
    { ...tier, eventId: anotherEvent.id },
    { ...tier, soldCount: tier.soldCount + 1 },
  ]) {
    const transition = organizerWorkspaceReducer(workspace, {
      type: 'upsert_ticket_tier',
      tier: replacement,
      currentAt: '2026-09-20T12:00:00.000Z',
    })
    assert.equal(transition.result?.kind, 'inventory_rejected')
    assert.equal(transition.state, workspace)
  }
})

test('filters orders by event, payment status, and normalized Vietnamese search', () => {
  const workspace = createOrganizerWorkspace()
  const orders = filterOrganizerOrders(workspace.orders, 'org-event-published', {
    query: 'nguyen minh anh',
    paymentStatus: 'paid',
  })

  assert.deepEqual(orders.map((order) => order.id), ['order-published-01'])
  assert.equal(filterOrganizerOrders(workspace.orders, 'org-event-published', { query: '', paymentStatus: 'refunded' }).length, 0)
  assert.equal(filterOrganizerOrders(workspace.orders, 'org-event-published', { query: 'khong-co', paymentStatus: 'all' }).length, 0)
  assert.equal(orders.every((order) => order.eventId === 'org-event-published'), true)
})

test('filters attendees by event, normalized search, tier, credential, and buyer-holder source', () => {
  const workspace = createOrganizerWorkspace()
  const buyers = filterOrganizerAttendees(workspace.attendees, workspace.orders, 'org-event-published', {
    query: 'tran quoc bao',
    credentialStatus: 'valid',
    source: 'buyer',
    ticketTierId: 'all',
  })
  const holders = filterOrganizerAttendees(workspace.attendees, workspace.orders, 'org-event-published', {
    query: '',
    credentialStatus: 'all',
    source: 'holder',
    ticketTierId: 'tier-published-general',
  })

  assert.deepEqual(buyers.map((attendee) => attendee.id), ['attendee-pub-03'])
  assert.deepEqual(holders.map((attendee) => attendee.id), ['attendee-pub-02'])
  assert.equal(holders.every((attendee) => attendee.eventId === 'org-event-published'), true)
  assert.equal(filterOrganizerAttendees(workspace.attendees, workspace.orders, 'org-event-published', { query: 'khong-co', credentialStatus: 'all', source: 'all', ticketTierId: 'all' }).length, 0)
})

test('uses the explicit buyer relation and excludes cross-event attendee orders', () => {
  const workspace = createOrganizerWorkspace()
  const ordersById = new Map(workspace.orders.map((order) => [order.id, order]))
  const buyer = workspace.attendees.find((attendee) => attendee.id === 'attendee-pub-01')!
  const renamedBuyer = {
    ...buyer,
    fullName: 'Người được thay đổi tên',
    email: 'holder-changed@example.com',
  }
  const crossEventAttendee = {
    ...buyer,
    id: 'attendee-cross-event',
    eventId: 'org-event-ongoing',
  }

  assert.equal(getOrganizerAttendeeSource(renamedBuyer, ordersById), 'buyer')
  assert.equal(getOrganizerAttendeeSource(crossEventAttendee, ordersById), 'holder')

  const buyers = filterOrganizerAttendees(
    [...workspace.attendees.filter((attendee) => attendee.id !== buyer.id), renamedBuyer],
    workspace.orders,
    buyer.eventId,
    { query: '', credentialStatus: 'all', source: 'buyer', ticketTierId: 'all' },
  )
  const ongoingAttendees = filterOrganizerAttendees(
    [...workspace.attendees, crossEventAttendee],
    workspace.orders,
    crossEventAttendee.eventId,
    { query: '', credentialStatus: 'all', source: 'all', ticketTierId: 'all' },
  )

  assert.equal(buyers.some((attendee) => attendee.id === renamedBuyer.id), true)
  assert.equal(
    ongoingAttendees.some((attendee) => attendee.id === crossEventAttendee.id),
    false,
  )
})
