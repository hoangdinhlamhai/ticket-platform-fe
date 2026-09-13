import assert from 'node:assert/strict'
import test from 'node:test'
import { MOCK_OWNED_TICKETS } from '../mock/ticketData.ts'
import { getTicketProfileSummary } from './get-ticket-profile-summary.ts'

test('summarizes owned ticket fixture states without inventing resale ownership', () => {
  const summary = getTicketProfileSummary(MOCK_OWNED_TICKETS)

  assert.equal(summary.upcomingCount, 2)
  assert.equal(summary.usedCount, 0)
  assert.equal(summary.resaleCount, 0)
  assert.deepEqual(summary.recentTickets.map((ticket) => ticket.id), [
    'ticket-vong-khuc',
    'ticket-night-run',
  ])
})

test('counts tickets currently listed for resale', () => {
  const tickets = [{ ...MOCK_OWNED_TICKETS[0], resaleStatus: 'listed' as const }, MOCK_OWNED_TICKETS[1]]
  assert.equal(getTicketProfileSummary(tickets).resaleCount, 1)
})

test('limits recent tickets without changing aggregate counts', () => {
  const summary = getTicketProfileSummary(MOCK_OWNED_TICKETS, 1)

  assert.equal(summary.upcomingCount, 2)
  assert.equal(summary.recentTickets.length, 1)
})
