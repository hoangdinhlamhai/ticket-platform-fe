import assert from 'node:assert/strict'
import test from 'node:test'
import { createOrganizerWorkspace } from '../mock/create-organizer-workspace.ts'
import { getOrganizerTicketSaleStatusTransition } from './organizer-inventory-transitions.ts'
import { organizerWorkspaceReducer } from './organizer-workspace-reducer.ts'

const eventInput = {
  title: 'Đêm nhạc mùa thu',
  startsAt: '2026-11-20T19:30:00+07:00',
  endsAt: '2026-11-20T22:30:00+07:00',
  venue: 'Nhà hát Thành phố',
  city: 'TP. Hồ Chí Minh',
}

const initialTicketTier = {
  name: 'Vé tiêu chuẩn',
  price: 250_000,
  capacity: 200,
}
const currentAt = '2026-09-20T12:00:00.000Z'

function assertOperation(result: ReturnType<typeof organizerWorkspaceReducer>['result'], operation: string, targetIds: object) {
  assert.notEqual(result, null)
  assert.equal(result.operation, operation)
  assert.deepEqual(result.targetIds, targetIds)
}

test('creates a draft event and its initial ticket tier atomically without mutating fixtures', () => {
  const initial = createOrganizerWorkspace()
  const created = organizerWorkspaceReducer(initial, {
    type: 'create_event',
    input: eventInput,
    initialTicketTier,
  })
  const event = created.state.events.at(-1)!
  const tier = created.state.ticketTiers.at(-1)!

  assert.equal(created.result?.kind, 'event_created')
  assertOperation(created.result, 'create_event', { eventId: event.id, ticketTierId: tier.id })
  assert.equal(event.status, 'draft')
  assert.deepEqual(tier, {
    id: `${event.id}-tier-1`,
    eventId: event.id,
    name: initialTicketTier.name,
    price: initialTicketTier.price,
    capacity: initialTicketTier.capacity,
    soldCount: 0,
    saleStatus: 'scheduled',
    salesStartAt: eventInput.startsAt,
    salesEndAt: eventInput.endsAt,
    perOrderLimit: 4,
  })
  assert.equal(initial.events.some((item) => item.id === event.id), false)
  assert.equal(initial.ticketTiers.some((item) => item.id === tier.id), false)

  const edited = organizerWorkspaceReducer(created.state, { type: 'update_event', eventId: event.id, patch: { title: 'Đêm nhạc cuối thu' } })
  assert.equal(edited.result?.kind, 'event_updated')
  assertOperation(edited.result, 'update_event', { eventId: event.id })
  assert.equal(edited.state.events.at(-1)!.title, 'Đêm nhạc cuối thu')
  assert.equal(created.state.events.at(-1)!.title, 'Đêm nhạc mùa thu')
})

test('rejects invalid event or initial-tier input without a partial event or ticket tier', () => {
  const initial = createOrganizerWorkspace()
  const invalidEvent = organizerWorkspaceReducer(initial, {
    type: 'create_event',
    input: { ...eventInput, title: '   ' },
    initialTicketTier,
  })
  const invalidTier = organizerWorkspaceReducer(initial, {
    type: 'create_event',
    input: eventInput,
    initialTicketTier: { ...initialTicketTier, price: Number.POSITIVE_INFINITY },
  })

  assert.equal(invalidEvent.result?.kind, 'event_transition_rejected')
  assertOperation(invalidEvent.result, 'create_event', {
    eventId: `org-event-session-${initial.events.length + 1}`,
    ticketTierId: `org-event-session-${initial.events.length + 1}-tier-1`,
  })
  assert.equal(invalidEvent.state, initial)

  assert.equal(invalidTier.result?.kind, 'inventory_rejected')
  assertOperation(invalidTier.result, 'create_event', {
    eventId: `org-event-session-${initial.events.length + 1}`,
    ticketTierId: `org-event-session-${initial.events.length + 1}-tier-1`,
  })
  assert.equal(invalidTier.state, initial)
})

