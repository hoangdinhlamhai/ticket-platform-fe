import type { PrimaryCheckoutDraft, PrimaryCheckoutErrors, PrimaryCheckoutField } from '../types/primary-checkout'
const fields: readonly PrimaryCheckoutField[] = ['fullName', 'email', 'phone', 'acceptedTerms']
export function validatePrimaryCheckout(draft: PrimaryCheckoutDraft) {
  const errors: PrimaryCheckoutErrors = {}
  if (draft.fullName.trim().length < 2) errors.fullName = 'Nhập họ và tên có ít nhất 2 ký tự.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) errors.email = 'Nhập một địa chỉ email hợp lệ.'
  const digits = draft.phone.replace(/\D/g, '')
  if (digits.length < 9 || digits.length > 11) errors.phone = 'Số điện thoại cần có từ 9 đến 11 chữ số.'
  if (!draft.acceptedTerms) errors.acceptedTerms = 'Bạn cần xác nhận đây là thanh toán minh họa.'
  return { errors, firstInvalidField: fields.find((field) => Boolean(errors[field])) ?? null }
}
