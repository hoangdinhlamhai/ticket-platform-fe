import type {
  OrganizerAttendee,
  OrganizerCheckInActivity,
  OrganizerOrder,
  OrganizerPayout,
  OrganizerRefund,
  OrganizerTicketTier,
} from './organizer-commerce.ts'
import type { OrganizerEvent, OrganizerEventInput, OrganizerEventPatch } from './organizer-event.ts'
import type { OrganizerOrganization, OrganizerOrganizationPatch } from './organizer-organization.ts'

export type OrganizerWorkspace = {
  readonly organization: OrganizerOrganization
  readonly events: readonly OrganizerEvent[]
  readonly ticketTiers: readonly OrganizerTicketTier[]
  readonly orders: readonly OrganizerOrder[]
  readonly attendees: readonly OrganizerAttendee[]
  readonly refunds: readonly OrganizerRefund[]
  readonly payouts: readonly OrganizerPayout[]
  readonly checkInActivities: readonly OrganizerCheckInActivity[]
  readonly eventFinance: OrganizerWorkspaceFinance
}

export type OrganizerCheckInOutcome =
  | 'success'
  | 'already_checked_in'
  | 'revoked'
  | 'wrong_event'
  | 'not_found'

type OrganizerTargetIds = Readonly<Record<string, string>>
export type OrganizerOperationName = Exclude<OrganizerWorkspaceAction['type'], 'clear_last_operation'>
type OrganizerOperationBase = {
  readonly operation: OrganizerOperationName
  readonly targetIds: OrganizerTargetIds
}

export type OrganizerOperationPayload =
  | {
      readonly kind:
        | 'event_created'
        | 'event_updated'
        | 'event_review_submitted'
        | 'event_published'
        | 'ticket_tier_saved'
        | 'organization_updated'
    }
  | {
      readonly kind:
        | 'event_transition_rejected'
        | 'inventory_rejected'
        | 'action_not_supported'
      readonly reason?: string
    }
  | { readonly kind: 'check_in'; readonly outcome: OrganizerCheckInOutcome }

export type OrganizerOperationResult = OrganizerOperationPayload & OrganizerOperationBase

import type { OrganizerEventFinance } from './organizer-event.ts'
import type { OrganizerTicketTierDraft } from '../helpers/validate-organizer-ticket-tier.ts'

export type OrganizerInitialTicketTierInput = OrganizerTicketTierDraft

export type OrganizerWorkspaceFinance = Readonly<Record<string, OrganizerEventFinance>>

export type OrganizerWorkspaceAction =
  | {
      readonly type: 'create_event'
      readonly input: OrganizerEventInput
      readonly initialTicketTier?: OrganizerInitialTicketTierInput
      readonly initialTicketTiers?: readonly OrganizerInitialTicketTierInput[]
      readonly finance?: OrganizerEventFinance
    }
  | {
      readonly type: 'update_event'
      readonly eventId: string
      readonly patch: OrganizerEventPatch
      readonly finance?: OrganizerEventFinance
    }
  | { readonly type: 'submit_event_review'; readonly eventId: string }
  | { readonly type: 'publish_event'; readonly eventId: string }
  | { readonly type: 'upsert_ticket_tier'; readonly tier: OrganizerTicketTier; readonly currentAt: string }
  | {
      readonly type: 'set_ticket_sale_status'
      readonly tierId: string
      readonly status: OrganizerTicketTier['saleStatus']
      readonly currentAt: string
    }
  | {
      readonly type: 'check_in_attendee'
      readonly eventId: string
      readonly attendeeId: string
      readonly checkedInAt: string
    }
  | { readonly type: 'update_organization'; readonly patch: OrganizerOrganizationPatch }
  | { readonly type: 'approve_event' | 'reject_event'; readonly eventId: string }
  | { readonly type: 'clear_last_operation' }

export type OrganizerWorkspaceTransition = {
  readonly state: OrganizerWorkspace
  readonly result: OrganizerOperationResult | null
}
