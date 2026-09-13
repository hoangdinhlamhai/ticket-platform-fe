import { ORGANIZER_CHECK_IN_ACTIVITY_FIXTURES, ORGANIZER_ATTENDEE_FIXTURES, ORGANIZER_ORDER_FIXTURES, ORGANIZER_TICKET_TIER_FIXTURES } from './organizer-commerce-data.ts'
import { ORGANIZER_EVENT_FIXTURES } from './organizer-event-data.ts'
import { ORGANIZER_PAYOUT_FIXTURES, ORGANIZER_REFUND_FIXTURES } from './organizer-finance-data.ts'
import { ORGANIZER_ORGANIZATION_FIXTURE } from './organizer-organization-data.ts'
import type { OrganizerWorkspace } from '../types/organizer-workspace.ts'

export function createOrganizerWorkspace(): OrganizerWorkspace {
  return {
    organization: { ...ORGANIZER_ORGANIZATION_FIXTURE },
    events: ORGANIZER_EVENT_FIXTURES.map((event) => ({ ...event })),
    ticketTiers: ORGANIZER_TICKET_TIER_FIXTURES.map((tier) => ({ ...tier })),
    orders: ORGANIZER_ORDER_FIXTURES.map((order) => ({ ...order, items: order.items.map((item) => ({ ...item })), ticketTierIds: [...order.ticketTierIds] })),
    attendees: ORGANIZER_ATTENDEE_FIXTURES.map((attendee) => ({ ...attendee })),
    refunds: ORGANIZER_REFUND_FIXTURES.map((refund) => ({ ...refund })),
    payouts: ORGANIZER_PAYOUT_FIXTURES.map((payout) => ({ ...payout })),
    checkInActivities: ORGANIZER_CHECK_IN_ACTIVITY_FIXTURES.map((activity) => ({ ...activity })),
  }
}
