import { useEffect, useRef, type RefObject } from 'react'
import type { OrganizerEventFormValues } from '../hooks/use-organizer-event-form.ts'

type Props = { open: boolean; onClose: () => void; returnFocus: RefObject<HTMLButtonElement | null>; values: OrganizerEventFormValues }

export function OrganizerEventPreview({ open, onClose, returnFocus, values }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const focusTarget = returnFocus.current
    closeRef.current?.focus()
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        event.preventDefault()
        closeRef.current?.focus()
      }
    }
    window.addEventListener('keydown', close)
    return () => {
      window.removeEventListener('keydown', close)
      focusTarget?.focus()
    }
  }, [onClose, open, returnFocus])
  if (!open) return null
  return <div className="fixed inset-0 z-50 grid place-items-center bg-pine/80 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="max-h-[90dvh] w-full max-w-xl overflow-auto rounded-lg bg-paper p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="organizer-event-preview-title"><p className="m-0 text-xs font-extrabold tracking-[.1em] text-coral-dark">XEM TRƯỚC KHÁCH THAM DỰ</p><h2 id="organizer-event-preview-title" className="mt-2 font-body text-3xl font-extrabold tracking-[-.07em]">{values.title || 'Tên sự kiện'}</h2><dl className="mt-5 grid gap-4 rounded-md bg-paper-deep p-4 text-sm"><div><dt className="font-bold text-ink-soft">Thời gian</dt><dd className="m-0 mt-1">{values.startsAt || 'Chưa chọn'} — {values.endsAt || 'Chưa chọn'}</dd></div><div><dt className="font-bold text-ink-soft">Địa điểm</dt><dd className="m-0 mt-1">{values.venue || 'Chưa nhập'}, {values.city || 'Chưa nhập'}</dd></div><div><dt className="font-bold text-ink-soft">Vé khởi tạo</dt><dd className="m-0 mt-1">{values.ticketTierName || 'Chưa đặt tên'} · {values.ticketTierPrice || '0'}đ · {values.ticketTierCapacity || '0'} vé</dd></div></dl><p className="mt-4 text-sm leading-relaxed text-ink-soft">Đây là bản xem trước UI. Sự kiện chỉ được tạo khi bạn chọn “Lưu bản nháp”.</p><button ref={closeRef} className="min-h-12 rounded-md bg-blue px-5 text-sm font-extrabold text-paper" type="button" onClick={onClose}>Đóng xem trước</button></section></div>
}
