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
  onSave: (tier: OrganizerTicketTier) => void | Promise<unknown>
  returnFocus: HTMLElement | null
  tier: OrganizerTicketTier | null
}

type Fields = {
  name: string
  price: string
  capacity: string
  salesStartAt: string
  salesEndAt: string
  minPerOrder: string
  perOrderLimit: string
  description: string
  image: string
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
        minPerOrder: String(tier.minPerOrder ?? 1),
        perOrderLimit: String(tier.perOrderLimit),
        description: tier.description ?? '',
        image: tier.image ?? '',
      }
    : {
        name: '',
        price: '0',
        capacity: '1',
        salesStartAt: '',
        salesEndAt: '',
        minPerOrder: '1',
        perOrderLimit: '4',
        description: '',
        image: '',
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
  const [saving, setSaving] = useState(false)
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

  const save = async () => {
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
      minPerOrder: Number(fields.minPerOrder),
      description: fields.description,
      image: fields.image || undefined,
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

    setSaving(true)
    try {
      await onSave({
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
        minPerOrder: draft.minPerOrder,
        description: draft.description,
        ...(draft.image ? { image: draft.image } : {}),
      })
      onClose()
    } catch {
      setMessage('Không thể tải ảnh hoặc lưu hạng vé. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const inputs = [
    { key: 'name', label: 'Tên hạng vé', type: 'text' },
    { key: 'price', label: 'Giá vé (đ)', type: 'number' },
    { key: 'capacity', label: 'Sức chứa', type: 'number' },
    { key: 'minPerOrder', label: 'Tối thiểu mỗi đơn', type: 'number' },
    { key: 'perOrderLimit', label: 'Tối đa mỗi đơn', type: 'number' },
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
      <label className="mt-4 block text-sm font-bold">Mô tả vé<textarea className="mt-2 min-h-24 w-full rounded-md border border-line bg-surface p-3" value={fields.description} onChange={(event) => update('description', event.target.value)} /></label>
      <label className="mt-4 block text-sm font-bold">Ảnh vé (PNG/JPEG/WebP, tối đa 1MB)<input className="mt-2 block text-sm" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (!file || file.size > 1024 * 1024 || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return; const reader = new FileReader(); reader.onload = () => typeof reader.result === 'string' && update('image', reader.result); reader.readAsDataURL(file) }} />{fields.image && <span className="mt-2 flex items-center gap-3"><img className="h-16 w-24 rounded object-cover" src={fields.image} alt="Ảnh vé xem trước" /><button className="text-sm text-coral-dark" type="button" onClick={() => update('image', '')}>Xóa ảnh</button></span>}</label>
      {message && <p className="mt-4 text-sm font-bold text-coral-dark" role="alert">{message}</p>}
      <button className="mt-5 min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper" type="button" disabled={saving} onClick={() => void save}>{saving ? 'Đang lưu…' : 'Lưu hạng vé'}</button>
    </section>
  </div>
}
