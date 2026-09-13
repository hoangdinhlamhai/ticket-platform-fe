import assert from 'node:assert/strict'
import test from 'node:test'
import { createOrganizerWorkspace } from '../mock/create-organizer-workspace.ts'
import {
  selectOrganizerEventAnalytics,
  selectOrganizerEventMetrics,
  selectOrganizerFinanceSummary,
  selectOrganizerWorkspaceMetrics,
} from './select-organizer-metrics.ts'

const empty = {
  organization: { id: 'org', name: '', publicEmail: '', publicPhone: '', address: '', payoutAccountLabel: '', defaultRefundPolicy: '' },
  events: [], ticketTiers: [], orders: [], attendees: [], refunds: [], payouts: [], checkInActivities: [],
}

test('isolates event reporting and excludes pending or refunded orders', () => {
  const workspace = createOrganizerWorkspace()
  const ongoing = selectOrganizerEventAnalytics(workspace, 'org-event-ongoing')
  const ended = selectOrganizerEventAnalytics(workspace, 'org-event-ended')

  assert.equal(ongoing.grossRevenue, 850000)
  assert.equal(ongoing.paidOrderCount, 1)
  assert.equal(ended.grossRevenue, 450000)
  assert.equal(ended.paidOrderCount, 1)
  assert.deepEqual(ended.salesByDay, [{ label: '2026-08-02', value: 450000, detail: '450.000đ' }])
})

test('aggregates same-day sales and returns sorted multi-day buckets', () => {
  const workspace = createOrganizerWorkspace()
  const first = workspace.orders.find((order) => order.id === 'order-published-01')!
  const second = workspace.orders.find((order) => order.id === 'order-published-02')!
  const orders = [
    { ...first, paidAt: '2026-09-22T09:00:00+07:00', total: 100000 },
    { ...second, paidAt: '2026-09-20T09:00:00+07:00', total: 200000 },
    { ...second, id: 'same-day', paidAt: '2026-09-22T18:00:00+07:00', total: 300000 },
  ]
  const analytics = selectOrganizerEventAnalytics({ ...workspace, orders }, 'org-event-published')

  assert.equal(analytics.grossRevenue, 600000)
  assert.deepEqual(analytics.salesByDay, [
    { label: '2026-09-20', value: 200000, detail: '200.000đ' },
    { label: '2026-09-22', value: 400000, detail: '400.000đ' },
  ])
})

test('shares paid-order and finance arithmetic with dashboard and analytics selectors', () => {
  const workspace = createOrganizerWorkspace()
  const dashboard = selectOrganizerWorkspaceMetrics(workspace)
  const finance = selectOrganizerFinanceSummary(workspace)
  const published = selectOrganizerEventAnalytics(workspace, 'org-event-published')
  const eventMetrics = selectOrganizerEventMetrics(workspace, 'org-event-published')

  assert.equal(dashboard.grossRevenue, finance.grossRevenue)
  assert.equal(published.grossRevenue, eventMetrics.grossRevenue)
  assert.equal(finance.refundTotal, 150000)
  assert.equal(finance.netRevenue, finance.grossRevenue - finance.refundTotal)
  assert.deepEqual(finance.payoutsByStatus, { scheduled: 900000, pending: 500000, paid: 300000 })
})

test('keeps reporting values zero-safe without data', () => {
  assert.deepEqual(selectOrganizerEventAnalytics(empty, 'none'), {
    grossRevenue: 0, paidOrderCount: 0, soldCount: 0, capacity: 0, soldRate: 0,
    checkedInCount: 0, attendeeCount: 0, checkInRate: 0, ticketTiers: [], salesByDay: [],
  })
  assert.deepEqual(selectOrganizerFinanceSummary(empty), {
    grossRevenue: 0, refundTotal: 0, netRevenue: 0, payoutsByStatus: { scheduled: 0, pending: 0, paid: 0 },
  })
})
