export type OrganizerBusinessType = 'INDIVIDUAL' | 'ORGANIZATION'
export function organizerBusinessTypeLabel(value: string) { return value === 'ORGANIZATION' ? 'Tổ chức' : 'Cá nhân' }
