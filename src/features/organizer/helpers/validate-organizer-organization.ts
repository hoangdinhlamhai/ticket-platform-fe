import type {
  OrganizerOrganization,
  OrganizerOrganizationPatch,
} from '../types/organizer-organization.ts'

export type OrganizerOrganizationFormValues = Required<Pick<
  OrganizerOrganizationPatch,
  'name' | 'publicEmail' | 'publicPhone' | 'address' | 'businessIdentifier' | 'defaultRefundPolicy'
>>

export const organizerOrganizationFields = [
  'name',
  'publicEmail',
  'publicPhone',
  'address',
  'businessIdentifier',
  'defaultRefundPolicy',
] as const

export type OrganizerOrganizationField = (typeof organizerOrganizationFields)[number]
export type OrganizerOrganizationErrors = Partial<Record<OrganizerOrganizationField, string>>

export function valuesFromOrganizerOrganization(
  organization: OrganizerOrganization,
): OrganizerOrganizationFormValues {
  return {
    name: organization.name,
    publicEmail: organization.publicEmail,
    publicPhone: organization.publicPhone,
    address: organization.address,
    businessIdentifier: organization.businessIdentifier ?? '',
    defaultRefundPolicy: organization.defaultRefundPolicy,
  }
}

export function normalizeOrganizerOrganizationValues(
  values: OrganizerOrganizationFormValues,
): OrganizerOrganizationFormValues {
  return {
    name: values.name.trim(),
    publicEmail: values.publicEmail.trim(),
    publicPhone: values.publicPhone.trim(),
    address: values.address.trim(),
    businessIdentifier: values.businessIdentifier.trim(),
    defaultRefundPolicy: values.defaultRefundPolicy.trim(),
  }
}

export function hasOrganizerOrganizationChanges(
  values: OrganizerOrganizationFormValues,
  baseline: OrganizerOrganizationFormValues,
) {
  return organizerOrganizationFields.some((field) => values[field] !== baseline[field])
}

export function reconcileOrganizerOrganizationDraft(
  draft: OrganizerOrganizationFormValues,
  baseline: OrganizerOrganizationFormValues,
  nextBaseline: OrganizerOrganizationFormValues,
): OrganizerOrganizationFormValues {
  return hasOrganizerOrganizationChanges(draft, baseline) ? draft : nextBaseline
}

export function validateOrganizerOrganization(values: OrganizerOrganizationFormValues): OrganizerOrganizationErrors {
  const errors: OrganizerOrganizationErrors = {}
  const identifier = values.businessIdentifier.trim()
  const phoneDigits = values.publicPhone.replace(/\D/g, '')

  if (!values.name.trim()) errors.name = 'Nhập tên tổ chức.'
  if (!/^\S+@\S+\.\S+$/.test(values.publicEmail.trim())) errors.publicEmail = 'Nhập email công khai hợp lệ.'
  if (phoneDigits.length < 9 || phoneDigits.length > 11) errors.publicPhone = 'Nhập số điện thoại gồm 9 đến 11 chữ số.'
  if (!values.address.trim()) errors.address = 'Nhập địa chỉ liên hệ.'
  if (identifier && !/^(?:MST\s*)?•{4,}(?:\s*\d{2,4})?$/.test(identifier)) errors.businessIdentifier = 'Mã số thuế/mã định danh chỉ được lưu ở dạng che mờ.'
  if (!values.defaultRefundPolicy.trim()) errors.defaultRefundPolicy = 'Nhập chính sách hoàn tiền mặc định.'
  return errors
}

export function prepareOrganizerOrganizationSave(
  values: OrganizerOrganizationFormValues,
): {
  readonly values: OrganizerOrganizationFormValues
  readonly patch: OrganizerOrganizationPatch
  readonly errors: OrganizerOrganizationErrors
} {
  const normalized = normalizeOrganizerOrganizationValues(values)
  return {
    values: normalized,
    patch: {
      ...normalized,
      businessIdentifier: normalized.businessIdentifier || undefined,
    },
    errors: validateOrganizerOrganization(normalized),
  }
}

export function getFirstOrganizerOrganizationError(errors: OrganizerOrganizationErrors): OrganizerOrganizationField | null {
  return organizerOrganizationFields.find((field) => errors[field] !== undefined) ?? null
}
