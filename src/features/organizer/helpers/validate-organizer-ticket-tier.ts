import type { OrganizerTicketTier } from '../types/organizer-commerce.ts'

export type OrganizerTicketTierDraft = Pick<OrganizerTicketTier, 'name' | 'price' | 'capacity' | 'salesStartAt' | 'salesEndAt' | 'perOrderLimit'>
export type OrganizerTicketTierValidation = { readonly valid: boolean; readonly errors: Readonly<Partial<Record<keyof OrganizerTicketTierDraft, string>>> }

export function validateOrganizerTicketTier(draft: OrganizerTicketTierDraft): OrganizerTicketTierValidation {
  const errors: Partial<Record<keyof OrganizerTicketTierDraft, string>> = {}
  if (!draft.name.trim()) errors.name = 'Nhập tên hạng vé.'
  if (!Number.isFinite(draft.price) || draft.price < 0) errors.price = 'Giá vé phải từ 0 trở lên.'
  if (!Number.isInteger(draft.capacity) || draft.capacity < 0) errors.capacity = 'Sức chứa phải là số nguyên không âm.'
  if (!Number.isInteger(draft.perOrderLimit) || draft.perOrderLimit < 1) errors.perOrderLimit = 'Giới hạn mỗi đơn phải từ 1 vé.'
  const startsAt = Date.parse(draft.salesStartAt)
  const endsAt = Date.parse(draft.salesEndAt)
  if (!Number.isFinite(startsAt)) errors.salesStartAt = 'Chọn thời điểm mở bán hợp lệ.'
  if (!Number.isFinite(endsAt) || (Number.isFinite(startsAt) && startsAt >= endsAt)) errors.salesEndAt = 'Thời điểm kết thúc phải sau thời điểm mở bán.'
  return { valid: Object.keys(errors).length === 0, errors }
}

export function canSaveOrganizerTicketTier(draft: OrganizerTicketTierDraft, soldCount: number) {
  return validateOrganizerTicketTier(draft).valid && Number.isInteger(soldCount) && soldCount >= 0 && draft.capacity >= soldCount
}