test('allows only draft or changes requested events to submit for review and never self-approves', () => {
  const workspace = createOrganizerWorkspace()
  const draft = workspace.events.find((event) => event.status === 'draft')!
  const pending = organizerWorkspaceReducer(workspace, { type: 'submit_event_review', eventId: draft.id })
  assert.equal(pending.result?.kind, 'event_review_submitted')
  assertOperation(pending.result, 'submit_event_review', { eventId: draft.id })
  assert.equal(pending.state.events.find((event) => event.id === draft.id)!.status, 'pending_review')

  const changesRequested = workspace.events.find((event) => event.status === 'changes_requested')!
  const resubmitted = organizerWorkspaceReducer(workspace, { type: 'submit_event_review', eventId: changesRequested.id })
  assert.equal(resubmitted.result?.kind, 'event_review_submitted')
  assert.equal(resubmitted.state.events.find((event) => event.id === changesRequested.id)!.status, 'pending_review')

  const repeated = organizerWorkspaceReducer(pending.state, { type: 'submit_event_review', eventId: draft.id })
  assert.equal(repeated.result?.kind, 'event_transition_rejected')
  assertOperation(repeated.result, 'submit_event_review', { eventId: draft.id })
  assert.equal(repeated.state, pending.state)
  assert.equal(organizerWorkspaceReducer(workspace, { type: 'approve_event', eventId: draft.id }).result?.kind, 'action_not_supported')
  assert.equal(organizerWorkspaceReducer(workspace, { type: 'reject_event', eventId: draft.id }).result?.kind, 'action_not_supported')
})

test('publishes approved events only and preserves state for invalid lifecycle operations', () => {
  const workspace = createOrganizerWorkspace()
  const approved = workspace.events.find((event) => event.status === 'approved')!
  const published = organizerWorkspaceReducer(workspace, { type: 'publish_event', eventId: approved.id })
  assert.equal(published.result?.kind, 'event_published')
  assertOperation(published.result, 'publish_event', { eventId: approved.id })
  assert.equal(published.state.events.find((event) => event.id === approved.id)!.status, 'published')

  const draft = workspace.events.find((event) => event.status === 'draft')!
  const rejected = organizerWorkspaceReducer(workspace, { type: 'publish_event', eventId: draft.id })
  assert.equal(rejected.result?.kind, 'event_transition_rejected')
  assertOperation(rejected.result, 'publish_event', { eventId: draft.id })
  assert.equal(rejected.state, workspace)
})

test('rejects invalid event schedules and only allows eligible lifecycle edits', () => {
  const workspace = createOrganizerWorkspace()
  const draft = workspace.events.find((event) => event.status === 'draft')!
  const invalidSchedule = organizerWorkspaceReducer(workspace, { type: 'update_event', eventId: draft.id, patch: { startsAt: '2026-12-01T20:00:00+07:00', endsAt: '2026-12-01T19:00:00+07:00' } })
  assert.equal(invalidSchedule.result?.kind, 'event_transition_rejected')
  assertOperation(invalidSchedule.result, 'update_event', { eventId: draft.id })
  assert.equal(invalidSchedule.state, workspace)

  const published = workspace.events.find((event) => event.status === 'published')!
  const locked = organizerWorkspaceReducer(workspace, { type: 'update_event', eventId: published.id, patch: { title: 'Không được đổi' } })
  assert.equal(locked.result?.kind, 'event_transition_rejected')
  assert.equal(locked.state, workspace)
})

