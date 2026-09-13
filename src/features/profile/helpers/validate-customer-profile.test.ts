import assert from 'node:assert/strict'
import test from 'node:test'
import { validateCustomerProfile } from './validate-customer-profile.ts'

const validProfile = {
  fullName: 'Minh Anh',
  email: 'minhanh@example.com',
  phone: '090 123 4567',
  birthDate: '1998-06-15',
}

test('accepts a complete valid customer profile', () => {
  assert.deepEqual(validateCustomerProfile(validProfile), {})
})

test('requires a meaningful name and valid email', () => {
  assert.deepEqual(validateCustomerProfile({ ...validProfile, fullName: ' ', email: 'minhanh@' }), {
    fullName: 'Nhập họ và tên có ít nhất 2 ký tự.',
    email: 'Nhập một địa chỉ email hợp lệ.',
  })
})

test('allows blank optional details and rejects an invalid entered phone number', () => {
  assert.deepEqual(validateCustomerProfile({ ...validProfile, phone: '', birthDate: '' }), {})
  assert.deepEqual(validateCustomerProfile({ ...validProfile, phone: '1234' }), {
    phone: 'Số điện thoại cần có từ 9 đến 11 chữ số.',
  })
})

test('compares birth dates against the local calendar date', () => {
  assert.deepEqual(validateCustomerProfile({ ...validProfile, birthDate: '2000-01-01' }, new Date(2000, 0, 1, 1)), {})
  assert.deepEqual(validateCustomerProfile({ ...validProfile, birthDate: '2000-01-02' }, new Date(2000, 0, 1, 23)), {
    birthDate: 'Ngày sinh không được lớn hơn ngày hiện tại.',
  })
})
