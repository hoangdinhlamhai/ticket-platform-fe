import type { OrganizerAttendee, OrganizerOrder } from '../types/organizer-commerce.ts'

type OrganizerCheckInLookup = {
  readonly kind: 'matches' | 'wrong_event' | 'not_found'
  readonly attendees: readonly OrganizerAttendee[]
}

function normalize(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replaceAll('đ', 'd')
}

export function findOrganizerCheckInCandidates(
  attendees: readonly OrganizerAttendee[],
  orders: readonly OrganizerOrder[],
  eventId: string,
  query: string,
) {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return []
  const ordersById = new Map(orders.map((order) => [order.id, order]))

  return attendees.filter((attendee) => {
    const order = ordersById.get(attendee.orderId)
    if (attendee.eventId !== eventId || order?.eventId !== eventId) return false
    return normalize(`${attendee.fullName} ${attendee.email} ${attendee.ticketReference} ${order.id}`).includes(normalizedQuery)
  })
}

export function classifyOrganizerCheckInLookup(
  attendees: readonly OrganizerAttendee[],
  orders: readonly OrganizerOrder[],
  eventId: string,
  query: string,
): OrganizerCheckInLookup {
  const matches = findOrganizerCheckInCandidates(attendees, orders, eventId, query)
  if (matches.length) return { kind: 'matches', attendees: matches }

  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return { kind: 'not_found', attendees: [] }
  const orderById = new Map(orders.map((order) => [normalize(order.id), order]))
  const ticketOwner = attendees.find((attendee) => normalize(attendee.ticketReference) === normalizedQuery)
  const matchedOrder = orderById.get(normalizedQuery)
  const isForeignTicket = ticketOwner && ticketOwner.eventId !== eventId
  const isForeignOrder = matchedOrder && matchedOrder.eventId !== eventId

  return {
    kind: isForeignTicket || isForeignOrder ? 'wrong_event' : 'not_found',
    attendees: [],
  }
}
