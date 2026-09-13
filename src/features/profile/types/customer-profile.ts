export type CustomerProfile = {
  fullName: string
  email: string
  phone: string
  birthDate: string
}

export type CustomerProfileErrors = Partial<Record<keyof CustomerProfile, string>>
