import { useRef, useState, type FormEvent } from 'react'
import { OrganizerEventBasicFields } from './OrganizerEventBasicFields.tsx'
import { OrganizerEventPreview } from './OrganizerEventPreview.tsx'
import { OrganizerEventScheduleFields } from './OrganizerEventScheduleFields.tsx'
import { OrganizerEventWizardProgress } from './OrganizerEventWizardProgress.tsx'
import { OrganizerImagePicker } from './OrganizerImagePicker.tsx'
import { OrganizerEventTierDialog } from './OrganizerEventTierDialog.tsx'
import { useOrganizerEventForm } from '../hooks/use-organizer-event-form.ts'
import {
  validateOrganizerTicketTier,
  type OrganizerTicketTierDraft,
} from '../helpers/validate-organizer-ticket-tier.ts'
import type {
  OrganizerEvent,
  OrganizerEventFinance,
  OrganizerEventInput,
} from '../types/organizer-event.ts'

export type OrganizerEventFormSave = {
  readonly initialTicketTiers?: readonly OrganizerTicketTierDraft[]
  readonly finance?: OrganizerEventFinance
  readonly input: OrganizerEventInput
}

type Props = {
  event?: OrganizerEvent
  locked?: boolean
  saving?: boolean
  error?: string | null
  onCancel?: () => void
  onDirtyChange?: (hasUnsavedChanges: boolean) => void
  onSave: (value: OrganizerEventFormSave) => boolean | Promise<boolean>
  submitLabel: string
  wizard?: boolean
}

const inputClass =
  'min-h-12 w-full rounded-md border border-line bg-paper px-3 text-base outline-none disabled:bg-paper-deep'

