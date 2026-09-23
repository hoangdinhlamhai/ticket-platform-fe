import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiError } from '../api/api-error.ts'
import { mapAuthApiErrors } from './map-auth-api-errors.ts'

test('maps API fullName validation errors onto the rendered name field', () => {
  const errors = mapAuthApiErrors(new ApiError({
    status: 422,
    code: 'VALIDATION_ERROR',
    message: 'Dữ liệu chưa hợp lệ.',
    fieldErrors: { fullName: 'Họ tên cần từ 2 ký tự.', email: 'Email chưa hợp lệ.' },
  }))

  assert.deepEqual(errors, { name: 'Họ tên cần từ 2 ký tự.', email: 'Email chưa hợp lệ.' })
})

test('ignores API fields that have no matching attendee form input', () => {
  const errors = mapAuthApiErrors(new ApiError({ status: 400, code: 'VALIDATION_ERROR', message: 'Bad input', fieldErrors: { role: 'Không thể tự chọn vai trò.' } }))

  assert.deepEqual(errors, {})
})
