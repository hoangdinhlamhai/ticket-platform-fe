import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  getFirstOrganizerOrganizationError,
  hasOrganizerOrganizationChanges,
  prepareOrganizerOrganizationSave,
  reconcileOrganizerOrganizationDraft,
  valuesFromOrganizerOrganization,
  type OrganizerOrganizationErrors,
  type OrganizerOrganizationFormValues,
} from '../helpers/validate-organizer-organization.ts'
import type { OrganizerOrganization, OrganizerOrganizationPatch } from '../types/organizer-organization.ts'

type Props = {
  organization: OrganizerOrganization
  onDirtyChange: (dirty: boolean) => void
  onSave: (values: OrganizerOrganizationPatch) => void
}

const inputClass = 'min-h-12 w-full rounded-md border border-line bg-paper px-3 text-base text-ink outline-none focus:border-blue focus:shadow-[0_0_0_3px_var(--color-focus-ring)] aria-[invalid=true]:border-error'

export function OrganizerOrganizationForm({ organization, onDirtyChange, onSave }: Props) {
  const [values, setValues] = useState(() => valuesFromOrganizerOrganization(organization))
  const [baseline, setBaseline] = useState(() => valuesFromOrganizerOrganization(organization))
  const baselineRef = useRef(baseline)
  const [errors, setErrors] = useState<OrganizerOrganizationErrors>({})
  const refs = useRef<Partial<Record<keyof OrganizerOrganizationFormValues, HTMLInputElement | HTMLTextAreaElement | null>>>({})
  const dirty = hasOrganizerOrganizationChanges(values, baseline)

  useEffect(() => {
    const nextBaseline = valuesFromOrganizerOrganization(organization)
    const previousBaseline = baselineRef.current
    setValues((current) => reconcileOrganizerOrganizationDraft(current, previousBaseline, nextBaseline))
    baselineRef.current = nextBaseline
    setBaseline(nextBaseline)
  }, [organization])
  useEffect(() => { onDirtyChange(dirty) }, [dirty, onDirtyChange])
  useEffect(() => () => onDirtyChange(false), [onDirtyChange])

  const change = (field: keyof OrganizerOrganizationFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const { values: normalized, patch, errors: nextErrors } = prepareOrganizerOrganizationSave(values)
    setErrors(nextErrors)
    const firstInvalid = getFirstOrganizerOrganizationError(nextErrors)
    if (firstInvalid) {
      refs.current[firstInvalid]?.focus()
      return
    }
    setValues(normalized)
    baselineRef.current = normalized
    setBaseline(normalized)
    onDirtyChange(false)
    onSave(patch)
  }
  const error = (field: keyof OrganizerOrganizationFormValues) => errors[field] ? `organizer-organization-${field}-error` : undefined

  return <form className="space-y-6 rounded-lg border border-line bg-surface p-5" noValidate onSubmit={submit}>
    <div><h2 className="m-0 text-xl font-extrabold">Thông tin công khai</h2><p className="mt-2 text-sm text-ink-soft">Chỉ thay đổi trong phiên hiện tại và sẽ mất khi tải lại trang.</p></div>
    <div className="grid gap-5 md:grid-cols-2">
      <label className="block text-sm font-bold" htmlFor="organizer-organization-name">Tên tổ chức <span className="text-error">*</span><input ref={(node) => { refs.current.name = node }} id="organizer-organization-name" className={`${inputClass} mt-2`} value={values.name} onChange={(event) => change('name', event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={error('name')} />{errors.name && <span id={error('name')} className="mt-2 block text-error" role="alert">{errors.name}</span>}</label>
      <label className="block text-sm font-bold" htmlFor="organizer-organization-email">Email công khai <span className="text-error">*</span><input ref={(node) => { refs.current.publicEmail = node }} id="organizer-organization-email" className={`${inputClass} mt-2`} type="email" value={values.publicEmail} onChange={(event) => change('publicEmail', event.target.value)} aria-invalid={Boolean(errors.publicEmail)} aria-describedby={error('publicEmail')} />{errors.publicEmail && <span id={error('publicEmail')} className="mt-2 block text-error" role="alert">{errors.publicEmail}</span>}</label>
      <label className="block text-sm font-bold" htmlFor="organizer-organization-phone">Điện thoại công khai <span className="text-error">*</span><input ref={(node) => { refs.current.publicPhone = node }} id="organizer-organization-phone" className={`${inputClass} mt-2`} inputMode="tel" value={values.publicPhone} onChange={(event) => change('publicPhone', event.target.value)} aria-invalid={Boolean(errors.publicPhone)} aria-describedby={error('publicPhone')} />{errors.publicPhone && <span id={error('publicPhone')} className="mt-2 block text-error" role="alert">{errors.publicPhone}</span>}</label>
      <label className="block text-sm font-bold" htmlFor="organizer-organization-address">Địa chỉ <span className="text-error">*</span><input ref={(node) => { refs.current.address = node }} id="organizer-organization-address" className={`${inputClass} mt-2`} value={values.address} onChange={(event) => change('address', event.target.value)} aria-invalid={Boolean(errors.address)} aria-describedby={error('address')} />{errors.address && <span id={error('address')} className="mt-2 block text-error" role="alert">{errors.address}</span>}</label>
      <label className="block text-sm font-bold" htmlFor="organizer-organization-business-identifier">Mã số thuế/mã định danh <input ref={(node) => { refs.current.businessIdentifier = node }} id="organizer-organization-business-identifier" className={`${inputClass} mt-2`} value={values.businessIdentifier} onChange={(event) => change('businessIdentifier', event.target.value)} aria-invalid={Boolean(errors.businessIdentifier)} aria-describedby={error('businessIdentifier')} />{errors.businessIdentifier && <span id={error('businessIdentifier')} className="mt-2 block text-error" role="alert">{errors.businessIdentifier}</span>}<span className="mt-2 block text-xs font-normal text-ink-soft">Không bắt buộc; chỉ lưu giá trị đã che mờ, ví dụ MST •••••• 4821.</span></label>
    </div>
    <label className="block text-sm font-bold" htmlFor="organizer-organization-refund-policy">Chính sách hoàn tiền mặc định <span className="text-error">*</span><textarea ref={(node) => { refs.current.defaultRefundPolicy = node }} id="organizer-organization-refund-policy" className={`${inputClass} mt-2 min-h-28 py-3`} value={values.defaultRefundPolicy} onChange={(event) => change('defaultRefundPolicy', event.target.value)} aria-invalid={Boolean(errors.defaultRefundPolicy)} aria-describedby={error('defaultRefundPolicy')} />{errors.defaultRefundPolicy && <span id={error('defaultRefundPolicy')} className="mt-2 block text-error" role="alert">{errors.defaultRefundPolicy}</span>}</label>
    <button className="min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper disabled:bg-ink-soft" type="submit" disabled={!dirty}>Lưu thay đổi</button>
  </form>
}
