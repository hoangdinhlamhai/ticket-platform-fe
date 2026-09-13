import { useEffect, useRef, useState, type ReactNode } from 'react'
import { validateAdminReason, type AdminSensitiveOperation } from '../helpers/admin-transitions.ts'
import { adminDialogStack } from './admin-dialog-stack.ts'

const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
export type AdminStatusOption = { readonly value: string; readonly label: string }

export function AdminPrototypeNotice() {
  return <p className="rounded-lg border border-blue/35 bg-google-hover px-4 py-3 text-sm font-bold text-blue-deep">Prototype Admin dùng dữ liệu mô phỏng trong phiên; tải lại trang sẽ đặt lại toàn bộ thay đổi.</p>
}

export function AdminPageHeader({ eyebrow, title, children, actions }: { readonly eyebrow: string; readonly title: string; readonly children?: ReactNode; readonly actions?: ReactNode }) {
  return <header className="flex flex-wrap items-end justify-between gap-5"><div><p className="m-0 text-xs font-extrabold tracking-[.11em] text-coral-dark">{eyebrow}</p><h1 className="mt-2 mb-0 text-[clamp(2.25rem,5vw,4.5rem)] leading-[.88] font-extrabold tracking-[-.075em]">{title}</h1>{children && <div className="mt-4 max-w-3xl text-ink-soft">{children}</div>}</div>{actions && <div className="flex flex-wrap gap-3">{actions}</div>}</header>
}

