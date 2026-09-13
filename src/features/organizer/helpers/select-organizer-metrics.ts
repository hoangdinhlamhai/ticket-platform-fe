import type {
  OrganizerAttendee,
  OrganizerOrder,
  OrganizerPayoutStatus,
  OrganizerTicketTier,
} from '../types/organizer-commerce.ts'
import type { OrganizerWorkspace } from '../types/organizer-workspace.ts'

export type OrganizerMetricSummary = {
  readonly grossRevenue: number
  readonly capacity: number
  readonly soldCount: number
  readonly remainingCount: number
  readonly soldRate: number
  readonly orderCount: number
  readonly checkedInCount: number
  readonly checkInRate: number
}

export type OrganizerTicketTierMetric = OrganizerTicketTier & {
  readonly remainingCount: number
  readonly soldRate: number
}

export type OrganizerEventMetricSummary = OrganizerMetricSummary & {
  readonly eventId: string
  readonly ticketTiers: readonly OrganizerTicketTierMetric[]
}

export type OrganizerAnalyticsBar = {
  readonly label: string
  readonly value: number
  readonly detail: string
}

export type OrganizerAnalytics = {
  readonly grossRevenue: number
  readonly paidOrderCount: number
  readonly soldCount: number
  readonly capacity: number
  readonly soldRate: number
  readonly checkedInCount: number
  readonly attendeeCount: number
  readonly checkInRate: number
  readonly ticketTiers: readonly OrganizerAnalyticsBar[]
  readonly salesByDay: readonly OrganizerAnalyticsBar[]
}

export type OrganizerFinanceSummary = {
  readonly grossRevenue: number
  readonly refundTotal: number
  readonly netRevenue: number
  readonly payoutsByStatus: Readonly<Record<OrganizerPayoutStatus, number>>
}

type OrganizerReportingScope = {
  readonly ticketTiers: readonly OrganizerTicketTier[]
  readonly orders: readonly OrganizerOrder[]
  readonly attendees: readonly OrganizerAttendee[]
}

type OrganizerScopedMetrics = OrganizerMetricSummary & {
  readonly paidOrderCount: number
  readonly attendeeCount: number
  readonly ticketTiers: readonly OrganizerTicketTier[]
  readonly salesByDay: readonly OrganizerAnalyticsBar[]
}

function ratio(numerator: number, denominator: number) {
  return denominator <= 0 ? 0 : numerator / denominator
}

function scopeWorkspace(workspace: OrganizerWorkspace, eventId?: string): OrganizerReportingScope {
  const includesEvent = <Item extends { readonly eventId: string }>(item: Item) => eventId === undefined || item.eventId === eventId

  return {
    ticketTiers: workspace.ticketTiers.filter(includesEvent),
    orders: workspace.orders.filter(includesEvent),
    attendees: workspace.attendees.filter(includesEvent),
  }
}

function summarizePaidOrders(orders: readonly OrganizerOrder[]) {
  const revenueByEventId: Record<string, number> = {}
  const salesByDay = new Map<string, number>()
  let grossRevenue = 0
  let paidOrderCount = 0

  for (const order of orders) {
    if (order.paymentStatus !== 'paid') continue
    grossRevenue += order.total
    paidOrderCount += 1
    revenueByEventId[order.eventId] = (revenueByEventId[order.eventId] ?? 0) + order.total
    const day = (order.paidAt ?? order.createdAt).slice(0, 10)
    salesByDay.set(day, (salesByDay.get(day) ?? 0) + order.total)
  }

  return {
    grossRevenue,
    paidOrderCount,
    revenueByEventId,
    salesByDay: [...salesByDay.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([label, value]) => ({ label, value, detail: `${value.toLocaleString('vi-VN')}đ` })),
  }
}

function summarizeScope(scope: OrganizerReportingScope): OrganizerScopedMetrics {
  const capacity = scope.ticketTiers.reduce((total, tier) => total + tier.capacity, 0)
  const soldCount = scope.ticketTiers.reduce((total, tier) => total + tier.soldCount, 0)
  const checkedInCount = scope.attendees.filter((attendee) => attendee.checkedInAt !== null).length
  const paid = summarizePaidOrders(scope.orders)

  return {
    ...paid,
    capacity,
    soldCount,
    remainingCount: capacity - soldCount,
    soldRate: ratio(soldCount, capacity),
    orderCount: scope.orders.length,
    checkedInCount,
    attendeeCount: scope.attendees.length,
    checkInRate: ratio(checkedInCount, scope.attendees.length),
    ticketTiers: scope.ticketTiers,
  }
}

export function selectOrganizerWorkspaceMetrics(workspace: OrganizerWorkspace): OrganizerMetricSummary {
  const metrics = summarizeScope(scopeWorkspace(workspace))
  return {
    grossRevenue: metrics.grossRevenue,
    capacity: metrics.capacity,
    soldCount: metrics.soldCount,
    remainingCount: metrics.remainingCount,
    soldRate: metrics.soldRate,
    orderCount: metrics.orderCount,
    checkedInCount: metrics.checkedInCount,
    checkInRate: metrics.checkInRate,
  }
}

export function selectOrganizerEventMetrics(workspace: OrganizerWorkspace, eventId: string): OrganizerEventMetricSummary {
  const metrics = summarizeScope(scopeWorkspace(workspace, eventId))
  return {
    eventId,
    grossRevenue: metrics.grossRevenue,
    capacity: metrics.capacity,
    soldCount: metrics.soldCount,
    remainingCount: metrics.remainingCount,
    soldRate: metrics.soldRate,
    orderCount: metrics.orderCount,
    checkedInCount: metrics.checkedInCount,
    checkInRate: metrics.checkInRate,
    ticketTiers: metrics.ticketTiers.map((tier) => ({
      ...tier,
      remainingCount: tier.capacity - tier.soldCount,
      soldRate: ratio(tier.soldCount, tier.capacity),
    })),
  }
}

export function selectOrganizerEventAnalytics(workspace: OrganizerWorkspace, eventId: string): OrganizerAnalytics {
  const metrics = summarizeScope(scopeWorkspace(workspace, eventId))

  return {
    grossRevenue: metrics.grossRevenue,
    paidOrderCount: metrics.paidOrderCount,
    soldCount: metrics.soldCount,
    capacity: metrics.capacity,
    soldRate: metrics.soldRate,
    checkedInCount: metrics.checkedInCount,
    attendeeCount: metrics.attendeeCount,
    checkInRate: metrics.checkInRate,
    ticketTiers: metrics.ticketTiers.map((tier) => ({
      label: tier.name,
      value: tier.soldCount,
      detail: `${tier.soldCount}/${tier.capacity} vé`,
    })),
    salesByDay: metrics.salesByDay,
  }
}

export function selectOrganizerEventRevenueById(
  workspace: OrganizerWorkspace,
): Readonly<Record<string, number>> {
  return summarizePaidOrders(workspace.orders).revenueByEventId
}

export function selectOrganizerFinanceSummary(workspace: OrganizerWorkspace): OrganizerFinanceSummary {
  const { grossRevenue } = summarizePaidOrders(workspace.orders)
  const refundTotal = workspace.refunds.reduce((total, refund) => total + refund.amount, 0)
  const payoutsByStatus: Record<OrganizerPayoutStatus, number> = { scheduled: 0, pending: 0, paid: 0 }

  for (const payout of workspace.payouts) payoutsByStatus[payout.status] += payout.amount

  return { grossRevenue, refundTotal, netRevenue: grossRevenue - refundTotal, payoutsByStatus }
}
