export type AuthMode = 'login' | 'register'

export type AuthFormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptedTerms: boolean
}

export type AuthFormErrors = Partial<Record<keyof AuthFormValues, string>>
