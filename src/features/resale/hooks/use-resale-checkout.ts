import { useCallback, useEffect, useRef, useState } from 'react'
import { validateResaleCheckout } from '../helpers/validate-resale-checkout'
import type {
  ResaleBuyer,
  ResaleCheckoutCompletion,
  ResaleCheckoutDraft,
  ResaleCheckoutErrors,
  ResaleListing,
} from '../types/resale'

type UseResaleCheckoutOptions = {
  listing: ResaleListing
  initialBuyer: ResaleBuyer
  onComplete: (completion: ResaleCheckoutCompletion) => void
}

export function useResaleCheckout({ listing, initialBuyer, onComplete }: UseResaleCheckoutOptions) {
  const [draft, setDraft] = useState<ResaleCheckoutDraft>({ ...initialBuyer, acceptedTerms: false })
  const [errors, setErrors] = useState<ResaleCheckoutErrors>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const timerRef = useRef<number | null>(null)
  const transferContent = `TICKETLY ${listing.id.replace(/[^a-z0-9]/gi, '').slice(-12).toUpperCase()}`

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
  }, [])

  const updateBuyerField = useCallback((field: keyof ResaleBuyer, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }, [])

  const setAcceptedTerms = useCallback((acceptedTerms: boolean) => {
    setDraft((current) => ({ ...current, acceptedTerms }))
    setErrors((current) => ({ ...current, acceptedTerms: undefined }))
  }, [])

  const submit = useCallback(() => {
    if (isProcessing) return null
    const validation = validateResaleCheckout(draft)
    setErrors(validation.errors)
    if (validation.firstInvalidField) return validation.firstInvalidField

    setIsProcessing(true)
    timerRef.current = window.setTimeout(() => {
      onComplete({
        listingId: listing.id,
        buyer: {
          fullName: draft.fullName.trim(),
          email: draft.email.trim(),
          phone: draft.phone.trim(),
        },
        amount: listing.price,
        transferContent,
      })
    }, 800)
    return null
  }, [draft, isProcessing, listing.id, listing.price, onComplete, transferContent])

  return { draft, errors, isProcessing, setAcceptedTerms, submit, transferContent, updateBuyerField }
}
