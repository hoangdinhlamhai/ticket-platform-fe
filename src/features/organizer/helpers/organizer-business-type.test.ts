import assert from 'node:assert/strict'
import test from 'node:test'
import { organizerBusinessTypeLabel } from './organizer-business-type.ts'

test('supports the two payout business type options', () => {
  assert.equal(organizerBusinessTypeLabel('INDIVIDUAL'), 'Cá nhân')
  assert.equal(organizerBusinessTypeLabel('ORGANIZATION'), 'Tổ chức')
})
