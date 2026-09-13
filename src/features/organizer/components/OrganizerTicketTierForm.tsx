import { useEffect, useRef, useState } from 'react'
import {
  dateTimeLocalToIsoPreservingOriginal,
  isoToDateTimeLocal,
} from '../helpers/organizer-datetime-local.ts'
import {
  canSaveOrganizerTicketTier,
  validateOrganizerTicketTier,
} from '../helpers/validate-organizer-ticket-tier.ts'
import type { OrganizerTicketTier } from '../types/organizer-commerce.ts'

type Props = {
  eventId: string
  onClose: () => void
  onSave: (tier: OrganizerTicketTier) => void
  returnFocus: HTMLElement | null
  tier: OrganizerTicketTier | null
}

type Fields = {
  name: string
  price: string
  capacity: string
  salesStartAt: string
  salesEndAt: string
  perOrderLimit: string
}

type OriginalDateTimes = {
  salesStartAt: string
  salesEndAt: string
  salesStartLocal: string
  salesEndLocal: string
}

function fieldsFor(tier: OrganizerTicketTier | null): Fields {
  return tier
    ? {
        name: tier.name,
        price: String(tier.price),
        capacity: String(tier.capacity),
        salesStartAt: isoToDateTimeLocal(tier.salesStartAt),
        salesEndAt: isoToDateTimeLocal(tier.salesEndAt),
        perOrderLimit: String(tier.perOrderLimit),
      }
    : {
        name: '',
        price: '0',
        capacity: '1',
        salesStartAt: '',
        salesEndAt: '',
        perOrderLimit: '4',
      }
}

function originalDateTimesFor(tier: OrganizerTicketTier | null): OriginalDateTimes {
  const fields = fieldsFor(tier)
  return {
    salesStartAt: tier?.salesStartAt ?? '',
    salesEndAt: tier?.salesEndAt ?? '',
    salesStartLocal: fields.salesStartAt,
    salesEndLocal: fields.salesEndAt,
  }
}

export function OrganizerTicketTierForm({
  eventId,
  onClose,
  onSave,
  returnFocus,
  tier,
}: Props) {
  const [fields, setFields] = useState(() => fieldsFor(tier))
  const [message, setMessage] = useState('')
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const originalsRef = useRef(originalDateTimesFor(tier))

  useEffect(() => {
    closeRef.current?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', keydown)
    return () => {
      window.removeEventListener('keydown', keydown)
      returnFocus?.focus()
    }
  }, [onClose, returnFocus])

  const update = (field: keyof Fields, value: string) => {
    setFields((current) => ({ ...current, [field]: value }))
  }

  const save = () => {
    const originals = originalsRef.current
    const salesStartAt = dateTimeLocalToIsoPreservingOriginal(
      fields.salesStartAt,
      originals.salesStartLocal,
      originals.salesStartAt,
    )
    const salesEndAt = dateTimeLocalToIsoPreservingOriginal(
      fields.salesEndAt,
      originals.salesEndLocal,
      originals.salesEndAt,
    )
    const draft = {
      name: fields.name,
      price: Number(fields.price),
      capacity: Number(fields.capacity),
      salesStartAt: salesStartAt ?? '',
      salesEndAt: salesEndAt ?? '',
      perOrderLimit: Number(fields.perOrderLimit),
    }
    const validation = validateOrganizerTicketTier(draft)
    const soldCount = tier?.soldCount ?? 0

    if (!validation.valid || !canSaveOrganizerTicketTier(draft, soldCount)) {
      setMessage(
        validation.valid
          ? `Sức chứa không thể thấp hơn ${soldCount} vé đã bán.`
          : Object.values(validation.errors)[0] ?? 'Kiểm tra lại hạng vé.',
      )
      return
    }

    onSave({
      id: tier?.id ?? `${eventId}-tier-${crypto.randomUUID()}`,
      eventId,
      soldCount,
      saleStatus: tier?.saleStatus ?? 'scheduled',
      name: draft.name.trim(),
      price: draft.price,
      capacity: draft.capacity,
      salesStartAt: draft.salesStartAt,
      salesEndAt: draft.salesEndAt,
      perOrderLimit: draft.perOrderLimit,
    })
    onClose()
  }

  const inputs = [
    { key: 'name', label: 'Tên hạng vé', type: 'text' },
    { key: 'price', label: 'Giá vé (đ)', type: 'number' },
    { key: 'capacity', label: 'Sức chứa', type: 'number' },
    { key: 'perOrderLimit', label: 'Giới hạn mỗi đơn', type: 'number' },
    { key: 'salesStartAt', label: 'Mở bán', type: 'datetime-local' },
    { key: 'salesEndAt', label: 'Kết thúc bán', type: 'datetime-local' },
  ] as const

  return <div className="fixed inset-0 z-50 grid place-items-center bg-pine/70 p-4" role="presentation">
    <section ref={panelRef} className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-lg bg-paper p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="ticket-tier-form-title">
      <div className="flex items-start justify-between gap-4">
        <div><p className="m-0 text-xs font-extrabold tracking-[.1em] text-coral-dark">VÉ VÀ TỒN KHO</p><h2 id="ticket-tier-form-title" className="mt-2 text-2xl font-extrabold">{tier ? 'Chỉnh sửa hạng vé' : 'Tạo hạng vé'}</h2></div>
        <button ref={closeRef} className="min-h-11 rounded-md border border-line px-3 font-bold" type="button" onClick={onClose}>Đóng</button>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {inputs.map(({ key, label, type }) => <label className="text-sm font-bold" key={key}>{label}
          <input className="mt-2 min-h-12 w-full rounded-md border border-line bg-surface px-3" min={type === 'number' ? 0 : undefined} step={type === 'datetime-local' ? '0.001' : undefined} type={type} value={fields[key]} onChange={(event) => update(key, event.target.value)} />
        </label>)}
      </div>
      {tier && <p className="mt-4 rounded-md bg-paper-deep p-3 text-sm text-ink-soft">Đã bán: {tier.soldCount} vé. Mã hạng vé, sự kiện và số đã bán được giữ nguyên.</p>}
      {message && <p className="mt-4 text-sm font-bold text-coral-dark" role="alert">{message}</p>}
      <button className="mt-5 min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper" type="button" onClick={save}>Lưu hạng vé</button>
    </section>
  </div>
}
