import assert from 'node:assert/strict'
import test from 'node:test'
import { mapOrganizerLocationToLegacyFields, validateOrganizerLocation } from './organizer-event-location.ts'

test('maps province ward and street to legacy venue and city fields', () => {
  assert.deepEqual(mapOrganizerLocationToLegacyFields({ provinceName: 'Hà Nội', wardName: 'Phường Dịch Vọng', street: '12 Cầu Giấy' }), {
    venue: '12 Cầu Giấy, Phường Dịch Vọng',
    city: 'Hà Nội',
  })
})

test('requires province, ward, and street for the new address step', () => {
  assert.deepEqual(validateOrganizerLocation({ provinceId: '', wardId: '', street: ' ' }), {
    provinceId: 'Chọn tỉnh/thành phố.',
    wardId: 'Chọn phường/xã.',
    street: 'Nhập đường/phố.',
  })
})
