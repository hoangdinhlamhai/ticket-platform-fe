import type { OrganizerEventInput } from '../types/organizer-event.ts'

export type OrganizerEventField = keyof OrganizerEventInput | 'provinceId' | 'wardId' | 'street'
export type OrganizerEventErrors = Partial<Record<OrganizerEventField, string>>

const fieldOrder: readonly OrganizerEventField[] = ['title', 'startsAt', 'endsAt', 'venue', 'city']

export function validateOrganizerEvent(input: OrganizerEventInput) {
  const errors: OrganizerEventErrors = {}
  if (!input.title.trim()) errors.title = 'Nhập tên sự kiện.'
  if (!input.startsAt) errors.startsAt = 'Chọn thời gian bắt đầu.'
  if (!input.endsAt) errors.endsAt = 'Chọn thời gian kết thúc.'
  if (!input.provinceId && !input.venue?.trim()) errors.venue = 'Nhập địa điểm tổ chức.'
  if (!input.provinceId && !input.city?.trim()) errors.city = 'Nhập tỉnh/thành phố.'

  if (input.startsAt && input.endsAt) {
    const startsAt = Date.parse(input.startsAt)
    const endsAt = Date.parse(input.endsAt)
    if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt)) errors.startsAt = 'Thời gian sự kiện không hợp lệ.'
    else if (startsAt >= endsAt) errors.endsAt = 'Thời gian kết thúc phải sau thời gian bắt đầu.'
  }

  return { errors, firstInvalidField: fieldOrder.find((field) => errors[field]) ?? null }
}
