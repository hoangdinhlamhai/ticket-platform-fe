import type { CustomerProfile, CustomerProfileErrors } from '../types/customer-profile'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateCustomerProfile(values: CustomerProfile, today = new Date()): CustomerProfileErrors {
  const errors: CustomerProfileErrors = {}
  const localDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  if (values.fullName.trim().length < 2) {
    errors.fullName = 'Nhập họ và tên có ít nhất 2 ký tự.'
  }

  if (!emailPattern.test(values.email.trim())) {
    errors.email = 'Nhập một địa chỉ email hợp lệ.'
  }

  const phoneDigits = values.phone.replace(/\D/g, '')
  if (values.phone.trim() && (phoneDigits.length < 9 || phoneDigits.length > 11)) {
    errors.phone = 'Số điện thoại cần có từ 9 đến 11 chữ số.'
  }

  if (values.birthDate && values.birthDate > localDate) {
    errors.birthDate = 'Ngày sinh không được lớn hơn ngày hiện tại.'
  }

  return errors
}
