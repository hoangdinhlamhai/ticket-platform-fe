import test from 'node:test'
import assert from 'node:assert/strict'
import { validateResaleCheckout } from './validate-resale-checkout.ts'
import type { ResaleCheckoutDraft } from '../types/resale.ts'

const validDraft: ResaleCheckoutDraft = { fullName: 'Nguyễn Minh Anh', email: 'minhanh@example.com', phone: '090 123 4567', acceptedTerms: true }
test('reports every required checkout field in focus order', () => { const result = validateResaleCheckout({ fullName: ' ', email: '', phone: '', acceptedTerms: false }); assert.equal(result.firstInvalidField, 'fullName'); assert.deepEqual(Object.keys(result.errors), ['fullName', 'email', 'phone', 'acceptedTerms']) })
test('rejects invalid email and phone values', () => { const result = validateResaleCheckout({ ...validDraft, email: 'minhanh@', phone: '1234' }); assert.equal(result.firstInvalidField, 'email'); assert.equal(typeof result.errors.email, 'string'); assert.equal(typeof result.errors.phone, 'string') })
test('accepts a valid buyer and formatted phone number', () => { assert.deepEqual(validateResaleCheckout(validDraft), { errors: {}, firstInvalidField: null }) })
