import type { AuthFormErrors, AuthFormValues, AuthMode } from '../types/authForm'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateAuthForm(values: AuthFormValues, mode: AuthMode): AuthFormErrors {
  const errors: AuthFormErrors = {}

  if (mode === 'register' && values.name.trim().length < 2) {
    errors.name = 'Nhập họ và tên của bạn để tiếp tục.'
  }

  if (!emailPattern.test(values.email.trim())) {
    errors.email = 'Nhập một địa chỉ email hợp lệ.'
  }

  if (values.password.length < 8) {
    errors.password = 'Mật khẩu cần có ít nhất 8 ký tự.'
  }

  if (mode === 'register' && values.confirmPassword.length === 0) {
    errors.confirmPassword = 'Nhập lại mật khẩu để xác nhận.'
  } else if (mode === 'register' && values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận chưa khớp.'
  }

  if (mode === 'register' && !values.acceptedTerms) {
    errors.acceptedTerms = 'Bạn cần đồng ý với điều khoản để tạo tài khoản.'
  }

  return errors
}
