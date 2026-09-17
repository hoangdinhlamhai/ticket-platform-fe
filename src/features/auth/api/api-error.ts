import type { AuthErrorCode } from './auth-contract.ts'

export class ApiError extends Error {
  readonly status: number
  readonly code: AuthErrorCode | string
  readonly fieldErrors: Record<string, string>

  constructor({ status, code, message, fieldErrors = {} }: { status: number; code: AuthErrorCode | string; message: string; fieldErrors?: Record<string, string> }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

export function isRetryableApiError(error: unknown) {
  return error instanceof ApiError && (error.code === 'NETWORK_ERROR' || error.code === 'SERVER_UNAVAILABLE' || error.status >= 500)
}
