export type OrganizerLocationInput = { readonly provinceId?: string; readonly wardId?: string; readonly street?: string }
export type OrganizerLocationNames = { readonly provinceName?: string; readonly wardName?: string; readonly street: string }

export function mapOrganizerLocationToLegacyFields({ provinceName = '', wardName = '', street }: OrganizerLocationNames) {
  const trimmedStreet = street.trim()
  const trimmedWard = wardName.trim()
  return { venue: [trimmedStreet, trimmedWard].filter(Boolean).join(', '), city: provinceName.trim() }
}

export function validateOrganizerLocation(input: OrganizerLocationInput) {
  const errors: Partial<Record<'provinceId' | 'wardId' | 'street', string>> = {}
  if (!input.provinceId?.trim()) errors.provinceId = 'Chọn tỉnh/thành phố.'
  if (!input.wardId?.trim()) errors.wardId = 'Chọn phường/xã.'
  if (!input.street?.trim()) errors.street = 'Nhập đường/phố.'
  return errors
}
