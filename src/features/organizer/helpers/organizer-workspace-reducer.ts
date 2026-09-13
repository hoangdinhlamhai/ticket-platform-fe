import { prepareOrganizerOrganizationSave, valuesFromOrganizerOrganization } from './validate-organizer-organization.ts'
import { getOrganizerCheckInOutcome } from './organizer-check-in-transitions.ts'
import { canPublishOrganizerEvent, canSubmitOrganizerEventForReview } from './organizer-event-transitions.ts'
import { getCanonicalOrganizerTicketSaleStatus, getOrganizerTicketSaleStatusTransition, hasValidOrganizerTicketInventory } from './organizer-inventory-transitions.ts'
import type { OrganizerOperationPayload, OrganizerOperationResult, OrganizerWorkspace, OrganizerWorkspaceAction, OrganizerWorkspaceTransition } from '../types/organizer-workspace.ts'

type OrganizerOperationName = Exclude<OrganizerWorkspaceAction['type'], 'clear_last_operation'>
type OrganizerTargetIds = Readonly<Record<string, string>>
type OrganizerRejectionKind = 'event_transition_rejected' | 'inventory_rejected' | 'action_not_supported'

function unchanged(state: OrganizerWorkspace, result: OrganizerOperationResult): OrganizerWorkspaceTransition {
  return { state, result }
}

function operationResult(operation: OrganizerOperationName, targetIds: OrganizerTargetIds, payload: OrganizerOperationPayload): OrganizerOperationResult {
  return { ...payload, operation, targetIds }
}

function rejected(state: OrganizerWorkspace, operation: OrganizerOperationName, targetIds: OrganizerTargetIds, kind: OrganizerRejectionKind, reason: string): OrganizerWorkspaceTransition {
  return unchanged(state, operationResult(operation, targetIds, { kind, reason }))
}

function hasValidEventSchedule(startsAt: string, endsAt: string) {
  const start = Date.parse(startsAt)
  const end = Date.parse(endsAt)
  return Number.isFinite(start) && Number.isFinite(end) && start < end
}

function nextEventId(state: OrganizerWorkspace) {
  return `org-event-session-${state.events.length + 1}`
}

function createInitialTicketTier(
  eventId: string,
  input: { readonly name: string; readonly price: number; readonly capacity: number },
  startsAt: string,
  endsAt: string,
) {
  return {
    id: `${eventId}-tier-1`,
    eventId,
    name: input.name.trim(),
    price: input.price,
    capacity: input.capacity,
    soldCount: 0,
    saleStatus: 'scheduled' as const,
    salesStartAt: startsAt,
    salesEndAt: endsAt,
    perOrderLimit: 4,
  }
}

