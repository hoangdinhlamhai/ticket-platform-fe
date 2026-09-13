import test from 'node:test'
import assert from 'node:assert/strict'
import { getTicketById } from './getTicketById.ts'

test('looks up known owned tickets and returns undefined for unknown ids', () => {
  const ticket = getTicketById('ticket-vong-khuc')
  assert.equal(ticket?.eventId, 'vong-khuc-thanh-pho')
  assert.equal(ticket?.referenceCode, 'TKL-VK-0012')
  assert.equal(getTicketById('khong-ton-tai'), undefined)
})
