import assert from 'node:assert/strict'
import test from 'node:test'
import {
  canDecideOrganizerVerification,
  canHoldPayout,
  canReviewEvent,
  validateAdminReason,
} from './admin-transitions.ts'

test('requires trimmed reasons only for adverse decisions', () => {
  assert.equal(validateAdminReason('approve_event', '').valid, true)
  assert.equal(validateAdminReason('request_event_changes', '   ').valid, false)
  assert.equal(validateAdminReason('reject_event', '').valid, false)
  assert.equal(validateAdminReason('restrict_user', '').valid, false)
  assert.equal(validateAdminReason('hide_resale', '').valid, false)
  assert.equal(validateAdminReason('hold_payout', '').valid, false)
  assert.deepEqual(validateAdminReason('reject_refund', '  Trùng điều kiện  '), {
    valid: true,
    reason: 'Trùng điều kiện',
  })
})

test('allows only legal review, verification, and payout entry states', () => {
  assert.equal(canReviewEvent('pending_review'), true)
  assert.equal(canReviewEvent('approved'), false)
  assert.equal(canDecideOrganizerVerification('pending'), true)
  assert.equal(canDecideOrganizerVerification('verified'), false)
  assert.equal(canHoldPayout('scheduled'), true)
  assert.equal(canHoldPayout('pending'), true)
  assert.equal(canHoldPayout('released'), true)
  assert.equal(canHoldPayout('on_hold'), false)
  assert.equal(canHoldPayout('paid'), false)
})