export function organizerWorkspaceReducer(state: OrganizerWorkspace, action: OrganizerWorkspaceAction): OrganizerWorkspaceTransition {
  switch (action.type) {
    case 'create_event': {
      const { input, initialTicketTier } = action
      const id = nextEventId(state)
      const initialTier = createInitialTicketTier(id, initialTicketTier, input.startsAt, input.endsAt)
      const tier = {
        ...initialTier,
        saleStatus: getCanonicalOrganizerTicketSaleStatus(initialTier),
      }
      const targetIds = { eventId: id, ticketTierId: tier.id }
      if (!input.title.trim() || !input.venue.trim() || !input.city.trim() || !hasValidEventSchedule(input.startsAt, input.endsAt)) {
        return rejected(state, 'create_event', targetIds, 'event_transition_rejected', 'Thông tin sự kiện chưa hợp lệ.')
      }
      if (!hasValidOrganizerTicketInventory(tier)) {
        return rejected(state, 'create_event', targetIds, 'inventory_rejected', 'Hạng vé khởi tạo có dữ liệu tồn không hợp lệ.')
      }
      const event = { id, title: input.title.trim(), startsAt: input.startsAt, endsAt: input.endsAt, venue: input.venue.trim(), city: input.city.trim(), status: 'draft' as const, reviewFeedback: null }
      return { state: { ...state, events: [...state.events, event], ticketTiers: [...state.ticketTiers, tier] }, result: operationResult('create_event', { eventId: id, ticketTierId: tier.id }, { kind: 'event_created' }) }
    }
    case 'update_event': {
      const current = state.events.find((event) => event.id === action.eventId)
      if (!current || !['draft', 'changes_requested'].includes(current.status)) {
        return rejected(state, 'update_event', { eventId: action.eventId }, 'event_transition_rejected', 'Sự kiện không thể chỉnh sửa ở trạng thái hiện tại.')
      }
      const event = { ...current, title: action.patch.title?.trim() ?? current.title, startsAt: action.patch.startsAt ?? current.startsAt, endsAt: action.patch.endsAt ?? current.endsAt, venue: action.patch.venue?.trim() ?? current.venue, city: action.patch.city?.trim() ?? current.city }
      if (!event.title || !event.venue || !event.city || !hasValidEventSchedule(event.startsAt, event.endsAt)) {
        return rejected(state, 'update_event', { eventId: action.eventId }, 'event_transition_rejected', 'Thông tin sự kiện chưa hợp lệ.')
      }
      return { state: { ...state, events: state.events.map((item) => item.id === event.id ? event : item) }, result: operationResult('update_event', { eventId: event.id }, { kind: 'event_updated' }) }
    }
    case 'submit_event_review': {
      const current = state.events.find((event) => event.id === action.eventId)
      if (!current || !canSubmitOrganizerEventForReview(current.status)) {
        return rejected(state, 'submit_event_review', { eventId: action.eventId }, 'event_transition_rejected', 'Sự kiện chưa thể gửi duyệt.')
      }
      const event = { ...current, status: 'pending_review' as const }
      return { state: { ...state, events: state.events.map((item) => item.id === event.id ? event : item) }, result: operationResult('submit_event_review', { eventId: event.id }, { kind: 'event_review_submitted' }) }
    }
    case 'publish_event': {
      const current = state.events.find((event) => event.id === action.eventId)
      if (!current || !canPublishOrganizerEvent(current.status)) {
        return rejected(state, 'publish_event', { eventId: action.eventId }, 'event_transition_rejected', 'Chỉ sự kiện đã được duyệt mới có thể xuất bản.')
      }
      const event = { ...current, status: 'published' as const }
      return { state: { ...state, events: state.events.map((item) => item.id === event.id ? event : item) }, result: operationResult('publish_event', { eventId: event.id }, { kind: 'event_published' }) }
    }
    case 'upsert_ticket_tier': {
      const existing = state.ticketTiers.find((tier) => tier.id === action.tier.id)
      const targetIds = { eventId: existing?.eventId ?? action.tier.eventId, ticketTierId: action.tier.id }
      const event = state.events.find((item) => item.id === action.tier.eventId)
      if ((existing && existing.eventId !== action.tier.eventId) || (existing && existing.soldCount !== action.tier.soldCount) || !event || !hasValidOrganizerTicketInventory(action.tier)) {
        return rejected(state, 'upsert_ticket_tier', targetIds, 'inventory_rejected', 'Hạng vé có dữ liệu tồn không hợp lệ.')
      }
      const tierForTransition = existing
        ? { ...action.tier, saleStatus: existing.saleStatus }
        : action.tier
      const canonicalTier = {
        ...action.tier,
        saleStatus: getCanonicalOrganizerTicketSaleStatus(action.tier),
      }
      const transition = existing?.saleStatus === canonicalTier.saleStatus
        ? { allowed: true }
        : getOrganizerTicketSaleStatusTransition(
            tierForTransition,
            event.status,
            canonicalTier.saleStatus,
            action.currentAt,
          )
      if (!transition.allowed) return rejected(state, 'upsert_ticket_tier', targetIds, 'inventory_rejected', transition.reason ?? 'Không thể chuyển trạng thái bán vé.')
      const ticketTiers = existing ? state.ticketTiers.map((tier) => tier.id === canonicalTier.id ? canonicalTier : tier) : [...state.ticketTiers, canonicalTier]
      return { state: { ...state, ticketTiers }, result: operationResult('upsert_ticket_tier', targetIds, { kind: 'ticket_tier_saved' }) }
    }
    case 'set_ticket_sale_status': {
      const tier = state.ticketTiers.find((item) => item.id === action.tierId)
      if (!tier) return rejected(state, 'set_ticket_sale_status', { ticketTierId: action.tierId }, 'inventory_rejected', 'Không tìm thấy hạng vé.')
      const targetIds = { eventId: tier.eventId, ticketTierId: tier.id }
      const event = state.events.find((item) => item.id === tier.eventId)
      if (!event) return rejected(state, 'set_ticket_sale_status', targetIds, 'inventory_rejected', 'Không tìm thấy sự kiện của hạng vé.')
      if (action.status === 'on_sale') {
        const requestedTransition = getOrganizerTicketSaleStatusTransition(
          tier,
          event.status,
          action.status,
          action.currentAt,
        )
        if (!requestedTransition.allowed) {
          return rejected(state, 'set_ticket_sale_status', targetIds, 'inventory_rejected', requestedTransition.reason ?? 'Không thể chuyển trạng thái bán vé.')
        }
      }
      const canonicalStatus = getCanonicalOrganizerTicketSaleStatus({
        ...tier,
        saleStatus: action.status,
      })
      const transition = tier.saleStatus === canonicalStatus
        ? { allowed: true }
        : getOrganizerTicketSaleStatusTransition(
            tier,
            event.status,
            canonicalStatus,
            action.currentAt,
          )
      if (!transition.allowed) return rejected(state, 'set_ticket_sale_status', targetIds, 'inventory_rejected', transition.reason ?? 'Không thể chuyển trạng thái bán vé.')
      const ticketTiers = state.ticketTiers.map((item) => item.id === tier.id ? { ...item, saleStatus: canonicalStatus } : item)
      return { state: { ...state, ticketTiers }, result: operationResult('set_ticket_sale_status', targetIds, { kind: 'ticket_tier_saved' }) }
    }
    case 'check_in_attendee': {
      const attendee = state.attendees.find((item) => item.id === action.attendeeId)
      const targetIds = { eventId: action.eventId, attendeeId: action.attendeeId }
      const outcome = getOrganizerCheckInOutcome(attendee, action.eventId)
      if (outcome !== 'success' || !attendee) return unchanged(state, operationResult('check_in_attendee', targetIds, { kind: 'check_in', outcome }))
      const nextAttendee = { ...attendee, credentialStatus: 'checked_in' as const, checkedInAt: action.checkedInAt }
      const activity = { id: `check-in-${attendee.id}-${state.checkInActivities.length + 1}`, eventId: attendee.eventId, attendeeId: attendee.id, checkedInAt: action.checkedInAt }
      return { state: { ...state, attendees: state.attendees.map((item) => item.id === attendee.id ? nextAttendee : item), checkInActivities: [activity, ...state.checkInActivities] }, result: operationResult('check_in_attendee', targetIds, { kind: 'check_in', outcome }) }
    }
    case 'update_organization': {
      const currentValues = valuesFromOrganizerOrganization(state.organization)
      const candidate = {
        ...currentValues,
        ...action.patch,
        businessIdentifier: Object.hasOwn(action.patch, 'businessIdentifier') ? action.patch.businessIdentifier ?? '' : currentValues.businessIdentifier,
      }
      const prepared = prepareOrganizerOrganizationSave(candidate)
      if (Object.keys(prepared.errors).length > 0) {
        return rejected(state, 'update_organization', { organizationId: state.organization.id }, 'action_not_supported', 'Thông tin tổ chức chưa hợp lệ.')
      }
      return { state: { ...state, organization: { ...state.organization, ...prepared.patch } }, result: operationResult('update_organization', { organizationId: state.organization.id }, { kind: 'organization_updated' }) }
    }
    case 'approve_event':
    case 'reject_event':
      return rejected(state, action.type, { eventId: action.eventId }, 'action_not_supported', 'Organizer không thể tự duyệt hoặc từ chối sự kiện.')
    case 'clear_last_operation':
      return { state, result: null }
  }
}