test('preserves event and sold ownership while normalizing a full on-sale tier', () => {
  const workspace = createOrganizerWorkspace()
  const tier = workspace.ticketTiers.find(
    (item) => item.soldCount > 0 && item.capacity > item.soldCount,
  )!
  const otherEvent = workspace.events.find((event) => event.id !== tier.eventId)!
  const invalidCapacity = organizerWorkspaceReducer(workspace, {
    type: 'upsert_ticket_tier',
    tier: { ...tier, capacity: tier.soldCount - 1 },
    currentAt,
  })
  const movedEvent = organizerWorkspaceReducer(workspace, {
    type: 'upsert_ticket_tier',
    tier: { ...tier, eventId: otherEvent.id },
    currentAt,
  })
  const rewrittenSoldCount = organizerWorkspaceReducer(workspace, {
    type: 'upsert_ticket_tier',
    tier: { ...tier, soldCount: tier.soldCount + 1 },
    currentAt,
  })

  for (const transition of [invalidCapacity, movedEvent, rewrittenSoldCount]) {
    assert.equal(transition.result?.kind, 'inventory_rejected')
    assertOperation(transition.result, 'upsert_ticket_tier', {
      eventId: tier.eventId,
      ticketTierId: tier.id,
    })
    assert.equal(transition.state, workspace)
  }

  const sellLimitCapacity = organizerWorkspaceReducer(workspace, {
    type: 'upsert_ticket_tier',
    tier: { ...tier, capacity: tier.soldCount, saleStatus: 'on_sale' },
    currentAt,
  })
  const savedTier = sellLimitCapacity.state.ticketTiers.find((item) => item.id === tier.id)!
  assert.equal(sellLimitCapacity.result?.kind, 'ticket_tier_saved')
  assertOperation(sellLimitCapacity.result, 'upsert_ticket_tier', {
    eventId: tier.eventId,
    ticketTierId: tier.id,
  })
  assert.notEqual(sellLimitCapacity.state, workspace)
  assert.equal(savedTier.capacity, tier.soldCount)
  assert.equal(savedTier.soldCount, tier.soldCount)
  assert.equal(savedTier.saleStatus, 'sold_out')
  assert.equal(workspace.ticketTiers.find((item) => item.id === tier.id)!.saleStatus, 'on_sale')

  const updated = organizerWorkspaceReducer(workspace, {
    type: 'upsert_ticket_tier',
    tier: { ...tier, capacity: tier.soldCount + 10 },
    currentAt,
  })
  assert.equal(updated.result?.kind, 'ticket_tier_saved')
  assertOperation(updated.result, 'upsert_ticket_tier', {
    eventId: tier.eventId,
    ticketTierId: tier.id,
  })
  assert.equal(
    updated.state.ticketTiers.find((item) => item.id === tier.id)!.capacity,
    tier.soldCount + 10,
  )
})

