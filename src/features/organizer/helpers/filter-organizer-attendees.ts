import type {
  OrganizerAttendee,
  OrganizerCredentialStatus,
  OrganizerOrder,
} from '../types/organizer-commerce.ts'

export type OrganizerAttendeeSource = 'all' | 'buyer' | 'holder'

export type OrganizerAttendeeFilters = {
  readonly query: string
  readonly credentialStatus: OrganizerCredentialStatus | 'all'
  readonly source: OrganizerAttendeeSource
  readonly ticketTierId: string | 'all'
}

function normalizeVietnamese(value: string) {
  return value
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replaceAll('đ', 'd')
}

function hasLinkedOrderInEvent(
  attendee: OrganizerAttendee,
  ordersById: ReadonlyMap<string, OrganizerOrder>,
) {
  return ordersById.get(attendee.orderId)?.eventId === attendee.eventId
}

export function getOrganizerAttendeeSource(
  attendee: OrganizerAttendee,
  ordersById: ReadonlyMap<string, OrganizerOrder>,
): Exclude<OrganizerAttendeeSource, 'all'> {
  return attendee.isOrderBuyer && hasLinkedOrderInEvent(attendee, ordersById) ? 'buyer' : 'holder'
}

export function filterOrganizerAttendees(
  attendees: readonly OrganizerAttendee[],
  orders: readonly OrganizerOrder[],
  eventId: string,
  filters: OrganizerAttendeeFilters,
) {
  const query = normalizeVietnamese(filters.query.trim())
  const ordersById = new Map(orders.map((order) => [order.id, order]))

  return attendees.filter((attendee) => {
    const source = getOrganizerAttendeeSource(attendee, ordersById)
    const searchableText = normalizeVietnamese(
      `${attendee.fullName} ${attendee.email} ${attendee.ticketReference}`,
    )

    return attendee.eventId === eventId
      && hasLinkedOrderInEvent(attendee, ordersById)
      && (!query || searchableText.includes(query))
      && (filters.credentialStatus === 'all' || attendee.credentialStatus === filters.credentialStatus)
      && (filters.ticketTierId === 'all' || attendee.ticketTierId === filters.ticketTierId)
      && (filters.source === 'all' || source === filters.source)
  })
}
