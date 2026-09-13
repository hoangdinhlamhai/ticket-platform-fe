import { useEffect, useRef, type RefObject } from 'react'
import { DemoTicketQr } from './DemoTicketQr'
type Props = { open: boolean; onClose: () => void; returnFocus: RefObject<HTMLButtonElement | null> }
export function TicketQrDialog({ open, onClose, returnFocus }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!open) return
    const trigger = returnFocus.current
    closeRef.current?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); return }
      if (event.key !== 'Tab') return
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])')
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', keydown)
    return () => { window.removeEventListener('keydown', keydown); trigger?.focus() }
  }, [onClose, open, returnFocus])
  if (!open) return null
  return <div className="fixed inset-0 z-50 grid place-items-center bg-pine/80 p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section ref={panelRef} className="max-h-[90dvh] overflow-auto rounded-lg bg-paper p-5 text-center shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="ticket-qr-dialog-title"><h2 id="ticket-qr-dialog-title" className="font-body text-3xl font-extrabold tracking-[-0.07em]">Credential demo</h2><p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">QR này chỉ phục vụ trình diễn UI và không chứa dữ liệu check-in thật.</p><div className="mt-5 flex justify-center"><DemoTicketQr large /></div><button ref={closeRef} className="mt-5 min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper" type="button" onClick={onClose}>Đóng QR demo</button></section></div>
}
