import assert from 'node:assert/strict'
import test from 'node:test'
import { MOCK_EVENT_DETAILS } from '../../events/mock/eventDetailData.ts'
import { issuePrimaryTickets, issueResaleTicket } from './issue-owned-tickets.ts'
import { updateOwnedTicketResaleStatus } from './update-owned-ticket-resale-status.ts'

const event = MOCK_EVENT_DETAILS[0]
const selection = { eventId: event.id, eventTitle: event.title, date: event.date, venue: event.venue, address: event.address, ticketTierId: 'balcony', ticketTierName: 'Balcony', unitPrice: 390000, quantity: 3 }

test('issues one unique credential per purchased ticket', () => {
  const tickets = issuePrimaryTickets({ orderId: 'ORD-X', selection, buyerName: 'Minh Anh' })
  assert.equal(tickets.length, 3)
  assert.equal(new Set(tickets.map((ticket) => ticket.id)).size, 3)
  assert.equal(new Set(tickets.map((ticket) => ticket.credentialCode)).size, 3)
})

test('issues one resale ticket with a new buyer credential', () => {
  const ticket = issueResaleTicket({ orderId: 'RS-1', listing: { id: 'listing-1', eventId: 'event-1', eventTitle: 'Event resale', startsAt: '17 THG 10 · 19:30', venue: 'Nhà hát', city: 'TP. Hồ Chí Minh', ticketType: 'Balcony', section: 'B', row: '2', seats: ['B12'], quantity: 1, seatingType: 'assigned', usageTerms: [], price: 450000, seller: { name: 'Minh Anh', verified: true, joinedAt: '2026', completedSales: 0 }, posterTone: 'coral', availability: 'available' }, buyerName: 'Người mua' })
  assert.equal(ticket.source, 'resale')
  assert.equal(ticket.eventId, 'event-1')
  assert.equal(ticket.holderName, 'Người mua')
  assert.equal(ticket.credentialStatus, 'ready')
})

test('updates only the selected ticket resale and credential states immutably', () => {
  const tickets = issuePrimaryTickets({ orderId: 'ORD-X', selection, buyerName: 'Minh Anh' })
  const updated = updateOwnedTicketResaleStatus(tickets, tickets[0].id, 'sold', 'revoked')
  assert.equal(updated[0].resaleStatus, 'sold')
  assert.equal(updated[0].credentialStatus, 'revoked')
  assert.equal(updated[1], tickets[1])
  assert.equal(tickets[0].resaleStatus, 'eligible')
})
