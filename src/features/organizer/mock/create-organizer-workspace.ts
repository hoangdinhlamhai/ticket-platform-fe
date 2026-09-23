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
    eventFinance: {},  }
}

// Neutral, non-persisted organization shell. The backend exposes no organization
// profile API yet, so this must NOT reuse the "Sự kiện Sao Việt" demo fixture —
// showing that name would imply a saved account that does not exist. Blank fields
// signal "chưa có" state; nothing here is ever sent to or claimed as saved on the server.
const BLANK_ORGANIZATION: OrganizerWorkspace['organization'] = {
  id: 'organizer-workspace',
  name: '',
  publicEmail: '',
  publicPhone: '',
  address: '',
  payoutAccountLabel: '',
  businessIdentifier: '',
  defaultRefundPolicy: '',
}

// Server-backed workspace: no seeded events or business collections, and a blank
// organization shell — never the demo fixture.
export function createEmptyOrganizerWorkspace(): OrganizerWorkspace {
  return {
    organization: { ...BLANK_ORGANIZATION },
    events: [],
    ticketTiers: [],
    orders: [],
    attendees: [],
    refunds: [],
    payouts: [],
    checkInActivities: [],
    eventFinance: {},
  }
}
