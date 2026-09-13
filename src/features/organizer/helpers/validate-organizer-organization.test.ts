import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getFirstOrganizerOrganizationError,
  hasOrganizerOrganizationChanges,
  prepareOrganizerOrganizationSave,
  reconcileOrganizerOrganizationDraft,
  validateOrganizerOrganization,
  valuesFromOrganizerOrganization,
} from './validate-organizer-organization.ts'

const valid = {
  name: 'Sao Việt', publicEmail: 'hello@example.com', publicPhone: '0901 234 567', address: 'Quận 1', businessIdentifier: 'MST •••••• 4821', defaultRefundPolicy: 'Theo điều kiện',
}

test('accepts an organization profile with optional masked identifier', () => {
  assert.deepEqual(validateOrganizerOrganization(valid), {})
  assert.deepEqual(validateOrganizerOrganization({ ...valid, businessIdentifier: '' }), {})
})

test('enforces 9 to 11 phone digits at both boundaries', () => {
  assert.equal(validateOrganizerOrganization({ ...valid, publicPhone: '123 456 789' }).publicPhone, undefined)
  assert.equal(validateOrganizerOrganization({ ...valid, publicPhone: '123 456 789 01' }).publicPhone, undefined)
  assert.equal(validateOrganizerOrganization({ ...valid, publicPhone: '12345678' }).publicPhone, 'Nhập số điện thoại gồm 9 đến 11 chữ số.')
  assert.equal(validateOrganizerOrganization({ ...valid, publicPhone: '123456789012' }).publicPhone, 'Nhập số điện thoại gồm 9 đến 11 chữ số.')
})

test('normalizes saved profile values before validating and persisting them', () => {
  const prepared = prepareOrganizerOrganizationSave({
    ...valid,
    name: ' Sao Việt ',
    publicEmail: ' hello@example.com ',
    publicPhone: ' 0901 234 567 ',
    address: ' Quận 1 ',
    businessIdentifier: ' MST •••••• 4821 ',
    defaultRefundPolicy: ' Theo điều kiện ',
  })
  const normalized = prepared.values

  assert.deepEqual(prepared.values, valid)
  assert.deepEqual(prepared.patch, valid)
  assert.deepEqual(prepared.errors, {})
  assert.equal(hasOrganizerOrganizationChanges(normalized, valid), false)
  assert.equal(hasOrganizerOrganizationChanges({ ...normalized, name: 'Sao Việt mới' }, valid), true)
  assert.deepEqual(validateOrganizerOrganization(normalized), {})
})

test('uses an empty controlled form value when the optional identifier is absent', () => {
  const values = valuesFromOrganizerOrganization({
    id: 'org-1',
    name: valid.name,
    publicEmail: valid.publicEmail,
    publicPhone: valid.publicPhone,
    address: valid.address,
    payoutAccountLabel: 'Ngân hàng •••• 4821',
    defaultRefundPolicy: valid.defaultRefundPolicy,
  })

  assert.equal(values.businessIdentifier, '')
})

test('stores a blank optional identifier as undefined while retaining a blank form value', () => {
  const prepared = prepareOrganizerOrganizationSave({ ...valid, businessIdentifier: '   ' })

  assert.deepEqual(prepared.errors, {})
  assert.equal(prepared.values.businessIdentifier, '')
  assert.equal(prepared.patch.businessIdentifier, undefined)
})

test('clears the dirty draft after a normalized save reaches the parent baseline', () => {
  const prepared = prepareOrganizerOrganizationSave({ ...valid, name: ' Sao Việt mới ' })
  const parentBaseline = { ...valid, name: 'Sao Việt mới' }
  const nextDraft = reconcileOrganizerOrganizationDraft(
    prepared.values,
    prepared.values,
    parentBaseline,
  )

  assert.deepEqual(prepared.errors, {})
  assert.deepEqual(nextDraft, parentBaseline)
  assert.equal(hasOrganizerOrganizationChanges(nextDraft, parentBaseline), false)
})

test('rejects unmasked business identifier and returns the first invalid field', () => {
  const errors = validateOrganizerOrganization({ ...valid, name: ' ', publicEmail: 'bad', publicPhone: '123', address: '', businessIdentifier: '0312345678', defaultRefundPolicy: '' })
  assert.deepEqual(Object.keys(errors), ['name', 'publicEmail', 'publicPhone', 'address', 'businessIdentifier', 'defaultRefundPolicy'])
  assert.equal(getFirstOrganizerOrganizationError(errors), 'name')
  assert.equal(getFirstOrganizerOrganizationError({}), null)
})
