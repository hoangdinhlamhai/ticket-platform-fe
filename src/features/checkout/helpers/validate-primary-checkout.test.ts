import assert from 'node:assert/strict'
import test from 'node:test'
import { validatePrimaryCheckout } from './validate-primary-checkout.ts'

test('validates primary checkout in focus order', () => {
  const result = validatePrimaryCheckout({ fullName: '', email: 'bad', phone: '12', acceptedTerms: false })
  assert.equal(result.firstInvalidField, 'fullName')
  assert.deepEqual(Object.keys(result.errors), ['fullName', 'email', 'phone', 'acceptedTerms'])
})

test('accepts a complete primary checkout buyer', () => {
  const result = validatePrimaryCheckout({ fullName: 'Minh Anh', email: 'minhanh@example.com', phone: '090 123 4567', acceptedTerms: true })
  assert.deepEqual(result.errors, {})
  assert.equal(result.firstInvalidField, null)
})