export function OrganizerEventForm({
  event,
  locked = false,
  saving = false,
  error = null,
  onCancel,
  onDirtyChange,
  onSave,
  submitLabel,
  wizard = false,
}: Props) {
  const form = useOrganizerEventForm(event, { onDirtyChange })
  const [step, setStep] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [tierOpen, setTierOpen] = useState(false)
  const [editingTier, setEditingTier] = useState<number | null>(null)
  const [tierReturnFocus, setTierReturnFocus] = useState<HTMLElement | null>(null)
  const [tierMessage, setTierMessage] = useState('')
  const previewRef = useRef<HTMLButtonElement>(null)
  const tiers = form.values.tiers

  const update = (name: string, value: string) => form.setField(name, value)

  const saveTier = (draft: OrganizerTicketTierDraft) => {
    form.setValues((current) => ({
      ...current,
      tiers:
        editingTier === null
          ? [...current.tiers, draft]
          : current.tiers.map((tier, index) => (index === editingTier ? draft : tier)),
    }))
    setTierMessage('')
  }

  const removeTier = (index: number) =>
    form.setValues((current) => ({
      ...current,
      tiers: current.tiers.filter((_, itemIndex) => itemIndex !== index),
    }))

  const validateTiers = () => {
    if (!wizard) return true; if (!tiers.length) { setTierMessage('Thêm ít nhất một loại vé.'); return false }
    const invalid = tiers.map(validateOrganizerTicketTier).find((item) => !item.valid)
    setTierMessage(invalid ? Object.values(invalid.errors)[0] ?? 'Kiểm tra lại loại vé.' : '')
    return !invalid
  }

  const next = () => {
    if (step === 0 && !form.validate(['title', 'categoryId', 'provinceId', 'street'])) return
    if (step === 1 && (!form.validate(['startsAt', 'endsAt']) || !validateTiers())) return
    setStep((value) => Math.min(3, value + 1))
  }

  const save = async () => {
    if (locked || saving) return

    if (wizard && step < 3) {
      next()
      return
    }

    const step0Valid = form.validate(['title', 'categoryId', 'provinceId', 'street'])
    if (!step0Valid) {
      setStep(0)
      return
    }

    const step1Valid = form.validate(['startsAt', 'endsAt'])
    if (!step1Valid) {
      setStep(1)
      return
    }

    const tiersValid = validateTiers()
    if (!tiersValid) {
      setStep(1)
      return
    }

    const savePayload: OrganizerEventFormSave = {
      input: form.toInput(),
      initialTicketTiers: wizard ? tiers : undefined,
      finance: form.values.finance,
    }

    const ok = await onSave(savePayload)
    if (ok) form.markSaved()
  }

  const submit = (eventValue: FormEvent) => {
    eventValue.preventDefault()
    void save()
  }

  let fields = null
  if (step === 0) {
    fields = (
      <OrganizerEventBasicFields
        disabled={locked}
        errors={form.errors}
        onChange={form.onChange}
        registerField={form.registerField}
        values={form.values}
        onFieldChange={update}
      />
    )
  } else if (step === 1) {
    fields = (
      <>
        <OrganizerEventScheduleFields
          disabled={locked}
          errors={form.errors}
          onChange={form.onChange}
          registerField={form.registerField}
          values={form.values}
        />
        {wizard && (
          <fieldset disabled={locked} className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <legend className="text-xl font-extrabold">Loại vé</legend>
              <span className="text-sm text-ink-soft">{tiers.length} loại vé</span>
            </div>
            {tiers.map((tier, index) => (
              <div
                key={`${tier.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-md border border-line p-3"
              >
                <button
                  type="button"
                  className="text-left"
                  onClick={(clickEvent) => {
                    setEditingTier(index)
                    setTierReturnFocus(clickEvent.currentTarget)
                    setTierOpen(true)
                  }}
                >
                  <strong>{tier.name}</strong> ·{' '}
                  {tier.price === 0 ? 'Miễn phí' : `${tier.price.toLocaleString('vi-VN')} đ`} ·{' '}
                  {tier.capacity} vé
                </button>
                <button
                  type="button"
                  className="text-sm font-bold text-coral-dark"
                  onClick={() => removeTier(index)}
                >
                  Xóa
                </button>
              </div>
            ))}
            <button
              type="button"
              className="min-h-10 rounded-md border border-blue px-4 font-bold text-blue-deep"
              onClick={(clickEvent) => {
                setEditingTier(null)
                setTierReturnFocus(clickEvent.currentTarget)
                setTierOpen(true)
              }}
            >
              + Thêm loại vé
            </button>
            {tierMessage && (
              <p className="text-sm font-bold text-error" role="alert">
                {tierMessage}
              </p>
            )}
            <OrganizerImagePicker
              label="Ảnh sơ đồ chỗ ngồi (tùy chọn)"
              value={form.values.seatingChartImage}
              onChange={(value) => update('seatingChartImage', value)}
              disabled={locked}
              maxMb={3}
            />
          </fieldset>
        )}
      </>
    )
  } else if (step === 2) {
    fields = (
      <fieldset disabled={locked} className="space-y-4">
        <legend className="text-xl font-extrabold">Xác nhận sau khi mua</legend>
        <label className="block text-sm font-bold" htmlFor="organizer-confirmation-message">
          Tin nhắn xác nhận
          <textarea
            id="organizer-confirmation-message"
            name="confirmationMessage"
            maxLength={500}
            className={inputClass}
            value={form.values.confirmationMessage}
            onChange={form.onChange}
          />
        </label>
        <p className="text-right text-xs text-ink-soft">
          {form.values.confirmationMessage.length}/500
        </p>
      </fieldset>
    )
  } else {
    fields = (
      <fieldset disabled={locked} className="space-y-4">
        <legend className="text-xl font-extrabold">Thông tin thanh toán và hóa đơn</legend>
        <label className="block text-sm font-bold">
          Loại hình kinh doanh
          <select
            className={inputClass}
            name="businessType"
            value={form.values.finance.businessType}
            onChange={(selectEvent) =>
              form.setValues((current) => ({
                ...current,
                finance: { ...current.finance, businessType: selectEvent.target.value },
              }))
            }
          >
            <option value="INDIVIDUAL">Cá nhân</option>
            <option value="ORGANIZATION">Tổ chức</option>
          </select>
        </label>
        {(
          [
            'accountHolder',
            'accountNumber',
            'bankName',
            'branch',
            'invoiceName',
            'invoiceAddress',
            'taxCode',
          ] as const
        ).map((key) => (
          <label className="block text-sm font-bold" key={key}>
            {(
              {
                accountHolder: 'Chủ tài khoản',
                accountNumber: 'Số tài khoản',
                bankName: 'Tên ngân hàng',
                branch: 'Chi nhánh',
                invoiceName: 'Tên xuất hóa đơn',
                invoiceAddress: 'Địa chỉ hóa đơn',
                taxCode: 'Mã số thuế',
              } as const
            )[key]}
            <input
              className={inputClass}
              value={form.values.finance[key]}
              onChange={(inputEvent) =>
                form.setValues((current) => ({
                  ...current,
                  finance: { ...current.finance, [key]: inputEvent.target.value },
                }))
              }
            />
          </label>
        ))}
      </fieldset>
    )
  }

  return (
    <>
      <form
        noValidate
        onSubmit={submit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
            e.preventDefault()
            if (wizard && step < 3) next()
          }
        }}
        className="space-y-5"
      >
        {error && (
          <div
            className="rounded-md border border-red-500 bg-red-50 p-4 text-sm font-bold text-red-700 shadow-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {wizard && <OrganizerEventWizardProgress currentStep={step} />}

        <section className="rounded-lg border border-line bg-surface p-5 sm:p-6">
          {fields}
          {!wizard && (
            <div className="mt-6 flex gap-3">
              <button
                className="min-h-12 rounded-md bg-coral px-5 font-extrabold text-paper"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Đang lưu…' : submitLabel}
              </button>
              {onCancel && (
                <button
                  className="min-h-12 rounded-md border border-line px-5 font-extrabold"
                  type="button"
                  onClick={onCancel}
                >
                  Hủy
                </button>
              )}
            </div>
          )}
        </section>

        {error && (
          <div
            className="rounded-md border border-red-500 bg-red-50 p-4 text-sm font-bold text-red-700 shadow-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {wizard && (
          <div className="flex justify-between gap-3">
            <button
              className="min-h-12 rounded-md border border-line px-5 font-extrabold"
              type="button"
              disabled={step === 0}
              onClick={() => setStep((value) => value - 1)}
            >
              Quay lại
            </button>
            <div className="flex gap-3">
              <button
                ref={previewRef}
                className="min-h-12 rounded-md border border-blue px-5 font-extrabold text-blue-deep"
                type="button"
                onClick={() => setPreviewOpen(true)}
              >
                Xem trước
              </button>
              {step < 3 ? (
                <button
                  key="step-next-btn"
                  className="min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper"
                  type="button"
                  onClick={next}
                >
                  Tiếp tục
                </button>
              ) : (
                <button
                  key="step-submit-btn"
                  className="min-h-12 rounded-md bg-coral px-5 font-extrabold text-paper"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? 'Đang lưu…' : submitLabel}
                </button>
              )}
            </div>
          </div>
        )}
      </form>

      <OrganizerEventPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        returnFocus={previewRef}
        values={form.values}
      />

      <OrganizerEventTierDialog
        key={`${tierOpen}-${editingTier ?? 'new'}`}
        open={tierOpen}
        tier={editingTier === null ? null : tiers[editingTier]}
        onClose={() => setTierOpen(false)}
        onSave={saveTier}
        returnFocus={tierReturnFocus}
        startsAt={form.values.startsAt}
        endsAt={form.values.endsAt}
      />
    </>
  )
}
