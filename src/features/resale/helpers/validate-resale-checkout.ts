import type {
  ResaleCheckoutDraft,
  ResaleCheckoutErrors,
  ResaleCheckoutField,
  ResaleCheckoutValidation,
} from '../types/resale'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const fieldOrder: readonly ResaleCheckoutField[] = ['fullName', 'email', 'phone', 'acceptedTerms']

export function validateResaleCheckout(draft: ResaleCheckoutDraft): ResaleCheckoutValidation {
  const errors: ResaleCheckoutErrors = {}
  const phoneDigits = draft.phone.replace(/\D/g, '')

  if (draft.fullName.trim().length < 2) errors.fullName = 'Nhập họ và tên có ít nhất 2 ký tự.'
  if (!emailPattern.test(draft.email.trim())) errors.email = 'Nhập một địa chỉ email hợp lệ.'
  if (phoneDigits.length < 9 || phoneDigits.length > 11) errors.phone = 'Số điện thoại cần có từ 9 đến 11 chữ số.'
  if (!draft.acceptedTerms) errors.acceptedTerms = 'Bạn cần xác nhận điều khoản trước khi tiếp tục.'

  return {
    errors,
    firstInvalidField: fieldOrder.find((field) => Boolean(errors[field])) ?? null,
  }
}