test('uses the supplied timestamp to enforce sale windows and inventory transitions', () => {
  const workspace = createOrganizerWorkspace()
  const sellingTier = workspace.ticketTiers.find((tier) => tier.saleStatus === 'on_sale')!
  const soldOutTier = workspace.ticketTiers.find((tier) => tier.saleStatus === 'sold_out')!
  const draftTier = workspace.ticketTiers.find((tier) => tier.eventId === 'org-event-draft')!
  const endedTier = workspace.ticketTiers.find((tier) => tier.saleStatus === 'ended')!
  const sellingEvent = workspace.events.find((event) => event.id === sellingTier.eventId)!
  const draftEvent = workspace.events.find((event) => event.id === draftTier.eventId)!
  const endedEvent = workspace.events.find((event) => event.id === endedTier.eventId)!
  const duringSale = '2026-09-20T12:00:00.000Z'

  assert.equal(getOrganizerTicketSaleStatusTransition(sellingTier, sellingEvent.status, 'on_sale', duringSale).allowed, true)
  assert.equal(getOrganizerTicketSaleStatusTransition(sellingTier, sellingEvent.status, 'sold_out', duringSale).allowed, false)
  assert.equal(getOrganizerTicketSaleStatusTransition(soldOutTier, sellingEvent.status, 'on_sale', duringSale).allowed, false)
  assert.equal(getOrganizerTicketSaleStatusTransition(draftTier, draftEvent.status, 'on_sale', duringSale).allowed, false)
  assert.equal(getOrganizerTicketSaleStatusTransition(draftTier, draftEvent.status, 'sold_out', duringSale).allowed, false)
  assert.equal(getOrganizerTicketSaleStatusTransition(endedTier, endedEvent.status, 'scheduled', duringSale).allowed, false)
  assert.equal(getOrganizerTicketSaleStatusTransition(sellingTier, sellingEvent.status, 'on_sale', '2026-09-15T01:00:00.000Z').allowed, false)
  assert.equal(getOrganizerTicketSaleStatusTransition(sellingTier, sellingEvent.status, 'on_sale', sellingTier.salesEndAt).allowed, false)
  assert.equal(getOrganizerTicketSaleStatusTransition(sellingTier, sellingEvent.status, 'on_sale', '2026-10-25T00:00:00.000Z').allowed, false)

  const savedTier = organizerWorkspaceReducer(workspace, {
    type: 'upsert_ticket_tier',
    tier: { ...sellingTier, perOrderLimit: sellingTier.perOrderLimit + 1 },
    currentAt: '2026-10-25T00:00:00.000Z',
  })
  assert.equal(savedTier.result?.kind, 'ticket_tier_saved')
  assertOperation(savedTier.result, 'upsert_ticket_tier', {
    eventId: sellingTier.eventId,
    ticketTierId: sellingTier.id,
  })

  const invalidTierSale = organizerWorkspaceReducer(workspace, {
    type: 'upsert_ticket_tier',
    tier: { ...draftTier, saleStatus: 'on_sale' },
    currentAt: duringSale,
  })
  assert.equal(invalidTierSale.result?.kind, 'inventory_rejected')
  assertOperation(invalidTierSale.result, 'upsert_ticket_tier', {
    eventId: draftTier.eventId,
    ticketTierId: draftTier.id,
  })
  assert.equal(invalidTierSale.state, workspace)

  const paused = organizerWorkspaceReducer(workspace, {
    type: 'set_ticket_sale_status',
    tierId: sellingTier.id,
    status: 'paused',
    currentAt: duringSale,
  })
  assert.equal(paused.result?.kind, 'ticket_tier_saved')
  assertOperation(paused.result, 'set_ticket_sale_status', {
    eventId: sellingTier.eventId,
    ticketTierId: sellingTier.id,
  })
  assert.equal(paused.state.ticketTiers.find((tier) => tier.id === sellingTier.id)!.saleStatus, 'paused')

  const invalidSoldOut = organizerWorkspaceReducer(workspace, {
    type: 'set_ticket_sale_status',
    tierId: sellingTier.id,
    status: 'sold_out',
    currentAt: duringSale,
  })
  assert.equal(invalidSoldOut.result?.kind, 'inventory_rejected')
  assertOperation(invalidSoldOut.result, 'set_ticket_sale_status', {
    eventId: sellingTier.eventId,
    ticketTierId: sellingTier.id,
  })
  assert.equal(invalidSoldOut.state, workspace)
})

test('checks in valid credentials atomically with the action timestamp and returns idempotent outcomes', () => {
  const workspace = createOrganizerWorkspace()
  const attendee = workspace.attendees.find((item) => item.credentialStatus === 'valid' && !item.checkedInAt)!
  const checkedInAt = '2026-09-02T10:30:00.000Z'
  const checked = organizerWorkspaceReducer(workspace, { type: 'check_in_attendee', eventId: attendee.eventId, attendeeId: attendee.id, checkedInAt })
  assert.deepEqual(checked.result, { kind: 'check_in', operation: 'check_in_attendee', targetIds: { eventId: attendee.eventId, attendeeId: attendee.id }, outcome: 'success' })
  assert.equal(checked.state.attendees.find((item) => item.id === attendee.id)!.checkedInAt, checkedInAt)
  assert.equal(checked.state.checkInActivities[0].checkedInAt, checkedInAt)
  assert.equal(checked.state.checkInActivities.length, workspace.checkInActivities.length + 1)

  const duplicate = organizerWorkspaceReducer(checked.state, { type: 'check_in_attendee', eventId: attendee.eventId, attendeeId: attendee.id, checkedInAt: '2026-09-02T10:31:00.000Z' })
  assert.equal(duplicate.result?.kind, 'check_in')
  assert.equal(duplicate.result?.outcome, 'already_checked_in')
  assert.equal(duplicate.state, checked.state)

  const voidAttendee = workspace.attendees.find((item) => item.credentialStatus === 'void')!
  const voidResult = organizerWorkspaceReducer(workspace, { type: 'check_in_attendee', eventId: voidAttendee.eventId, attendeeId: voidAttendee.id, checkedInAt })
  assert.equal(voidResult.result?.outcome, 'revoked')
  assert.equal(voidResult.state, workspace)

  const wrongEvent = workspace.events.find((event) => event.id !== attendee.eventId)!
  assert.equal(organizerWorkspaceReducer(workspace, { type: 'check_in_attendee', eventId: wrongEvent.id, attendeeId: attendee.id, checkedInAt }).result?.outcome, 'wrong_event')
  assert.equal(organizerWorkspaceReducer(workspace, { type: 'check_in_attendee', eventId: attendee.eventId, attendeeId: 'missing', checkedInAt }).result?.outcome, 'not_found')
})

