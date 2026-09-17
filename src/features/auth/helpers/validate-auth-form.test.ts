import assert from 'node:assert/strict'
import test from 'node:test'
import { validateAuthForm } from './validateAuthForm.ts'

test('requires all attendee registration fields before an API request can be submitted', () => {
  assert.deepEqual(validateAuthForm({ name: ' ', email: 'not-an-email', password: 'short', confirmPassword: '', acceptedTerms: false }, 'register'), {
    name: 'Nhập họ và tên của bạn để tiếp tục.',
    email: 'Nhập một địa chỉ email hợp lệ.',
    password: 'Mật khẩu cần có ít nhất 8 ký tự.',
    confirmPassword: 'Nhập lại mật khẩu để xác nhận.',
    acceptedTerms: 'Bạn cần đồng ý với điều khoản để tạo tài khoản.',
  })
})

test('allows login values without registration-only fields', () => {
  assert.deepEqual(validateAuthForm({ name: '', email: 'linh@example.com', password: 'correct-horse', confirmPassword: '', acceptedTerms: false }, 'login'), {})
})