const tones = { neutral: 'border-line bg-paper-deep text-ink-soft', blue: 'border-blue/40 bg-google-hover text-blue-deep', mint: 'border-success/40 bg-mint text-success', coral: 'border-coral/45 bg-error-ring text-coral-dark', critical: 'border-error bg-error-ring text-error' }
export function AdminStatusBadge({ label, tone, iconLabel }: { readonly label: string; readonly tone: keyof typeof tones; readonly iconLabel?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-extrabold ${tones[tone]}`}><span aria-hidden="true">●</span>{iconLabel && <span className="sr-only">{iconLabel}: </span>}{label}</span>
}

export function AdminMetricCard({ label, value, detail, onOpen }: { readonly label: string; readonly value: string | number; readonly detail: string; readonly onOpen: () => void }) {
  return <button className="min-h-36 rounded-lg border border-line bg-surface p-5 text-left hover:border-blue" type="button" onClick={onOpen}><span className="block text-sm font-bold text-ink-soft">{label}</span><strong className="mt-2 block text-3xl font-extrabold">{value}</strong><span className="mt-2 block text-xs font-bold text-blue-deep">{detail}</span></button>
}

export function AdminFilterToolbar({ query, status, statusOptions = [], resultCount, onQueryChange, onStatusChange }: { readonly query: string; readonly status: string; readonly statusOptions?: readonly AdminStatusOption[]; readonly resultCount: number; readonly onQueryChange: (value: string) => void; readonly onStatusChange: (value: string) => void }) {
  return <div className="flex flex-wrap gap-3 rounded-lg border border-line bg-surface p-4"><label className="min-w-52 flex-1 text-sm font-bold">Tìm kiếm<input className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3" value={query} onChange={(event) => onQueryChange(event.target.value)} /></label>{statusOptions.length > 0 && <label className="text-sm font-bold">Trạng thái<select className="mt-1 min-h-11 rounded border border-line bg-paper px-3" value={status} onChange={(event) => onStatusChange(event.target.value)}><option value="">Tất cả</option>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>}<p className="self-end text-sm text-ink-soft">{resultCount} kết quả</p></div>
}

export function AdminResponsiveRecordList({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return <div className="rounded-lg border border-line" aria-label={label}>{children}</div>
}

function trapDialogFocus(event: KeyboardEvent, panel: HTMLElement | null) {
  if (event.key !== 'Tab') return
  const focusable = panel?.querySelectorAll<HTMLElement>(focusableSelector)
  if (!focusable?.length) return
  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}

export function AdminRecordDrawer({ open, title, children, onClose }: { readonly open: boolean; readonly title: string; readonly children: ReactNode; readonly onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const activeRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])
  useEffect(() => {
    if (!open) return
    activeRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeRef.current?.focus()
    const registration = adminDialogStack.open(() => onCloseRef.current(), () => activeRef.current?.focus())
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') registration.handleEscape()
      else if (registration.isTopmost()) trapDialogFocus(event, panelRef.current)
    }
    window.addEventListener('keydown', keydown)
    return () => { window.removeEventListener('keydown', keydown); registration.close() }
  }, [open])
  if (!open) return null
  return <div className="fixed inset-0 z-50" role="presentation"><button className="absolute inset-0 h-full w-full bg-pine/55" type="button" aria-label="Đóng chi tiết" onClick={onClose} /><section ref={panelRef} className="absolute top-0 right-0 h-full w-full max-w-xl overflow-y-auto bg-paper p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="admin-drawer-title"><header className="flex justify-between gap-3 border-b border-line pb-4"><h2 id="admin-drawer-title" className="m-0 text-xl font-extrabold">{title}</h2><button ref={closeRef} className="min-h-11 rounded border border-line px-3 font-bold" type="button" onClick={onClose}>Đóng</button></header>{children}</section></div>
}

type DecisionDialogProps = { readonly title: string; readonly description: string; readonly confirmLabel: string; readonly operation: AdminSensitiveOperation; readonly onCancel: () => void; readonly onConfirm: (reason: string) => void }
function AdminDecisionDialogContent({ title, description, confirmLabel, operation, onCancel, onConfirm }: DecisionDialogProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const panelRef = useRef<HTMLElement>(null)
  const reasonRef = useRef<HTMLTextAreaElement>(null)
  const activeRef = useRef<HTMLElement | null>(null)
  const onCancelRef = useRef(onCancel)
  useEffect(() => {
    onCancelRef.current = onCancel
  }, [onCancel])
  useEffect(() => {
    activeRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusFrame = window.requestAnimationFrame(() => reasonRef.current?.focus())
    const registration = adminDialogStack.open(() => onCancelRef.current(), () => activeRef.current?.focus())
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') registration.handleEscape()
      else if (registration.isTopmost()) trapDialogFocus(event, panelRef.current)
    }
    window.addEventListener('keydown', keydown)
    return () => { window.cancelAnimationFrame(focusFrame); window.removeEventListener('keydown', keydown); registration.close() }
  }, [])
  const submit = () => {
    const validation = validateAdminReason(operation, reason)
    if (!validation.valid) { setError('Vui lòng nhập lý do trước khi xác nhận.'); reasonRef.current?.focus(); return }
    onConfirm(validation.reason ?? '')
  }
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-pine/60 p-4" role="presentation"><button className="absolute inset-0 h-full w-full" type="button" aria-label="Đóng hộp thoại quyết định" onClick={onCancel} /><section ref={panelRef} className="relative w-full max-w-lg rounded-lg bg-paper p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="admin-decision-title"><h2 id="admin-decision-title" className="m-0 text-xl font-extrabold">{title}</h2><p className="text-sm text-ink-soft">{description}</p><label className="block text-sm font-bold">Lý do hoặc ghi chú<textarea ref={reasonRef} className="mt-1 min-h-28 w-full rounded border border-line bg-surface p-3" aria-invalid={Boolean(error)} aria-describedby={error ? 'admin-decision-error' : undefined} value={reason} onChange={(event) => { setReason(event.target.value); setError('') }} /></label>{error && <p id="admin-decision-error" className="text-sm font-bold text-error">{error}</p>}<div className="mt-4 flex justify-end gap-3"><button className="min-h-11 rounded border border-line px-4 font-bold" type="button" onClick={onCancel}>Hủy</button><button className="min-h-11 rounded bg-coral px-4 font-extrabold text-paper" type="button" onClick={submit}>{confirmLabel}</button></div></section></div>
}

export function AdminDecisionDialog({ open, ...props }: DecisionDialogProps & { readonly open: boolean }) {
  return open ? <AdminDecisionDialogContent {...props} /> : null
}
