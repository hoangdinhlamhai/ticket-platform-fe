import type { OrganizerTicketTier } from '../types/organizer-commerce.ts'
import type { OrganizerEventFinance, OrganizerEventInput, OrganizerEventPatch } from '../types/organizer-event.ts'
import type { OrganizerOrganizationPatch } from '../types/organizer-organization.ts'
import type {
  OrganizerInitialTicketTierInput,
  OrganizerOperationResult,
  OrganizerWorkspace,
} from '../types/organizer-workspace.ts'

export type OrganizerWorkspaceController = {
  readonly workspace: OrganizerWorkspace
  readonly lastOperation: OrganizerOperationResult | null
  readonly createEvent: (input: OrganizerEventInput, initialTicketTiers: readonly OrganizerInitialTicketTierInput[], finance?: OrganizerEventFinance) => OrganizerOperationResult | null | Promise<OrganizerOperationResult | null>
  readonly updateEvent: (eventId: string, patch: OrganizerEventPatch, finance?: OrganizerEventFinance) => OrganizerOperationResult | null | Promise<OrganizerOperationResult | null>
  readonly submitEventReview: (eventId: string) => OrganizerOperationResult | null | Promise<OrganizerOperationResult | null>
  readonly publishEvent: (eventId: string) => OrganizerOperationResult | null
  readonly saveTicketTier: (tier: OrganizerTicketTier) => OrganizerOperationResult | null | Promise<OrganizerOperationResult | null>
  readonly updateEventImage: (eventId: string, field: 'seatingChartImage', value: string) => Promise<OrganizerOperationResult | null>
  readonly setTicketSaleStatus: (tierId: string, status: OrganizerTicketTier['saleStatus']) => OrganizerOperationResult | null
  readonly checkInAttendee: (eventId: string, attendeeId: string) => OrganizerOperationResult | null
  readonly updateOrganization: (patch: OrganizerOrganizationPatch) => OrganizerOperationResult | null
  readonly clearLastOperation: () => OrganizerOperationResult | null
}
