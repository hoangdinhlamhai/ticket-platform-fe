import assert from 'node:assert/strict'
import test from 'node:test'
import { getProfileInitials } from './get-profile-initials.ts'

test('uses the first and final words for profile initials', () => {
  assert.equal(getProfileInitials('Nguyễn Minh Anh'), 'NA')
  assert.equal(getProfileInitials('  Minh   '), 'M')
})

test('returns a safe fallback for a blank name', () => {
  assert.equal(getProfileInitials('   '), '?')
})
