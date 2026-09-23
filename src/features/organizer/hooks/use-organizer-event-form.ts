import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  validateOrganizerEvent,
  type OrganizerEventErrors,
  type OrganizerEventField,
} from '../helpers/validate-organizer-event.ts'
import { validateOrganizerLocation } from '../helpers/organizer-event-location.ts'
import { sanitizeOrganizerHtml } from '../helpers/sanitize-organizer-html.ts'
import type {
  OrganizerEvent,
  OrganizerEventFinance,
  OrganizerEventInput,
} from '../types/organizer-event.ts'
import type { OrganizerTicketTierDraft } from '../types/organizer-commerce.ts'

export type OrganizerEventFormValues = OrganizerEventInput & {
  scheduleSummary: string
  policySummary: string
  ticketTierName: string
  ticketTierPrice: string
  ticketTierCapacity: string
  thumbnail: string
  category: string
  categoryId: string
  coverImage: string
  provinceId: string
  wardId: string
  street: string
  description: string
  organizerName: string
  organizerBio: string
  organizerLogo: string
  visibility: 'public' | 'link_only'
  confirmationMessage: string
  seatingChartImage: string
  tiers: OrganizerTicketTierDraft[]
  finance: OrganizerEventFinance
}

type Options = {
  onDirtyChange?: (dirty: boolean) => void
  finance?: OrganizerEventFinance
}

const financeDefault: OrganizerEventFinance = {
  accountHolder: '',
  accountNumber: '',
  bankName: '',
  branch: '',
  businessType: 'INDIVIDUAL',
  invoiceName: '',
  invoiceAddress: '',
  taxCode: '',
}

const dateTimeLocalPattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/

function parseDateTimeLocal(value: string) {
  const match = dateTimeLocalPattern.exec(value)
  if (!match) return null
  const [, y, m, d, h, min] = match
  const date = new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min))
  return date.getFullYear() === Number(y) &&
    date.getMonth() === Number(m) - 1 &&
    date.getDate() === Number(d) &&
    date.getHours() === Number(h) &&
    date.getMinutes() === Number(min)
    ? date
    : null
}

export function toDateTimeLocalValue(value: string) {
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function fromDateTimeLocalValue(value: string) {
  return parseDateTimeLocal(value)?.toISOString() ?? ''
}

function initialValues(
  event?: OrganizerEvent,
  finance?: OrganizerEventFinance,
): OrganizerEventFormValues {
  return {
    title: event?.title ?? '',
    startsAt: event ? toDateTimeLocalValue(event.startsAt) : '',
    endsAt: event ? toDateTimeLocalValue(event.endsAt) : '',
    venue: event?.venue ?? '',
    city: event?.city ?? '',
    thumbnail: event?.thumbnail ?? '',
    coverImage: event?.coverImage ?? '',
    category: event?.category ?? '',
    categoryId: event?.categoryId ?? '',
    provinceId: event?.provinceId ?? '',
    wardId: event?.wardId ?? '',
    street: event?.street ?? event?.venue ?? '',
    description: event?.description ?? '',
    organizerName: event?.organizerName ?? '',
    organizerBio: event?.organizerBio ?? '',
    organizerLogo: event?.organizerLogo ?? '',
    visibility: event?.visibility ?? 'public',
    confirmationMessage: event?.confirmationMessage ?? '',
    seatingChartImage: event?.seatingChartImage ?? '',
    scheduleSummary: '',
    policySummary: '',
    ticketTierName: 'Vé tiêu chuẩn',
    ticketTierPrice: '',
    ticketTierCapacity: '',
    tiers: [],
    finance: finance ?? financeDefault,
  }
}

export function useOrganizerEventForm(
  event?: OrganizerEvent,
  { onDirtyChange, finance }: Options = {},
) {
  const [values, setValues] = useState(() => initialValues(event, finance))
  const [savedValues, setSavedValues] = useState(() => initialValues(event, finance))
  const [errors, setErrors] = useState<OrganizerEventErrors>({})
  const fieldRefs = useRef<Partial<Record<string, HTMLInputElement | HTMLSelectElement | null>>>({})

  const isDirty = JSON.stringify(values) !== JSON.stringify(savedValues)
  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const update = (field: string, value: string) => {
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === 'street' ? { venue: value } : {}),
    }))
    if (field in errors) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  const onChange = (
    change: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => update(change.target.name, change.target.value)

  const validate = (
    fields: readonly OrganizerEventField[] = ['title', 'startsAt', 'endsAt', 'venue', 'city'],
  ) => {
    const result = validateOrganizerEvent({
      title: values.title,
      startsAt: fromDateTimeLocalValue(values.startsAt),
      endsAt: fromDateTimeLocalValue(values.endsAt),
      venue: values.venue || values.street,
      city: values.city,
      provinceId: values.provinceId,
    })
    const locationErrors = validateOrganizerLocation(values)
    const categoryErrors: Partial<Record<string, string>> = {}
    if (!values.categoryId?.trim()) {
      categoryErrors.categoryId = 'Chọn danh mục sự kiện.'
    }
    const nextErrors = { ...result.errors, ...locationErrors, ...categoryErrors }
    setErrors(nextErrors)
    const first =
      fields.find((field) => nextErrors[field]) ??
      (fields.includes('venue') && Object.keys(locationErrors).length
        ? (Object.keys(locationErrors)[0] as OrganizerEventField)
        : undefined)
    if (first) {
      requestAnimationFrame(() => fieldRefs.current[first]?.focus())
    }
    return first === undefined
  }

  const markSaved = () => {
    setSavedValues(values)
    setErrors({})
    onDirtyChange?.(false)
  }

  const registerField =
    (field: string) => (node: HTMLInputElement | HTMLSelectElement | null) => {
      fieldRefs.current[field] = node
    }

  const toInput = (): OrganizerEventInput => ({
    title: values.title,
    startsAt: fromDateTimeLocalValue(values.startsAt),
    endsAt: fromDateTimeLocalValue(values.endsAt),
    venue: values.venue || values.street,
    city: values.city,
    thumbnail: values.thumbnail || undefined,
    coverImage: values.coverImage || undefined,
    category: values.category || undefined,
    categoryId: values.categoryId || undefined,
    provinceId: values.provinceId || undefined,
    wardId: values.wardId || undefined,
    street: values.street || undefined,
    description: sanitizeOrganizerHtml(values.description),
    organizerName: values.organizerName || undefined,
    organizerBio: sanitizeOrganizerHtml(values.organizerBio),
    organizerLogo: values.organizerLogo || undefined,
    visibility: values.visibility,
    confirmationMessage: values.confirmationMessage.slice(0, 500) || undefined,
    seatingChartImage: values.seatingChartImage || undefined,
  })

  return {
    errors,
    isDirty,
    markSaved,
    onChange,
    registerField,
    toInput,
    validate,
    values,
    setField: update,
    setValues,
  }
}
