import assert from 'node:assert/strict'
import test from 'node:test'
import { createOrganizerWorkspace } from '../mock/create-organizer-workspace.ts'
import { selectOrganizerEventMetrics, selectOrganizerEventRevenueById, selectOrganizerFinanceSummary, selectOrganizerWorkspaceMetrics } from './select-organizer-metrics.ts'

const emptyWorkspace = {
  organization: { id: 'org-empty', name: 'Đơn vị trống', publicEmail: 'hello@example.com', publicPhone: '0900000000', address: 'TP. Hồ Chí Minh', payoutAccountLabel: '•••• 0000', defaultRefundPolicy: 'Không hoàn tiền' },
  events: [], ticketTiers: [], orders: [], attendees: [], refunds: [], payouts: [], checkInActivities: [],
}

test('derives workspace revenue, inventory, order and check-in metrics from canonical entities', () => {
  const workspace = createOrganizerWorkspace()
  const metrics = selectOrganizerWorkspaceMetrics(workspace)
  const expectedGross = workspace.orders.filter((order) => order.paymentStatus === 'paid').reduce((total, order) => total + order.total, 0)
  const expectedSold = workspace.ticketTiers.reduce((total, tier) => total + tier.soldCount, 0)
  const expectedCapacity = workspace.ticketTiers.reduce((total, tier) => total + tier.capacity, 0)
  const expectedCheckedIn = workspace.attendees.filter((attendee) => attendee.checkedInAt !== null).length

  assert.equal(metrics.grossRevenue, expectedGross)
  assert.equal(metrics.soldCount, expectedSold)
  assert.equal(metrics.remainingCount, expectedCapacity - expectedSold)
  assert.equal(metrics.orderCount, workspace.orders.length)
  assert.equal(metrics.checkedInCount, expectedCheckedIn)
  assert.equal(metrics.soldRate, expectedSold / expectedCapacity)
  assert.equal(metrics.checkInRate, expectedCheckedIn / workspace.attendees.length)
})

test('scopes event metrics to the selected event and reports ticket tier inventory', () => {
  const workspace = createOrganizerWorkspace()
  const event = workspace.events[0]
  const metrics = selectOrganizerEventMetrics(workspace, event.id)
  const tiers = workspace.ticketTiers.filter((tier) => tier.eventId === event.id)

  assert.equal(metrics.eventId, event.id)
  assert.equal(metrics.capacity, tiers.reduce((total, tier) => total + tier.capacity, 0))
  assert.equal(metrics.soldCount, tiers.reduce((total, tier) => total + tier.soldCount, 0))
  assert.equal(metrics.remainingCount, metrics.capacity - metrics.soldCount)
  assert.equal(metrics.orderCount, workspace.orders.filter((order) => order.eventId === event.id).length)
  assert.deepEqual(metrics.ticketTiers.map((tier) => tier.id), tiers.map((tier) => tier.id))
})

test('derives an event revenue map from the canonical paid-order calculation', () => {
  const workspace = createOrganizerWorkspace()
  const revenueByEventId = selectOrganizerEventRevenueById(workspace)

  for (const event of workspace.events) {
    assert.equal(
      revenueByEventId[event.id] ?? 0,
      selectOrganizerEventMetrics(workspace, event.id).grossRevenue,
    )
  }
})

test('derives finance totals from paid orders, refunds and payout statuses', () => {
  const workspace = createOrganizerWorkspace()
  const summary = selectOrganizerFinanceSummary(workspace)
  const gross = workspace.orders.filter((order) => order.paymentStatus === 'paid').reduce((total, order) => total + order.total, 0)
  const refunds = workspace.refunds.reduce((total, refund) => total + refund.amount, 0)

  assert.equal(summary.grossRevenue, gross)
  assert.equal(summary.refundTotal, refunds)
  assert.equal(summary.netRevenue, gross - refunds)
  assert.deepEqual(summary.payoutsByStatus, {
    paid: workspace.payouts.filter((payout) => payout.status === 'paid').reduce((total, payout) => total + payout.amount, 0),
    pending: workspace.payouts.filter((payout) => payout.status === 'pending').reduce((total, payout) => total + payout.amount, 0),
    scheduled: workspace.payouts.filter((payout) => payout.status === 'scheduled').reduce((total, payout) => total + payout.amount, 0),
  })
})

test('returns zero-safe ratios and totals for a workspace with no data', () => {
  const metrics = selectOrganizerWorkspaceMetrics(emptyWorkspace)
  const eventMetrics = selectOrganizerEventMetrics(emptyWorkspace, 'missing')
  const blankEventMetrics = selectOrganizerEventMetrics(createOrganizerWorkspace(), '')
  const finance = selectOrganizerFinanceSummary(emptyWorkspace)

  assert.deepEqual(metrics, { grossRevenue: 0, capacity: 0, soldCount: 0, remainingCount: 0, soldRate: 0, orderCount: 0, checkedInCount: 0, checkInRate: 0 })
  assert.deepEqual(eventMetrics, { eventId: 'missing', grossRevenue: 0, capacity: 0, soldCount: 0, remainingCount: 0, soldRate: 0, orderCount: 0, checkedInCount: 0, checkInRate: 0, ticketTiers: [] })
  assert.deepEqual(blankEventMetrics, { eventId: '', grossRevenue: 0, capacity: 0, soldCount: 0, remainingCount: 0, soldRate: 0, orderCount: 0, checkedInCount: 0, checkInRate: 0, ticketTiers: [] })
  assert.deepEqual(finance, { grossRevenue: 0, refundTotal: 0, netRevenue: 0, payoutsByStatus: { scheduled: 0, pending: 0, paid: 0 } })
})
