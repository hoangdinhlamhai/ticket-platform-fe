import assert from 'node:assert/strict'
import test from 'node:test'
import { createOrganizerWorkspace } from '../mock/create-organizer-workspace.ts'
import {
  getCanonicalOrganizerTicketSaleStatus,
  getOrganizerTicketSaleStatusTransition,
} from './organizer-inventory-transitions.ts'
import { organizerWorkspaceReducer } from './organizer-workspace-reducer.ts'

const currentAt = '2026-09-20T12:00:00.000Z'

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

test('normalizes zero-capacity tiers to sold out at create, upsert, and sale-status boundaries', () => {
  const workspace = createOrganizerWorkspace()
  const created = organizerWorkspaceReducer(workspace, {
    type: 'create_event',
    input: eventInput,
    initialTicketTier: { ...initialTicketTier, capacity: 0 },
  })
  const createdTier = created.state.ticketTiers.at(-1)!
  const sellingTier = workspace.ticketTiers.find((tier) => tier.saleStatus === 'on_sale')!
  const sellingEvent = workspace.events.find((event) => event.id === sellingTier.eventId)!
  const zeroCapacityTier = {
    ...sellingTier,
    id: 'tier-zero-capacity',
    capacity: 0,
    soldCount: 0,
    saleStatus: 'scheduled' as const,
  }
  const upserted = organizerWorkspaceReducer(workspace, {
    type: 'upsert_ticket_tier',
    tier: zeroCapacityTier,
    currentAt,
  })
  const saleAttempt = organizerWorkspaceReducer(upserted.state, {
    type: 'set_ticket_sale_status',
    tierId: zeroCapacityTier.id,
    status: 'on_sale',
    currentAt,
  })

  assert.equal(created.result?.kind, 'event_created')
  assert.equal(createdTier.saleStatus, 'sold_out')
  assert.equal(upserted.result?.kind, 'ticket_tier_saved')
  assert.equal(
    upserted.state.ticketTiers.find((tier) => tier.id === zeroCapacityTier.id)!.saleStatus,
    'sold_out',
  )
  assert.equal(saleAttempt.result?.kind, 'inventory_rejected')
  assert.equal(saleAttempt.state, upserted.state)
  assert.equal(
    saleAttempt.state.ticketTiers.find((tier) => tier.id === zeroCapacityTier.id)!.saleStatus,
    'sold_out',
  )
  assert.equal(getCanonicalOrganizerTicketSaleStatus(zeroCapacityTier), 'sold_out')
  assert.equal(
    getOrganizerTicketSaleStatusTransition(
      zeroCapacityTier,
      sellingEvent.status,
      'on_sale',
      currentAt,
    ).allowed,
    false,
  )
})

test('uses the supplied timestamp to enforce a half-open ticket sale window', () => {
  const workspace = createOrganizerWorkspace()
  const sellingTier = workspace.ticketTiers.find((tier) => tier.saleStatus === 'on_sale')!
  const soldOutTier = workspace.ticketTiers.find((tier) => tier.saleStatus === 'sold_out')!
  const draftTier = workspace.ticketTiers.find((tier) => tier.eventId === 'org-event-draft')!
  const endedTier = workspace.ticketTiers.find((tier) => tier.saleStatus === 'ended')!
  const sellingEvent = workspace.events.find((event) => event.id === sellingTier.eventId)!
  const draftEvent = workspace.events.find((event) => event.id === draftTier.eventId)!
  const endedEvent = workspace.events.find((event) => event.id === endedTier.eventId)!

  assert.equal(
    getOrganizerTicketSaleStatusTransition(sellingTier, sellingEvent.status, 'on_sale', currentAt)
      .allowed,
    true,
  )
  assert.equal(
    getOrganizerTicketSaleStatusTransition(sellingTier, sellingEvent.status, 'sold_out', currentAt)
      .allowed,
    false,
  )
  assert.equal(
    getOrganizerTicketSaleStatusTransition(soldOutTier, sellingEvent.status, 'on_sale', currentAt)
      .allowed,
    false,
  )
  assert.equal(
    getOrganizerTicketSaleStatusTransition(draftTier, draftEvent.status, 'on_sale', currentAt)
      .allowed,
    false,
  )
  assert.equal(
    getOrganizerTicketSaleStatusTransition(draftTier, draftEvent.status, 'sold_out', currentAt)
      .allowed,
    false,
  )
  assert.equal(
    getOrganizerTicketSaleStatusTransition(endedTier, endedEvent.status, 'scheduled', currentAt)
      .allowed,
    false,
  )
  assert.equal(
    getOrganizerTicketSaleStatusTransition(
      sellingTier,
      sellingEvent.status,
      'on_sale',
      '2026-09-15T01:00:00.000Z',
    ).allowed,
    false,
  )
  assert.equal(
    getOrganizerTicketSaleStatusTransition(
      sellingTier,
      sellingEvent.status,
      'on_sale',
      sellingTier.salesEndAt,
    ).allowed,
    false,
  )
  assert.equal(
    getOrganizerTicketSaleStatusTransition(
      sellingTier,
      sellingEvent.status,
      'on_sale',
      '2026-10-25T00:00:00.000Z',
    ).allowed,
    false,
  )

  const savedTier = organizerWorkspaceReducer(workspace, {
    type: 'upsert_ticket_tier',
    tier: { ...sellingTier, perOrderLimit: sellingTier.perOrderLimit + 1 },
    currentAt: '2026-10-25T00:00:00.000Z',
  })
  assert.equal(savedTier.result?.kind, 'ticket_tier_saved')

  const invalidTierSale = organizerWorkspaceReducer(workspace, {
    type: 'upsert_ticket_tier',
    tier: { ...draftTier, saleStatus: 'on_sale' },
    currentAt,
  })
  assert.equal(invalidTierSale.result?.kind, 'inventory_rejected')
  assert.equal(invalidTierSale.state, workspace)

  const paused = organizerWorkspaceReducer(workspace, {
    type: 'set_ticket_sale_status',
    tierId: sellingTier.id,
    status: 'paused',
    currentAt,
  })
  assert.equal(paused.result?.kind, 'ticket_tier_saved')
  assert.equal(paused.state.ticketTiers.find((tier) => tier.id === sellingTier.id)!.saleStatus, 'paused')

  const invalidSoldOut = organizerWorkspaceReducer(workspace, {
    type: 'set_ticket_sale_status',
    tierId: sellingTier.id,
    status: 'sold_out',
    currentAt,
  })
  assert.equal(invalidSoldOut.result?.kind, 'inventory_rejected')
  assert.equal(invalidSoldOut.state, workspace)
})
