export type OrganizerOrganization = {
  readonly id: string
  readonly name: string
  readonly publicEmail: string
  readonly publicPhone: string
  readonly address: string
  readonly payoutAccountLabel: string
  readonly businessIdentifier?: string
  readonly defaultRefundPolicy: string
}

export type OrganizerOrganizationPatch = Partial<Pick<
  OrganizerOrganization,
  'name' | 'publicEmail' | 'publicPhone' | 'address' | 'businessIdentifier' | 'defaultRefundPolicy'
>>
