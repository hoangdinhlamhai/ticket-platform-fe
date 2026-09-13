import { useRef, useState, type ChangeEvent } from 'react'
import {
  validateOrganizerEvent,
  type OrganizerEventErrors,
  type OrganizerEventField,
} from '../helpers/validate-organizer-event.ts'
import type { OrganizerEvent, OrganizerEventInput } from '../types/organizer-event.ts'

export type OrganizerEventFormValues = OrganizerEventInput & {
  scheduleSummary: string
  policySummary: string
  ticketTierName: string
  ticketTierPrice: string
  ticketTierCapacity: string
}

type UseOrganizerEventFormOptions = {
  onDirtyChange?: (isDirty: boolean) => void
}

const dateTimeLocalPattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/

function parseDateTimeLocal(value: string) {
  const match = dateTimeLocalPattern.exec(value)
  if (!match) return null

  const [, year, month, day, hour, minute] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute))
  if (
    date.getFullYear() !== Number(year)
    || date.getMonth() !== Number(month) - 1
    || date.getDate() !== Number(day)
    || date.getHours() !== Number(hour)
    || date.getMinutes() !== Number(minute)
  ) {
    return null
  }

  return date
}

export function toDateTimeLocalValue(value: string) {
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return ''

  const date = new Date(timestamp)
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hour}:${minute}`
}

export function fromDateTimeLocalValue(value: string) {
  return parseDateTimeLocal(value)?.toISOString() ?? ''
}

function initialValues(event?: OrganizerEvent): OrganizerEventFormValues {
  return {
    title: event?.title ?? '',
    startsAt: event ? toDateTimeLocalValue(event.startsAt) : '',
    endsAt: event ? toDateTimeLocalValue(event.endsAt) : '',
    venue: event?.venue ?? '',
    city: event?.city ?? '',
    scheduleSummary: '',
    policySummary: '',
    ticketTierName: 'Vé tiêu chuẩn',
    ticketTierPrice: '',
    ticketTierCapacity: '',
  }
}

function toInput(values: OrganizerEventFormValues): OrganizerEventInput {
  return {
    title: values.title,
    startsAt: fromDateTimeLocalValue(values.startsAt),
    endsAt: fromDateTimeLocalValue(values.endsAt),
    venue: values.venue,
    city: values.city,
  }
}

function valuesMatch(
  first: OrganizerEventFormValues,
  second: OrganizerEventFormValues,
) {
  return JSON.stringify(first) === JSON.stringify(second)
}

export function useOrganizerEventForm(
  event?: OrganizerEvent,
  { onDirtyChange }: UseOrganizerEventFormOptions = {},
) {
  const [initial] = useState(() => initialValues(event))
  const [values, setValues] = useState(initial)
  const [savedValues, setSavedValues] = useState(initial)
  const [errors, setErrors] = useState<OrganizerEventErrors>({})
  const fieldRefs = useRef<
    Partial<Record<keyof OrganizerEventInput, HTMLInputElement | null>>
  >({})

  const onChange = (change: ChangeEvent<HTMLInputElement>) => {
    const field = change.target.name as keyof OrganizerEventFormValues
    const nextValues = { ...values, [field]: change.target.value }
    setValues(nextValues)
    onDirtyChange?.(!valuesMatch(nextValues, savedValues))

    if (field in errors) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  const validate = (
    fields: readonly OrganizerEventField[] = [
      'title',
      'startsAt',
      'endsAt',
      'venue',
      'city',
    ],
  ) => {
    const result = validateOrganizerEvent(toInput(values))
    setErrors(result.errors)
    const firstInvalidField = fields.find((field) => result.errors[field])

    if (firstInvalidField) {
      requestAnimationFrame(() => fieldRefs.current[firstInvalidField]?.focus())
    }

    return firstInvalidField === undefined
  }

  const markSaved = () => {
    setSavedValues(values)
    setErrors({})
    onDirtyChange?.(false)
  }

  const registerField = (field: keyof OrganizerEventInput) => (
    node: HTMLInputElement | null,
  ) => {
    fieldRefs.current[field] = node
  }

  return {
    errors,
    isDirty: !valuesMatch(values, savedValues),
    markSaved,
    onChange,
    registerField,
    toInput: () => toInput(values),
    validate,
    values,
  }
}
