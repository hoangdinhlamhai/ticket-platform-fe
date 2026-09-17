export type AttendeeUser = {
  id: string
  email: string
  fullName: string
  phone: string | null
  role: 'ATTENDEE'
  status: 'ACTIVE'
}

export type AuthSessionResponse = {
  user: AttendeeUser
  accessToken: string
  expiresIn: number
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  fullName: string
  email: string
  password: string
  phone?: string
}

export type AuthErrorCode =
  | 'VALIDATION_ERROR'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHENTICATED'
  | 'ACCOUNT_INACTIVE'
  | 'ATTENDEE_ONLY'
  | 'TOO_MANY_REQUESTS'
  | 'NETWORK_ERROR'
  | 'SERVER_UNAVAILABLE'
  | 'UNKNOWN_ERROR'

export type AuthErrorResponse = {
  statusCode: number
  code: AuthErrorCode | string
  message: string
  fieldErrors?: Record<string, string>
}
