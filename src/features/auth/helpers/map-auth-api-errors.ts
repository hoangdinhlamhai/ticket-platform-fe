import { ApiError } from '../api/api-error.ts'
import type { AuthFormErrors, AuthFormValues } from '../types/authForm.ts'

const allowedFields: ReadonlySet<string> = new Set<keyof AuthFormValues>(['name', 'email', 'password', 'confirmPassword', 'acceptedTerms'])

export function mapAuthApiErrors(error: unknown): AuthFormErrors {
  if (!(error instanceof ApiError)) return {}
  const errors: AuthFormErrors = {}
  for (const [key, message] of Object.entries(error.fieldErrors)) {
    const field = key === 'fullName' ? 'name' : key
    if (allowedFields.has(field)) errors[field as keyof AuthFormValues] = message
  }
  return errors
}
