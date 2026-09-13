import assert from 'node:assert/strict'
import test from 'node:test'
import { createAttendeeOrder } from './create-attendee-order.ts'
import { filterAttendeeOrders } from './filter-attendee-orders.ts'

const buyer = { fullName: 'Minh Anh', email: 'minhanh@example.com', phone: '0901234567' }
const item = { label: 'Balcony', quantity: 2, unitPrice: 390000 }

test('creates fee-free attendee orders and strips issued tickets from unsuccessful outcomes', () => {
  const completed = createAttendeeOrder({ id: 'ORD-1', source: 'primary', status: 'completed', eventId: 'event-1', eventTitle: 'Event', buyer, items: [item], issuedTicketIds: ['T-1', 'T-2'] })
  const failed = createAttendeeOrder({ id: 'ORD-2', source: 'primary', status: 'failed', eventId: 'event-1', eventTitle: 'Event', buyer, items: [item], issuedTicketIds: ['invalid'] })
  assert.equal(completed.total, 780000)
  assert.equal(completed.serviceFee, 0)
  assert.deepEqual(completed.issuedTicketIds, ['T-1', 'T-2'])
  assert.deepEqual(failed.issuedTicketIds, [])
  assert.equal(failed.paidAt, null)
})

test('filters attendee orders by source and status with and semantics', () => {
  const orders = [
    createAttendeeOrder({ id: '1', source: 'primary', status: 'completed', eventId: 'e', eventTitle: 'E', buyer, items: [item] }),
    createAttendeeOrder({ id: '2', source: 'resale', status: 'completed', eventId: 'e', eventTitle: 'E', buyer, items: [item] }),
    createAttendeeOrder({ id: '3', source: 'primary', status: 'expired', eventId: 'e', eventTitle: 'E', buyer, items: [item] }),
  ]
  assert.deepEqual(filterAttendeeOrders(orders, { source: 'primary', status: 'completed' }).map((order) => order.id), ['1'])
  assert.deepEqual(filterAttendeeOrders(orders, { source: 'all', status: 'completed' }).map((order) => order.id), ['1', '2'])
})