test('updates the canonical organization used by the organizer header in the current session', () => {
  const workspace = createOrganizerWorkspace()
  const updated = organizerWorkspaceReducer(workspace, {
    type: 'update_organization',
    patch: {
      name: 'Sự kiện Sao Việt Mới',
      businessIdentifier: 'MST •••••• 7777',
    },
  })

  assert.equal(updated.result?.kind, 'organization_updated')
  assertOperation(updated.result, 'update_organization', { organizationId: workspace.organization.id })
  assert.equal(updated.state.organization.name, 'Sự kiện Sao Việt Mới')
  assert.equal(updated.state.organization.businessIdentifier, 'MST •••••• 7777')
  assert.equal(workspace.organization.name, 'Sự kiện Sao Việt')
  assert.equal(workspace.organization.businessIdentifier, 'MST •••••• 4821')
})

test('clears the acknowledged operation without changing canonical workspace state', () => {
  const workspace = createOrganizerWorkspace()
  const updated = organizerWorkspaceReducer(workspace, { type: 'update_organization', patch: { name: 'Sự kiện Sao Việt Mới' } })
  assert.equal(updated.result?.kind, 'organization_updated')
  assertOperation(updated.result, 'update_organization', { organizationId: workspace.organization.id })

  const cleared = organizerWorkspaceReducer(updated.state, { type: 'clear_last_operation' })
  assert.equal(cleared.state, updated.state)
  assert.equal(cleared.result, null)
})

test('rejects invalid organization updates at the canonical reducer boundary', () => {
  const workspace = createOrganizerWorkspace()
  for (const patch of [
    { name: '   ' },
    { publicEmail: 'khong-hop-le' },
    { publicPhone: '123' },
    { businessIdentifier: '0312345678' },
  ]) {
    const updated = organizerWorkspaceReducer(workspace, { type: 'update_organization', patch })
    assert.equal(updated.result?.kind, 'action_not_supported')
    assert.equal(updated.state, workspace)
  }
})

test('provides isolated fixtures with referentially valid commerce data', () => {
  const first = createOrganizerWorkspace()
  const second = createOrganizerWorkspace()
  assert.notEqual(first.organization, second.organization)
  assert.notEqual(first.events, second.events)
  assert.notEqual(first.orders[0].items, second.orders[0].items)
  assert.deepEqual([...new Set(first.events.map((event) => event.status))].sort(), ['approved', 'cancelled', 'changes_requested', 'draft', 'ended', 'ongoing', 'pending_review', 'published', 'rejected'])
  assert.deepEqual([...new Set(first.ticketTiers.map((tier) => tier.saleStatus))].sort(), ['ended', 'on_sale', 'paused', 'scheduled', 'sold_out'])
  assert.equal(first.ticketTiers.every((tier) => first.events.some((event) => event.id === tier.eventId) && tier.capacity >= tier.soldCount), true)
  assert.equal(first.orders.every((order) => first.events.some((event) => event.id === order.eventId) && order.ticketTierIds.every((id) => first.ticketTiers.some((tier) => tier.id === id))), true)
  assert.equal(first.attendees.every((attendee) => first.orders.some((order) => order.id === attendee.orderId && order.eventId === attendee.eventId) && first.ticketTiers.some((tier) => tier.id === attendee.ticketTierId && tier.eventId === attendee.eventId)), true)
  assert.equal(first.checkInActivities.every((activity) => first.events.some((event) => event.id === activity.eventId) && first.attendees.some((attendee) => attendee.id === activity.attendeeId && attendee.eventId === activity.eventId)), true)
  assert.equal(first.refunds.every((refund) => first.orders.some((order) => order.id === refund.orderId)), true)
  assert.equal(first.payouts.every((payout) => first.events.some((event) => event.id === payout.eventId)), true)
})
