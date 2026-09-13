import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { validateCustomerProfile } from '../helpers/validate-customer-profile'
import type { CustomerProfile, CustomerProfileErrors } from '../types/customer-profile'

type UseCustomerProfileOptions = {
  profile: CustomerProfile
  onSave: (profile: CustomerProfile) => void
}

export function useCustomerProfile({ profile, onSave }: UseCustomerProfileOptions) {
  const [draft, setDraft] = useState<CustomerProfile>(profile)
  const [errors, setErrors] = useState<CustomerProfileErrors>({})

  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(profile), [draft, profile])

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as keyof CustomerProfile
    setDraft((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }, [])

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateCustomerProfile(draft)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || !isDirty) return false

    const nextProfile = {
      ...draft,
      fullName: draft.fullName.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
    }
    setDraft(nextProfile)
    onSave(nextProfile)
    return true
  }, [draft, isDirty, onSave])

  return { draft, errors, handleChange, handleSubmit, isDirty }
}
