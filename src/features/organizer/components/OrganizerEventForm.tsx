import { useRef, useState, type FormEvent } from 'react'
import { OrganizerEventBasicFields } from './OrganizerEventBasicFields.tsx'
import { OrganizerEventPolicyFields } from './OrganizerEventPolicyFields.tsx'
import { OrganizerEventPreview } from './OrganizerEventPreview.tsx'
import { OrganizerEventScheduleFields } from './OrganizerEventScheduleFields.tsx'
import { OrganizerEventWizardProgress } from './OrganizerEventWizardProgress.tsx'
import { useOrganizerEventForm } from '../hooks/use-organizer-event-form.ts'
import type { OrganizerEvent, OrganizerEventInput } from '../types/organizer-event.ts'

export type OrganizerInitialTicketTier = { readonly capacity: number; readonly name: string; readonly price: number }
export type OrganizerEventFormSave = { readonly initialTicketTier?: OrganizerInitialTicketTier; readonly input: OrganizerEventInput }
type TierField = 'ticketTierName' | 'ticketTierPrice' | 'ticketTierCapacity'
type Props = { event?: OrganizerEvent; locked?: boolean; onCancel?: () => void; onDirtyChange?: (hasUnsavedChanges: boolean) => void; onSave: (value: OrganizerEventFormSave) => boolean; submitLabel: string; wizard?: boolean }
const tierFieldNames: readonly TierField[] = ['ticketTierName', 'ticketTierPrice', 'ticketTierCapacity']

export function OrganizerEventForm({ event, locked = false, onCancel, onDirtyChange, onSave, submitLabel, wizard = false }: Props) {
  const form = useOrganizerEventForm(event, { onDirtyChange })
  const [step, setStep] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [tierErrors, setTierErrors] = useState<Partial<Record<TierField, string>>>({})
  const previewButtonRef = useRef<HTMLButtonElement>(null)
  const tierRefs = useRef<Partial<Record<TierField, HTMLInputElement | null>>>({})
  const validateTier = () => {
    const errors: Partial<Record<TierField, string>> = {}
    if (!form.values.ticketTierName.trim()) errors.ticketTierName = 'Nhập tên hạng vé.'
    if (!Number.isFinite(Number(form.values.ticketTierPrice)) || Number(form.values.ticketTierPrice) <= 0) errors.ticketTierPrice = 'Nhập giá vé lớn hơn 0.'
    if (!Number.isInteger(Number(form.values.ticketTierCapacity)) || Number(form.values.ticketTierCapacity) <= 0) errors.ticketTierCapacity = 'Nhập số lượng vé nguyên lớn hơn 0.'
    setTierErrors(errors)
    const firstInvalid = tierFieldNames.find((field) => errors[field])
    if (firstInvalid) requestAnimationFrame(() => tierRefs.current[firstInvalid]?.focus())
    return firstInvalid === undefined
  }
  const save = () => {
    if (locked || !form.validate() || (wizard && !validateTier())) return
    const saved = onSave({
      input: form.toInput(),
      initialTicketTier: wizard ? { name: form.values.ticketTierName.trim(), price: Number(form.values.ticketTierPrice), capacity: Number(form.values.ticketTierCapacity) } : undefined,
    })
    if (saved) form.markSaved()
  }
  const submit = (formEvent: FormEvent<HTMLFormElement>) => { formEvent.preventDefault(); save() }
  const next = () => {
    if (step === 0 && !form.validate(['title'])) return
    if (step === 1 && !form.validate(['startsAt', 'endsAt', 'venue', 'city'])) return
    if (step === 3 && !validateTier()) return
    setStep((current) => Math.min(current + 1, 4))
  }
  const tierInput = (field: TierField, label: string, type: 'number' | 'text') => {
    const errorId = `organizer-${field}-error`
    return <div><label className="mb-2 block text-sm font-bold" htmlFor={`organizer-${field}`}>{label} <span className="text-error">*</span></label><input ref={(node) => { tierRefs.current[field] = node }} id={`organizer-${field}`} name={field} type={type} min={type === 'number' ? '1' : undefined} inputMode={type === 'number' ? 'numeric' : undefined} className="min-h-12 w-full rounded-md border border-line bg-paper px-3 text-base outline-none focus:border-blue focus:shadow-[0_0_0_3px_var(--color-focus-ring)] disabled:bg-paper-deep aria-[invalid=true]:border-error" disabled={locked} value={form.values[field]} onChange={form.onChange} aria-invalid={Boolean(tierErrors[field])} aria-describedby={tierErrors[field] ? errorId : undefined} />{tierErrors[field] && <p id={errorId} className="mt-2 mb-0 text-sm font-bold text-error" role="alert">{tierErrors[field]}</p>}</div>
  }
  const fields = <>{(wizard ? step === 0 : true) && <OrganizerEventBasicFields disabled={locked} errors={form.errors} onChange={form.onChange} registerField={form.registerField} values={form.values} />}{(wizard ? step === 1 : true) && <OrganizerEventScheduleFields disabled={locked} errors={form.errors} onChange={form.onChange} registerField={form.registerField} values={form.values} />}{(wizard ? step === 2 : true) && <OrganizerEventPolicyFields disabled={locked} onChange={form.onChange} values={form.values} />}</>

  return <><form noValidate onSubmit={submit} className="space-y-5">{wizard && <OrganizerEventWizardProgress currentStep={step} />}<section className="rounded-lg border border-line bg-surface p-5 sm:p-6">{fields}{wizard && step === 3 && <fieldset disabled={locked} className="space-y-4"><legend className="text-xl font-extrabold text-ink">Hạng vé khởi tạo</legend><p className="m-0 text-sm leading-relaxed text-ink-soft">Hạng vé này được kiểm tra trước khi lưu bản nháp trong phiên.</p>{tierInput('ticketTierName', 'Tên hạng vé', 'text')}{tierInput('ticketTierPrice', 'Giá vé (đ)', 'number')}{tierInput('ticketTierCapacity', 'Số lượng vé', 'number')}</fieldset>}{wizard && step === 4 && <section><h2 className="m-0 text-xl font-extrabold">Sẵn sàng lưu bản nháp</h2><p className="mt-2 mb-0 text-sm leading-relaxed text-ink-soft">Bản lưu này luôn ở trạng thái nháp. Gửi Admin duyệt là thao tác tách biệt sau khi bạn kiểm tra thông tin.</p></section>}{!wizard && !locked && <div className="mt-6 flex flex-wrap gap-3"><button className="min-h-12 rounded-md bg-coral px-5 text-sm font-extrabold text-paper" type="submit">{submitLabel}</button>{onCancel && <button className="min-h-12 rounded-md border border-line px-5 text-sm font-extrabold" type="button" onClick={() => onCancel()}>Hủy</button>}</div>}</section>{wizard && <div className="flex flex-wrap justify-between gap-3"><button className="min-h-12 rounded-md border border-line px-5 text-sm font-extrabold disabled:opacity-40" type="button" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>Quay lại</button><div className="flex flex-wrap gap-3">{step >= 3 && <button ref={previewButtonRef} className="min-h-12 rounded-md border border-blue px-5 text-sm font-extrabold text-blue-deep" type="button" onClick={() => setPreviewOpen(true)}>Xem trước</button>}{step < 4 ? <button className="min-h-12 rounded-md bg-blue px-5 text-sm font-extrabold text-paper" type="button" onClick={next}>Tiếp tục</button> : <button className="min-h-12 rounded-md bg-coral px-5 text-sm font-extrabold text-paper" type="submit">{submitLabel}</button>}</div></div>}</form><OrganizerEventPreview open={previewOpen} onClose={() => setPreviewOpen(false)} returnFocus={previewButtonRef} values={form.values} /></>
}
